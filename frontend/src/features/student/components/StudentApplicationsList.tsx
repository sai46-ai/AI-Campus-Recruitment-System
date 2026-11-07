import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Application } from '../../../shared/types';

interface StudentApplicationsListProps {
  applications: Application[];
}

export const StudentApplicationsList: React.FC<StudentApplicationsListProps> = ({
  applications,
}) => {
  const appliedCount = applications.filter((a) => a.status === 'Applied').length;
  const reviewCount = applications.filter((a) => a.status === 'Under Review').length;
  const shortlistCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const offerCount = applications.filter(
    (a) => a.status === 'Selected' || a.status === 'Hired'
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#066A5B]">
            <CheckCircle2 className="h-3 w-3" />
            Shortlisted
          </span>
        );
      case 'Selected':
      case 'Hired':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#1E6091]">
            <CheckCircle2 className="h-3 w-3" />
            Offer Extended
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/35 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#92400E]">
            <Clock className="h-3 w-3" />
            Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/35 bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#9F1239]">
            <XCircle className="h-3 w-3" />
            Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-400/35 bg-slate-500/15 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#344942]">
            <Clock className="h-3 w-3" />
            Applied
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-[#D4DED3] bg-tideglass-surface p-5 sm:p-6 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D4DED3]">
        <div>
          <h2 className="text-base font-bold text-[#1E2D27] font-headline">Application Pipeline Funnel</h2>
          <span className="text-[11px] font-mono text-[#516861]">Real-time status tracking across campus drives</span>
        </div>
        <Link
          to="/my-applications"
          className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          <span>View All ({applications.length})</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="p-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF]/70">
          <span className="text-[11px] text-[#1E40AF] font-medium block">Submitted</span>
          <span className="text-xl font-bold font-mono tabular-nums text-[#1E40AF] mt-0.5 block">{appliedCount}</span>
        </div>
        <div className="p-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB]/70">
          <span className="text-[11px] text-[#92400E] font-medium block">In review</span>
          <span className="text-xl font-bold font-mono tabular-nums text-[#92400E] mt-0.5 block">{reviewCount}</span>
        </div>
        <div className="p-3 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/70">
          <span className="text-[11px] text-[#065F46] font-medium block">Shortlisted</span>
          <span className="text-xl font-bold font-mono tabular-nums text-[#065F46] mt-0.5 block">{shortlistCount}</span>
        </div>
        <div className="p-3 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF]/70">
          <span className="text-[11px] text-[#075985] font-medium block">Selected / offers</span>
          <span className="text-xl font-bold font-mono tabular-nums text-[#075985] mt-0.5 block">{offerCount}</span>
        </div>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-3" role="list">
          {applications.slice(0, 5).map((app) => (
            <div
              key={app._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-[#D4DED3] bg-tideglass-surface hover:border-cyan-400/40 transition-all gap-3"
            >
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-[#EAF2FA] font-bold text-[#344942] font-mono text-sm">
                  {app.job?.company ? app.job.company.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#344942]">
                    {app.job?.title || 'Position Title'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#516861] mt-0.5">
                    <span>{app.job?.company || 'Company'}</span>
                    {app.job?.location && <span>• {app.job.location}</span>}
                    {app.appliedAt && (
                      <span className="text-[#516861] font-mono text-[11px]">
                        • Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-center">
                {app.matchScore !== undefined && app.matchScore > 0 && (
                  <span className="text-xs font-mono font-bold text-[#2879AD]">
                    {app.matchScore}% Match
                  </span>
                )}
                {getStatusBadge(app.status)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 rounded-xl border border-dashed border-[#D4DED3] bg-[#FFFDF7]/80">
          <h3 className="text-sm font-semibold text-[#344942]">No applications submitted yet</h3>
          <p className="text-xs text-[#516861] mt-1 max-w-sm mx-auto">
            Explore active placement drives matching your academic branch and cutoff parameters.
          </p>
          <div className="mt-4">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-[#06281E] hover:bg-emerald-400 transition-colors"
            >
              <span>Browse Active Campus Drives</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplicationsList;
