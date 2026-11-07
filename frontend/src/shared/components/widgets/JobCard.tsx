import React from 'react';
import { Job } from '../../types';
import { MapPin, Clock, Building2, Eye, GraduationCap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface JobCardProps {
  job: Job;
  matchScore?: number;
  onApply?: (job: Job) => void;
  onInspect?: (job: Job) => void;
  hasApplied?: boolean;
  variant?: 'default' | 'compact';
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  matchScore,
  onApply,
  onInspect,
  hasApplied,
  variant = 'default',
}) => {
  const getJobTypeBorder = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'internship':
        return 'border-t-2 border-t-[#2563EB]';
      case 'full-time':
        return 'border-t-2 border-t-[#059669]';
      case 'contract':
        return 'border-t-2 border-t-[#D97706]';
      default:
        return 'border-t-2 border-t-[#0284C7]';
    }
  };

  const getMatchScoreVariant = (score?: number): 'emerald' | 'cyan' | 'amber' => {
    if (!score) return 'cyan';
    if (score >= 75) return 'emerald';
    if (score >= 50) return 'cyan';
    return 'amber';
  };

  if (variant === 'compact') {
    return (
      <Card
        variant="interactive"
        className={`p-4 bg-tideglass-surface border border-[#D4DED3] ${getJobTypeBorder(job.jobType)} hover:border-[#0A7D6E]/50 shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] transition-all`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-base font-semibold text-[#1E2D27] truncate">{job.title}</h3>
              {matchScore !== undefined && (
                <Badge variant={getMatchScoreVariant(matchScore)} size="sm">{matchScore}% Match</Badge>
              )}
            </div>
            <p className="caption text-[#516861]">{job.company} • {job.location}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {job.requiredSkills?.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="cyan" size="sm">{skill}</Badge>
              ))}
              {job.requiredSkills && job.requiredSkills.length > 4 && (
                <Badge variant="default" size="sm">+{job.requiredSkills.length - 4} more</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onInspect && (
              <Button size="sm" variant="secondary" onClick={() => onInspect(job)}>
                Details
              </Button>
            )}
            {onApply && (
              <Button
                size="sm"
                variant={hasApplied ? 'secondary' : 'primary'}
                disabled={hasApplied}
                onClick={() => onApply(job)}
              >
                {hasApplied ? 'Applied' : 'Apply'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 sm:p-5 flex flex-col h-full bg-tideglass-surface border border-[#D4DED3] ${getJobTypeBorder(job.jobType)} hover:border-[#0A7D6E]/50 shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] transition-all group rounded-2xl`}>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-lg bg-[#EAF5EF]/80 border border-[#BDE0D3] flex items-center justify-center flex-shrink-0 transition-colors"
              aria-hidden="true"
            >
              <Building2 className="w-4 h-4 text-[#0A7D6E]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#1E2D27] truncate leading-tight">{job.title}</h3>
              <p className="text-xs text-[#2563EB] font-medium mt-0.5">{job.company}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {matchScore !== undefined && (
              <Badge variant={getMatchScoreVariant(matchScore)} size="sm">{matchScore}% Match</Badge>
            )}
            {job.minCgpa !== undefined && job.minCgpa > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#92400E] bg-[#FFFBEB] border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                <GraduationCap className="w-2.5 h-2.5 text-[#D97706]" /> CGPA &ge; {job.minCgpa}
              </span>
            )}
          </div>
        </div>

        {job.description && (
          <p className="text-xs text-[#516861] line-clamp-2 mb-3 leading-relaxed">{job.description}</p>
        )}

        {/* Skill Badges */}
        <div className="flex flex-wrap gap-1">
          {job.requiredSkills?.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="cyan" size="sm" className="text-[10px] py-0.5 px-2">{skill}</Badge>
          ))}
          {job.requiredSkills && job.requiredSkills.length > 4 && (
            <Badge variant="default" size="sm" className="text-[10px] py-0.5 px-1.5">+{job.requiredSkills.length - 4}</Badge>
          )}
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-[#D4DED3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#516861]">
          <span className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>{job.location}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#0A7D6E]" aria-hidden="true" />
            <span>{job.jobType}</span>
          </span>
          {job.salary?.min && job.salary?.max && (
            <span className="font-semibold text-[#066A5B] font-mono tabular-nums px-2 py-0.5 rounded bg-[#EAF5EF] border border-[#BDE0D3]">
              ₹{job.salary.min >= 1000 ? (job.salary.min / 100000).toFixed(1) : job.salary.min}–
              {job.salary.max >= 1000 ? (job.salary.max / 100000).toFixed(1) : job.salary.max} LPA
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {onInspect && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onInspect(job)}
              className="flex-1 sm:flex-initial text-xs py-1 px-2.5"
            >
              <Eye className="w-3 h-3 mr-1" />
              <span>Details</span>
            </Button>
          )}
          {onApply && (
            <Button
              size="sm"
              variant={hasApplied ? 'secondary' : 'primary'}
              disabled={hasApplied}
              onClick={() => onApply(job)}
              className="flex-1 sm:flex-initial text-xs py-1 px-3"
            >
              {hasApplied ? 'Applied' : 'Apply'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};