import React, { useEffect, useState } from 'react';
import { api } from '../../shared/services/api';
import { Job } from '../../shared/types';
import { JobCard } from '../../shared/components/widgets/JobCard';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { Card } from '../../shared/components/ui/Card';
import { Badge } from '../../shared/components/ui/Badge';
import { Modal } from '../../shared/components/ui/Modal';

export const ViewJobs: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingJob, setApplyingJob] = useState<string | null>(null);
  const [applyMsg, setApplyMsg] = useState<{ jobId: string; message: string; success: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inspectedJob, setInspectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [search, jobType, page]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      fetchMyApplications();
    }
  }, [isAuthenticated, user?.role]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 9 };
      if (search) params.search = search;
      if (jobType) params.jobType = jobType;

      const res = await api.get('/jobs', { params });
      setJobs(res.data.data.jobs || []);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch {
      // Handle offline state gracefully
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      const activeApps = (res.data.data || []).filter((a: any) => a.status !== 'Withdrawn');
      const ids = new Set<string>(activeApps.map((a: any) => a.job?._id || a.job));
      setAppliedJobs(ids);
    } catch {
      // Ignore
    }
  };

  const handleApply = async (job: Job, customCoverLetter?: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setApplyingJob(job._id);
    setApplyMsg(null);
    try {
      await api.post(`/applications/${job._id}`, {
        coverLetter: customCoverLetter || coverLetter || undefined,
      });
      setAppliedJobs((prev) => new Set([...prev, job._id]));
      setApplyMsg({
        jobId: job._id,
        message: `Application submitted for ${job.title} at ${job.company}!`,
        success: true,
      });
      setCoverLetter('');
      if (inspectedJob?._id === job._id) {
        setInspectedJob(null);
      }
    } catch (err: any) {
      setApplyMsg({
        jobId: job._id,
        message: err.response?.data?.message || 'Failed to submit application.',
        success: false,
      });
    } finally {
      setApplyingJob(null);
    }
  };

  const evaluateEligibility = (job: Job) => {
    if (!user || user.role !== 'student') {
      return { eligible: true, checks: [] };
    }
    const studentCgpa = user.cgpa ?? 0;
    const studentBacklogs = user.activeBacklogs ?? 0;
    const studentDept = (user.department || '').toLowerCase();

    const cgpaOk = !job.minCgpa || job.minCgpa <= 0 || studentCgpa === 0 || studentCgpa >= job.minCgpa;
    const backlogOk =
      job.maxBacklogs === undefined || job.maxBacklogs === null || studentBacklogs <= job.maxBacklogs;
    const branchOk =
      !job.allowedBranches ||
      job.allowedBranches.length === 0 ||
      !studentDept ||
      job.allowedBranches.some(
        (b) => studentDept.includes(b.toLowerCase()) || b.toLowerCase().includes(studentDept)
      );

    return {
      eligible: cgpaOk && backlogOk && branchOk,
      checks: [
        {
          label: `Minimum CGPA (${job.minCgpa && job.minCgpa > 0 ? job.minCgpa : 'No cutoff'})`,
          detail: studentCgpa > 0 ? `Your CGPA: ${studentCgpa.toFixed(2)}` : 'Set CGPA in Profile',
          passed: cgpaOk,
        },
        {
          label: `Allowed Branches (${job.allowedBranches?.length ? job.allowedBranches.join(', ') : 'All Branches'})`,
          detail: user.department || 'Set Department in Profile',
          passed: branchOk,
        },
        {
          label: `Maximum Active Backlogs (${job.maxBacklogs ?? 0})`,
          detail: `Your Backlogs: ${studentBacklogs}`,
          passed: backlogOk,
        },
      ],
    };
  };

  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];

  const clearSearch = () => {
    setSearch('');
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Collegiate Header Panel */}
      <div className="mb-6 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF5EF] border border-[#BDE0D3] text-[11px] font-mono font-medium text-[#0A7D6E] mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A7D6E]" />
            <span>Campus Recruitment Opportunities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E2D27] font-headline">
            Campus Recruitment Drives
          </h1>
          <p className="text-xs sm:text-sm text-[#516861] mt-1">
            Explore published campus opportunities, check eligibility criteria, and apply with your profile.
          </p>
        </div>
      </div>

      {/* Compact Search & Filters Toolbar */}
      <div className="p-2.5 sm:p-3 mb-6 rounded-xl bg-tideglass-surface border border-[#D4DED3] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 relative w-full">
          <Input
            type="text"
            placeholder="Search by title, company, location, or skills..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search className="w-4 h-4 text-[#516861]" aria-hidden="true" />}
            aria-label="Search jobs"
            className="text-xs py-2"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#516861] hover:text-[#344942] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#1E6778] shrink-0">Filter:</span>
          <select
            value={jobType}
            onChange={(e) => {
              setJobType(e.target.value);
              setPage(1);
            }}
            className="input py-2 text-xs min-w-[140px] w-full sm:w-auto"
            aria-label="Filter by job type"
          >
            <option value="">All Drive Types</option>
            {jobTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Apply Message Toast */}
      {applyMsg && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-2.5 ${
            applyMsg.success
              ? 'bg-[#E6F4F0] text-[#066A5B] border-emerald-400/40'
              : 'bg-[#FEE2E2] text-[#991B1B] border-red-400/40'
          }`}
          role="alert"
        >
          {applyMsg.success ? (
            <CheckCircle2 className="w-4 h-4 text-[#0A7D6E] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
          )}
          <span>{applyMsg.message}</span>
        </div>
      )}

      {/* Job Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse bg-tideglass-surface border border-[#D4DED3]">
              <div className="h-4 w-3/4 bg-[#D8E6E1] rounded mb-4" />
              <div className="h-3 w-1/2 bg-[#D8E6E1] rounded mb-4" />
              <div className="h-16 bg-[#D8E6E1] rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-[#D8E6E1] rounded" />
                <div className="h-5 w-16 bg-[#D8E6E1] rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                matchScore={job.matchScore}
                hasApplied={appliedJobs.has(job._id)}
                onInspect={(j) => setInspectedJob(j)}
                onApply={user?.role === 'student' || !isAuthenticated ? handleApply : undefined}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center space-x-2 mt-10" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Previous</span>
              </Button>
              <span className="text-sm font-medium text-[#344942] px-3" aria-current="page">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </nav>
          )}
        </>
      ) : (
        <Card className="p-8 text-center bg-tideglass-surface/95 border border-[#D4DED3] max-w-md mx-auto shadow-[0_4px_20px_rgba(30,45,39,0.06)] backdrop-blur-md">
          <h2 className="text-base font-bold text-[#1E2D27] mb-1.5">No published opportunities are currently available</h2>
          <p className="text-xs text-[#516861] leading-relaxed mb-4">
            Check back as new recruitment drives are published by authorized employers.
          </p>
          {(search || jobType) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setJobType('');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      )}

      {/* Job Details & Eligibility Modal */}
      {inspectedJob && (
        <Modal
          isOpen={Boolean(inspectedJob)}
          onClose={() => setInspectedJob(null)}
          title={`${inspectedJob.title} — ${inspectedJob.company}`}
          size="lg"
        >
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#344942] font-mono pb-4 border-b border-[#D4DED3]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F4F0] border border-[#D4DED3]">
                <MapPin className="w-3.5 h-3.5 text-[#2879AD]" />
                {inspectedJob.location}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F4F0] border border-[#D4DED3]">
                <Clock className="w-3.5 h-3.5 text-[#0A7D6E]" />
                {inspectedJob.jobType} • {inspectedJob.experienceLevel}
              </span>
              {inspectedJob.salary?.min && inspectedJob.salary?.max && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/35 text-[#066A5B] font-bold">
                  ₹{inspectedJob.salary.min >= 1000 ? (inspectedJob.salary.min / 100000).toFixed(1) : inspectedJob.salary.min}–
                  {inspectedJob.salary.max >= 1000 ? (inspectedJob.salary.max / 100000).toFixed(1) : inspectedJob.salary.max} LPA
                </span>
              )}
            </div>

            <div>
              <h4 className="text-xs font-mono text-[#1E6778] font-medium mb-2">
                Role Overview &amp; Responsibilities
              </h4>
              <p className="text-sm text-[#1E2D27] whitespace-pre-wrap leading-relaxed">
                {inspectedJob.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono text-[#1E6778] font-medium mb-2">
                Required Technical Competencies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {inspectedJob.requiredSkills?.map((skill, idx) => (
                  <Badge key={idx} variant="info" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Live Eligibility Check Matrix */}
            {(() => {
              const elig = evaluateEligibility(inspectedJob);
              return (
                <div className="p-4 rounded-xl bg-tideglass-surface border border-[#D4DED3] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#0A7D6E] font-medium flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      Campus Eligibility Criteria Check
                    </span>
                    <Badge variant={elig.eligible ? 'success' : 'warning'} size="sm">
                      {elig.eligible ? 'Eligible to Apply' : 'Check Criteria'}
                    </Badge>
                  </div>
                  {elig.checks.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {elig.checks.map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-[#344942] flex items-center gap-1.5">
                            {c.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0A7D6E] shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                            )}
                            {c.label}
                          </span>
                          <span className="font-mono text-[#516861]">{c.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {(user?.role === 'student' || !isAuthenticated) && !appliedJobs.has(inspectedJob._id) && (
              <div>
                <label className="label">Optional Cover Note to Hiring Team</label>
                <textarea
                  rows={3}
                  className="input resize-none"
                  placeholder="Highlight relevant projects, internships, or why you are a strong fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#D4DED3]">
            <Button variant="outline" onClick={() => setInspectedJob(null)}>
              Close
            </Button>
            {(user?.role === 'student' || !isAuthenticated) && (
              <Button
                variant={appliedJobs.has(inspectedJob._id) ? 'secondary' : 'primary'}
                disabled={appliedJobs.has(inspectedJob._id) || applyingJob === inspectedJob._id}
                isLoading={applyingJob === inspectedJob._id}
                onClick={() => handleApply(inspectedJob, coverLetter)}
              >
                {appliedJobs.has(inspectedJob._id) ? 'Already Applied' : 'Submit Application'}
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
export default ViewJobs;