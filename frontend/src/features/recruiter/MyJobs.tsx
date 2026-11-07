import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../shared/services/api';
import { Job } from '../../shared/types';
import { Briefcase, Eye, Edit, Trash2, PlusCircle, Lock, Unlock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const MyJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/recruiter/my-jobs');
      setJobs(res.data.data || []);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to load your posted job drives');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    try {
      const endpoint = currentStatus === 'OPEN' ? `/jobs/${jobId}/close` : `/jobs/${jobId}/reopen`;
      await api.put(endpoint);
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN' } : j))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change job status');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this recruitment drive?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setMessage('Recruitment drive deleted successfully');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to delete recruitment drive');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/recruiter-dashboard')}
        className="mb-6 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-[#D4DED3] bg-tideglass-surface text-xs font-semibold text-[#1E2D27] hover:bg-[#EAF2ED] hover:border-[#0A7D6E]/40 transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4 text-[#0A7D6E]" />
        <span>Back to Dashboard</span>
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2D27] font-headline mb-1">
            My Campus Recruitment Drives
          </h1>
          <p className="text-sm text-[#516861]">
            View, edit, close, or inspect candidate pipelines for your published drives
          </p>
        </div>

        <Link
          to="/post-job"
          className="px-4 py-2.5 rounded-xl bg-[#0A7D6E] hover:bg-[#0E9584] text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Drive</span>
        </Link>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold ${
            !message.toLowerCase().includes('failed')
              ? 'bg-[#E6F4F0] border border-emerald-400/40 text-[#066A5B]'
              : 'bg-[#FEE2E2] border border-red-400/40 text-[#991B1B]'
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-[#0A7D6E]/40 transition-all backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)] ${
                job.status === 'OPEN' ? 'border-l-4 border-l-[#059669]' : 'border-l-4 border-l-[#64748B]'
              }`}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-[#1E2D27] font-headline">{job.title}</h3>
                  <span className="text-xs text-[#2563EB] font-semibold">{job.company}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      job.status === 'OPEN'
                        ? 'bg-emerald-500/15 text-[#066A5B] border border-emerald-400/30'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {job.status}
                  </span>
                  {!job.isApproved && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-[#92400E] border border-amber-400/30">
                      Pending Placement Approval
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#516861] mb-3">
                  {job.location} • {job.jobType} • {job.experienceLevel}
                  {job.minCgpa ? ` • Min CGPA: ${job.minCgpa}` : ''}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills?.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#E0F2FE] text-[#0369A1] border border-sky-200"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/applicants/${job._id}`}
                  className="px-3.5 py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-blue-200 text-xs font-semibold text-[#1D4ED8] flex items-center space-x-1.5 transition-all"
                >
                  <Eye className="w-4 h-4 text-[#2563EB]" />
                  <span>View Applicants</span>
                </Link>

                <Link
                  to={`/edit-job/${job._id}`}
                  className="px-3 py-2 rounded-xl bg-[#E6F4F0] hover:bg-[#D4ECE5] border border-[#D4DED3] text-xs font-semibold text-[#1E2D27] flex items-center space-x-1.5 transition-all"
                >
                  <Edit className="w-4 h-4 text-[#D97706]" />
                  <span>Edit</span>
                </Link>

                <button
                  onClick={() => handleToggleStatus(job._id, job.status)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    job.status === 'OPEN'
                      ? 'bg-amber-500/15 border border-amber-400/35 text-[#92400E] hover:bg-amber-500/25'
                      : 'bg-emerald-500/15 border border-emerald-400/35 text-[#066A5B] hover:bg-emerald-500/25'
                  }`}
                >
                  {job.status === 'OPEN' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  <span>{job.status === 'OPEN' ? 'Close Drive' : 'Reopen Drive'}</span>
                </button>

                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="px-3 py-2 rounded-xl bg-red-500/15 border border-red-400/35 hover:bg-red-500/25 text-xs font-semibold text-[#991B1B] transition-all"
                  aria-label="Delete job drive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl bg-tideglass-surface border border-[#D4DED3]">
          <Briefcase className="w-12 h-12 text-[#2879AD] mx-auto mb-3" />
          <p className="text-base font-bold text-[#344942]">No recruitment drives posted yet</p>
          <p className="text-xs text-[#516861] mt-1 mb-6">
            Create your first campus drive to start receiving applications.
          </p>
          <Link
            to="/post-job"
            className="px-5 py-2.5 rounded-xl bg-[#0A7D6E] hover:bg-[#0E9584] text-white text-sm font-semibold shadow-xs transition-colors inline-flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Campus Drive</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
