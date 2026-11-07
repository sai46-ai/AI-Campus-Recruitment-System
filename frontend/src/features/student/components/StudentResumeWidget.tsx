import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload as UploadIcon, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Resume } from '../../../shared/types';

interface StudentResumeWidgetProps {
  resume: Resume | null;
  loadingResume: boolean;
  uploadingFile: boolean;
  uploadMessage: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StudentResumeWidget: React.FC<StudentResumeWidgetProps> = ({
  resume,
  loadingResume,
  uploadingFile,
  uploadMessage,
  onFileUpload,
}) => {
  const atsScore = resume?.atsScore || 0;
  const strokeDashoffset = 283 - (283 * atsScore) / 100;

  const getScoreColor = (s: number) => {
    if (s >= 75) return 'text-[#059669] stroke-emerald-500';
    if (s >= 55) return 'text-[#0284C7] stroke-sky-500';
    return 'text-[#D97706] stroke-amber-500';
  };

  const breakdownMetrics = [
    { label: 'Skills Coverage', value: resume?.atsBreakdown?.skillCoverageScore, color: 'bg-sky-500' },
    { label: 'Experience Depth', value: resume?.atsBreakdown?.experienceScore, color: 'bg-[#0A7D6E]' },
    { label: 'Academic Rigor', value: resume?.atsBreakdown?.educationScore, color: 'bg-blue-600' },
  ];

  return (
    <div className="rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#0284C7] bg-tideglass-surface p-5 sm:p-6 backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#D4DED3]">
        <div>
          <h2 className="text-base font-bold text-[#1E2D27] font-headline">Resume Health &amp; ATS Compatibility</h2>
          <span className="text-[11px] font-mono text-[#516861]">
            {resume ? `${resume.originalName} • Analyzed` : 'No verified resume on file'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DED3] bg-[#E6F4F0] px-3 py-1.5 text-xs font-semibold text-[#344942] hover:bg-[#D4ECE5] transition-colors">
              <UploadIcon className="h-3.5 w-3.5 text-[#0A7D6E]" />
              <span>{uploadingFile ? 'Analyzing...' : 'Upload PDF'}</span>
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={onFileUpload}
              className="hidden"
              disabled={uploadingFile}
              aria-label="Upload resume PDF or DOCX"
            />
          </label>
          <Link
            to="/resume-builder"
            className="inline-flex items-center gap-1 rounded-lg border border-amber-400/35 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-[#92400E] hover:bg-amber-500/25 transition-colors"
          >
            <span>Resume Studio</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {uploadMessage && (
        <div
          className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            !uploadMessage.toLowerCase().includes('failed')
              ? 'border border-emerald-400/35 bg-[#EAF5EF] text-[#066A5B]'
              : 'border border-rose-400/35 bg-rose-500/15 text-[#9F1239]'
          }`}
          role="alert"
        >
          {!uploadMessage.toLowerCase().includes('failed') ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0A7D6E]" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-[#BE123C]" />
          )}
          <span>{uploadMessage}</span>
        </div>
      )}

      {loadingResume ? (
        <div className="h-36 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="text-xs font-mono text-[#516861]">Loading verified resume diagnostics...</span>
        </div>
      ) : resume ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 flex flex-col items-center text-center p-4 rounded-xl border border-[#D4DED3] bg-tideglass-surface">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="stroke-[#D8E6E1] fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className={`fill-none transition-all duration-1000 ease-out ${getScoreColor(atsScore)}`}
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-[#344942] font-mono">{atsScore}%</span>
                  <span className="text-[10px] block font-mono font-bold text-[#516861] uppercase">ATS Score</span>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#344942] mt-2">
                {atsScore >= 75
                  ? 'Strong Structural Alignment'
                  : atsScore >= 55
                  ? 'Moderate Keyword Coverage'
                  : 'Requires Optimization'}
              </span>
              <span className="text-[11px] text-[#516861] mt-0.5">
                Evaluated against campus drive benchmarks
              </span>
            </div>

            <div className="md:col-span-7 space-y-3 p-4 rounded-xl border border-[#D4DED3] bg-tideglass-surface">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E2D27] block mb-2">
                Category Compliance
              </span>
              {breakdownMetrics.map(({ label, value, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#1E2D27]">{label}</span>
                    <span className="font-bold text-[#1E2D27]">{value !== undefined ? `${value}%` : 'N/A'}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#E2EFEA] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${value || 0}%` }}
                      role="progressbar"
                      aria-valuenow={value || 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              ))}

              {resume.parsedData?.skills && resume.parsedData.skills.length > 0 && (
                <div className="pt-2 border-t border-[#D4DED3]">
                  <span className="text-[11px] font-mono text-[#516861] block mb-1.5">
                    Extracted Skills ({resume.parsedData.skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {resume.parsedData.skills.slice(0, 7).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E0F2FE] border border-sky-300 text-[#0369A1] font-medium">
                        {skill}
                      </span>
                    ))}
                    {resume.parsedData.skills.length > 7 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#516861]">
                        +{resume.parsedData.skills.length - 7} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {resume.aiSuggestions && resume.aiSuggestions.length > 0 && (
            <div className="mt-4 p-3.5 rounded-xl border border-amber-200/80 bg-[#FFFBEB]/90">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#92400E] font-bold mb-2">
                <FileText className="h-3.5 w-3.5 text-[#D97706]" />
                <span>Actionable ATS Improvements</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#1E2D27]" role="list">
                {resume.aiSuggestions.slice(0, 3).map((sug, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#D97706] font-bold">•</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 rounded-xl border border-dashed border-[#D4DED3] bg-[#FFFDF7]/80">
          <h3 className="text-sm font-semibold text-[#344942]">No active resume on file</h3>
          <p className="text-xs text-[#516861] mt-1 max-w-sm mx-auto">
            Upload your existing PDF/DOCX resume for automated extraction, or author a structured resume in Resume Studio.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-[#06281E] hover:bg-emerald-400 transition-colors">
                <UploadIcon className="h-3.5 w-3.5" />
                <span>Upload PDF Resume</span>
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={onFileUpload}
                className="hidden"
                disabled={uploadingFile}
                aria-label="Upload resume PDF or DOCX"
              />
            </label>
            <Link
              to="/resume-builder"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DED3] bg-[#E6F4F0] px-3.5 py-2 text-xs font-semibold text-[#344942] hover:bg-[#D4ECE5] transition-colors"
            >
              <span>Open Resume Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResumeWidget;
