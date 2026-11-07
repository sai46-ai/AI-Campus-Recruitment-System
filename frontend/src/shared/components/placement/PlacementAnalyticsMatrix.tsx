import React from 'react';
import { GraduationCap, CheckCircle } from 'lucide-react';

interface PlacementAnalyticsMatrixProps {
  placementRate?: number;
  totalStudents?: number;
  placedStudents?: number;
  totalJobs?: number;
  totalApplications?: number;
  shortlistedCount?: number;
  className?: string;
}

export const PlacementAnalyticsMatrix: React.FC<PlacementAnalyticsMatrixProps> = ({
  placementRate = 0,
  totalStudents = 0,
  placedStudents = 0,
  totalJobs = 0,
  totalApplications = 0,
  shortlistedCount = 0,
  className = '',
}) => {
  const unplacedStudents = Math.max(0, totalStudents - placedStudents);
  const safeApps = Math.max(1, totalApplications);
  const shortlistRate = totalApplications > 0 ? Math.round((shortlistedCount / safeApps) * 100) : 0;
  const offerConversionRate = totalApplications > 0 ? Math.round((placedStudents / safeApps) * 100) : 0;

  const cohortMetrics = [
    {
      label: 'Registered Student Cohort',
      value: `${totalStudents} Students`,
      rate: totalStudents > 0 ? 100 : 0,
      color: 'bg-blue-600',
      text: 'text-blue-600',
    },
    {
      label: 'Placed / Selected Candidates',
      value: `${placedStudents} / ${totalStudents}`,
      rate: Math.min(100, Math.max(0, placementRate)),
      color: 'bg-emerald-600',
      text: 'text-emerald-600',
    },
    {
      label: 'Application Shortlist Ratio',
      value: `${shortlistedCount} / ${totalApplications} Apps`,
      rate: Math.min(100, Math.max(0, shortlistRate)),
      color: 'bg-[#0A7D6E]',
      text: 'text-[#0A7D6E]',
    },
    {
      label: 'Offer Conversion Velocity',
      value: `${placedStudents} Offers`,
      rate: Math.min(100, Math.max(0, offerConversionRate)),
      color: 'bg-sky-500',
      text: 'text-sky-600',
    },
  ];

  const operationalSummary = [
    {
      tier: 'Published Campus Drives',
      share: `${totalJobs}`,
      color: '#059669',
      count: 'Active & Historical Drives',
    },
    {
      tier: 'Submitted Applications',
      share: `${totalApplications}`,
      color: '#2563EB',
      count: 'Total Candidate Submissions',
    },
    {
      tier: 'Active Seeking Cohort',
      share: `${unplacedStudents}`,
      color: '#D97706',
      count: 'Eligible Unplaced Candidates',
    },
  ];

  if (totalStudents === 0 && totalJobs === 0) {
    return (
      <div className={`p-5 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1E2D27] font-headline">Institutional Placement Telemetry</h3>
            <p className="text-xs text-[#516861] mt-0.5">
              No registered students or active campus drives on record. Institutional placement ratios and cohort statistics will calculate automatically as academic drives commence.
            </p>
          </div>
          <span className="text-xs font-mono text-[#0A7D6E] shrink-0 self-start sm:self-auto px-2.5 py-1 rounded-md bg-[#EAF5EF] border border-[#BDE0D3]">
            Cohort Idle
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
            <GraduationCap className="w-5 h-5 text-[#0A7D6E]" />
            <h3 className="text-base font-semibold text-[#1E2D27] font-headline">Institutional Placement Matrix</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3]">
              Live database metrics
            </span>
          </div>
          <p className="text-xs text-[#516861] mt-0.5">
            Real-time student placement ratios, application conversion rates, and active campus drive telemetry
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right font-mono">
            <span className="text-xs text-[#516861]">Institutional placement rate: </span>
            <span className="text-xl font-bold text-[#0A7D6E] tabular-nums">
              { `${placementRate}%` }
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left: Real Cohort Conversion Bars */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-semibold text-[#516861] block mb-2">
            Cohort placement &amp; conversion velocity
          </span>
          {cohortMetrics.map((b, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#FFFDF7]/60 border border-[#D4DED3] space-y-2 font-mono shadow-xs backdrop-blur-[6px]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1E2D27] font-sans font-medium">{b.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[#516861] text-[11px] tabular-nums">{b.value}</span>
                  <span className={`font-semibold tabular-nums ${b.text}`}>{b.rate}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E2EFEA] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${b.color}`}
                  style={{ width: `${Math.max(4, b.rate)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Real Operational Totals */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <span className="text-xs font-semibold text-[#516861] block mb-2">
            Institutional drive summary
          </span>
          {operationalSummary.map((t, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-tideglass-surface border border-[#D4DED3] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#1E2D27] block mb-0.5">{t.tier}</span>
                <span className="text-[11px] font-mono text-[#516861] tabular-nums">{t.count}</span>
              </div>
              <span
                className="text-base font-semibold font-mono tabular-nums px-3 py-1 rounded-lg bg-[#EAF2FA] border"
                style={{ color: t.color, borderColor: `${t.color}55` }}
              >
                {t.share}
              </span>
            </div>
          ))}

          <div className="p-3.5 rounded-xl bg-[#E6F4F0] border border-emerald-400/30 flex items-center space-x-3 text-xs">
            <CheckCircle className="w-5 h-5 text-[#0A7D6E] shrink-0" />
            <span className="text-[#344942] leading-relaxed">
              Metrics are computed directly from live student registrations, published job drives, and verified application outcomes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementAnalyticsMatrix;
