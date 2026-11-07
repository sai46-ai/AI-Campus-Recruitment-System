import React, { useEffect, useState } from 'react';
import { api } from '../../shared/services/api';
import { StatCard } from '../../shared/components/widgets/StatCard';
import { Job } from '../../shared/types';
import {
  Users,
  Building2,
  CheckCircle2,
  TrendingUp,
  Award,
  Check,
  GraduationCap,
} from 'lucide-react';
import { PlacementAnalyticsMatrix } from '../../shared/components/placement/PlacementAnalyticsMatrix';

export const PlacementDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [jobsForApproval, setJobsForApproval] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes] = await Promise.all([
        api.get('/placement/stats'),
        api.get('/placement/jobs-approval'),
      ]);
      setStats(statsRes.data?.data);
      setJobsForApproval(jobsRes.data?.data || []);
    } catch {
      // Preserve UI state
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      await api.put(`/placement/jobs/${jobId}/approve`);
      setJobsForApproval((prev) => prev.filter((j) => j._id !== jobId));
      setActionMsg('Campus drive approved and published to student portal.');
    } catch {
      setActionMsg('Failed to approve campus drive.');
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await api.get('/placement/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'campus-placement-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setActionMsg('Placement report exported successfully.');
    } catch {
      setActionMsg('Could not download CSV placement report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0A7D6E]" />
            <span className="text-[11px] font-mono font-medium text-[#1E6778]">
              Institutional Placement Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E2D27] font-headline mt-1">
            Institutional Placement Operations
          </h1>
          <p className="text-xs text-[#516861] font-mono mt-0.5">
            Campus drive authorizations | Departmental statistics | Cohort telemetry
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-[#F0F6F3]/80 hover:bg-[#EAF2ED] border border-[#D4DED3] text-xs font-semibold text-[#1E6778] inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export placement CSV'}
          </button>
          <div className="px-3 py-2 rounded-xl bg-[#F0F6F3]/80 border border-[#D4DED3] text-xs font-mono text-[#0A7D6E]">
            Cohort status: Active
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-[#E6F4F0] border border-emerald-400/40 text-[#066A5B] text-xs font-semibold">
          {actionMsg}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <PlacementAnalyticsMatrix
            placementRate={stats?.placementRate ?? 0}
            totalStudents={stats?.totalStudents || 0}
            placedStudents={stats?.placedStudentsCount || 0}
            totalJobs={stats?.totalJobs || 0}
            totalApplications={stats?.totalApplications || 0}
            shortlistedCount={stats?.shortlistedApplications || 0}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} variant="blue" />
            <StatCard
              title="Placed Students"
              value={stats?.placedStudentsCount || 0}
              icon={CheckCircle2}
              variant="emerald"
              trend={
                stats?.placementRate !== null && stats?.placementRate !== undefined
                  ? `${stats.placementRate}% Placement Rate`
                  : '0% Placement Rate'
              }
            />
            <StatCard
              title="Average Package"
              value={stats?.averagePackageLpa ? `₹${stats.averagePackageLpa} LPA` : 'No Offers Yet'}
              icon={TrendingUp}
              variant="teal"
            />
            <StatCard
              title="Highest Package"
              value={stats?.highestPackageLpa ? `₹${stats.highestPackageLpa} LPA` : 'No Offers Yet'}
              icon={Award}
              variant="amber"
            />
          </div>

          {/* Job Approvals Queue */}
          <div className="p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#D97706] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
            <h2 className="text-lg font-bold text-[#1E2D27] mb-4 flex items-center space-x-2 font-headline">
              <Building2 className="w-5 h-5 text-[#D97706]" />
              <span>Pending Campus Drive Approvals ({jobsForApproval.length})</span>
            </h2>

            {jobsForApproval.length > 0 ? (
              <div className="space-y-3">
                {jobsForApproval.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 rounded-xl bg-[#FFFDF7] border border-[#D4DED3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1E2D27]">{job.title}</h3>
                      <p className="text-xs text-[#516861]">
                        {job.company} • {job.location} • {job.jobType}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApproveJob(job._id)}
                      className="px-4 py-2 rounded-xl bg-[#0A7D6E] hover:bg-[#0E9584] text-xs font-bold text-white shadow-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Drive</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#516861] py-6 text-center">
                All submitted campus recruitment drives have been reviewed and approved.
              </p>
            )}
          </div>

          {/* Top Recruiters & Department Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#059669] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
              <h2 className="text-base font-bold text-[#1E2D27] mb-4 flex items-center space-x-2 font-headline">
                <Building2 className="w-5 h-5 text-[#059669]" />
                <span>Top Hiring Partners</span>
              </h2>
              {stats?.topRecruiters && stats.topRecruiters.length > 0 ? (
                <div className="space-y-3">
                  {stats.topRecruiters.map((rec: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-tideglass-surface border border-[#D4DED3] flex items-center justify-between"
                    >
                      <span className="text-sm font-semibold text-[#1E2D27]">{rec.companyName}</span>
                      <span className="text-xs font-bold text-[#059669] font-mono">
                        {rec.offersCount} Offer{rec.offersCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#516861] py-6 text-center">
                  Hiring partner rankings populate automatically as offers are extended.
                </p>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#2563EB] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
              <h2 className="text-base font-bold text-[#1E2D27] mb-4 flex items-center space-x-2 font-headline">
                <GraduationCap className="w-5 h-5 text-[#2563EB]" />
                <span>Department Placement Stats</span>
              </h2>
              {stats?.departmentStats && stats.departmentStats.length > 0 ? (
                <div className="space-y-3">
                  {stats.departmentStats.map((dept: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-tideglass-surface border border-[#D4DED3] flex items-center justify-between"
                    >
                      <span className="text-sm font-semibold text-[#1E2D27]">{dept.departmentName}</span>
                      <span className="text-xs font-bold text-[#2563EB] font-mono">
                        {dept.placedCount} Placed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#516861] py-6 text-center">
                  Department placement counts populate as student selections are recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementDashboard;
