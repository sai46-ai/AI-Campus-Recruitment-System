import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/services/api';
import { Resume } from '../../shared/types';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Sparkles,
  RefreshCw,
  Plus,
  Eye,
  Edit3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';
import { Card } from '../../shared/components/ui/Card';
import { Modal } from '../../shared/components/ui/Modal';
import { cn } from '../../shared/utils/cn';
import { ResumeAtsGauge } from './components/ResumeAtsGauge';
import { ResumeSectionViewer } from './components/ResumeSectionViewer';

const sectionOrder = [
  { key: 'personal', label: 'Personal Info' },
  { key: 'education', label: 'Education' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'achievements', label: 'Achievements' },
];

export const ResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isErrorMsg, setIsErrorMsg] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  const [editModal, setEditModal] = useState<{
    open: boolean;
    section: string;
    data: any;
  }>({ open: false, section: '', data: null });

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resumes/my-resume');
      setResume(res.data.data);
    } catch {
      // No existing resume yet
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeFromProfile = async () => {
    setSaving(true);
    setUploadMessage('');
    setIsErrorMsg(false);
    try {
      const initialPayload = {
        originalName: `${(user?.name || 'Student').replace(/\s+/g, '_')}_Resume.pdf`,
        personalInfo: {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          location: 'Campus',
          summary: user?.bio || `Final-year ${user?.department || 'Engineering'} candidate seeking software and systems engineering roles.`,
        },
        education: user?.department
          ? [
              {
                degree: `B.Tech in ${user.department}`,
                institution: 'University Campus',
                fieldOfStudy: user.department,
                startDate: user.graduationYear ? String(Number(user.graduationYear) - 4) : '2022',
                endDate: user.graduationYear ? String(user.graduationYear) : '2026',
                gpa: user.cgpa ? String(user.cgpa) : '',
                type: 'Degree',
              },
            ]
          : [],
        skills: {
          'Core Competencies': user?.skills?.length ? user.skills : ['TypeScript', 'Python', 'React', 'Node.js'],
        },
        experience: [],
        projects: [],
        certifications: [],
        achievements: [],
      };
      const res = await api.post('/resumes/save', initialPayload);
      setResume(res.data.data);
      setUploadMessage('Initialized interactive resume from your authenticated profile.');
    } catch (err: any) {
      setIsErrorMsg(true);
      setUploadMessage(err.response?.data?.message || 'Could not initialize resume.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage('');
    setIsErrorMsg(false);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResume(res.data.data);
      setUploadMessage('Resume uploaded and analyzed with ATS scoring.');
    } catch (err: any) {
      setIsErrorMsg(true);
      setUploadMessage(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume) return;
    setAnalyzing(true);
    setUploadMessage('');
    setIsErrorMsg(false);
    try {
      const res = await api.post(`/resumes/${resume._id}/analyze`);
      setResume(res.data.data);
      setUploadMessage('ATS analysis and keyword diagnostics updated.');
    } catch (err: any) {
      setIsErrorMsg(true);
      setUploadMessage(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!resume) return;
    try {
      const res = await api.get(`/resumes/${resume._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(user?.name || 'Student').replace(/\s+/g, '_')}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setIsErrorMsg(true);
      setUploadMessage('Failed to download resume PDF.');
    }
  };

  const handleDelete = async () => {
    if (!resume || !window.confirm('Delete your resume? This action cannot be undone.')) return;
    try {
      await api.delete(`/resumes/${resume._id}`);
      setResume(null);
      setUploadMessage('Resume deleted.');
      setIsErrorMsg(false);
    } catch (err: any) {
      setIsErrorMsg(true);
      setUploadMessage(err.response?.data?.message || 'Delete failed.');
    }
  };

  const openEditModal = (section: string, currentData: any) => {
    let cloned: any;
    if (section === 'personal') {
      cloned = {
        name: currentData?.name || user?.name || '',
        email: currentData?.email || user?.email || '',
        phone: currentData?.phone || user?.phone || '',
        location: currentData?.location || '',
        linkedin: currentData?.linkedin || '',
        github: currentData?.github || '',
        portfolio: currentData?.portfolio || '',
        summary: currentData?.summary || '',
      };
    } else if (section === 'skills') {
      const entries = Object.entries(currentData || {});
      cloned =
        entries.length > 0
          ? entries.map(([cat, list]) => ({
              category: cat,
              itemsText: Array.isArray(list) ? list.join(', ') : String(list || ''),
            }))
          : [{ category: 'Core Engineering', itemsText: (resume?.parsedData?.skills || []).join(', ') }];
    } else if (section === 'achievements') {
      cloned = Array.isArray(currentData) && currentData.length > 0 ? [...currentData] : [''];
    } else {
      cloned = Array.isArray(currentData) ? JSON.parse(JSON.stringify(currentData)) : [];
    }
    setEditModal({ open: true, section, data: cloned });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, section: '', data: null });
  };

  const saveSection = async () => {
    if (!resume || !editModal.section) return;
    setSaving(true);
    setIsErrorMsg(false);
    try {
      const payload: Record<string, any> = {};
      if (editModal.section === 'personal') {
        payload.personalInfo = editModal.data;
      } else if (editModal.section === 'skills') {
        const skillsMap: Record<string, string[]> = {};
        (editModal.data || []).forEach((row: { category: string; itemsText: string }) => {
          const cat = (row.category || 'Technical Skills').trim();
          const items = (row.itemsText || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          if (cat && items.length > 0) {
            skillsMap[cat] = items;
          }
        });
        payload.skills = skillsMap;
      } else if (editModal.section === 'achievements') {
        payload.achievements = (editModal.data || []).map((s: string) => s.trim()).filter(Boolean);
      } else {
        payload[editModal.section] = editModal.data;
      }

      const res = await api.patch(`/resumes/${resume._id}`, payload);
      setResume(res.data.data);
      setUploadMessage('Resume section saved and ATS score updated.');
      closeEditModal();
    } catch (err: any) {
      setIsErrorMsg(true);
      setUploadMessage(err.response?.data?.message || 'Failed to save section changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-busy="true">
          <Card className="p-6 animate-pulse lg:col-span-2 bg-tideglass-surface border border-[#D4DED3]">
            <div className="h-8 w-1/3 bg-[#D8E6E1] rounded mb-6" />
            <div className="space-y-4">
              <div className="h-4 bg-[#D8E6E1] rounded" />
              <div className="h-4 bg-[#D8E6E1] rounded" />
              <div className="h-4 bg-[#D8E6E1] rounded" />
            </div>
          </Card>
          <Card className="p-6 animate-pulse bg-tideglass-surface border border-[#D4DED3]">
            <div className="h-8 w-1/2 bg-[#D8E6E1] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-16 bg-[#D8E6E1] rounded" />
              <div className="h-16 bg-[#D8E6E1] rounded" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3] mb-3">
            <FileText className="w-3.5 h-3.5 text-[#0A7D6E]" />
            Structured Resume &amp; ATS Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2D27] font-headline mb-2">
            Interactive Resume Builder &amp; ATS Studio
          </h1>
          <p className="text-sm text-[#516861]">
            Upload an existing PDF/DOCX resume for instant parsing or initialize a structured engineering resume directly from your profile.
          </p>
        </header>

        {uploadMessage && (
          <div
            role="alert"
            className={`mb-6 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              !isErrorMsg
                ? 'bg-[#E6F4F0] border border-emerald-400/40 text-[#066A5B]'
                : 'bg-[#FEE2E2] border border-red-400/40 text-[#991B1B]'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}

        <Card className="p-10 sm:p-12 text-center bg-tideglass-surface border border-[#D4DED3] shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-400/35 flex items-center justify-center mx-auto mb-5 text-[#0A7D6E]">
            <FileText className="w-8 h-8" aria-hidden="true" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#344942] font-headline mb-2">
            Start Your Verified Campus Resume
          </h2>
          <p className="text-sm text-[#516861] max-w-xl mx-auto mb-8 leading-relaxed">
            Build a structured, recruiter-ready resume connected to your university credentials, or upload an existing PDF/DOCX file to extract sections and compute your live ATS readiness score.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleInitializeFromProfile}
              isLoading={saving}
              disabled={saving || uploading}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Initialize Resume From My Profile</span>
            </Button>

            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-semibold bg-[#E6F4F0] text-[#344942] border border-[#D4DED3] hover:bg-[#D4ECE5] hover:border-cyan-400/50 transition-all">
                <Upload className="w-4 h-4 mr-2 text-[#0A7D6E]" aria-hidden="true" />
                <span>{uploading ? 'Uploading & Parsing...' : 'Upload PDF / DOCX'}</span>
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
                aria-label="Upload resume PDF or DOCX"
              />
            </label>

            <Button variant="outline" size="lg" asChild>
              <Link to="/jobs">Browse Campus Drives</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const previewName = resume.personalInfo?.name || resume.parsedData?.name || user?.name || 'Candidate Name';
  const previewEmail = resume.personalInfo?.email || resume.parsedData?.email || user?.email || '';
  const previewPhone = resume.personalInfo?.phone || resume.parsedData?.phone || user?.phone || '';
  const previewLocation = resume.personalInfo?.location || '';
  const previewSummary = resume.personalInfo?.summary || resume.parsedData?.summary || '';
  const allSkillsFlat: string[] =
    Object.values(resume.skills || {}).flatMap((v) => (Array.isArray(v) ? v : [String(v)])).length > 0
      ? Object.values(resume.skills || {}).flatMap((v) => (Array.isArray(v) ? v : [String(v)]))
      : resume.parsedData?.skills || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3] mb-2">
            <FileText className="w-3.5 h-3.5 text-[#0A7D6E]" />
            <span>Interactive Resume &amp; ATS Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2D27] font-headline">
            {previewName}&apos;s Resume Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#516861] mt-1">
            Live ATS score: <strong className="text-[#0A7D6E] font-mono tabular-nums">{resume.atsScore}%</strong> | File: <span className="font-mono text-[#1E6778]">{resume.originalName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-[#E6F4F0] p-1 border border-[#D4DED3]">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'editor'
                  ? 'bg-emerald-500 text-[#06281E]'
                  : 'text-[#516861] hover:text-[#344942]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Section Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'preview'
                  ? 'bg-emerald-500 text-[#06281E]'
                  : 'text-[#516861] hover:text-[#344942]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Resume Preview</span>
            </button>
          </div>

          <label className="cursor-pointer">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E6F4F0] text-[#344942] border border-[#D4DED3] hover:bg-[#D4ECE5] transition-all">
              <Upload className="w-3.5 h-3.5 mr-1.5 text-[#2879AD]" />
              <span>{uploading ? 'Uploading...' : 'Replace File'}</span>
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          <Button variant="secondary" size="sm" onClick={handleAnalyze} isLoading={analyzing} disabled={analyzing}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Run ATS Analysis
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Download PDF
          </Button>

          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </header>

      {uploadMessage && (
        <div
          role="alert"
          className={`mb-6 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            !isErrorMsg
              ? 'bg-[#E6F4F0] text-[#066A5B] border border-emerald-400/40'
              : 'bg-[#FEE2E2] text-[#991B1B] border border-red-400/40'
          }`}
        >
          {!isErrorMsg ? (
            <CheckCircle2 className="w-4 h-4 text-[#0A7D6E] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
          )}
          <span>{uploadMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: ATS Gauge, Section Nav, and AI Suggestions */}
        <div className="lg:col-span-1 space-y-5">
          <ResumeAtsGauge resume={resume} />

          <Card className="p-4 bg-tideglass-surface border border-[#D4DED3]">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#92400E] font-semibold mb-3">
              Resume Structure Sections
            </h4>
            <nav aria-label="Resume sections">
              <ul className="space-y-1.5">
                {sectionOrder.map(({ key, label }) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection(key);
                        setViewMode('editor');
                      }}
                      className={cn(
                        'w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between',
                        activeSection === key && viewMode === 'editor'
                          ? 'bg-emerald-500/20 text-[#066A5B] border border-emerald-400/40'
                          : 'text-[#344942] hover:bg-[#E6F4F0] hover:text-[#344942]'
                      )}
                      aria-current={activeSection === key ? 'page' : undefined}
                    >
                      <span>{label}</span>
                      <span className="text-[11px] font-mono text-[#516861]">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </Card>

          {resume.aiSuggestions && resume.aiSuggestions.length > 0 && (
            <Card className="p-5 bg-tideglass-surface border border-amber-400/35">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#B45309]" aria-hidden="true" />
                <h4 className="text-sm font-bold text-[#344942] font-headline">ATS Improvement Recommendations</h4>
              </div>
              <ul className="space-y-2">
                {resume.aiSuggestions.map((s, i) => (
                  <li key={i} className="text-xs text-[#344942] flex items-start space-x-2 leading-relaxed">
                    <span className="text-[#0A7D6E] font-bold mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Right: Active Section Editor OR Formatted Live Resume Preview */}
        <div className="lg:col-span-2">
          {viewMode === 'editor' ? (
            <ResumeSectionViewer
              activeSection={activeSection}
              resume={resume}
              onEdit={openEditModal}
            />
          ) : (
            <Card className="p-8 sm:p-10 bg-[#FAF6EE] text-[#102436] border border-amber-300/50 shadow-2xl rounded-2xl">
              {/* Print-Ready Warm Ivory Document Sheet Preview */}
              <div className="border-b-2 border-[#163850] pb-5 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2233] tracking-tight font-headline">
                    {previewName}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#285370] font-medium mt-1">
                    {[previewEmail, previewPhone, previewLocation].filter(Boolean).join(' • ')}
                  </p>
                  {(resume.personalInfo?.linkedin || resume.personalInfo?.github || resume.personalInfo?.portfolio) && (
                    <p className="text-xs text-[#0d9488] font-mono mt-1">
                      {[resume.personalInfo?.linkedin, resume.personalInfo?.github, resume.personalInfo?.portfolio]
                        .filter(Boolean)
                        .join(' | ')}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full bg-[#0d9488]/15 text-[#0f766e] font-mono text-xs font-bold border border-[#0d9488]/30 self-start sm:self-auto">
                  ATS Verified: {resume.atsScore}%
                </span>
              </div>

              {previewSummary && (
                <section className="mb-6">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0f766e] border-b border-[#cbd5e1] pb-1 mb-2">
                    Professional Summary
                  </h3>
                  <p className="text-sm text-[#1e293b] leading-relaxed">{previewSummary}</p>
                </section>
              )}

              {(resume.education?.length ?? 0) > 0 && (
                <section className="mb-6">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0f766e] border-b border-[#cbd5e1] pb-1 mb-2.5">
                    Education
                  </h3>
                  <div className="space-y-3">
                    {resume.education?.map((edu, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#0f172a]">{edu.degree}</p>
                          <p className="text-xs text-[#334155]">{edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</p>
                        </div>
                        <div className="text-xs font-mono text-[#475569]">
                          {edu.startDate} – {edu.endDate || 'Present'} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {allSkillsFlat.length > 0 && (
                <section className="mb-6">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0f766e] border-b border-[#cbd5e1] pb-1 mb-2.5">
                    Technical Competencies
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {allSkillsFlat.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded bg-[#e2e8f0] text-[#0f172a] text-xs font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {(resume.experience?.length ?? 0) > 0 && (
                <section className="mb-6">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0f766e] border-b border-[#cbd5e1] pb-1 mb-2.5">
                    Experience
                  </h3>
                  <div className="space-y-4">
                    {resume.experience?.map((exp, idx) => (
                      <div key={idx}>
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                          <p className="text-sm font-bold text-[#0f172a]">
                            {exp.title} — <span className="font-semibold text-[#0f766e]">{exp.company}</span>
                          </p>
                          <span className="text-xs font-mono text-[#475569]">
                            {exp.startDate} – {exp.endDate || 'Present'}
                          </span>
                        </div>
                        {exp.description && exp.description.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-[#334155] mt-1.5 space-y-1">
                            {exp.description.map((line, lIdx) => (
                              <li key={lIdx}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(resume.projects?.length ?? 0) > 0 && (
                <section className="mb-6">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0f766e] border-b border-[#cbd5e1] pb-1 mb-2.5">
                    Key Engineering Projects
                  </h3>
                  <div className="space-y-3">
                    {resume.projects?.map((proj, idx) => (
                      <div key={idx}>
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm font-bold text-[#0f172a]">{proj.name}</p>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="text-[11px] font-mono text-[#0f766e]">
                              {proj.technologies.join(', ')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#334155] mt-1 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(resume.certifications?.length ?? 0) > 0 && (
                <section className="mb-6">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0f766e] border-b border-[#cbd5e1] pb-1 mb-2">
                    Certifications
                  </h3>
                  <ul className="list-disc list-inside text-xs text-[#334155] space-y-1">
                    {resume.certifications?.map((c, idx) => (
                      <li key={idx}>
                        <strong>{c.name}</strong> {c.issuer ? `— ${c.issuer}` : ''} {c.date ? `(${c.date})` : ''}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(resume.achievements?.length ?? 0) > 0 && (
                <section>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0f766e] border-b border-[#cbd5e1] pb-1 mb-2">
                    Achievements &amp; Honors
                  </h3>
                  <ul className="list-disc list-inside text-xs text-[#334155] space-y-1">
                    {resume.achievements?.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </section>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Functional Section Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={closeEditModal}
        title={`Edit ${sectionOrder.find((s) => s.key === editModal.section)?.label || 'Section'}`}
        size="lg"
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {editModal.section === 'personal' && editModal.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={editModal.data.name || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, data: { ...prev.data, name: e.target.value } }))
                  }
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={editModal.data.email || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, data: { ...prev.data, email: e.target.value } }))
                  }
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="text"
                  className="input"
                  value={editModal.data.phone || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, data: { ...prev.data, phone: e.target.value } }))
                  }
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input"
                  value={editModal.data.location || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, data: { ...prev.data, location: e.target.value } }))
                  }
                />
              </div>
              <div>
                <label className="label">LinkedIn URL</label>
                <input
                  type="url"
                  className="input"
                  value={editModal.data.linkedin || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, data: { ...prev.data, linkedin: e.target.value } }))
                  }
                />
              </div>
              <div>
                <label className="label">GitHub / Portfolio URL</label>
                <input
                  type="url"
                  className="input"
                  value={editModal.data.github || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, data: { ...prev.data, github: e.target.value } }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Professional Summary</label>
                <textarea
                  rows={4}
                  className="input resize-none"
                  value={editModal.data.summary || ''}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, data: { ...prev.data, summary: e.target.value } }))
                  }
                />
              </div>
            </div>
          )}

          {editModal.section === 'education' && Array.isArray(editModal.data) && (
            <div className="space-y-4">
              {editModal.data.map((edu: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#E6F4F0] border border-[#D4DED3] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#92400E]">Education #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: prev.data.filter((_: any, i: number) => i !== idx),
                        }))
                      }
                      className="text-xs text-[#B91C1C] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Degree (e.g., B.Tech in CSE)"
                      className="input"
                      value={edu.degree || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], degree: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Institution / University"
                      className="input"
                      value={edu.institution || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], institution: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      className="input"
                      value={edu.fieldOfStudy || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], fieldOfStudy: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="CGPA / GPA (e.g., 8.85)"
                      className="input"
                      value={edu.gpa || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], gpa: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Start Year (e.g., 2022)"
                      className="input"
                      value={edu.startDate || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], startDate: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="End Year (e.g., 2026)"
                      className="input"
                      value={edu.endDate || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], endDate: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setEditModal((prev) => ({
                    ...prev,
                    data: [
                      ...(prev.data || []),
                      { degree: '', institution: '', fieldOfStudy: '', startDate: '2022', endDate: '2026', gpa: '' },
                    ],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add Education Entry
              </Button>
            </div>
          )}

          {editModal.section === 'experience' && Array.isArray(editModal.data) && (
            <div className="space-y-4">
              {editModal.data.map((exp: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#E6F4F0] border border-[#D4DED3] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#92400E]">Experience #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: prev.data.filter((_: any, i: number) => i !== idx),
                        }))
                      }
                      className="text-xs text-[#B91C1C] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Role Title (e.g., Software Engineering Intern)"
                      className="input"
                      value={exp.title || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Company / Organization"
                      className="input"
                      value={exp.company || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], company: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Start Date (e.g., May 2025)"
                      className="input"
                      value={exp.startDate || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], startDate: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="End Date (e.g., Aug 2025)"
                      className="input"
                      value={exp.endDate || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], endDate: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Key impact bullets (one per line)"
                    className="input resize-none"
                    value={Array.isArray(exp.description) ? exp.description.join('\n') : exp.description || ''}
                    onChange={(e) => {
                      const next = [...editModal.data];
                      next[idx] = {
                        ...next[idx],
                        description: e.target.value.split('\n').filter((line) => line.trim().length > 0),
                      };
                      setEditModal((prev) => ({ ...prev, data: next }));
                    }}
                  />
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setEditModal((prev) => ({
                    ...prev,
                    data: [
                      ...(prev.data || []),
                      { title: '', company: '', startDate: '', endDate: '', location: 'Remote', description: [] },
                    ],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add Experience Entry
              </Button>
            </div>
          )}

          {editModal.section === 'projects' && Array.isArray(editModal.data) && (
            <div className="space-y-4">
              {editModal.data.map((proj: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#E6F4F0] border border-[#D4DED3] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#92400E]">Project #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: prev.data.filter((_: any, i: number) => i !== idx),
                        }))
                      }
                      className="text-xs text-[#B91C1C] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Project Name"
                      className="input"
                      value={proj.name || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], name: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Technologies (comma-separated)"
                      className="input"
                      value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = {
                          ...next[idx],
                          technologies: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Project architecture & measurable outcomes"
                    className="input resize-none"
                    value={proj.description || ''}
                    onChange={(e) => {
                      const next = [...editModal.data];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setEditModal((prev) => ({ ...prev, data: next }));
                    }}
                  />
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setEditModal((prev) => ({
                    ...prev,
                    data: [...(prev.data || []), { name: '', description: '', technologies: [], link: '' }],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add Project
              </Button>
            </div>
          )}

          {editModal.section === 'skills' && Array.isArray(editModal.data) && (
            <div className="space-y-4">
              {editModal.data.map((row: { category: string; itemsText: string }, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#E6F4F0] border border-[#D4DED3] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Category (e.g., Languages, Cloud & DevOps)"
                      className="input py-1.5 text-xs font-mono"
                      value={row.category}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], category: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: prev.data.filter((_: any, i: number) => i !== idx),
                        }))
                      }
                      className="ml-3 text-xs text-[#B91C1C] hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Comma-separated skills (e.g., TypeScript, React, Node.js, PostgreSQL)"
                    className="input"
                    value={row.itemsText}
                    onChange={(e) => {
                      const next = [...editModal.data];
                      next[idx] = { ...next[idx], itemsText: e.target.value };
                      setEditModal((prev) => ({ ...prev, data: next }));
                    }}
                  />
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setEditModal((prev) => ({
                    ...prev,
                    data: [...(prev.data || []), { category: 'Frameworks & Tools', itemsText: '' }],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add Skill Category
              </Button>
            </div>
          )}

          {editModal.section === 'certifications' && Array.isArray(editModal.data) && (
            <div className="space-y-3">
              {editModal.data.map((cert: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#E6F4F0] border border-[#D4DED3] grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="Certification Name"
                    className="input"
                    value={cert.name || ''}
                    onChange={(e) => {
                      const next = [...editModal.data];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setEditModal((prev) => ({ ...prev, data: next }));
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Issuer (e.g., AWS, Google)"
                    className="input"
                    value={cert.issuer || ''}
                    onChange={(e) => {
                      const next = [...editModal.data];
                      next[idx] = { ...next[idx], issuer: e.target.value };
                      setEditModal((prev) => ({ ...prev, data: next }));
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Year (e.g., 2026)"
                      className="input"
                      value={cert.date || ''}
                      onChange={(e) => {
                        const next = [...editModal.data];
                        next[idx] = { ...next[idx], date: e.target.value };
                        setEditModal((prev) => ({ ...prev, data: next }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal((prev) => ({
                          ...prev,
                          data: prev.data.filter((_: any, i: number) => i !== idx),
                        }))
                      }
                      className="text-xs text-[#B91C1C] hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setEditModal((prev) => ({
                    ...prev,
                    data: [...(prev.data || []), { name: '', issuer: '', date: '2026' }],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add Certification
              </Button>
            </div>
          )}

          {editModal.section === 'achievements' && Array.isArray(editModal.data) && (
            <div className="space-y-2.5">
              {editModal.data.map((ach: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Achievement or honor description"
                    className="input"
                    value={ach}
                    onChange={(e) => {
                      const next = [...editModal.data];
                      next[idx] = e.target.value;
                      setEditModal((prev) => ({ ...prev, data: next }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditModal((prev) => ({
                        ...prev,
                        data: prev.data.filter((_: any, i: number) => i !== idx),
                      }))
                    }
                    className="text-xs text-[#B91C1C] hover:underline shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setEditModal((prev) => ({
                    ...prev,
                    data: [...(prev.data || []), ''],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add Achievement
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-[#D4DED3]">
          <Button variant="outline" onClick={closeEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveSection} isLoading={saving} disabled={saving}>
            Save Section &amp; Re-score
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default ResumeBuilder;