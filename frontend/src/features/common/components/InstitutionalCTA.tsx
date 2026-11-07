import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Database,
  GraduationCap,
} from 'lucide-react';

export const InstitutionalCTA: React.FC = () => {
  return (
    <section
      id="institutional-cta"
      className="py-16 md:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl border border-[#D4DED3] bg-[#FFFDF7]/70 p-8 sm:p-12 md:p-16 backdrop-blur-[6px] shadow-sm text-center">
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-[#0A7D6E] mb-6">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Next-generation placement orchestration</span>
            </div>

            <h2
              id="cta-heading"
              className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[#1E2D27] leading-tight"
            >
              Elevate Your Campus Recruitment Experience
            </h2>

            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#516861] max-w-2xl mx-auto leading-relaxed">
              Equip your institution, candidates, and hiring partners with a verified, AI-assisted recruitment infrastructure that replaces spreadsheet chaos with transparent, automated workflows.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 shadow-sm"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/jobs"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-[#D4DED3] bg-[#FFFDF7] px-6 py-3.5 text-sm font-semibold text-[#1E2D27] transition-colors hover:bg-[#EAF2FA]"
              >
                Explore Live Drives
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-[#D4DED3] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#0A7D6E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-[#1E2D27] block">Dedicated Role Gateways</span>
                  <span className="text-[11px] text-[#516861] block mt-0.5">
                    Tailored workflows for Students, Corporate Recruiters &amp; Placement Cells.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-[#0A7D6E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-[#1E2D27] block">Direct Campus Drives</span>
                  <span className="text-[11px] text-[#516861] block mt-0.5">
                    All job drives, requirements, and cutoffs published directly by verified employers.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-[#0A7D6E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-[#1E2D27] block">Authenticated Access</span>
                  <span className="text-[11px] text-[#516861] block mt-0.5">
                    Protected application records and deterministic ATS evaluations.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
