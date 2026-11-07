import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileEdit,
  FileText,
  MessageSquareCode,
  CheckCircle2,
  Lock,
  GraduationCap,
  Building2,
  Landmark,
  Compass,
} from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';
import { DriveBoard } from './components/DriveBoard';
import { PlatformIntelligence } from './components/PlatformIntelligence';
import { getChapterFromProgress } from '../../shared/components/background/cameraSpline';
import { api } from '../../shared/services/api';

export const LandingPage: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      setActiveChapter(getChapterFromProgress(progress));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/health', { timeout: 3000 })
      .then((res) => {
        if (isMounted) {
          setApiOnline(res.data?.status === 'ok');
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiOnline(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSection = (id: string, targetProgress?: number) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (typeof targetProgress === 'number' && (window as any).__CAMPUS_3D_WORLD__) {
      (window as any).__CAMPUS_3D_WORLD__.setProgress(targetProgress);
      setActiveChapter(getChapterFromProgress(targetProgress));
    }
  };

  return (
    <div className="relative text-[#1E2D27] overflow-x-hidden pb-24">
      {/* FLOATING CHAPTER INDICATOR RAIL */}
      <nav
        aria-label="Chapter navigation"
        className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2 p-2 rounded-xl bg-tideglass-surface border border-[#D4DED3] backdrop-blur-[6px] shadow-sm"
      >
        {[
          { num: 1, id: 'chapter-discover', label: 'Discover', progress: 0.0 },
          { num: 2, id: 'chapter-profile', label: 'Build profile', progress: 0.25 },
          { num: 3, id: 'chapter-opportunities', label: 'Opportunities', progress: 0.5 },
          { num: 4, id: 'chapter-interview', label: 'Evaluation pipeline', progress: 0.75 },
          { num: 5, id: 'chapter-placement', label: 'Placement', progress: 1.0 },
        ].map((ch) => (
          <button
            key={ch.num}
            onClick={() => scrollToSection(ch.id, ch.progress)}
            aria-label={`Jump to Chapter ${ch.num}: ${ch.label}`}
            className={`group relative flex items-center justify-center h-8 w-8 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeChapter === ch.num
                ? 'bg-[#0A7D6E] text-white shadow-xs'
                : 'text-[#516861] hover:text-[#1E2D27] hover:bg-[#EAF2ED]'
            }`}
          >
            <span>0{ch.num}</span>
            <span className="pointer-events-none absolute right-10 whitespace-nowrap rounded-md bg-[#FFFDF7] border border-[#D4DED3] px-2.5 py-1 text-[11px] font-sans font-medium text-[#1E2D27] opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xs">
              {ch.label}
            </span>
          </button>
        ))}
      </nav>

      {/* CHAPTER 01: DISCOVER — OPPORTUNITY LANDSCAPE */}
      <section
        id="chapter-discover"
        className="min-h-screen py-24 sm:py-32 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full relative"
        aria-labelledby="ch1-heading"
      >
        <div className="max-w-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] rounded-2xl p-6 sm:p-10 shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0A7D6E]" />
              Chapter 01 • Discover
            </span>
            <span className="text-[11px] font-mono text-[#1E6778]">
              Verified Institutional Network
            </span>
          </div>

          <h1
            id="ch1-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1E2D27] leading-tight font-headline"
          >
            Where University Talent Meets Verified Enterprise Placement
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#516861] leading-relaxed">
            An institutional-grade recruitment matching platform connecting accredited universities, engineering candidates, and enterprise employers with verifiable skills, automated ATS screening, and compliant placement workflows.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Button
              asChild
              variant="primary"
              size="lg"
              className="rounded-xl font-semibold bg-[#0A7D6E] text-white hover:bg-[#0E9584] shadow-xs"
            >
              <button onClick={() => scrollToSection('chapter-opportunities', 0.5)}>
                <span>Explore Opportunities</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="rounded-xl border border-[#D4DED3] bg-tideglass-surface text-[#1E2D27] hover:bg-[#EAF2ED]"
            >
              <Link to="/register?role=student">
                <GraduationCap className="w-4 h-4 mr-1.5 text-[#0A7D6E]" />
                <span>Student Gateway</span>
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#D4DED3] flex flex-wrap items-center gap-4 text-xs font-medium text-[#516861]">
            <span className="text-[#0A7D6E]">
              Placement Analytics
            </span>
            <span className="text-[#D4DED3]">|</span>
            <span>Eligibility Cutoffs</span>
            <span className="text-[#D4DED3]">|</span>
            <span>Automated Screening</span>
          </div>
        </div>
      </section>

      {/* CHAPTER 02: BUILD YOUR PROFILE */}
      <section
        id="chapter-profile"
        className="min-h-screen py-24 sm:py-32 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full relative"
        aria-labelledby="ch2-heading"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0284C7] rounded-2xl p-6 sm:p-10 shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-amber-500/15 text-[#B45309] border border-amber-400/35 mb-4">
              <FileText className="w-3.5 h-3.5" />
              Chapter 02 • Profile Station
            </div>

            <h2
              id="ch2-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1E2D27] leading-tight font-headline"
            >
              Build a Profile That Has Dimension
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#516861] leading-relaxed">
              Transform flat resume pages into structured, verified engineering credentials. Multi-format PDF and DOCX parsing extracts academic milestones, project architectures, and core skills without manual re-entry.
            </p>

            <ul className="mt-6 space-y-3 text-xs sm:text-sm text-[#1E2D27]" role="list">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0A7D6E] shrink-0 mt-0.5" />
                <span>Live ATS scoring gauge evaluating structural formatting compliance</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0A7D6E] shrink-0 mt-0.5" />
                <span>Dynamic section authoring for education, experience, projects, and skills</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0A7D6E] shrink-0 mt-0.5" />
                <span>Standardized, recruiter-friendly single-click PDF compilation</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-[#D4DED3] flex flex-wrap items-center gap-3">
              <Button asChild variant="primary" size="md" className="rounded-xl font-semibold bg-[#0A7D6E] text-white hover:bg-[#0E9584]">
                <Link to="/resume-builder">
                  <FileEdit className="w-4 h-4 mr-1.5" />
                  <span>Open Resume Builder</span>
                </Link>
              </Button>
              <Button asChild variant="secondary" size="md" className="rounded-xl border-[#D4DED3] text-[#1E2D27]">
                <Link to="/login">Test ATS Alignment</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 pointer-events-none hidden lg:block" aria-hidden="true" />
        </div>
      </section>

      {/* CHAPTER 03: DISCOVER OPPORTUNITIES */}
      <section
        id="chapter-opportunities"
        className="min-h-screen py-20 sm:py-28 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full relative"
        aria-labelledby="ch3-heading"
      >
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#2563EB] rounded-2xl p-5 shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-[#EBF4F6] text-[#1E6778] border border-[#BFE1E7] mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Chapter 03 • Opportunity Network
            </div>
            <h2
              id="ch3-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E2D27] font-headline"
            >
              Explore the Network of Campus Opportunities
            </h2>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#0A7D6E] hover:text-[#0E9584] px-3.5 py-2 rounded-lg bg-[#EAF5EF] border border-[#BDE0D3] transition-colors w-fit"
          >
            <span>Open full directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8">
            <DriveBoard />
          </div>
          <div className="lg:col-span-4">
            <PlatformIntelligence />
          </div>
        </div>
      </section>

      {/* CHAPTER 04: EVALUATION & SELECTION PIPELINE */}
      <section
        id="chapter-interview"
        className="min-h-screen py-24 sm:py-32 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full relative"
        aria-labelledby="ch4-heading"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 pointer-events-none hidden lg:block" aria-hidden="true" />

          <div className="lg:col-span-5 bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#D97706] rounded-2xl p-6 sm:p-10 shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-[#EBF4F6] text-[#1E6778] border border-[#BFE1E7] mb-4">
              <MessageSquareCode className="w-3.5 h-3.5" />
              Chapter 04 • Selection &amp; Evaluation Pipeline
            </div>

            <h2
              id="ch4-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1E2D27] leading-tight font-headline"
            >
              Structured Screening &amp; Panel Coordination
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#516861] leading-relaxed">
              Coordinate corporate screening rounds, technical assessments, and panel evaluations in a unified recruitment workflow. Keep candidates, corporate hiring panels, and placement officers synchronized with live status updates.
            </p>

            <ul className="mt-6 space-y-3 text-xs sm:text-sm text-[#516861]" role="list">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E6778] shrink-0 mt-0.5" />
                <span>Synchronized stage tracking for Applied, Shortlisted, and Selected candidates</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E6778] shrink-0 mt-0.5" />
                <span>Automated eligibility verification against CGPA, department, and backlog cutoffs</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E6778] shrink-0 mt-0.5" />
                <span>Real-time candidate evaluation status and application progress timeline</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-[#D4DED3] flex flex-wrap items-center gap-3">
              <Button asChild variant="primary" size="md" className="rounded-xl font-semibold bg-[#0A7D6E] text-white hover:bg-[#0E9584]">
                <Link to="/jobs">
                  <span>Explore Active Drives</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="md" className="rounded-xl border-[#D4DED3] text-[#1E2D27] hover:text-[#0A7D6E]">
                <Link to="/login">Candidate Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER 05: PLACEMENT CONVERGENCE */}
      <section
        id="chapter-placement"
        className="min-h-screen py-24 sm:py-32 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full relative"
        aria-labelledby="ch5-heading"
      >
        <div className="max-w-4xl mx-auto w-full bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#059669] rounded-2xl p-8 sm:p-12 md:p-14 shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3] mb-6">
            <GraduationCap className="w-3.5 h-3.5" />
            Chapter 05 • Placement Convergence
          </div>

          <h2
            id="ch5-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1E2D27] leading-tight font-headline"
          >
            Follow the Path Toward Verified Placement
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-[#516861] max-w-2xl mx-auto leading-relaxed">
            The five-environment recruitment platform unites students, universities, and enterprise hiring teams with transparent eligibility cutoffs, authenticated records, and real-time analytics.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <Link
              to="/register?role=student"
              className="p-5 rounded-xl border border-[#D4DED3] border-t-2 border-t-[#2563EB] bg-tideglass-surface hover:bg-[#EAF2ED] transition-colors group"
            >
              <GraduationCap className="w-6 h-6 text-[#2563EB] mb-3" />
              <h3 className="text-sm font-semibold text-[#1E2D27] group-hover:text-[#2563EB] transition-colors">
                Candidate Gateway
              </h3>
              <p className="text-xs text-[#516861] mt-1">
                Build your ATS profile, apply to live campus drives &amp; track selection stages.
              </p>
            </Link>

            <Link
              to="/login"
              className="p-5 rounded-xl border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] bg-tideglass-surface hover:bg-[#EAF2ED] transition-colors group"
            >
              <Building2 className="w-6 h-6 text-[#0A7D6E] mb-3" />
              <h3 className="text-sm font-semibold text-[#1E2D27] group-hover:text-[#0A7D6E] transition-colors">
                Recruiter Portal
              </h3>
              <p className="text-xs text-[#516861] mt-1">
                Post company drives with custom cutoffs and evaluate verified candidate resumes.
              </p>
            </Link>

            <Link
              to="/login"
              className="p-5 rounded-xl border border-[#D4DED3] border-t-2 border-t-[#D97706] bg-tideglass-surface hover:bg-[#EAF2ED] transition-colors group"
            >
              <Landmark className="w-6 h-6 text-[#D97706] mb-3" />
              <h3 className="text-sm font-semibold text-[#1E2D27] group-hover:text-[#D97706] transition-colors">
                Placement Directors
              </h3>
              <p className="text-xs text-[#516861] mt-1">
                Institutional orchestration, drive authorizations, and placement analytics exports.
              </p>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              variant="primary"
              size="lg"
              className="rounded-xl font-semibold bg-[#0A7D6E] text-white hover:bg-[#0E9584] px-8 py-3.5 shadow-xs"
            >
              <Link to="/register">
                <span>Join Placement Network</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 pt-6 border-t border-[#D4DED3] flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#516861]">
            <span className="text-[#0A7D6E]">
              Verified Campus Placement
            </span>
            <span className="text-[#D4DED3]">|</span>
            <span className="text-[#1E2D27]">
              Automated ATS Screening
            </span>
            <span className="text-[#D4DED3]">|</span>
            <span>Institutional Multi-Stage Evaluation</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
