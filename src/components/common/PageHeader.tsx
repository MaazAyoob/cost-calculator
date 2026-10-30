import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div className={cn('pb-6 mb-6 border-b border-[#E5E7EB]', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-xs text-[#707873] mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[#CBD5CB]">/</span>}
              {crumb.href && idx < breadcrumbs.length - 1 ? (
                <Link
                  to={crumb.href}
                  className="hover:text-[#1B3D34] hover:underline cursor-pointer transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={cn(idx === breadcrumbs.length - 1 ? 'font-medium text-[#18211E]' : 'hover:text-[#18211E] cursor-pointer')}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18211E] font-heading tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-[#707873] mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};
