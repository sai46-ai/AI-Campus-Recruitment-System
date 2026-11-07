import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  asChild,
  type = 'button',
  ...props
}) => {
  const baseStyles = cn(
    'inline-flex items-center justify-center font-semibold rounded-xl',
    'transition-all duration-150 ease',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A7D6E] focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.98]'
  );

  const variants = {
    primary: 'bg-[#0A7D6E] text-white font-semibold hover:bg-[#0E9584] active:bg-[#086357] shadow-xs hover:shadow-sm',
    secondary: 'bg-[#F0F6F3]/95 text-[#1E2D27] border border-[#D4DED3] hover:bg-[#EAF2ED] hover:border-[#0A7D6E]/50 active:bg-[#DCEAE4]',
    outline: 'border border-[#D4DED3] bg-tideglass-surface text-[#1E2D27] hover:bg-[#F0F6F3] hover:text-[#0A7D6E] hover:border-[#0A7D6E]/50',
    ghost: 'text-[#516861] hover:text-[#1E2D27] hover:bg-[#F0F6F3]/85',
    danger: 'bg-[#B91C1C] text-white hover:bg-[#991B1B] active:bg-[#7F1D1D] shadow-xs',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
  };

  const content = (
    <>
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </>
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(baseStyles, variants[variant], sizes[size], className, (children as React.ReactElement<any>).props?.className),
      disabled: disabled || isLoading,
      ...props,
    });
  }

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
};
