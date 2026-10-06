import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'accent' | 'neutral' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'brand',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-md select-none transition-colors';

  const variants = {
    brand: 'bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[rgba(27,61,52,0.15)]',
    accent: 'bg-[rgba(242,140,40,0.12)] text-[#D9771A] border border-[rgba(242,140,40,0.25)]',
    neutral: 'bg-gray-100 text-[#4B5563] border border-gray-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    outline: 'bg-transparent text-[#1B3D34] border border-[#E5E7EB]',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 leading-none',
    md: 'text-xs px-2.5 py-1 leading-normal',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
