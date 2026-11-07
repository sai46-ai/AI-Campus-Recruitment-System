import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Cpu, FileCheck2, Lock, ArrowRight, Layers } from 'lucide-react';
import { api } from '../../../shared/services/api';
import { Button } from '../../../shared/components/ui/Button';

export const PlatformIntelligence: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'online' | 'standby' | 'checking'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [apiVersion, setApiVersion] = useState<string>('2.0.0');

  useEffect(() => {
    let isMounted = true;
    const start = performance.now();

    api
      .get('/health', { timeout: 3000 })
      .then((res) => {
        const roundTrip = Math.round(performance.now() - start);
        if (isMounted) {
          if (res.data?.status === 'ok') {
            setHealthStatus('online');
            setLatencyMs(roundTrip);
            if (res.data?.version) setApiVersion(res.data.version);
          } else {
            setHealthStatus('standby');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setHealthStatus('standby');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const pipelineStages = [
    {
      step: '01',
      title: 'Resume AST Extraction',
      description: 'Multi-format PDF parsing with structured skills & education normalization.',
      icon: FileCheck2,
      tag: 'PARSER',
    },
    {
      step: '02',
      title: 'ATS Schema Alignment',
      description: 'Multi-category compatibility scoring against recruiter job prerequisites.',
      icon: Cpu,
      tag: 'EVALUATION',
    },
    {
      step: '03',
      title: 'Selection Coordination',
      description: 'Domain-specific technical & HR round scheduling with real-time status updates.',
      icon: Activity,
      tag: 'ASSESSMENT',
    },
    {
      step: '04',
      title: 'Institutional Audit',
      description: 'Placement cell verification and institutional audit records.',
      icon: Layers,
      tag: 'GOVERNANCE',
    },
  ];

  return (
    <div className="space-y-4 flex flex-col justify-between h-full">
      {/* 1. Verified Telemetry & System Health Card */}
      <div className="p-5 rounded-2xl bg-tideglass-surface border border-[#D4DED3] shadow-[0_8px_28px_rgba(52,73,66,0.10)] backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#D4DED3]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0A7D6E]" aria-hidden="true" />
            <span className="text-xs font-mono font-medium text-[#1E2D27]">
              Platform telemetry
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
              healthStatus === 'online'
                ? 'bg-[#EAF5EF] text-[#0A7D6E] border-[#BDE0D3]'
                : healthStatus === 'standby'
                ? 'bg-[#FEF3C7] text-[#92400E] border-amber-400/40'
                : 'bg-[#F0F6F3] text-[#516861] border-[#D4DED3]'
            }`}
          >
            {healthStatus === 'online' ? 'Active' : healthStatus === 'standby' ? 'Standby' : 'Checking'}
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-[rgba(255,253,247,0.52)] border border-[#D4DED3] flex items-center justify-between shadow-xs">
            <span className="text-[#516861]">Core API Version</span>
            <span className="text-[#1E2D27] font-semibold tabular-nums">v{apiVersion}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[rgba(255,253,247,0.52)] border border-[#D4DED3] flex items-center justify-between shadow-xs">
            <span className="text-[#516861]">Gateway Latency</span>
            <span className="text-[#0A7D6E] font-semibold tabular-nums">
              {latencyMs !== null ? `${latencyMs} ms` : 'Standby / Local'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[rgba(255,253,247,0.52)] border border-[#D4DED3] flex items-center justify-between shadow-xs">
            <span className="text-[#516861]">Eligibility Verification</span>
            <span className="text-[#1E6778] font-semibold">Automated Cutoffs</span>
          </div>
        </div>
      </div>

      {/* 2. Structured Placement Pipeline Explanation */}
      <div className="p-5 rounded-2xl bg-tideglass-surface border border-[#D4DED3] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-mono font-medium text-[#0A7D6E]">
              Matching architecture
            </span>
            <span className="text-[10px] font-mono text-[#516861]">4 stages</span>
          </div>

          <div className="space-y-3">
            {pipelineStages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="p-2.5 rounded-lg bg-tideglass-surface border border-[#D4DED3] flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-md bg-[#E6F4F0] border border-[#D4DED3] flex items-center justify-center text-[#0A7D6E] shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-[#344942] truncate">{stage.title}</h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#E6F4F0] text-[#1E6091] border border-[#D4DED3]">
                        {stage.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#516861] leading-snug">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#D4DED3]">
          <div className="flex items-center gap-2 text-xs text-[#344942] font-medium mb-1.5">
            <Lock className="w-3.5 h-3.5 text-[#0A7D6E] shrink-0" aria-hidden="true" />
            <span>Institutional Data Protection</span>
          </div>
          <p className="text-[11px] text-[#516861] leading-relaxed mb-3">
            Student contact details remain shielded until candidate selection. Audit logs guarantee transparency.
          </p>
          <Button asChild variant="primary" size="sm" className="w-full text-center">
            <Link to="/register" className="justify-center">
              <span>Join Placement Network</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
