import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  iconColor?: string;
  variant?: 'teal' | 'blue' | 'emerald' | 'amber' | 'coral' | 'cyan';
}

const variantStyles = {
  teal: {
    topBorder: 'border-t-2 border-t-[#0A7D6E]',
    iconBox: 'bg-[#EAF5EF] border-[#BDE0D3] text-[#0A7D6E]',
  },
  blue: {
    topBorder: 'border-t-2 border-t-[#2563EB]',
    iconBox: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]',
  },
  emerald: {
    topBorder: 'border-t-2 border-t-[#059669]',
    iconBox: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]',
  },
  amber: {
    topBorder: 'border-t-2 border-t-[#D97706]',
    iconBox: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]',
  },
  coral: {
    topBorder: 'border-t-2 border-t-[#DC2626]',
    iconBox: 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]',
  },
  cyan: {
    topBorder: 'border-t-2 border-t-[#0284C7]',
    iconBox: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7]',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  iconColor,
  variant = 'teal',
}) => {
  const currentVariant = variantStyles[variant] || variantStyles.teal;

  return (
    <div
      className={cn(
        'card p-5 bg-tideglass-surface border border-[#D4DED3] shadow-[0_4px_16px_rgba(30,45,39,0.06)] transition-all hover:shadow-[0_6px_20px_rgba(30,45,39,0.09)]',
        currentVariant.topBorder
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="caption text-[#516861] font-mono text-[11px] font-medium tracking-wide uppercase">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1E2D27] font-headline mt-1 tabular-nums">
            {value}
          </h3>
          {trend && (
            <p
              className={cn(
                'text-xs mt-1.5 font-medium font-mono tabular-nums flex items-center gap-1',
                trendUp ? 'text-[#059669]' : 'text-[#DC2626]'
              )}
            >
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            'p-2.5 rounded-xl border shadow-xs transition-colors',
            iconColor || currentVariant.iconBox
          )}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};