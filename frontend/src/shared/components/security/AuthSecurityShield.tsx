import React from 'react';
import { Shield, Lock, Key, EyeOff, ShieldCheck } from 'lucide-react';

interface AuthSecurityShieldProps {
  className?: string;
  variant?: 'login' | 'register';
}

export const AuthSecurityShield: React.FC<AuthSecurityShieldProps> = ({
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center select-none py-2 ${className}`}>
      {/* Central Security Crest */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center my-3">
        <div className="absolute inset-0 rounded-full border border-emerald-400/25" />
        <div className="absolute inset-3 rounded-full border border-dashed border-[#D4DED3]" />
        <div className="absolute inset-6 rounded-full border border-teal-400/20" />

        <div className="relative z-10 w-28 h-28 rounded-xl bg-tideglass-surface border border-[#D4DED3] shadow-sm flex flex-col items-center justify-center backdrop-blur-[6px]">
          <div className="relative">
            <Shield className="w-12 h-12 text-[#0A7D6E]" />
            <Lock className="w-5 h-5 text-[#1E6091] absolute -bottom-1 -right-1" />
          </div>
          <span className="mt-2 text-[10px] font-mono font-semibold tracking-wide text-[#0A7D6E]">
            [Talent Core]
          </span>
        </div>

        <div className="absolute top-1 left-4 px-2 py-0.5 rounded-md bg-[#FFFDF7]/90 border border-[#D4DED3] text-[9px] font-mono text-[#066A5B] shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Session auth
        </div>

        <div className="absolute bottom-2 right-4 px-2 py-0.5 rounded-md bg-[#FFFDF7]/90 border border-[#D4DED3] text-[9px] font-mono text-[#1E6091] shadow-sm flex items-center gap-1">
          <EyeOff className="w-2.5 h-2.5 text-[#2879AD]" />
          Data privacy
        </div>
      </div>

      {/* Protocol Telemetry Pill Matrix */}
      <div className="w-full space-y-2 mt-2">
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-tideglass-surface border border-[#D4DED3] flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A7D6E] shrink-0" />
            <span className="text-[#1E2D27]">Audited Endpoints</span>
          </div>
          <div className="p-2 rounded-lg bg-tideglass-surface border border-[#D4DED3] flex items-center space-x-2">
            <Key className="w-3.5 h-3.5 text-[#2879AD] shrink-0" />
            <span className="text-[#1E2D27]">Signed JWT Auth</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#EAF2FA]/88 border border-[#D4DED3] flex items-center justify-between text-[10px] font-mono text-[#516861]">
          <span>Identity gateway:</span>
          <span className="text-[#0A7D6E] font-semibold">Verified active</span>
        </div>
      </div>
    </div>
  );
};

export default AuthSecurityShield;
