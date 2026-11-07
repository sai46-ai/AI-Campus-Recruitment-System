import React, { useEffect, useState } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/services/api';
import { Job } from '../../shared/types';
import { StatCard } from '../../shared/components/widgets/StatCard';
import {
  Briefcase,
  Users,
  TrendingUp,
  ChevronRight,
  Eye,
  CheckCircle2,
  Award,
  Edit,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CandidatePipelineFunnel } from '../../shared/components/recruiter/CandidatePipelineFunnel';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    interviews: 0,
    hired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsRes = await api.get('/jobs/recruiter/my-jobs');
      const jobs: Job[] = jobsRes.data.data || [];
      setMyJobs(jobs);

      let totalApplicants = 0;
      let shortlisted = 0;
      let interviews = 0;
      let hired = 0;

      const appResults = await Promise.allSettled(
        jobs.map((job) => api.get(`/applications/job/${job._id}`))
      );

      for (const res of appResults) {
        if (res.status === 'fulfilled') {
          const applicants = res.value.data?.data || [];
          totalApplicants += applicants.length;
          shortlisted += applicants.filter((a: any) => a.status === 'Shortlisted').length;
          interviews += applicants.filter(
            (a: any) => a.status === 'Shortlisted' || a.status === 'Under Review'
          ).length;
          hired += applicants.filter(
            (a: any) => a.status === 'Selected' || a.status === 'Hired'
          ).length;
        }
      }

      setStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === 'OPEN').length,
        totalApplicants,
        shortlisted,
        interviews,
        hired,
      });
    } catch {
      // Preserve UI state
    } finally {
      setLoading(false);
    }
  };

  const handleCloseJob = async (jobId: string) => {
    try {
      await api.put(`/jobs/${jobId}/close`);
      setMyJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: 'CLOSED' } : j))
      );
      setStats((prev) => ({
        ...prev,
        activeJobs: Math.max(0, prev.activeJobs - 1),
      }));
    } catch {
      // Ignore
    }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]"
      >
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0A7D6E]" />
            <span className="text-[11px] font-mono font-medium text-[#1E6778]">
              Recruiter Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E2D27] font-headline mt-1">
            Recruiter Command Console
          </h1>
          <p className="text-xs text-[#516861] font-mono mt-0.5">
            {user?.name} | Hiring Lead | {user?.company || 'Verified Employer'}
          </p>
        </div>
        <Link
          to="/post-job"
          className="px-4 py-2.5 rounded-xl bg-[#0A7D6E] hover:bg-[#0E9584] text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center justify-center self-start sm:self-auto"
        >
          Post New Campus Drive
        </Link>
      </motion.div>

      {/* Hiring Funnel Visualization */}
      <motion.div variants={itemVariants} className="mb-8">
        <CandidatePipelineFunnel
          totalApplicants={stats.totalApplicants}
          shortlisted={stats.shortlisted}
          interviews={stats.interviews}
          hired={stats.hired}
        />
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Drives" value={stats.totalJobs} icon={Briefcase} variant="blue" />
        <StatCard title="Active Drives" value={stats.activeJobs} icon={CheckCircle2} variant="emerald" />
        <StatCard title="Total Applicants" value={stats.totalApplicants} icon={Users} variant="teal" />
        <StatCard title="Shortlisted" value={stats.shortlisted} icon={TrendingUp} variant="amber" />
      </motion.div>

      {/* Active Job Listings */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]"
      >
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D4DED3]">
          <h2 className="text-base font-semibold text-[#1E2D27] flex items-center space-x-2 font-headline">
            <Briefcase className="w-5 h-5 text-[#2879AD]" />
            <span>Published Campus Drives</span>
          </h2>
          <Link to="/my-jobs" className="text-xs text-[#0A7D6E] font-semibold hover:underline flex items-center">
            Manage All Drives <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : myJobs.length > 0 ? (
          <div className="space-y-3">
            {myJobs.slice(0, 5).map((job) => (
              <div
                key={job._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[rgba(255,253,247,0.52)] border border-[#D4DED3] hover:border-[#0A7D6E]/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#344942]">{job.title}</p>
                  <div className="flex flex-wrap items-center gap-2.5 mt-1">
                    <span className="text-xs text-[#516861]">
                      {job.company} • {job.location} • {job.jobType}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        job.status === 'OPEN'
                          ? 'bg-emerald-500/20 text-[#0A7D6E] border border-emerald-400/30'
                          : 'bg-[#EAF2FA] text-[#516861]'
                      }`}
                    >
                      {job.status}
                    </span>
                    {!job.isApproved && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-[#92400E] border border-amber-400/30">
                        Pending Placement Approval
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/applicants/${job._id}`}
                    className="px-3.5 py-2 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-cyan-400/30 text-xs font-semibold text-[#1E6091] flex items-center space-x-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Applicants</span>
                  </Link>
                  <Link
                    to={`/edit-job/${job._id}`}
                    className="px-3 py-2 rounded-xl bg-[#E6F4F0] hover:bg-[#D4ECE5] border border-[#D4DED3] text-xs font-semibold text-[#344942] flex items-center space-x-1.5 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Edit</span>
                  </Link>
                  {job.status === 'OPEN' && (
                    <button
                      onClick={() => handleCloseJob(job._id)}
                      className="px-3 py-2 rounded-xl bg-red-500/15 border border-red-400/35 hover:bg-red-500/25 text-xs font-semibold text-[#991B1B] transition-all"
                    >
                      Close Drive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm font-semibold text-[#344942]">No job drives posted yet</p>
            <p className="text-xs text-[#516861] mt-1">
              Publish your first campus recruitment drive to begin evaluating student applicants.
            </p>
            <Link
              to="/post-job"
              className="mt-4 inline-flex items-center px-5 py-2.5 rounded-xl bg-emerald-500 text-[#06281E] text-sm font-bold shadow-sm hover:bg-emerald-400 transition-colors"
            >
              Post Campus Drive
            </Link>
          </div>
        )}
      </motion.div>

      {/* Candidate Ranking Guidance Card */}
      <motion.div
        variants={itemVariants}
        className="mt-6 p-6 rounded-2xl border border-[#D4DED3] bg-tideglass-surface backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)]"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Award className="w-5 h-5 text-[#0A7D6E]" />
          <h3 className="text-base font-semibold text-[#1E2D27] font-headline">
            Automated Candidate Skill &amp; ATS Ranking
          </h3>
        </div>
        <p className="text-xs text-[#516861] mb-4 leading-relaxed">
          Open any active drive and select <strong className="text-[#1E2D27]">View Applicants</strong> to inspect candidates ranked by skill coverage, download structured PDF resumes, schedule evaluation rounds, and update selection stages.
        </p>
        <Link
          to="/my-jobs"
          className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/35 text-[#1E6091] text-xs font-bold hover:bg-cyan-500/30 transition-all inline-flex items-center space-x-2"
        >
          <span>Manage All Job Drives</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </motion.div>
  );
};
export default RecruiterDashboard;
