import React from 'react';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[rgba(27,61,52,0.06)] text-[#1B3D34] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-[#1B3D34] font-heading mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-[#4B5563] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
