import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-[#EAF5EF] border border-[#BDE0D3] flex items-center justify-center text-[#0A7D6E] shadow-xs shrink-0">
          <Shield className="w-6 h-6 text-[#0A7D6E]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2D27] tracking-tight font-headline">Privacy Policy</h1>
          <p className="text-xs sm:text-sm text-[#516861] mt-0.5">Last updated: November 2026 • Institutional Compliance</p>
        </div>
      </div>

      <div className="bg-tideglass-surface rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] p-8 shadow-[0_4px_16px_rgba(30,45,39,0.06)] space-y-8 text-[#1E2D27] leading-relaxed text-sm backdrop-blur-[6px]">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#1E2D27] flex items-center space-x-2 font-headline">
            <Lock className="w-4 h-4 text-[#0A7D6E]" />
            <span>1. Data Collection &amp; Pre-Inference Minimization</span>
          </h2>
          <p className="text-[#516861]">
            The AI Campus Recruitment System collects only the minimum student, recruiter, and institutional data necessary to execute campus recruitment workflows. Resumes uploaded by students are parsed strictly for professional skills, educational credentials, and employment history.
          </p>
          <p className="text-[#516861]">
            Pre-inference data sanitization removes sensitive direct personal identifiers before transmission to AI evaluation models, ensuring compliance with institutional privacy standards and global data protection guidelines.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#D4DED3]">
          <h2 className="text-lg font-bold text-[#1E2D27] flex items-center space-x-2 font-headline">
            <FileText className="w-4 h-4 text-[#2879AD]" />
            <span>2. Role-Based Access Control (RBAC) &amp; Authorization</span>
          </h2>
          <p className="text-[#516861]">
            Access to student profiles, applicant rosters, and institutional metrics is strictly gated by role. Recruiters may only inspect candidates who have applied to their authorized recruitment drives. Training &amp; Placement Officers (TPOs) maintain audit access for departmental verification and institutional placement reporting.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#D4DED3]">
          <h2 className="text-lg font-bold text-[#1E2D27] flex items-center space-x-2 font-headline">
            <CheckCircle2 className="w-4 h-4 text-[#0A7D6E]" />
            <span>3. Audit Logging &amp; Data Retention</span>
          </h2>
          <p className="text-[#516861]">
            All critical system interactions — including application status transitions, job postings, and permission modifications — are recorded in the institutional audit log with actor ID, timestamp, and IP provenance.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
