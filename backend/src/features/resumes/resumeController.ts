import { Response } from 'express';
import mongoose from 'mongoose';
import Resume from './resumeModel';
import User from '../auth/userModel';
import Application from '../applications/applicationModel';
import Job from '../jobs/jobModel';
import asyncHandler from '../../shared/utils/asyncHandler';
import AppError from '../../shared/utils/appError';
import { extractTextFromFile } from '../../shared/utils/fileParser';
import { parseResumeWithGemini } from '../../shared/services/geminiService';
import { AuthenticatedRequest } from '../../shared/middleware/auth';
import { getResumeUploadDir } from '../../shared/middleware/upload';
import { UserRole } from '../../shared/constants/roles';
import fs from 'fs';
import path from 'path';

/**
 * Generates a valid standalone single-page PDF Buffer containing the candidate's
 * structured resume details so that resumes built from scratch in ResumeBuilder
 * can be downloaded as a real, standards-compliant PDF document.
 */
function buildPdfBufferFromResume(resume: any): Buffer {
  const esc = (s: string) =>
    String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x20-\x7E]/g, ' ');

  const lines: { text: string; size: number; bold?: boolean }[] = [];
  const pInfo = resume.personalInfo || resume.parsedData || {};
  lines.push({ text: pInfo.name || 'Candidate Resume', size: 18, bold: true });

  const contactParts = [pInfo.email, pInfo.phone, pInfo.location, pInfo.linkedin, pInfo.github].filter(Boolean);
  if (contactParts.length > 0) {
    lines.push({ text: contactParts.join(' | '), size: 9 });
  }
  lines.push({ text: '', size: 8 });

  if (pInfo.summary) {
    lines.push({ text: 'PROFESSIONAL SUMMARY', size: 11, bold: true });
    const summaryWords = String(pInfo.summary).split(/\s+/);
    let currentLine = '';
    for (const w of summaryWords) {
      if ((currentLine + ' ' + w).length > 90) {
        lines.push({ text: currentLine.trim(), size: 9.5 });
        currentLine = w;
      } else {
        currentLine += ' ' + w;
      }
    }
    if (currentLine.trim()) lines.push({ text: currentLine.trim(), size: 9.5 });
    lines.push({ text: '', size: 6 });
  }

  const eduList = resume.education?.length ? resume.education : resume.parsedData?.education || [];
  if (eduList.length > 0) {
    lines.push({ text: 'EDUCATION', size: 11, bold: true });
    for (const edu of eduList) {
      const deg = edu.degree || '';
      const inst = edu.institution || '';
      const yr = edu.endDate || edu.year || '';
      const gpa = edu.gpa ? ` (GPA: ${edu.gpa})` : '';
      lines.push({ text: `${deg} - ${inst} ${yr}${gpa}`.trim(), size: 9.5 });
    }
    lines.push({ text: '', size: 6 });
  }

  const expList = resume.experience?.length ? resume.experience : resume.parsedData?.experience || [];
  if (expList.length > 0) {
    lines.push({ text: 'EXPERIENCE', size: 11, bold: true });
    for (const exp of expList) {
      const title = exp.title || exp.jobTitle || '';
      const company = exp.company || '';
      const dur = exp.startDate ? `${exp.startDate} - ${exp.endDate || 'Present'}` : exp.duration || '';
      lines.push({ text: `${title} at ${company} (${dur})`, size: 10, bold: true });
      const descArr = Array.isArray(exp.description)
        ? exp.description
        : exp.description
        ? [exp.description]
        : [];
      for (const d of descArr) {
        lines.push({ text: `- ${String(d).slice(0, 95)}`, size: 9 });
      }
    }
    lines.push({ text: '', size: 6 });
  }

  const projList = resume.projects?.length ? resume.projects : resume.parsedData?.projects || [];
  if (projList.length > 0) {
    lines.push({ text: 'PROJECTS', size: 11, bold: true });
    for (const proj of projList) {
      const name = proj.name || proj.title || '';
      const techs = Array.isArray(proj.technologies) && proj.technologies.length ? ` [${proj.technologies.join(', ')}]` : '';
      lines.push({ text: `${name}${techs}`, size: 10, bold: true });
      if (proj.description) {
        lines.push({ text: `  ${String(proj.description).slice(0, 95)}`, size: 9 });
      }
    }
    lines.push({ text: '', size: 6 });
  }

  const skillsObj = resume.skills || {};
  const flatSkills: string[] = [];
  if (typeof skillsObj === 'object' && !Array.isArray(skillsObj) && Object.keys(skillsObj).length > 0) {
    lines.push({ text: 'SKILLS', size: 11, bold: true });
    for (const [cat, list] of Object.entries(skillsObj)) {
      const valStr = Array.isArray(list) ? list.join(', ') : String(list || '');
      if (valStr) lines.push({ text: `${cat}: ${valStr}`, size: 9.5 });
    }
    lines.push({ text: '', size: 6 });
  } else if (resume.parsedData?.skills?.length) {
    flatSkills.push(...resume.parsedData.skills);
    lines.push({ text: 'SKILLS', size: 11, bold: true });
    lines.push({ text: flatSkills.join(', '), size: 9.5 });
    lines.push({ text: '', size: 6 });
  }

  const certList = resume.certifications?.length ? resume.certifications : resume.parsedData?.certifications || [];
  if (certList.length > 0) {
    lines.push({ text: 'CERTIFICATIONS', size: 11, bold: true });
    for (const c of certList) {
      const cText = typeof c === 'string' ? c : `${c.name || ''}${c.issuer ? ' - ' + c.issuer : ''}`;
      if (cText.trim()) lines.push({ text: `- ${cText}`, size: 9.5 });
    }
  }

  let contentOps = 'BT\n';
  let y = 750;
  for (const item of lines) {
    if (y < 50) break;
    if (!item.text) {
      y -= item.size;
      continue;
    }
    const font = item.bold ? '/F2' : '/F1';
    contentOps += `${font} ${item.size} Tf\n50 ${y} Td\n(${esc(item.text)}) Tj\n-50 -${y} Td\n`;
    y -= item.size + 5;
  }
  contentOps += 'ET\n';

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n'
  );
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');
  objects.push(
    `6 0 obj\n<< /Length ${Buffer.byteLength(contentOps, 'utf8')} >>\nstream\n${contentOps}endstream\nendobj\n`
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

export const formatResumeResponse = (resume: any) => {
  if (!resume) return null;
  const obj = typeof resume.toObject === 'function' ? resume.toObject() : { ...resume };

  if (!obj.personalInfo || Object.keys(obj.personalInfo).length === 0) {
    obj.personalInfo = {
      name: obj.parsedData?.name || '',
      email: obj.parsedData?.email || '',
      phone: obj.parsedData?.phone || '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
      summary: obj.parsedData?.summary || '',
    };
  }

  if (!obj.education || obj.education.length === 0) {
    obj.education = (obj.parsedData?.education || []).map((edu: any) => ({
      degree: edu.degree || '',
      institution: edu.institution || '',
      year: edu.year,
      startDate: edu.startDate || '',
      endDate: edu.endDate || (edu.year ? String(edu.year) : ''),
      fieldOfStudy: edu.fieldOfStudy || '',
      gpa: edu.gpa || '',
      type: edu.type || 'Degree',
    }));
  }

  if (!obj.experience || obj.experience.length === 0) {
    obj.experience = (obj.parsedData?.experience || []).map((exp: any) => ({
      title: exp.title || exp.jobTitle || '',
      company: exp.company || '',
      startDate: exp.startDate || exp.duration || '',
      endDate: exp.endDate || '',
      location: exp.location || '',
      description: Array.isArray(exp.description)
        ? exp.description
        : exp.description
        ? [exp.description]
        : [],
      type: exp.type || 'Full-time',
    }));
  }

  if (!obj.projects || obj.projects.length === 0) {
    obj.projects = (obj.parsedData?.projects || []).map((proj: any) => ({
      name: proj.name || proj.title || '',
      description: proj.description || '',
      technologies: proj.technologies || [],
      link: proj.link || '',
    }));
  }

  if (!obj.skills || (typeof obj.skills === 'object' && Object.keys(obj.skills).length === 0)) {
    const rawSkills: string[] = obj.parsedData?.skills || [];
    if (rawSkills.length > 0) {
      obj.skills = {
        'Technical Skills': rawSkills,
      };
    } else {
      obj.skills = {};
    }
  }

  if (!obj.certifications || obj.certifications.length === 0) {
    obj.certifications = (obj.parsedData?.certifications || []).map((c: any) =>
      typeof c === 'string' ? { name: c, issuer: '', date: '' } : c
    );
  }

  if (!obj.achievements) {
    obj.achievements = [];
  }

  return obj;
};

function composeRawTextFromStructuredResume(resume: any): string {
  const p = resume.personalInfo || {};
  const skillsFlat: string[] = [];
  if (resume.skills && typeof resume.skills === 'object') {
    for (const val of Object.values(resume.skills)) {
      if (Array.isArray(val)) skillsFlat.push(...val.map(String));
      else if (typeof val === 'string') skillsFlat.push(...val.split(',').map((s) => s.trim()));
    }
  }
  if (resume.parsedData?.skills?.length) {
    skillsFlat.push(...resume.parsedData.skills);
  }
  const uniqueSkills = Array.from(new Set(skillsFlat.filter(Boolean)));

  const expText = (resume.experience || [])
    .map(
      (e: any) =>
        `Experience: ${e.title || e.jobTitle || ''} at ${e.company || ''} (${e.startDate || e.duration || ''}) ${
          Array.isArray(e.description) ? e.description.join(' ') : e.description || ''
        }`
    )
    .join('\n');

  const eduText = (resume.education || [])
    .map((ed: any) => `Education: ${ed.degree || ''} from ${ed.institution || ''} ${ed.endDate || ed.year || ''} GPA: ${ed.gpa || ''}`)
    .join('\n');

  const projText = (resume.projects || [])
    .map((pr: any) => `Projects: ${pr.name || pr.title || ''} - ${pr.description || ''} (${(pr.technologies || []).join(', ')})`)
    .join('\n');

  const certText = (resume.certifications || [])
    .map((c: any) => (typeof c === 'string' ? c : `${c.name || ''} ${c.issuer || ''}`))
    .join(', ');

  return [
    p.name || resume.parsedData?.name,
    p.email || resume.parsedData?.email,
    p.phone || resume.parsedData?.phone,
    p.linkedin,
    p.github,
    p.summary || resume.parsedData?.summary,
    uniqueSkills.length ? `Skills: ${uniqueSkills.join(', ')}` : '',
    expText,
    eduText,
    projText,
    certText ? `Certifications: ${certText}` : '',
    (resume.achievements || []).join('\n'),
  ]
    .filter(Boolean)
    .join('\n');
}

export const uploadResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('Please attach a valid resume file (PDF, DOCX, or TXT)', 400);
  }

  const userId = req.user?.userId;
  let rawText = '';
  let parsedResult: any = null;

  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    rawText = await extractTextFromFile(fileBuffer, req.file.originalname);
    parsedResult = await parseResumeWithGemini(rawText);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    throw err;
  }

  const fileUrl = `/uploads/resumes/${req.file.filename}`;

  if (parsedResult.skills && parsedResult.skills.length > 0) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { skills: { $each: parsedResult.skills } },
    });
  }

  let resume = await Resume.findOne({ student: userId });

  if (resume) {
    resume.versionHistory.push({
      version: resume.versionHistory.length + 1,
      uploadedAt: resume.uploadedAt || new Date(),
      fileUrl: resume.fileUrl,
      atsScore: resume.atsScore,
    });

    resume.fileUrl = fileUrl;
    resume.originalName = req.file.originalname;
    resume.mimeType = req.file.mimetype;
    resume.size = req.file.size;
    resume.rawText = rawText;
    resume.parsedData = {
      name: parsedResult.name,
      email: parsedResult.email,
      phone: parsedResult.phone,
      summary: parsedResult.summary,
      skills: parsedResult.skills,
      experience: parsedResult.experience,
      education: parsedResult.education,
      projects: parsedResult.projects,
      certifications: parsedResult.certifications,
    };
    resume.personalInfo = {
      ...resume.personalInfo,
      name: parsedResult.name || resume.personalInfo?.name || '',
      email: parsedResult.email || resume.personalInfo?.email || '',
      phone: parsedResult.phone || resume.personalInfo?.phone || '',
      summary: parsedResult.summary || resume.personalInfo?.summary || '',
    };
    resume.skills = { 'Technical Skills': parsedResult.skills || [] };
    resume.atsScore = parsedResult.atsScore;
    resume.atsBreakdown = parsedResult.atsBreakdown;
    resume.aiSuggestions = parsedResult.aiSuggestions;
    resume.uploadedAt = new Date();

    await resume.save();
  } else {
    resume = await Resume.create({
      student: userId,
      fileUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      rawText,
      parsedData: {
        name: parsedResult.name,
        email: parsedResult.email,
        phone: parsedResult.phone,
        summary: parsedResult.summary,
        skills: parsedResult.skills,
        experience: parsedResult.experience,
        education: parsedResult.education,
        projects: parsedResult.projects,
        certifications: parsedResult.certifications,
      },
      personalInfo: {
        name: parsedResult.name || '',
        email: parsedResult.email || '',
        phone: parsedResult.phone || '',
        summary: parsedResult.summary || '',
      },
      skills: { 'Technical Skills': parsedResult.skills || [] },
      atsScore: parsedResult.atsScore,
      atsBreakdown: parsedResult.atsBreakdown,
      aiSuggestions: parsedResult.aiSuggestions,
      versionHistory: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Resume uploaded and analyzed by AI successfully',
    data: formatResumeResponse(resume),
  });
});

export const getMyResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const resume = await Resume.findOne({ student: userId });

  if (!resume) {
    return res.status(200).json({
      success: true,
      message: 'No resume found',
      data: null,
    });
  }

  return res.status(200).json({
    success: true,
    data: formatResumeResponse(resume),
  });
});

export const analyzeResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  let query: any = { student: userId };
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    query = { _id: id, student: userId };
  }

  const resume = await Resume.findOne(query);
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  let textToAnalyze = composeRawTextFromStructuredResume(resume) || resume.rawText;
  if (!textToAnalyze && resume.fileUrl) {
    const uploadsRoot = getResumeUploadDir();
    const filePath = path.resolve(uploadsRoot, path.basename(resume.fileUrl));
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      textToAnalyze = await extractTextFromFile(fileBuffer, resume.originalName);
    }
  }

  resume.rawText = textToAnalyze || 'Candidate Resume';
  const parsedResult = await parseResumeWithGemini(resume.rawText);

  resume.atsScore = parsedResult.atsScore;
  resume.atsBreakdown = parsedResult.atsBreakdown;
  resume.aiSuggestions = parsedResult.aiSuggestions;

  if (parsedResult.skills && parsedResult.skills.length > 0) {
    const mergedSkills = Array.from(new Set([...(resume.parsedData?.skills || []), ...parsedResult.skills]));
    resume.parsedData.skills = mergedSkills;
    await User.findByIdAndUpdate(userId, {
      $addToSet: { skills: { $each: mergedSkills } },
    });
  }

  await resume.save();

  return res.status(200).json({
    success: true,
    message: 'AI analysis completed successfully',
    data: formatResumeResponse(resume),
  });
});

export const updateResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  let query: any = { student: userId };
  if (id && id !== 'my-resume' && id !== 'new' && mongoose.Types.ObjectId.isValid(id)) {
    query = { _id: id, student: userId };
  }

  let resume = await Resume.findOne(query);
  if (!resume) {
    const userDoc = await User.findById(userId);
    resume = new Resume({
      student: userId,
      fileUrl: `/uploads/resumes/authored_${userId}.pdf`,
      originalName: `${(userDoc?.name || 'Student').replace(/\s+/g, '_')}_Resume.pdf`,
      mimeType: 'application/pdf',
      size: 4096,
      rawText: '',
      parsedData: {
        name: userDoc?.name || '',
        email: userDoc?.email || '',
        phone: userDoc?.phone || '',
        summary: userDoc?.bio || '',
        skills: userDoc?.skills || [],
        experience: [],
        education: userDoc?.department
          ? [
              {
                degree: `B.Tech in ${userDoc.department}`,
                institution: 'University Engineering Institute',
                year: userDoc.graduationYear || 2026,
              },
            ]
          : [],
        projects: [],
        certifications: [],
      },
      personalInfo: {
        name: userDoc?.name || '',
        email: userDoc?.email || '',
        phone: userDoc?.phone || '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
        summary: userDoc?.bio || '',
      },
      skills: userDoc?.skills?.length ? { 'Technical Skills': userDoc.skills } : {},
      atsScore: 0,
      atsBreakdown: {
        skillCoverageScore: 0,
        experienceScore: 0,
        educationScore: 0,
        formattingScore: 0,
      },
      aiSuggestions: [],
      versionHistory: [],
    });
  }

  const allowedSections = [
    'personal',
    'personalInfo',
    'education',
    'experience',
    'projects',
    'skills',
    'certifications',
    'achievements',
    'parsedData',
  ];

  for (const key of Object.keys(req.body)) {
    if (allowedSections.includes(key)) {
      if (key === 'personal' || key === 'personalInfo') {
        resume.personalInfo = { ...resume.personalInfo, ...req.body[key] };
        if (!resume.parsedData) {
          resume.parsedData = { skills: [], experience: [], education: [], projects: [], certifications: [] };
        }
        if (req.body[key].name !== undefined) resume.parsedData.name = req.body[key].name;
        if (req.body[key].email !== undefined) resume.parsedData.email = req.body[key].email;
        if (req.body[key].phone !== undefined) resume.parsedData.phone = req.body[key].phone;
        if (req.body[key].summary !== undefined) resume.parsedData.summary = req.body[key].summary;
      } else {
        (resume as any)[key] = req.body[key];
      }
    }
  }

  // Synchronize flat skills into parsedData.skills and User.skills
  const flatSkills: string[] = [];
  if (resume.skills && typeof resume.skills === 'object') {
    for (const val of Object.values(resume.skills)) {
      if (Array.isArray(val)) {
        flatSkills.push(...val.map((s) => String(s).trim()).filter(Boolean));
      } else if (typeof val === 'string') {
        flatSkills.push(
          ...val
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }
    }
  }
  if (flatSkills.length > 0) {
    resume.parsedData.skills = Array.from(new Set(flatSkills));
    await User.findByIdAndUpdate(userId, {
      $set: { skills: resume.parsedData.skills },
    });
  }

  // Recompute rawText and ATS score when sections are updated
  resume.rawText = composeRawTextFromStructuredResume(resume);
  try {
    const parsedResult = await parseResumeWithGemini(resume.rawText);
    resume.atsScore = parsedResult.atsScore;
    resume.atsBreakdown = parsedResult.atsBreakdown;
    resume.aiSuggestions = parsedResult.aiSuggestions;
  } catch {
    // Keep existing ATS score if in unit test mode without Gemini key
  }

  resume.markModified('personalInfo');
  resume.markModified('education');
  resume.markModified('experience');
  resume.markModified('projects');
  resume.markModified('skills');
  resume.markModified('certifications');
  resume.markModified('achievements');
  resume.markModified('parsedData');

  await resume.save();

  return res.status(200).json({
    success: true,
    message: 'Resume saved and updated successfully',
    data: formatResumeResponse(resume),
  });
});

export const deleteResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  let query: any = { student: userId };
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    query = { _id: id, student: userId };
  }

  const resume = await Resume.findOneAndDelete(query);

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  if (resume.fileUrl) {
    const uploadsRoot = getResumeUploadDir();
    const filePath = path.resolve(uploadsRoot, path.basename(resume.fileUrl));
    if (filePath.startsWith(`${uploadsRoot}${path.sep}`)) {
      fs.rm(filePath, { force: true }, () => {});
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Resume deleted successfully',
  });
});

export const downloadResume = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  const userId = req.user?.userId;
  const role = req.user?.role;
  const isOwner = resume.student.toString() === userId;
  if (req.baseUrl.endsWith('/resumes') && role === UserRole.RECRUITER) {
    const applicationId = String(req.query.applicationId || '');
    if (!applicationId) throw new AppError('Application context is required to access this resume', 403);
    const application = await Application.findOne({ _id: applicationId, resume: resume._id }).select('job');
    if (!application || !(await Job.exists({ _id: application.job, postedBy: userId }))) {
      throw new AppError('Unauthorized to access this resume', 403);
    }
  } else if (
    !isOwner &&
    role !== UserRole.ADMIN &&
    role !== UserRole.SUPER_ADMIN &&
    role !== UserRole.PLACEMENT_OFFICER
  ) {
    throw new AppError('Unauthorized to access this resume', 403);
  }

  const safeFilename = path.basename(resume.originalName || 'resume.pdf').replace(/[\r\n"\\]/g, '_');

  if (resume.fileUrl) {
    const uploadsRoot = getResumeUploadDir();
    const filePath = path.resolve(uploadsRoot, path.basename(resume.fileUrl));
    if (filePath.startsWith(`${uploadsRoot}${path.sep}`) && fs.existsSync(filePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      res.setHeader('Content-Type', resume.mimeType || 'application/pdf');
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // Generate clean PDF dynamically from the structured resume data if built in ResumeBuilder
  const pdfBuffer = buildPdfBufferFromResume(formatResumeResponse(resume));
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename.endsWith('.pdf') ? safeFilename : `${safeFilename}.pdf`}"`);
  res.setHeader('Content-Type', 'application/pdf');
  return res.status(200).send(pdfBuffer);
});
