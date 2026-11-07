import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'teal'
    | 'emerald'
    | 'blue'
    | 'cyan'
    | 'amber'
    | 'coral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseStyles = cn(
    'inline-flex items-center font-medium rounded-md border',
    'transition-colors duration-150'
  );

  const variants = {
    default: 'bg-[#F0F6F3]/90 text-[#1E2D27] border-[#D4DED3]',
    success: 'bg-[#ECFDF5]/90 text-[#065F46] border-[#A7F3D0]',
    warning: 'bg-[#FFFBEB]/90 text-[#92400E] border-[#FDE68A]',
    danger: 'bg-[#FEF2F2]/90 text-[#991B1B] border-[#FECACA]',
    info: 'bg-[#F0F9FF]/90 text-[#075985] border-[#BAE6FD]',
    teal: 'bg-[#EAF5EF]/90 text-[#0A7D6E] border-[#BDE0D3]',
    emerald: 'bg-[#ECFDF5]/90 text-[#065F46] border-[#A7F3D0]',
    blue: 'bg-[#EFF6FF]/90 text-[#1E40AF] border-[#BFDBFE]',
    cyan: 'bg-[#F0F9FF]/90 text-[#075985] border-[#BAE6FD]',
    amber: 'bg-[#FFFBEB]/90 text-[#92400E] border-[#FDE68A]',
    coral: 'bg-[#FEF2F2]/90 text-[#991B1B] border-[#FECACA]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] leading-tight',
    md: 'px-2.5 py-1 text-xs leading-tight',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
