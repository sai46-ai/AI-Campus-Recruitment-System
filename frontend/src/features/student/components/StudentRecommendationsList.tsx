import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Job } from '../../../shared/types';

interface StudentRecommendationsListProps {
  recommendations: any[];
}

export const StudentRecommendationsList: React.FC<StudentRecommendationsListProps> = ({
  recommendations,
}) => {
  const formatSalary = (salary?: { min?: number; max?: number; currency?: string }): string | null => {
    if (!salary || (!salary.min && !salary.max)) return null;
    const cur = salary.currency || 'INR';
    const toLpa = (v: number) => (cur === 'INR' && v >= 100000 ? `₹${(v / 100000).toFixed(1)} LPA` : `${cur} ${v.toLocaleString()}`);
    if (salary.min && salary.max) return `${toLpa(salary.min)} - ${toLpa(salary.max)}`;
    return toLpa(salary.min || salary.max || 0);
  };

  return (
    <div className="rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#2563EB] bg-tideglass-surface p-5 sm:p-6 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D4DED3]">
        <div>
          <h2 className="text-sm font-semibold text-[#1E2D27] font-headline">Recommended Campus Drives</h2>
          <span className="text-[11px] font-mono text-[#516861]">Matched to your verified profile skills</span>
        </div>
        <Link
          to="/jobs"
          className="text-xs font-mono font-medium text-[#0A7D6E] hover:text-[#066A5B] transition-colors"
        >
          View all drives →
        </Link>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-3" role="list">
          {recommendations.slice(0, 3).map((rec, idx) => {
            const job: Job = rec.job || rec;
            const salaryStr = formatSalary(job.salary);
            const score = rec.matchScore || 0;
            const scoreClass =
              score >= 75
                ? 'bg-emerald-500/15 text-[#066A5B] border-emerald-400/35'
                : score >= 50
                ? 'bg-sky-500/15 text-[#0369A1] border-sky-400/35'
                : 'bg-amber-500/15 text-[#92400E] border-amber-400/35';

            return (
              <div
                key={job._id || idx}
                className="p-3.5 rounded-xl border border-[#D4DED3] bg-tideglass-surface hover:border-[#2563EB]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h3 className="text-xs font-bold text-[#1E2D27] leading-tight">
                        {job.title}
                      </h3>
                      <span className="text-[11px] text-[#516861] block mt-0.5">
                        {job.company} {job.location ? `• ${job.location}` : ''}
                      </span>
                    </div>
                    {score > 0 && (
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${scoreClass}`}>
                        {score}% Match
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 my-2">
                    {salaryStr && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EAF5EF] border border-emerald-200 text-[#066A5B] font-semibold">
                        {salaryStr}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EFF6FF] border border-blue-200 text-[#1D4ED8]">
                        {job.jobType}
                      </span>
                    )}
                    {job.minCgpa !== undefined && job.minCgpa > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFFBEB] border border-amber-200 text-[#B45309]">
                        Min {job.minCgpa} CGPA
                      </span>
                    )}
                  </div>

                  {rec.matchedSkills && rec.matchedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.matchedSkills.slice(0, 3).map((skill: string, sIdx: number) => (
                        <span key={sIdx} className="inline-flex items-center gap-1 text-[10px] text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded-md border border-sky-200">
                          <Check className="w-2.5 h-2.5" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#D4DED3] flex justify-end">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0A7D6E] hover:text-[#066A5B] transition-colors"
                  >
                    <span>View Opening</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 rounded-xl border border-dashed border-[#D4DED3] bg-[#FFFDF7]/80">
          <p className="text-xs text-[#516861]">
            Upload your resume or add profile skills to view tailored job recommendations.
          </p>
          <div className="mt-3">
            <Link
              to="/resume-builder"
              className="inline-flex items-center gap-1 rounded-lg border border-[#D4DED3] bg-[#E6F4F0] px-3 py-1.5 text-xs font-semibold text-[#344942] hover:bg-[#D4ECE5]"
            >
              <span>Build ATS Profile</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-[#D4DED3]">
        <Link
          to="/jobs"
          className="inline-flex items-center justify-center w-full gap-1.5 rounded-lg border border-[#D4DED3] bg-[#E6F4F0] px-4 py-2 text-xs font-semibold text-[#344942] hover:bg-[#D4ECE5] hover:text-[#344942] transition-colors"
        >
          <span>Explore All Campus Openings</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default StudentRecommendationsList;
