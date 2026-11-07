import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Briefcase, MapPin, DollarSign, Calendar, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../../shared/services/api';
import { Job } from '../../../shared/types';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

export const DriveBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [jobType, setJobType] = useState<string>('All');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalJobs, setTotalJobs] = useState<number>(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        limit: 4,
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (jobType && jobType !== 'All') {
        params.jobType = jobType;
      }

      const res = await api.get('/jobs', { params, timeout: 5000 });
      const jobList = res.data?.data?.jobs || [];
      const pagination = res.data?.data?.pagination;

      setJobs(jobList);
      setTotalJobs(pagination?.total ?? jobList.length);
      setTotalPages(pagination?.pages || 1);
    } catch (err: any) {
      console.warn('Live drive board API offline or unreachable:', err.message);
      setError('Backend API is currently offline. Start server to stream live campus drives.');
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [debouncedSearch, jobType, page]);

  const filterChips = ['All', 'Full-time', 'Internship', 'Remote', 'Contract'];

  const formatSalary = (salary?: { min?: number; max?: number; currency?: string }) => {
    if (!salary || (!salary.min && !salary.max)) return 'Competitive Compensation';
    const curr = salary.currency === 'INR' ? '₹' : salary.currency === 'USD' ? '$' : (salary.currency || '₹');
    if (salary.min && salary.max) {
      if (salary.max >= 100000) {
        return `${curr}${(salary.min / 100000).toFixed(1)} - ${curr}${(salary.max / 100000).toFixed(1)} LPA`;
      }
      return `${curr}${salary.min.toLocaleString()} - ${curr}${salary.max.toLocaleString()}`;
    }
    const val = salary.max || salary.min || 0;
    if (val >= 100000) return `${curr}${(val / 100000).toFixed(1)} LPA`;
    return `${curr}${val.toLocaleString()}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Rolling Applications';
    try {
      const d = new Date(dateStr);
      return `Deadline: ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } catch {
      return 'Rolling Applications';
    }
  };

  return (
    <div className="rounded-2xl bg-tideglass-surface border border-[#D4DED3] p-5 sm:p-6 shadow-[0_8px_28px_rgba(52,73,66,0.10)] backdrop-blur-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D4DED3]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="text-xs font-mono font-medium text-[#0A7D6E]">
                Campus drive board
              </span>
              <span className="text-xs text-[#516861] font-mono tabular-nums">
                ({loading ? '...' : `${totalJobs} published`})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E2D27] font-headline">Active Placement Drives</h2>
          </div>

          <Link
            to="/jobs"
            className="text-xs font-mono font-medium text-[#0A7D6E] hover:text-[#066A5B] inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Open All Drives</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Search input & Filter chips */}
        <div className="pt-4 pb-5 space-y-3.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#516861] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, or required skill..."
              aria-label="Search campus placement drives"
              className="w-full pl-10 pr-9 py-2 rounded-lg bg-[#EAF2FA] border border-[#D4DED3] text-sm text-[#344942] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#516861] hover:text-[#344942] p-0.5"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter drives by employment type">
            {filterChips.map((chip) => {
              const isActive = jobType === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setJobType(chip);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-[#06281E] font-semibold shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                      : 'bg-[#EAF2FA] text-[#516861] border border-[#D4DED3] hover:border-cyan-400/50 hover:text-[#344942]'
                  }`}
                  aria-pressed={isActive}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-3 min-h-[340px]">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#EAF2FA]/80 border border-[#D4DED3] animate-pulse space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5 w-1/2">
                    <div className="h-4 bg-slate-600/60 rounded w-3/4" />
                    <div className="h-3 bg-slate-700/80 rounded w-1/2" />
                  </div>
                  <div className="h-5 bg-slate-600/40 rounded w-20" />
                </div>
                <div className="h-3 bg-[#EAF2FA] rounded w-5/6" />
              </div>
            ))
          ) : error ? (
            <div className="p-8 rounded-xl bg-[#FFFDF7]/85 border border-[#D4DED3] text-center flex flex-col items-center justify-center min-h-[300px]">
              <AlertCircle className="w-10 h-10 text-[#B45309] mb-3" aria-hidden="true" />
              <h3 className="text-base font-semibold text-[#344942] mb-1">Campus Placement Service Standby</h3>
              <p className="text-xs text-[#516861] max-w-sm mb-5 leading-relaxed">{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchJobs} className="gap-2">
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Retry Connection</span>
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#FFFDF7]/85 border border-[#D4DED3] text-center flex flex-col items-center justify-center min-h-[300px]">
              <Briefcase className="w-10 h-10 text-[#2879AD] mb-3" aria-hidden="true" />
              <h3 className="text-base font-semibold text-[#344942] mb-1">No Campus Drives Found</h3>
              <p className="text-xs text-[#516861] max-w-sm mb-4 leading-relaxed">
                No active placement opportunities matched your search criteria: &ldquo;{search || jobType}&rdquo;.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setJobType('All');
                }}
              >
                Reset Search Filters
              </Button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job._id}
                className="p-4 rounded-xl bg-[rgba(255,253,247,0.52)] border border-[#D4DED3] hover:border-[#0A7D6E]/50 transition-colors duration-150 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-medium text-[#0A7D6E]">{job.company}</span>
                      <span className="text-[#D4DED3]">|</span>
                      <span className="text-xs text-[#516861] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#1E6778]" aria-hidden="true" />
                        {job.location || 'Campus / Remote'}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#1E2D27] group-hover:text-[#066A5B] transition-colors font-headline">
                      {job.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Badge variant="info" size="sm">
                      {job.jobType || 'Full-time'}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#516861] font-mono py-1.5 mb-3 border-y border-[#D4DED3]">
                  <div className="flex items-center gap-1 text-[#344942]">
                    <DollarSign className="w-3.5 h-3.5 text-[#0A7D6E]" aria-hidden="true" />
                    <span>{formatSalary(job.salary)}</span>
                  </div>
                  <span className="text-slate-500 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1 text-[#516861]">
                    <Calendar className="w-3.5 h-3.5 text-[#2879AD]" aria-hidden="true" />
                    <span>{formatDate(job.deadline)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(job.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#E6F4F0] border border-[#D4DED3] text-[#344942]"
                      >
                        {skill}
                      </span>
                    ))}
                    {(job.requiredSkills?.length || 0) > 3 && (
                      <span className="text-[11px] font-mono text-[#516861]">
                        +{(job.requiredSkills?.length || 0) - 3} more
                      </span>
                    )}
                  </div>

                  <Button asChild variant="outline" size="sm" className="whitespace-nowrap self-end sm:self-auto">
                    <Link to="/jobs">
                      <span>View Drive</span>
                      <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#D4DED3] text-xs font-mono text-[#516861]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
