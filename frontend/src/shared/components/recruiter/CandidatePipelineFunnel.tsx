import React from 'react';
import { Filter } from 'lucide-react';

interface CandidatePipelineFunnelProps {
  totalApplicants?: number;
  shortlisted?: number;
  interviews?: number;
  hired?: number;
  className?: string;
}

export const CandidatePipelineFunnel: React.FC<CandidatePipelineFunnelProps> = ({
  totalApplicants = 0,
  shortlisted = 0,
  interviews = 0,
  hired = 0,
  className = '',
}) => {
  const safeTotal = Math.max(1, totalApplicants);
  const shortlistPct = totalApplicants > 0 ? Math.round((shortlisted / safeTotal) * 100) : 0;
  const interviewPct = totalApplicants > 0 ? Math.round((interviews / safeTotal) * 100) : 0;
  const hiredPct = totalApplicants > 0 ? Math.round((hired / safeTotal) * 100) : 0;

  const stages = [
    {
      name: 'Total Applicants',
      count: totalApplicants,
      rate: totalApplicants > 0 ? '100%' : '0%',
      color: '#2563EB',
      barBg: 'bg-blue-600',
      width: totalApplicants > 0 ? '100%' : '6%',
    },
    {
      name: 'ATS & Recruiter Shortlisted',
      count: shortlisted,
      rate: `${shortlistPct}%`,
      color: '#0A7D6E',
      barBg: 'bg-[#0A7D6E]',
      width: `${totalApplicants > 0 ? Math.max(8, shortlistPct) : 6}%`,
    },
    {
      name: 'Under Review & Evaluation',
      count: interviews,
      rate: `${interviewPct}%`,
      color: '#D97706',
      barBg: 'bg-amber-500',
      width: `${totalApplicants > 0 ? Math.max(8, interviewPct) : 6}%`,
    },
    {
      name: 'Selected / Hired Offers',
      count: hired,
      rate: `${hiredPct}%`,
      color: '#059669',
      barBg: 'bg-emerald-500',
      width: `${totalApplicants > 0 ? Math.max(8, hiredPct) : 6}%`,
    },
  ];

  if (totalApplicants === 0) {
    return (
      <div className={`p-5 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1E2D27] font-headline">Candidate Pipeline Progression</h3>
            <p className="text-xs text-[#516861] mt-0.5">
              No applicant submissions recorded yet. Pipeline conversion metrics and stage progression will populate automatically as candidates apply.
            </p>
          </div>
          <span className="text-xs font-mono text-[#0A7D6E] shrink-0 self-start sm:self-auto px-2.5 py-1 rounded-md bg-[#EAF5EF] border border-[#BDE0D3]">
            Awaiting Applications
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#D4DED3]">
        <div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#0A7D6E]" />
            <h3 className="text-base font-bold text-[#1E2D27] font-headline">Hiring Funnel &amp; Pipeline Conversion</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EAF5EF] text-[#0A7D6E] border border-emerald-400/30">
              LIVE PIPELINE DATA
            </span>
          </div>
          <p className="text-xs text-[#516861] mt-0.5">
            Real-time candidate progression across application, shortlisting, evaluation, and offer stages
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="p-2 rounded-lg bg-[#EAF5EF] border border-emerald-200 flex items-center gap-2">
            <span className="text-[#516861]">Offer Yield:</span>
            <span className="text-[#059669] font-bold">{hiredPct}%</span>
          </div>
        </div>
      </div>

      {/* Funnel Stage Horizontal Bars */}
      <div className="space-y-4 my-6">
        {stages.map((stage, idx) => (
          <div key={idx} className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1E2D27] font-sans font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                {stage.name}
              </span>
              <div className="flex items-center space-x-3">
                <span className="text-[#516861] text-[11px]">{stage.rate} of total</span>
                <span className="text-[#1E2D27] font-bold text-sm">{stage.count} Candidates</span>
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-[#E2EFEA] border border-[#D4DED3] overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full ${stage.barBg} transition-all duration-500 shadow-sm`}
                style={{ width: stage.width }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Real Pipeline Ratio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#D4DED3] text-xs font-mono">
        <div className="p-3 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
          <span className="text-[11px] text-[#516861] block mb-1">Shortlist Ratio</span>
          <span className="text-[#0A7D6E] font-bold text-sm">{shortlistPct}% ({shortlisted})</span>
        </div>
        <div className="p-3 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
          <span className="text-[11px] text-[#516861] block mb-1">Active Evaluation</span>
          <span className="text-[#D97706] font-bold text-sm">{interviews} Candidates</span>
        </div>
        <div className="p-3 rounded-xl bg-tideglass-surface border border-[#D4DED3]">
          <span className="text-[11px] text-[#516861] block mb-1">Selected / Hired</span>
          <span className="text-[#059669] font-bold text-sm">{hired} Offers</span>
        </div>
      </div>
    </div>
  );
};

export default CandidatePipelineFunnel;
