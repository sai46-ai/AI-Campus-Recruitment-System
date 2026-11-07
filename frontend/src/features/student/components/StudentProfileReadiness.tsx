import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { User, Resume } from '../../../shared/types';

interface StudentProfileReadinessProps {
  user: User | null;
  resume: Resume | null;
}

export const StudentProfileReadiness: React.FC<StudentProfileReadinessProps> = ({
  user,
  resume,
}) => {
  const checklist = [
    {
      id: 'identity',
      label: 'Verified Identity',
      desc: 'Full name and institutional email',
      done: Boolean(user?.name && user?.email),
    },
    {
      id: 'department',
      label: 'Academic Department',
      desc: user?.department || 'Department not specified',
      done: Boolean(user?.department),
    },
    {
      id: 'cohort',
      label: 'Graduation Cohort',
      desc: user?.graduationYear ? `Batch of ${user.graduationYear}` : 'Graduation year required',
      done: Boolean(user?.graduationYear),
    },
    {
      id: 'cgpa',
      label: 'Academic Cutoff (CGPA)',
      desc: user?.cgpa !== undefined && user?.cgpa !== null && user.cgpa > 0 ? `${user.cgpa.toFixed(2)} CGPA on record` : 'CGPA not yet entered',
      done: user?.cgpa !== undefined && user?.cgpa !== null && user.cgpa > 0,
    },
    {
      id: 'skills',
      label: 'Verified Skills Catalog',
      desc:
        (user?.skills?.length || 0) > 0 || (resume?.parsedData?.skills?.length || 0) > 0
          ? `${Math.max(user?.skills?.length || 0, resume?.parsedData?.skills?.length || 0)} skills detected`
          : 'Add primary technical skills',
      done: (user?.skills?.length || 0) > 0 || (resume?.parsedData?.skills?.length || 0) > 0,
    },
    {
      id: 'resume',
      label: 'ATS-Scored Resume',
      desc: resume ? `${resume.originalName} (${resume.atsScore || 0}% score)` : 'Create or upload resume',
      done: Boolean(resume),
    },
  ];

  const completedCount = checklist.filter((item) => item.done).length;
  const readinessPercentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#059669] bg-tideglass-surface p-5 sm:p-6 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D4DED3]">
        <div>
          <h2 className="text-sm font-bold text-[#1E2D27] font-headline">Profile Readiness Index</h2>
          <span className="text-[11px] font-mono text-[#516861]">Eligibility verification for campus drives</span>
        </div>
        <span
          className={`text-sm font-bold font-mono ${
            readinessPercentage >= 80
              ? 'text-[#059669]'
              : readinessPercentage >= 50
              ? 'text-[#0284C7]'
              : 'text-[#D97706]'
          }`}
        >
          {readinessPercentage}%
        </span>
      </div>

      <div className="mb-5">
        <div className="h-2 w-full rounded-full bg-[#E2EFEA] border border-[#D4DED3] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              readinessPercentage >= 80
                ? 'bg-emerald-500'
                : readinessPercentage >= 50
                ? 'bg-sky-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${readinessPercentage}%` }}
            role="progressbar"
            aria-valuenow={readinessPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile readiness progress"
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] font-mono text-[#516861]">
          <span>{completedCount} of {checklist.length} milestones complete</span>
          <span>{checklist.length - completedCount} pending</span>
        </div>
      </div>

      <div className="space-y-2.5" role="list">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`flex items-start justify-between p-2.5 rounded-xl border text-xs transition-colors ${
              item.done
                ? 'border-emerald-400/30 bg-[#EAF5EF]/80 text-[#1E2D27]'
                : 'border-amber-300/40 bg-[#FFFDF7]/85 text-[#1E2D27]'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div>
                <span className="font-semibold block text-[#1E2D27]">
                  {item.label}
                </span>
                <span className="text-[11px] text-[#516861] block mt-0.5">{item.desc}</span>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                item.done
                  ? 'bg-emerald-500/15 text-[#066A5B] border border-emerald-400/30'
                  : 'bg-amber-500/15 text-[#92400E] border border-amber-400/30'
              }`}
            >
              {item.done ? 'COMPLETE' : 'PENDING'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[#D4DED3]">
        <Link
          to="/profile"
          className="inline-flex items-center justify-center w-full gap-1.5 rounded-lg border border-[#0A7D6E]/30 bg-[#0A7D6E]/10 px-4 py-2 text-xs font-semibold text-[#0A7D6E] hover:bg-[#0A7D6E]/15 transition-colors"
        >
          <span>Update Profile Credentials</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default StudentProfileReadiness;
