import React from 'react';
import { cn } from '../../utils/cn';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
  badge,
  className,
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-[#18211E] font-heading tracking-tight">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[rgba(27,61,52,0.06)] text-[#1B3D34] rounded-md border border-[rgba(27,61,52,0.18)] font-mono">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-xs sm:text-sm text-[#707873] max-w-2xl leading-relaxed">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
