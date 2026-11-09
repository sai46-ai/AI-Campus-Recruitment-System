import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSearch, 
  FileEdit, 
  MessageSquareCode, 
  ShieldCheck, 
  ArrowRight, 
  Award,
  CheckCircle2,
  Code2,
  Cpu
} from 'lucide-react';

interface CapabilityCardProps {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
  features: string[];
  actionLabel?: string;
  actionHref?: string;
  badge?: string;
}

const CapabilityCard: React.FC<CapabilityCardProps> = ({
  icon,
  tag,
  title,
  description,
  features,
  actionLabel,
  actionHref,
  badge,
}) => {
  return (
    <div className="relative group rounded-xl border border-white/10 bg-[#0E131F]/80 p-6 md:p-8 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#121827]/90 hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col justify-between">
      {/* Decorative gradient corner glow */}
      <div 
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl transition-all duration-500 group-hover:bg-emerald-500/10" 
        aria-hidden="true" 
      />

      <div>
        {/* Top bar with icon and tag */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/40 transition-transform duration-200">
            {icon}
          </div>
          {badge && (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-[#0A7D6E]">
              <Award className="h-3 w-3" />
              {badge}
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono text-[#6D858A]">{tag}</span>
        <h3 className="mt-1 text-xl font-bold text-[#1E2D27] group-hover:text-[#0A7D6E] transition-colors duration-200">
          {title}
        </h3>
        
        <p className="mt-2.5 text-sm leading-relaxed text-[#516861]">
          {description}
        </p>

        {/* Feature bullets */}
        <ul className="mt-5 space-y-2 text-xs text-[#6D858A]" role="list">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400/80 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {actionLabel && actionHref && (
        <div className="mt-6 pt-5 border-t border-white/5">
          <Link
            to={actionHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:text-[#0A7D6E] focus:outline-none focus-visible:underline"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export const PlatformCapabilities: React.FC = () => {
  const capabilities = [
    {
      icon: <FileSearch className="h-6 w-6" />,
      tag: "Deep Document AST",
      title: "Resume Parsing & Skill Extraction",
      description:
        "Analyzes uploaded PDF/DOCX resumes, extracting structured candidate profiles, academic history, and technical competencies without manual re-entry.",
      features: [
        "Multi-tier NLP & taxonomy skill extraction across engineering disciplines",
        "Deterministic CGPA, degree, and graduation timeline parsing",
        "Zero data transmission to unverified third-party brokers",
      ],
      actionLabel: "Test ATS Alignment",
      actionHref: "/login",
      badge: "Core Parser",
    },
    {
      icon: <FileEdit className="h-6 w-6" />,
      tag: "Authoring Suite",
      title: "Interactive Resume Builder & ATS Gauge",
      description:
        "Full-featured interactive resume designer with live ATS structural feedback, section customization, and clean standard layout generation.",
      features: [
        "Live ATS score evaluation assessing structural compliance",
        "Customizable work experience, project, and education entries",
        "Clean, recruitment-ready standard layout output",
      ],
      actionLabel: "Open Resume Builder",
      actionHref: "/resume-builder",
      badge: "Built-in Tool",
    },
    {
      icon: <MessageSquareCode className="h-6 w-6" />,
      tag: "Recruitment Workflow",
      title: "Real-Time Interview Pipeline Coordination",
      description:
        "End-to-end management of campus recruitment interview stages, coordinating corporate hiring panels and student candidate rounds seamlessly.",
      features: [
        "Structured interview rounds spanning technical, domain, and HR stages",
        "Direct panel meeting links and real-time scheduling coordination",
        "Transparent candidate status updates from application to offer release",
      ],
      actionLabel: "Explore Active Drives",
      actionHref: "/jobs",
      badge: "Pipeline Engine",
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      tag: "Governance & Auditing",
      title: "Institutional Drive Orchestration",
      description:
        "Complete lifecycle management for university placement cells and recruiters: drive publication, strict cutoff gating, and application pipelines.",
      features: [
        "Granular eligibility criteria (degree, min CGPA, graduation year)",
        "Multi-round status updates: Applied, Shortlisted, Interviewed, Offered",
        "Transparent, auditable drive logs for placement administration",
      ],
      actionLabel: "View Placement Protocol",
      actionHref: "/login",
      badge: "Institutional",
    },
  ];

  return (
    <section 
      id="platform-capabilities" 
      className="py-16 md:py-24" 
      aria-labelledby="capabilities-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3">
            <Cpu className="h-3.5 w-3.5" />
            <span>End-to-End Recruitment Infrastructure</span>
          </div>
          <h2 
            id="capabilities-heading" 
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#344942]"
          >
            Engineered for Campus Precision & Verified Hiring
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#516861]">
            A cohesive suite of specialized modules connecting university placement cells, engineering students, and enterprise recruiters with truthful data and zero guesswork.
          </p>
        </div>

        {/* 4-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {capabilities.map((cap, idx) => (
            <CapabilityCard
              key={idx}
              icon={cap.icon}
              tag={cap.tag}
              title={cap.title}
              description={cap.description}
              features={cap.features}
              actionLabel={cap.actionLabel}
              actionHref={cap.actionHref}
              badge={cap.badge}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

