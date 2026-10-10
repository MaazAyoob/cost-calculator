import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'accent' | 'neutral' | 'success' | 'warning' | 'outline' | 'mint' | 'lavender';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'brand',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-bold rounded-[6px] select-none transition-colors';

  const variants = {
    brand: 'bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[rgba(27,61,52,0.18)]',
    accent: 'bg-[rgba(242,140,40,0.12)] text-[#D9771A] border border-[rgba(242,140,40,0.30)]',
    neutral: 'bg-[#F8F8F6] text-[#687770] border border-[#E3E8E2]',
    success: 'bg-[#E7F3E8] text-[#1B3D34] border border-[#C5E3C8]',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200',
    outline: 'bg-transparent text-[#172722] border border-[#E3E8E2]',
    mint: 'bg-[#DDF4E7] text-[#1B3D34] border border-[#BCE8CD]',
    lavender: 'bg-[#EEE8FF] text-[#553C9A] border border-[#D8C7FF]',
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
