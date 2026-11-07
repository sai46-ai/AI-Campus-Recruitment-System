import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Radar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { api } from '../../../shared/services/api';

export const LandingHero: React.FC = () => {
  const [systemOnline, setSystemOnline] = useState<boolean | null>(null);
  const [apiVersion, setApiVersion] = useState<string>('2.0.0');

  useEffect(() => {
    let isMounted = true;
    api
      .get('/health', { timeout: 3000 })
      .then((res) => {
        if (isMounted) {
          setSystemOnline(res.data?.status === 'ok');
          if (res.data?.version) setApiVersion(res.data.version);
        }
      })
      .catch(() => {
        if (isMounted) setSystemOnline(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden" aria-labelledby="hero-heading">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Verification Status Chip */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FFFDF7]/70 border border-[#D4DED3] backdrop-blur-[6px] shadow-sm">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                systemOnline === false ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className="text-[11px] font-mono text-[#516861] font-medium">
              {systemOnline === true
                ? `Enterprise placement engine • API v${apiVersion} active`
                : systemOnline === false
                ? 'Campus recruitment engine • Standalone mode'
                : 'Initializing talent infrastructure...'}
            </span>
          </div>
        </div>

        {/* Hero Headline & Narrative */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1E2D27] leading-[1.14] mb-6 font-headline"
          >
            Where University Talent Meets{' '}
            <span className="text-[#0A7D6E]">
              Verified Enterprise Placement
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#516861] max-w-2xl mx-auto leading-relaxed">
            An institutional-grade recruitment matching engine connecting accredited universities, engineering
            candidates, and enterprise employers with verifiable skills, automated ATS screening, and compliant
            placement workflows.
          </p>
        </div>

        {/* Primary Action Button Cluster */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-12">
          <Button asChild variant="primary" size="lg" className="rounded-xl font-semibold">
            <Link to="/register" className="group">
              <span>Enter Student Gateway</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="rounded-xl text-[#1E2D27] hover:text-[#0A7D6E]">
            <Link to="/login">
              <Building2 className="w-4 h-4 text-[#0A7D6E] mr-1.5" aria-hidden="true" />
              <span>Recruiter Portal</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl border-[#D4DED3] text-[#516861] hover:text-[#0A7D6E]">
            <a href="#recruitment-cockpit">
              <Radar className="w-4 h-4 text-[#0A7D6E] mr-1.5" aria-hidden="true" />
              <span>Explore Live Drives</span>
            </a>
          </Button>
        </div>

        {/* Institutional Verification Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#516861] font-mono">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0A7D6E]" aria-hidden="true" />
            <span>Institutional Placement Analytics</span>
          </div>
          <span className="text-[#D4DED3] hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A7D6E]" aria-hidden="true" />
            <span>Role-Based Access Control</span>
          </div>
          <span className="text-[#D4DED3] hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0A7D6E]" aria-hidden="true" />
            <span>Automated ATS Category Scoring</span>
          </div>
        </div>
      </div>
    </section>
  );
};

