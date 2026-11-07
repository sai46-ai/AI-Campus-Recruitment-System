import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive';
  asChild?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  asChild,
  ...props
}) => {
  const baseStyles = cn(
    'bg-tideglass-surface border border-[#D4DED3] rounded-2xl shadow-[0_8px_28px_rgba(52,73,66,0.08)] backdrop-blur-md text-[#344942]',
    'transition-all duration-200 ease',
    variant === 'default' && 'hover:border-[#0A7D6E]/40 hover:shadow-[0_12px_32px_rgba(52,73,66,0.12)]',
    variant === 'interactive' && 'cursor-pointer hover:border-[#0A7D6E]/55 hover:shadow-[0_12px_32px_rgba(52,73,66,0.14)]'
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(baseStyles, className, (children as React.ReactElement<any>).props?.className),
      ...props,
    });
  }

  return (
    <div className={cn(baseStyles, className)} {...props}>
      {children}
    </div>
  );
};
