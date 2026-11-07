import React, { useState } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

interface TalentNode {
  id: string;
  name: string;
  role: string;
  category: 'student' | 'recruiter' | 'enterprise';
  x: number;
  y: number;
  moduleType: string;
  capability: string;
}

const NODES: TalentNode[] = [
  {
    id: 'ai-core',
    name: 'ATS & Eligibility Core',
    role: 'Resume Parsing & Role Matching',
    category: 'enterprise',
    x: 50,
    y: 50,
    moduleType: 'Core Service',
    capability: 'Multi-factor Skill & CGPA Evaluation',
  },
  {
    id: 's1',
    name: 'Student Profile Hub',
    role: 'Academic & Skill Credentials',
    category: 'student',
    x: 20,
    y: 28,
    moduleType: 'Student Module',
    capability: 'Department, CGPA & Backlog Sync',
  },
  {
    id: 's2',
    name: 'Interactive Resume Studio',
    role: 'Structured Section Authoring',
    category: 'student',
    x: 26,
    y: 72,
    moduleType: 'Student Module',
    capability: 'Live Preview & PDF Generation',
  },
  {
    id: 's3',
    name: 'ATS Readiness Analyzer',
    role: 'Section & Keyword Diagnostics',
    category: 'student',
    x: 35,
    y: 20,
    moduleType: 'AI Service',
    capability: 'Skill Coverage & Formatting Breakdown',
  },
  {
    id: 's4',
    name: 'Application Tracker',
    role: 'Stage & Status Timeline',
    category: 'student',
    x: 15,
    y: 54,
    moduleType: 'Student Module',
    capability: 'Real-Time Selection Stage Updates',
  },
  {
    id: 'r1',
    name: 'Recruiter Drive Publisher',
    role: 'Job & Eligibility Configuration',
    category: 'recruiter',
    x: 76,
    y: 26,
    moduleType: 'Recruiter Module',
    capability: 'Role Criteria & Compensation Setup',
  },
  {
    id: 'r2',
    name: 'Applicant Screening Desk',
    role: 'Resume & Match Evaluation',
    category: 'recruiter',
    x: 82,
    y: 64,
    moduleType: 'Recruiter Module',
    capability: 'Shortlisting & Status Transitions',
  },
  {
    id: 'r3',
    name: 'Candidate Pipeline Funnel',
    role: 'Cohort Conversion Analytics',
    category: 'recruiter',
    x: 66,
    y: 78,
    moduleType: 'Recruiter Module',
    capability: 'Stage-by-Stage Applicant Tracking',
  },
  {
    id: 'e1',
    name: 'Placement Cell Console',
    role: 'University Drive Governance',
    category: 'enterprise',
    x: 48,
    y: 16,
    moduleType: 'Placement Cell',
    capability: 'Drive Verification & Cohort Oversight',
  },
  {
    id: 'e2',
    name: 'RBAC Security Gateway',
    role: 'Role-Based Access Control',
    category: 'enterprise',
    x: 80,
    y: 46,
    moduleType: 'Security Layer',
    capability: 'JWT Session & Endpoint Protection',
  },
  {
    id: 'e3',
    name: 'Institutional Audit Ledger',
    role: 'Placement & Offer Reporting',
    category: 'enterprise',
    x: 52,
    y: 84,
    moduleType: 'Admin Console',
    capability: 'CSV Export & System Governance',
  },
];

const EDGES = [
  ['ai-core', 's1'], ['ai-core', 's2'], ['ai-core', 's3'], ['ai-core', 's4'],
  ['ai-core', 'r1'], ['ai-core', 'r2'], ['ai-core', 'r3'],
  ['ai-core', 'e1'], ['ai-core', 'e2'], ['ai-core', 'e3'],
  ['s1', 'r1'], ['s2', 'r3'], ['s3', 'e1'], ['s4', 'e2'], ['r2', 'e3'],
  ['s1', 's3'], ['r1', 'e2'], ['s2', 'e3'],
];

export const TalentNetworkGraph: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'student' | 'recruiter' | 'enterprise'>('all');
  const [hoveredNode, setHoveredNode] = useState<TalentNode | null>(null);

  const filteredNodes = activeFilter === 'all'
    ? NODES
    : NODES.filter((n) => n.id === 'ai-core' || n.category === activeFilter);

  const getNodeColor = (cat: string) => {
    switch (cat) {
      case 'student': return '#38bdf8';
      case 'recruiter': return '#2dd4bf';
      case 'enterprise': return '#10b981';
      default: return '#10b981';
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col justify-between select-none ${className}`}>
      {/* Top Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#285370]/70 z-10">
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-xs font-mono text-slate-200 font-semibold tracking-wider uppercase">
            Platform Workflow Topology
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          {(['all', 'student', 'recruiter', 'enterprise'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/45 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-[#15344a]/80 text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main SVG Graph Visualization */}
      <div className="relative flex-1 w-full min-h-[320px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
            </linearGradient>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="50" cy="50" r="18" fill="url(#centerGlow)" />

          {EDGES.map(([srcId, tgtId], i) => {
            const src = NODES.find((n) => n.id === srcId);
            const tgt = NODES.find((n) => n.id === tgtId);
            if (!src || !tgt) return null;

            const isHighlighted = hoveredNode && (hoveredNode.id === srcId || hoveredNode.id === tgtId);

            return (
              <line
                key={`edge-${i}`}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={isHighlighted ? '#10b981' : 'url(#edgeGrad)'}
                strokeWidth={isHighlighted ? 0.7 : 0.35}
                strokeDasharray={isHighlighted ? 'none' : '1.5 1'}
                strokeOpacity={isHighlighted ? 0.95 : 0.5}
                className="transition-all duration-300"
              />
            );
          })}

          {filteredNodes.map((node) => {
            const isCenter = node.id === 'ai-core';
            const color = getNodeColor(node.category);
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  r={isCenter ? 4.5 : isHovered ? 3.2 : 2.2}
                  fill={isCenter ? '#0d2638' : '#15344a'}
                  stroke={color}
                  strokeWidth={isCenter ? 0.9 : 0.6}
                />
                <circle
                  r={isCenter ? 2.5 : isHovered ? 1.8 : 1.2}
                  fill={color}
                />
              </g>
            );
          })}
        </svg>

        {hoveredNode && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-xl bg-[#0e2738]/95 border border-emerald-400/50 shadow-2xl backdrop-blur-md text-xs font-mono"
            style={{
              left: `${Math.min(75, Math.max(25, hoveredNode.x))}%`,
              top: `${Math.min(75, Math.max(25, hoveredNode.y))}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="flex items-center space-x-2 text-white font-bold mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getNodeColor(hoveredNode.category) }}
              />
              <span>{hoveredNode.name}</span>
            </div>
            <div className="text-[11px] text-slate-300">{hoveredNode.role}</div>
            <div className="mt-2 pt-2 border-t border-[#285370] flex items-center justify-between gap-4 text-[10px]">
              <span className="text-emerald-300">{hoveredNode.capability}</span>
              <span className="text-cyan-300">{hoveredNode.moduleType}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Architecture Summary Strip */}
      <div className="pt-3 border-t border-[#285370]/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono z-10">
        <div className="flex items-center space-x-2 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>Role-Based Architecture</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          <span className="text-cyan-300 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> Student Portal
          </span>
          <span className="text-teal-300 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-teal-400" /> Recruiter Console
          </span>
          <span className="text-emerald-300 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Placement Governance
          </span>
        </div>
      </div>
    </div>
  );
};

export default TalentNetworkGraph;
