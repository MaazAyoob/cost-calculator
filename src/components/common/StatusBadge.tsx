import React from 'react';
import { cn } from '../../utils/cn';

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  status: StatusType;
  label: string;
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, dot = true, className }) => {
  const styles = {
    success: 'bg-[#E7F3E8] text-[#1B3D34] border-[#C5E3C8]',
    warning: 'bg-[rgba(242,140,40,0.12)] text-[#D9771A] border-[rgba(242,140,40,0.30)]',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80',
    neutral: 'bg-[#F8F8F6] text-[#707873] border-[#E5E7EB]',
  };

  const dotColors = {
    success: 'bg-[#1B3D34]',
    warning: 'bg-[#F28C28]',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    neutral: 'bg-[#9CA3AF]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        styles[status],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[status])} />}
      {label}
    </span>
  );
};
