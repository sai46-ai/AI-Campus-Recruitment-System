import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, helperText, type = 'text', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = inputId && error ? `${inputId}-error` : undefined;
    const helperId = inputId && helperText && !error ? `${inputId}-helper` : undefined;
    const describedBy = errorId || helperId || props['aria-describedby'];

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#516861] pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            className={cn(
              'w-full py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D4DED3] text-[#344942] placeholder-[#728881]',
              'focus:outline-none focus:ring-2 focus:ring-[#0A7D6E]/25 focus:border-[#0A7D6E]',
              'transition-colors duration-150',
              icon ? 'pl-11 pr-4' : 'px-4',
              error && 'input-error',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-[#B91C1C] font-semibold" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-[#516861]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
