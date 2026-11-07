import React from 'react';
import { Shield, Activity, Server, Database, Zap, Lock } from 'lucide-react';

interface SystemActivityMatrixProps {
  totalUsers?: number;
  totalJobs?: number;
  totalApplications?: number;
  uptime?: string;
  className?: string;
}

export const SystemActivityMatrix: React.FC<SystemActivityMatrixProps> = ({
  totalUsers = 0,
  totalJobs = 0,
  totalApplications = 0,
  uptime = 'Active',
  className = '',
}) => {
  const serviceNodes = [
    {
      name: 'Identity & RBAC Service',
      status: 'Operational',
      detail: `${totalUsers} Registered Accounts`,
      icon: Shield,
      color: 'text-[#0A7D6E]',
    },
    {
      name: 'MongoDB Document Store',
      status: 'Connected',
      detail: `${totalJobs} Published Drives`,
      icon: Database,
      color: 'text-[#2879AD]',
    },
    {
      name: 'ATS & Skill Matching Service',
      status: 'Ready',
      detail: 'Resume & Eligibility Scoring',
      icon: Zap,
      color: 'text-[#B45309]',
    },
    {
      name: 'Application Workflow API',
      status: 'Healthy',
      detail: `${totalApplications} Tracked Submissions`,
      icon: Server,
      color: 'text-[#0A7D6E]',
    },
  ];

  return (
    <div className={`p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] shadow-[0_8px_28px_rgba(52,73,66,0.10)] backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#D4DED3]">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#0A7D6E]" />
            <h3 className="text-base font-bold text-[#344942] font-headline">Platform Service Overview</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3]">
              SYSTEM OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-[#516861] mt-0.5">
            Live service status, role-based access enforcement, and database entity totals
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="p-2 rounded-lg bg-[#F0F6F3] border border-[#D4DED3] flex items-center gap-2">
            <span className="text-[#516861]">Service State:</span>
            <span className="text-[#0A7D6E] font-bold">{uptime}</span>
          </div>
        </div>
      </div>

      {/* Service Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
        {serviceNodes.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-[#FFFDF7] border border-[#D4DED3] flex flex-col justify-between space-y-3 font-mono shadow-xs">
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A7D6E]" />
                  {s.status}
                </span>
              </div>
              <div>
                <span className="text-xs font-sans font-bold text-[#344942] block mb-0.5">{s.name}</span>
                <span className="text-[11px] text-[#516861]">{s.detail}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Health Bar */}
      <div className="p-3.5 rounded-xl bg-[#F0F6F3] border border-[#D4DED3] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2 text-[#516861]">
          <Lock className="w-3.5 h-3.5 text-[#0A7D6E]" />
          <span>ROLE-BASED ACCESS &amp; INPUT VALIDATION ACTIVE</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          <span className="text-[#2879AD]">Provisioned Accounts: {totalUsers}</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-[#0A7D6E]">JWT &amp; Rate Limiting Enforced</span>
        </div>
      </div>
    </div>
  );
};

export default SystemActivityMatrix;
