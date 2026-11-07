import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../shared/services/api';
import { Application, Job } from '../../shared/types';
import { Users, Calendar, FileText, ArrowLeft, Award, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const ViewApplicants: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}?sortBy=matchScore`),
      ]);
      setJob(jobRes.data.data);
      setApplicants(appsRes.data.data || []);
    } catch {
      // Preserve UI state
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, status: string) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: status as any } : a))
      );
      setActionMessage(`Candidate status updated to ${status}`);
    } catch {
      setActionMessage('Failed to update candidate status');
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApp || !scheduledDate || !scheduledTime) return;
    try {
      await api.post('/interviews/schedule', {
        applicationId: selectedApp._id,
        scheduledDate,
        scheduledTime,
        type: 'Technical',
        mode: 'Video',
      });
      setScheduleModalOpen(false);
      await handleStatusChange(selectedApp._id, 'Shortlisted');
      setActionMessage(`Technical evaluation scheduled for ${selectedApp.student?.name}`);
    } catch {
      setActionMessage('Failed to schedule evaluation');
    }
  };

  const handleDownloadResume = async (resumeId: string, appId: string, candidateName?: string) => {
    try {
      const res = await api.get(`/resumes/${resumeId}/download?applicationId=${appId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidateName?.replace(/\s+/g, '_') || 'candidate'}-resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setActionMessage('Could not download candidate resume.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-[#D4DED3] bg-tideglass-surface text-xs font-semibold text-[#1E2D27] hover:bg-[#EAF2ED] hover:border-[#0A7D6E]/40 transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4 text-[#0A7D6E]" />
        <span>Back to Drives</span>
      </button>

      <div className="mb-8 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0284C7] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3] mb-2">
            Applicant Evaluation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E2D27] font-headline mb-1">
            Applicants — {job?.title || 'Campus Drive'}
          </h1>
          <p className="text-sm text-[#516861]">
            {job?.company} • Ranked by ATS Skill &amp; Eligibility Match Score ({applicants.length} Total)
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-[#E6F4F0] border border-emerald-400/40 text-[#066A5B] text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applicants.length > 0 ? (
        <div className="space-y-4">
          {applicants.map((app) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)]"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <h3 className="text-lg font-bold text-[#1E2D27] font-headline">{app.student?.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200">
                    {app.student?.department || 'Engineering'}
                  </span>
                  {app.student?.cgpa !== undefined && app.student.cgpa > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFFBEB] text-[#B45309] border border-amber-200">
                      CGPA: {app.student.cgpa}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      app.status === 'Shortlisted' || app.status === 'Selected' || app.status === 'Hired'
                        ? 'bg-emerald-500/15 text-[#066A5B] border border-emerald-400/30'
                        : app.status === 'Rejected'
                        ? 'bg-red-500/15 text-[#991B1B] border border-red-400/30'
                        : 'bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <p className="text-xs text-[#516861]">
                  {app.student?.email} • {app.student?.phone || 'Phone on file'}
                </p>

                {app.aiAnalysis && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {app.aiAnalysis.matchedSkills?.map((sk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#E0F2FE] text-[#0369A1] border border-sky-200"
                      >
                        <Check className="w-2.5 h-2.5" />
                        <span>{sk}</span>
                      </span>
                    ))}
                    {app.aiAnalysis.missingSkills?.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#FFFBEB] text-[#B45309] border border-amber-200"
                      >
                        Gap: {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Match Score Badge & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right mr-2">
                  <div
                    className={`flex items-center space-x-1 text-base font-bold font-mono tabular-nums ${
                      (app.matchScore || 0) >= 75
                        ? 'text-[#059669]'
                        : (app.matchScore || 0) >= 50
                        ? 'text-[#0284C7]'
                        : 'text-[#D97706]'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>{app.matchScore}%</span>
                  </div>
                  <span className="text-[10px] text-[#516861] font-mono font-medium">
                    ATS Match
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {app.resume && (
                    <button
                      onClick={() =>
                        handleDownloadResume(
                          typeof app.resume === 'string' ? app.resume : app.resume._id,
                          app._id,
                          app.student?.name
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-[#E0F2FE] border border-sky-300 text-[#0369A1] text-xs font-bold hover:bg-[#BAE6FD] transition-all flex items-center space-x-1.5"
                      title="Download Candidate Resume"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resume PDF</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setScheduleModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#EFF6FF] border border-blue-300 text-[#1D4ED8] text-xs font-bold hover:bg-[#DBEAFE] transition-all flex items-center space-x-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Round</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(app._id, 'Shortlisted')}
                    className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-[#066A5B] text-xs font-bold hover:bg-emerald-500/25 transition-all"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusChange(app._id, 'Selected')}
                    className="px-3 py-2 rounded-xl bg-[#059669] text-white text-xs font-bold hover:bg-[#047857] transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Select / Offer</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(app._id, 'Rejected')}
                    className="px-3 py-2 rounded-xl bg-red-500/15 border border-red-400/35 text-[#991B1B] text-xs font-bold hover:bg-red-500/25 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl bg-tideglass-surface border border-[#D4DED3]">
          <Users className="w-12 h-12 text-[#2879AD] mx-auto mb-3" />
          <p className="text-base font-bold text-[#344942]">No applicants yet for this drive</p>
          <p className="text-xs text-[#516861] mt-1">
            Candidate applications will appear here in real time as students apply.
          </p>
        </div>
      )}

      {/* Schedule Evaluation Modal (Non-Black Ocean Backdrop) */}
      {scheduleModalOpen && selectedApp && (
        <div
          className="fixed inset-0 z-50 bg-[#183238]/35 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="p-6 rounded-3xl bg-[#FFFDF7] border border-[#D4DED3] max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#344942] mb-1 font-headline">
              Schedule Candidate Evaluation Round
            </h3>
            <p className="text-xs text-[#516861] mb-6">
              Candidate: <strong className="text-[#0A7D6E]">{selectedApp.student?.name}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="label">Evaluation Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Evaluation Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#D4DED3]">
                <button
                  onClick={() => setScheduleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#E6F4F0] border border-[#D4DED3] text-xs font-bold text-[#344942] hover:bg-[#D4ECE5]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-[#06281E] hover:bg-emerald-400"
                >
                  Confirm Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ViewApplicants;
