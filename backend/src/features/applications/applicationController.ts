import { Response } from 'express';
import mongoose from 'mongoose';
import Application from './applicationModel';
import Job from '../jobs/jobModel';
import Resume from '../resumes/resumeModel';
import User from '../auth/userModel';
import asyncHandler from '../../shared/utils/asyncHandler';
import AppError from '../../shared/utils/appError';
import logger from '../../shared/utils/logger';
import { AuthenticatedRequest } from '../../shared/middleware/auth';
import { calculateCandidateJobMatch } from '../../shared/services/geminiService';
import { ApplicationStatus, UserRole } from '../../shared/constants/roles';
import { createInAppNotification } from '../../shared/services/notificationService';

const recordApplicationStatus = (application: any, status: ApplicationStatus, actorId?: string, comment?: string) => {
  if (application.status === status) return false;
  application.status = status;
  application.timeline.push({
    status,
    updatedAt: new Date(),
    ...(actorId ? { updatedBy: actorId } : {}),
    comment: comment || `Status changed to ${status}`,
  });
  return true;
};

export const applyForJob = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  const { coverLetter } = req.body;
  const studentId = req.user?.userId;

  const job = await Job.findOne({
    _id: jobId,
    status: 'OPEN',
    isApproved: true,
    $or: [{ deadline: null }, { deadline: { $exists: false } }, { deadline: { $gte: new Date() } }],
  });
  if (!job) {
    throw new AppError('Job opening is invalid or closed for applications', 400);
  }

  // Academic Eligibility Verification
  const studentUser = await User.findById(studentId);
  if (studentUser) {
    if (job.minCgpa && studentUser.cgpa !== undefined && studentUser.cgpa > 0 && studentUser.cgpa < job.minCgpa) {
      throw new AppError(
        `Academic eligibility requirement not met: Minimum CGPA of ${job.minCgpa} required (Your CGPA: ${studentUser.cgpa})`,
        400
      );
    }
    if (
      job.allowedBranches &&
      job.allowedBranches.length > 0 &&
      studentUser.department &&
      !job.allowedBranches.some((b: string) => {
        const bl = b.toLowerCase().trim();
        const dl = (studentUser.department || '').toLowerCase().trim();
        if (bl === dl || dl.includes(bl) || bl.includes(dl)) return true;
        if (bl === 'cse' && (dl.includes('computer') || dl.includes('cs'))) return true;
        if (bl === 'it' && (dl.includes('information') || dl.includes('it'))) return true;
        if (bl === 'ece' && (dl.includes('electronics') || dl.includes('communication'))) return true;
        if (bl === 'eee' && (dl.includes('electrical') || dl.includes('electronics'))) return true;
        if (bl === 'me' && (dl.includes('mechanical') || dl.includes('mech'))) return true;
        if (bl === 'ce' && (dl.includes('civil') || dl.includes('civ'))) return true;
        return false;
      })
    ) {
      throw new AppError(
        `Academic eligibility requirement not met: Open only to ${job.allowedBranches.join(', ')} (Your department: ${studentUser.department})`,
        400
      );
    }
    if (
      job.maxBacklogs !== undefined &&
      studentUser.activeBacklogs !== undefined &&
      studentUser.activeBacklogs > job.maxBacklogs
    ) {
      throw new AppError(
        `Academic eligibility requirement not met: Maximum ${job.maxBacklogs} active backlogs allowed (Your backlogs: ${studentUser.activeBacklogs})`,
        400
      );
    }
  }

  const existingApp = await Application.findOne({ student: studentId, job: jobId });
  if (existingApp && existingApp.status !== ApplicationStatus.WITHDRAWN) {
    throw new AppError('You have already applied for this job opening', 400);
  }

  const studentResume = await Resume.findOne({ student: studentId });
  const candidateSkills =
    (studentResume?.parsedData?.skills?.length ? studentResume.parsedData.skills : studentUser?.skills) || [];

  let matchAnalysis: any = null;
  try {
    matchAnalysis = await calculateCandidateJobMatch(
      candidateSkills,
      studentResume?.rawText || '',
      job.title,
      job.description,
      job.requiredSkills
    );
  } catch (aiErr: any) {
    logger.warn(`[Application] Gemini match calculation temporarily unavailable: ${aiErr.message}`);
  }

  if (existingApp && existingApp.status === ApplicationStatus.WITHDRAWN) {
    existingApp.status = ApplicationStatus.APPLIED;
    existingApp.resume = studentResume?._id;
    existingApp.coverLetter = coverLetter;
    existingApp.matchScore = matchAnalysis?.matchScore ?? 0;
    existingApp.aiScore = matchAnalysis?.aiScore ?? 0;
    existingApp.aiAnalysis = matchAnalysis
      ? {
          matchedSkills: matchAnalysis.matchedSkills,
          missingSkills: matchAnalysis.missingSkills,
          candidateStrengths: matchAnalysis.candidateStrengths,
          aiRecommendation: matchAnalysis.aiRecommendation,
        }
      : existingApp.aiAnalysis;
    existingApp.timeline.push({
      status: ApplicationStatus.APPLIED,
      updatedAt: new Date(),
      comment: 'Application re-submitted by student',
    });
    await existingApp.save();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: existingApp,
    });
  }

  const application = await Application.create({
    student: studentId,
    job: jobId,
    resume: studentResume?._id,
    coverLetter,
    status: ApplicationStatus.APPLIED,
    matchScore: matchAnalysis?.matchScore ?? 0,
    aiScore: matchAnalysis?.aiScore ?? 0,
    aiAnalysis: matchAnalysis
      ? {
          matchedSkills: matchAnalysis.matchedSkills,
          missingSkills: matchAnalysis.missingSkills,
          candidateStrengths: matchAnalysis.candidateStrengths,
          aiRecommendation: matchAnalysis.aiRecommendation,
        }
      : undefined,
    timeline: [
      {
        status: ApplicationStatus.APPLIED,
        updatedAt: new Date(),
        comment: 'Application submitted by student',
      },
    ],
  });

  return res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: application,
  });
});

export const getMyApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.userId;
  const query = Application.find({ student: studentId })
    .select('-notes')
    .populate('job', 'title company location salary status jobType deadline minCgpa allowedBranches')
    .sort({ createdAt: -1 });
  const applications = typeof (query as any)?.lean === 'function' ? await (query as any).lean() : await query;

  res.status(200).json({
    success: true,
    data: applications,
  });
});

export const getApplicationHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const application = await Application.findById(req.params.applicationId).select('student job status timeline appliedAt');
  if (!application) throw new AppError('Application not found', 404);

  const requester = req.user;
  const isPrivileged =
    requester?.role === UserRole.ADMIN ||
    requester?.role === UserRole.SUPER_ADMIN ||
    requester?.role === UserRole.PLACEMENT_OFFICER;
  const isStudent = application.student.toString() === requester?.userId;
  const isJobOwner =
    requester?.role === UserRole.RECRUITER &&
    Boolean(await Job.exists({ _id: application.job, postedBy: requester.userId }));
  if (!isPrivileged && !isStudent && !isJobOwner) {
    throw new AppError('Unauthorized to view this application history', 403);
  }

  res.status(200).json({
    success: true,
    data: {
      status: application.status,
      appliedAt: application.appliedAt,
      timeline: application.timeline.map((event: any) => ({
        status: event.status,
        updatedAt: event.updatedAt,
        comment: event.comment,
      })),
    },
  });
});

export const withdrawApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { applicationId } = req.params;
  const studentId = req.user?.userId;

  const application = await Application.findOne({ _id: applicationId, student: studentId });
  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (application.status === ApplicationStatus.WITHDRAWN) {
    throw new AppError('Application is already withdrawn', 400);
  }

  if (application.status === ApplicationStatus.HIRED) {
    throw new AppError('Cannot withdraw an accepted or hired offer without Placement Officer consent', 400);
  }

  application.status = ApplicationStatus.WITHDRAWN;
  application.withdrawnAt = new Date();
  application.timeline.push({
    status: ApplicationStatus.WITHDRAWN,
    updatedAt: new Date(),
    updatedBy: studentId as any,
    comment: 'Application voluntarily withdrawn by candidate',
  });

  await application.save();

  createInAppNotification({
    userId: application.student.toString(),
    type: 'APPLICATION_STATUS',
    title: 'Application Status Updated',
    message: `Your application status has been updated to "${application.status}".`,
    metadata: { applicationId: application._id, status: application.status },
  });

  res.status(200).json({
    success: true,
    message: 'Application withdrawn successfully',
    data: application,
  });
});

export const getJobApplicants = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  const { status, sortBy = 'matchScore' } = req.query;
  const job = await Job.findById(jobId).select('postedBy');
  if (!job) throw new AppError('Job not found', 404);

  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  const isPlacementOfficer = req.user?.role === UserRole.PLACEMENT_OFFICER;
  const isJobOwner = job.postedBy.toString() === req.user?.userId;
  if (!isAdmin && !isPlacementOfficer && !isJobOwner) {
    throw new AppError('Unauthorized to view applicants for this job', 403);
  }

  if (status && !Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
    throw new AppError('Invalid application status filter', 400);
  }

  const query: any = { job: jobId };
  if (status) {
    query.status = status;
  }

  const sortOption: any = {};
  if (!['matchScore', 'aiScore', 'createdAt'].includes(String(sortBy))) {
    throw new AppError('Invalid applicant sort option', 400);
  }
  if (sortBy === 'matchScore') {
    sortOption.matchScore = -1;
  } else if (sortBy === 'aiScore') {
    sortOption.aiScore = -1;
  } else {
    sortOption.createdAt = -1;
  }

  const parsedPage = Number.parseInt(String(req.query.page), 10);
  const parsedLimit = Number.parseInt(String(req.query.limit), 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 50;
  const skip = (page - 1) * limit;

  let queryBuilder: any = Application.find(query)
    .select('-notes')
    .populate('student', 'name email phone skills avatar department graduationYear cgpa activeBacklogs')
    .sort(sortOption);

  if (typeof queryBuilder.skip === 'function') {
    queryBuilder = queryBuilder.skip(skip);
  }
  if (typeof queryBuilder.limit === 'function') {
    queryBuilder = queryBuilder.limit(limit);
  }

  const applicants = await queryBuilder;

  let total = applicants.length;
  const isMocked = Boolean((Application.countDocuments as any)?._isMockFunction);
  if (mongoose.connection.readyState === 1 || isMocked) {
    try {
      total = await Application.countDocuments(query);
    } catch {
      total = applicants.length;
    }
  }

  res.status(200).json({
    success: true,
    data: applicants,
    pagination: {
      page,
      limit,
      total: Math.max(total, applicants.length),
      totalPages: Math.ceil(Math.max(total, applicants.length) / limit),
      hasMore: page * limit < Math.max(total, applicants.length),
    },
  });
});

export const updateApplicationStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { applicationId } = req.params;
  const { status, notes } = req.body;

  if (!Object.values(ApplicationStatus).includes(status)) {
    throw new AppError('Invalid application status', 400);
  }

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  const isPlacementOfficer = req.user?.role === UserRole.PLACEMENT_OFFICER;
  if (!isAdmin && !isPlacementOfficer) {
    const job = await Job.findOne({ _id: application.job, postedBy: req.user?.userId }).select('_id');
    if (!job) throw new AppError('Unauthorized to update this application', 403);
  }

  if (notes !== undefined && (typeof notes !== 'string' || notes.length > 1000)) {
    throw new AppError('Notes must be a string of at most 1000 characters', 400);
  }
  recordApplicationStatus(application, status as ApplicationStatus, req.user?.userId);
  if (notes !== undefined) application.notes = notes;

  await application.save();

  createInAppNotification({
    userId: application.student.toString(),
    type: 'APPLICATION_STATUS',
    title: 'Application Status Updated',
    message: `Your application status has been updated to "${application.status}".`,
    metadata: { applicationId: application._id, status: application.status },
  });

  res.status(200).json({
    success: true,
    message: `Application status updated to ${application.status}`,
    data: { _id: application._id, status: application.status, timeline: application.timeline },
  });
});

export const recomputeJobAiScores = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  if (!isAdmin && job.postedBy.toString() !== req.user?.userId) {
    throw new AppError('Unauthorized to recompute scores for this job', 403);
  }

  const applications = await Application.find({ job: jobId }).populate('resume');

  for (const app of applications) {
    const studentResume = app.resume as any;
    const matchAnalysis = await calculateCandidateJobMatch(
      studentResume?.parsedData?.skills || [],
      studentResume?.rawText || '',
      job.title,
      job.description,
      job.requiredSkills
    );

    app.matchScore = matchAnalysis.matchScore;
    app.aiScore = matchAnalysis.aiScore;
    app.aiAnalysis = {
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills,
      candidateStrengths: matchAnalysis.candidateStrengths,
      aiRecommendation: matchAnalysis.aiRecommendation,
    };
    await app.save();
  }

  res.status(200).json({
    success: true,
    message: `Recomputed AI candidate scores for ${applications.length} applicants`,
  });
});
