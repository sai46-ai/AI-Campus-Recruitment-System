import React from 'react';
import { CheckCircle2, Circle, Compass, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CareerProgressHelixProps {
  atsScore?: number;
  applicationCount?: number;
  interviewCount?: number;
  className?: string;
}

interface StepConfig {
  id: number;
  title: string;
  desc: string;
  status: string;
  badge: string;
  accent: string;
  accentBorder: string;
}

export const CareerProgressHelix: React.FC<CareerProgressHelixProps> = ({
  atsScore = 0,
  applicationCount = 0,
  interviewCount = 0,
  className = '',
}) => {
  const steps: StepConfig[] = [
    {
      id: 1,
      title: 'Profile Initialized',
      desc: 'University identity, branch & academic credentials synced',
      status: 'complete',
      badge: 'VERIFIED',
      accent: 'text-[#2563EB]',
      accentBorder: 'border-t-2 border-t-[#2563EB]',
    },
    {
      id: 2,
      title: 'ATS Resume Studio',
      desc: atsScore > 0 ? `Scored ${atsScore}/100 with structured ATS analysis` : 'Build or upload your resume for ATS scoring',
      status: atsScore >= 70 ? 'complete' : atsScore > 0 ? 'active' : 'pending',
      badge: atsScore > 0 ? `${atsScore}% ATS` : 'NOT SCORED',
      accent: 'text-[#0A7D6E]',
      accentBorder: 'border-t-2 border-t-[#0A7D6E]',
    },
    {
      id: 3,
      title: 'Drive Applications',
      desc: applicationCount > 0 ? `${applicationCount} Active Applications Submitted` : 'Explore eligible campus placement drives',
      status: applicationCount > 0 ? 'complete' : 'active',
      badge: `${applicationCount} APPLIED`,
      accent: 'text-[#0284C7]',
      accentBorder: 'border-t-2 border-t-[#0284C7]',
    },
    {
      id: 4,
      title: 'Shortlist & Evaluation',
      desc: interviewCount > 0 ? `${interviewCount} Shortlisted / Under Evaluation` : 'Recruiter screening & technical evaluation rounds',
      status: interviewCount > 0 ? 'complete' : 'pending',
      badge: interviewCount > 0 ? `${interviewCount} ACTIVE` : 'AWAITING',
      accent: 'text-[#D97706]',
      accentBorder: 'border-t-2 border-t-[#D97706]',
    },
    {
      id: 5,
      title: 'Placement Selection',
      desc: 'Final offer confirmation & placement cell record',
      status: 'pending',
      badge: 'FINAL STAGE',
      accent: 'text-[#059669]',
      accentBorder: 'border-t-2 border-t-[#059669]',
    },
  ];

  let completedCount = 1;
  if (atsScore >= 70) completedCount++;
  if (applicationCount > 0) completedCount++;
  if (interviewCount > 0) completedCount++;
  const completionPercentage = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={`p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#D4DED3]">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#0A7D6E]" />
            <h3 className="text-base font-bold text-[#1E2D27] font-headline">Career Milestone Trajectory</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3]">
              Live readiness tracker
            </span>
          </div>
          <p className="text-xs text-[#516861] mt-0.5">
            Real-time placement readiness progression based on your profile, resume, and active applications
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right font-mono">
            <span className="text-xs text-[#516861]">Readiness index: </span>
            <span className="text-base font-semibold text-[#0A7D6E] tabular-nums">{completionPercentage}%</span>
          </div>
          <div className="w-24 h-2.5 rounded-full bg-[#E2EFEA] border border-[#D4DED3] overflow-hidden">
            <div
              className="h-full bg-[#0A7D6E] rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5-Stage Step Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-6">
        {steps.map((s) => {
          const isComplete = s.status === 'complete';
          const isActive = s.status === 'active';

          return (
            <div
              key={s.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${s.accentBorder} ${
                isComplete
                  ? 'bg-[#EAF5EF]/90 border-[#BDE0D3] shadow-xs'
                  : isActive
                  ? 'bg-[#EFF6FF]/90 border-[#BFDBFE] shadow-xs'
                  : 'bg-[#FFFDF7]/80 border-[#D4DED3]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono font-bold tabular-nums ${s.accent}`}>
                    0{s.id}
                  </span>
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  ) : isActive ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#6D858A]" />
                  )}
                </div>
                <h4 className="text-xs font-semibold text-[#1E2D27] mb-1 leading-snug">{s.title}</h4>
                <p className="text-[11px] text-[#516861] leading-relaxed">{s.desc}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-[#D4DED3] flex items-center justify-between">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isComplete
                    ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                    : isActive
                    ? 'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]'
                    : 'bg-[#F0F6F3] text-[#516861] border border-[#D4DED3]'
                }`}>
                  {s.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Next Action Banner */}
      <div className="p-3.5 rounded-xl bg-tideglass-surface border border-[#D4DED3] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-[#1E2D27]">
          <TrendingUp className="w-4 h-4 text-[#0A7D6E]" />
          <span>
            {applicationCount === 0
              ? 'Next Step: Explore published campus drives and submit applications with your structured resume.'
              : 'Next Step: Track your submitted applications and refine your resume for higher ATS alignment.'}
          </span>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#0A7D6E] text-white font-semibold text-xs hover:bg-[#0E9584] transition-all shadow-xs"
        >
          <span>{applicationCount === 0 ? 'Explore Drives' : 'Browse Active Drives'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default CareerProgressHelix;
