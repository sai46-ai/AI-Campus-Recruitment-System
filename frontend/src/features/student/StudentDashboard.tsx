import React, { useEffect, useState } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/services/api';
import { Resume } from '../../shared/types';
import {
  Briefcase,
  FileText,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CareerProgressHelix } from '../../shared/components/career/CareerProgressHelix';
import { StudentApplicationsList } from './components/StudentApplicationsList';
import { StudentRecommendationsList } from './components/StudentRecommendationsList';
import { StudentProfileReadiness } from './components/StudentProfileReadiness';
import { StudentResumeWidget } from './components/StudentResumeWidget';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingResume, setLoadingResume] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoadingResume(true);
    try {
      const [resumeRes, appsRes, recRes] = await Promise.allSettled([
        api.get('/resumes/my-resume'),
        api.get('/applications/my-applications'),
        api.get('/jobs/recommendations'),
      ]);

      if (resumeRes.status === 'fulfilled') setResume(resumeRes.value.data.data);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.data || []);
      if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data.data || []);
    } catch {
      // Preserve UI stability if backend is unreachable
    } finally {
      setLoadingResume(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResume(res.data.data);
      setUploadMessage('✓ Resume analyzed and ATS diagnostic computed successfully!');
    } catch (err: any) {
      setUploadMessage(err.response?.data?.message || 'Resume upload failed. Please verify PDF/DOCX format.');
    } finally {
      setUploadingFile(false);
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Candidate';
  const departmentName = user?.department || 'Academic Department Not Set';
  const cohortYear = user?.graduationYear ? `Batch of ${user.graduationYear}` : 'Graduation Year Not Set';
  const cgpaValue = typeof user?.cgpa === 'number' && user.cgpa > 0 ? user.cgpa.toFixed(2) : null;
  const backlogsCount = user?.activeBacklogs ?? 0;

  const shortlistedCount = applications.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Selected' || a.status === 'Hired'
  ).length;
  const inReviewCount = applications.filter(
    (a) => a.status === 'Under Review' || a.status === 'Applied'
  ).length;
  const skillsCount = resume?.parsedData?.skills?.length || user?.skills?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in">
      {/* 1. Student Workspace Header */}
      <section aria-labelledby="workspace-heading">
        <div className="relative overflow-hidden rounded-2xl border border-[#D4DED3] bg-tideglass-surface p-6 sm:p-8 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)]">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md border border-[#BDE0D3] bg-[#EAF5EF] px-2.5 py-1 text-[11px] font-mono font-medium text-[#0A7D6E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0A7D6E]" />
                <span>Candidate Career Studio</span>
              </div>

              <h1 id="workspace-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E2D27] font-headline tracking-tight">
                Candidate Career Hub • <span className="text-[#0A7D6E]">{firstName}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-[#516861]">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-[#B45309]" />
                  <span>{departmentName}</span>
                </span>
                <span className="text-[#D4DED3]">|</span>
                <span className="font-mono text-[#516861]">{cohortYear}</span>
                {cgpaValue && (
                  <>
                    <span className="text-[#D4DED3]">|</span>
                    <span className="font-mono text-[#516861]">
                      CGPA: <strong className="text-[#1E2D27] tabular-nums">{cgpaValue}</strong>
                    </span>
                  </>
                )}
                <span className="text-[#D4DED3]">|</span>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md border ${
                    backlogsCount === 0
                      ? 'border-[#BDE0D3] bg-[#EAF5EF] text-[#0A7D6E]'
                      : 'border-amber-400/35 bg-amber-500/15 text-[#92400E]'
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{backlogsCount === 0 ? 'Clear academic standing' : `${backlogsCount} active backlog(s)`}</span>
                </span>
              </div>
            </div>

            {/* Header Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/jobs"
                className="inline-flex items-center rounded-xl border border-[#D4DED3] bg-[#F0F6F3]/80 px-4 py-2 text-xs font-semibold text-[#1E2D27] hover:bg-[#EAF2ED] transition-colors shadow-xs"
              >
                Explore Drives
              </Link>
              <Link
                to="/resume-builder"
                className="inline-flex items-center rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-[#92400E] hover:bg-amber-500/25 transition-colors shadow-xs"
              >
                Resume Builder
              </Link>
              <Link
                to="/my-applications"
                className="inline-flex items-center rounded-xl border border-[#BDE0D3] bg-[#EAF5EF] px-4 py-2 text-xs font-semibold text-[#0A7D6E] hover:bg-[#D8ECE3] transition-colors shadow-xs"
              >
                My Applications
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4-Pillar Performance Summary Tiles */}
      <section aria-labelledby="summary-tiles-heading">
        <h2 id="summary-tiles-heading" className="sr-only">Key Recruitment Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#2563EB] bg-tideglass-surface p-5 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)] hover:shadow-[0_6px_20px_rgba(30,45,39,0.09)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-[#516861] font-medium uppercase tracking-wider">Total applications</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-[#1E2D27] font-mono tabular-nums">{applications.length}</span>
              <span className="text-[11px] font-mono text-[#2563EB] font-semibold">
                {inReviewCount > 0 ? `${inReviewCount} active` : 'No active queue'}
              </span>
            </div>
            <div className="mt-3 text-xs text-[#516861] flex items-center justify-between border-t border-[#D4DED3] pt-2">
              <Link to="/my-applications" className="text-[#2563EB] hover:underline flex items-center gap-1 font-mono text-[11px] font-semibold">
                <span>View status history</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#059669] bg-tideglass-surface p-5 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)] hover:shadow-[0_6px_20px_rgba(30,45,39,0.09)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-[#516861] font-medium uppercase tracking-wider">Shortlisted &amp; offers</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-[#1E2D27] font-mono tabular-nums">{shortlistedCount}</span>
              <span className="text-[11px] font-mono text-[#065F46] font-semibold tabular-nums">
                {applications.length > 0
                  ? `${Math.round((shortlistedCount / applications.length) * 100)}% conversion`
                  : 'Awaiting round 1'}
              </span>
            </div>
            <div className="mt-3 text-xs text-[#516861] flex items-center justify-between border-t border-[#D4DED3] pt-2">
              <span className="text-[11px] font-mono text-[#065F46] font-medium">Verified placement stages</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#D97706] bg-tideglass-surface p-5 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)] hover:shadow-[0_6px_20px_rgba(30,45,39,0.09)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-[#516861] font-medium uppercase tracking-wider">ATS match score</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              {resume ? (
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-[#D97706] font-mono tabular-nums">
                    {resume.atsScore}
                    <span className="text-sm font-normal text-[#516861]">/100</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#92400E] font-semibold">
                    {resume.atsScore >= 75 ? 'Industry ready' : resume.atsScore >= 55 ? 'Competitive' : 'Needs polish'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xl sm:text-2xl font-semibold text-[#516861] font-mono">Not scored</span>
                  <span className="text-[11px] font-mono text-[#B45309]">Create / Upload</span>
                </>
              )}
            </div>
            <div className="mt-3 text-xs text-[#516861] flex items-center justify-between border-t border-[#D4DED3] pt-2">
              <Link to="/resume-builder" className="text-[#D97706] hover:underline flex items-center gap-1 font-mono text-[11px] font-semibold">
                <span>{resume ? 'Open resume builder' : 'Create resume now'}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] bg-tideglass-surface p-5 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)] hover:shadow-[0_6px_20px_rgba(30,45,39,0.09)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-[#516861] font-medium uppercase tracking-wider">Verified skills</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#BDE0D3] bg-[#EAF5EF] text-[#0A7D6E]">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-[#1E2D27] font-mono tabular-nums">{skillsCount}</span>
              <span className="text-[11px] font-mono text-[#0A7D6E] font-medium">Competencies</span>
            </div>
            <div className="mt-3 text-xs text-[#516861] flex items-center justify-between border-t border-[#D4DED3] pt-2">
              <Link to="/profile" className="text-[#0A7D6E] hover:underline flex items-center gap-1 font-mono text-[11px] font-semibold">
                <span>Manage credentials</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Career Milestone Trajectory */}
      <section aria-labelledby="milestone-trajectory-heading">
        <h2 id="milestone-trajectory-heading" className="sr-only">Career Milestone Trajectory</h2>
        <CareerProgressHelix
          atsScore={resume ? resume.atsScore : 0}
          applicationCount={applications.length}
          interviewCount={shortlistedCount}
        />
      </section>

      {/* 4. Two-Column Modular Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <StudentResumeWidget
            resume={resume}
            loadingResume={loadingResume}
            uploadingFile={uploadingFile}
            uploadMessage={uploadMessage}
            onFileUpload={handleFileUpload}
          />

          <StudentApplicationsList applications={applications} />
        </div>

        <div className="space-y-8">
          <StudentProfileReadiness user={user} resume={resume} />

          <StudentRecommendationsList recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
