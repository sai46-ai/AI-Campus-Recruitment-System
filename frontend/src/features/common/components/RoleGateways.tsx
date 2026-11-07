import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface RoleGatewayCardProps {
  icon: React.ReactNode;
  audience: string;
  headline: string;
  description: string;
  points: string[];
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  highlighted?: boolean;
}

const RoleGatewayCard: React.FC<RoleGatewayCardProps> = ({
  icon,
  audience,
  headline,
  description,
  points,
  primaryCtaText,
  primaryCtaHref,
  secondaryCtaText,
  secondaryCtaHref,
  highlighted = false,
}) => {
  return (
    <div
      className={`relative rounded-xl border flex flex-col justify-between p-6 sm:p-8 transition-all duration-300 ${
        highlighted
          ? 'border-emerald-400/45 bg-[#E6F4F0]/92 shadow-xl shadow-emerald-950/20'
          : 'border-[#D4DED3] bg-tideglass-surface hover:border-cyan-400/40'
      } backdrop-blur-md`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500 px-3 py-0.5 text-[11px] font-bold text-[#06281E] uppercase tracking-wider">
          Primary Candidate Gateway
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-400/25 bg-[#E6F4F0] text-[#0A7D6E]">
            {icon}
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#516861]">{audience}</span>
            <h3 className="text-lg font-bold text-[#344942]">{headline}</h3>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#344942] mb-6">
          {description}
        </p>

        <div className="border-t border-[#D4DED3] pt-5 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#516861] mb-3 block">
            Core Workflow Access:
          </span>
          <ul className="space-y-2 text-xs text-[#344942]" role="list">
            {points.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0A7D6E] mt-0.5" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-[#D4DED3] flex flex-col sm:flex-row gap-2.5">
        <Link
          to={primaryCtaHref}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
            highlighted
              ? 'bg-emerald-500 text-[#06281E] hover:bg-emerald-400'
              : 'border border-emerald-400/35 bg-emerald-500/15 text-[#066A5B] hover:bg-emerald-500/25'
          } focus:outline-none focus:ring-2 focus:ring-emerald-400`}
        >
          <span>{primaryCtaText}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          to={secondaryCtaHref}
          className="inline-flex items-center justify-center rounded-lg border border-[#D4DED3] bg-[#E6F4F0] px-4 py-2.5 text-xs font-medium text-[#344942] transition-colors hover:bg-[#D4ECE5] hover:text-[#344942]"
        >
          {secondaryCtaText}
        </Link>
      </div>
    </div>
  );
};

export const RoleGateways: React.FC = () => {
  return (
    <section
      id="role-gateways"
      className="py-16 md:py-24 border-t border-[#D4DED3]"
      aria-labelledby="gateways-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-[#0A7D6E] mb-3">
            <Users className="h-3.5 w-3.5" />
            <span>Dedicated Stakeholder Portals</span>
          </div>
          <h2
            id="gateways-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#344942]"
          >
            A Unified Platform Tailored for Each Role
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#344942]">
            Secure, role-segregated interfaces designed specifically for students preparing for employment, enterprise hiring teams, and university placement administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <RoleGatewayCard
            icon={<GraduationCap className="h-6 w-6" />}
            audience="Candidates"
            headline="Students & Graduates"
            description="Build competitive industry profiles, verify academic eligibility cutoffs, and track campus drive progress in real time."
            points={[
              'ATS-aligned structured resume builder and PDF export',
              'Real-time campus drive discovery and single-click apply',
              'Automated skill coverage and ATS readiness diagnostics',
              'Transparent application status tracking across all rounds',
            ]}
            primaryCtaText="Student Registration"
            primaryCtaHref="/register?role=student"
            secondaryCtaText="Candidate Sign In"
            secondaryCtaHref="/login"
            highlighted={true}
          />

          <RoleGatewayCard
            icon={<Building2 className="h-6 w-6" />}
            audience="Hiring Teams"
            headline="Enterprise Recruiters"
            description="Discover qualified campus talent with verified cutoffs, streamline candidate screening, and coordinate selection rounds with agility."
            points={[
              'Create campus drives with granular eligibility parameters',
              'Review structured candidate profiles and ATS-parsed skills',
              'Transition applicant stages: Applied, Shortlisted, Selected',
              'Direct applicant filtering and hiring pipeline analytics',
            ]}
            primaryCtaText="Recruiter Login"
            primaryCtaHref="/login"
            secondaryCtaText="Register Company"
            secondaryCtaHref="/register?role=recruiter"
          />

          <RoleGatewayCard
            icon={<Landmark className="h-6 w-6" />}
            audience="Administration"
            headline="Placement Directors"
            description="Manage university-wide recruitment logistics, approve corporate drives, track batch placement velocities, and maintain compliance archives."
            points={[
              'Authorize and oversee incoming company recruitment drives',
              'Enforce institutional policies (CGPA and backlog gates)',
              'Audit applicant logs and institutional placement progress',
              'Export structured placement summaries for accreditation',
            ]}
            primaryCtaText="Officer Access"
            primaryCtaHref="/login"
            secondaryCtaText="Policy Guidelines"
            secondaryCtaHref="/terms"
          />
        </div>
      </div>
    </section>
  );
};
