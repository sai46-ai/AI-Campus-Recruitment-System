import React from 'react';
import { Award } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Resume } from '../../../shared/types';

interface ResumeAtsGaugeProps {
  resume: Resume;
}

export const ResumeAtsGauge: React.FC<ResumeAtsGaugeProps> = ({ resume }) => {
  const atsScore = resume.atsScore || 0;
  const strokeColor =
    atsScore >= 70 ? '#059669' : atsScore >= 50 ? '#0284C7' : '#D97706';

  const breakdownMetrics = [
    { label: 'Skill Coverage', value: resume.atsBreakdown?.skillCoverageScore ?? 0, color: 'bg-sky-500', text: 'text-sky-600' },
    { label: 'Experience Depth', value: resume.atsBreakdown?.experienceScore ?? 0, color: 'bg-[#0A7D6E]', text: 'text-[#0A7D6E]' },
    { label: 'Education Alignment', value: resume.atsBreakdown?.educationScore ?? 0, color: 'bg-blue-600', text: 'text-blue-600' },
    { label: 'Section Formatting', value: resume.atsBreakdown?.formattingScore ?? 0, color: 'bg-emerald-500', text: 'text-emerald-600' },
  ];

  return (
    <Card className="p-5 bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0284C7] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-[#0284C7]" aria-hidden="true" />
          <h3 className="text-base font-semibold text-[#1E2D27] font-headline">ATS Readiness Score</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] border border-sky-300 font-medium">
          Live Gauge
        </span>
      </div>

      <div className="text-center mb-5">
        <div className="relative w-44 h-44 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
            <circle
              cx="96"
              cy="96"
              r="82"
              fill="none"
              stroke="#D8E6E1"
              strokeWidth="10"
            />
            <circle
              cx="96"
              cy="96"
              r="82"
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 82}
              strokeDashoffset={2 * Math.PI * 82 * (1 - atsScore / 100)}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-[#1E2D27] font-mono">{atsScore}%</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#516861] mt-0.5">
              ATS Alignment
            </span>
          </div>
        </div>
        <p className="text-xs text-[#516861] mt-2">
          {atsScore >= 70
            ? 'Strong structural & keyword compatibility for campus drives'
            : atsScore >= 50
            ? 'Moderate compatibility — add quantified project and experience bullets'
            : 'Complete additional resume sections to improve ATS readiness'}
        </p>
      </div>

      <div className="space-y-2.5 pt-3 border-t border-[#D4DED3]">
        {breakdownMetrics.map(({ label, value, color, text }) => (
          <div key={label} className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#1E2D27]">{label}</span>
              <span className={`font-mono font-bold ${text}`}>{value}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#E2EFEA] overflow-hidden">
              <div
                className={`h-full rounded-full ${color} transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(4, value))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
export default ResumeAtsGauge;
