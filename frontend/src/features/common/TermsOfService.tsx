import React from 'react';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#2563EB] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-blue-200 flex items-center justify-center text-[#2563EB] shadow-xs shrink-0">
          <BookOpen className="w-6 h-6 text-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2D27] tracking-tight font-headline">Terms of Service</h1>
          <p className="text-xs sm:text-sm text-[#516861] mt-0.5">Effective Date: November 2026 • Campus Usage Agreement</p>
        </div>
      </div>

      <div className="bg-tideglass-surface rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#2563EB] p-8 shadow-[0_4px_16px_rgba(30,45,39,0.06)] space-y-8 text-[#1E2D27] leading-relaxed text-sm backdrop-blur-[6px]">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#1E2D27] flex items-center space-x-2 font-headline">
            <CheckCircle className="w-4 h-4 text-[#0A7D6E]" />
            <span>1. Authorized Institutional Usage</span>
          </h2>
          <p className="text-[#516861]">
            This platform is designated for verified students, participating corporate recruiters, and authorized university placement officials. Creating fraudulent profiles, scraping applicant data, or attempting unauthorized privilege escalation will result in immediate account termination.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#D4DED3]">
          <h2 className="text-lg font-bold text-[#1E2D27] flex items-center space-x-2 font-headline">
            <AlertCircle className="w-4 h-4 text-[#B45309]" />
            <span>2. Fair Recruitment &amp; Verification Standards</span>
          </h2>
          <p className="text-[#516861]">
            Recruiters must post accurate job descriptions, compensation ranges, and eligibility criteria. Placement officers retain the authority to review and approve all campus drives before they become active on the public student portal.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#D4DED3]">
          <h2 className="text-lg font-bold text-[#1E2D27] flex items-center space-x-2 font-headline">
            <BookOpen className="w-4 h-4 text-[#2879AD]" />
            <span>3. Automated ATS Advisory Disclaimer</span>
          </h2>
          <p className="text-[#516861]">
            Resume ATS scores and skill-matching evaluations are algorithmic suggestions provided to assist students and recruiters. Final hiring decisions and academic certifications remain the sole responsibility of human evaluators and institutional authorities.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
