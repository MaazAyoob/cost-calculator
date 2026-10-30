import React from 'react';
import { cn } from '../../utils/cn';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide' | 'full';
}

/**
 * PageContainer — Canonical container width and horizontal padding.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  className,
  size = 'default',
  children,
  ...props
}) => {
  const sizeClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1440px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn('w-full mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'white' | 'forest' | 'grid' | 'muted';
  spacing?: 'sm' | 'md' | 'lg' | 'none';
}

/**
 * Section — Architectural editorial section with consistent vertical rhythm.
 */
export const Section: React.FC<SectionProps> = ({
  className,
  variant = 'default',
  spacing = 'lg',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-[#F8F8F6] text-[#18211E]',
    white: 'bg-white text-[#18211E] border-y border-[#E5E7EB]',
    forest: 'bg-[#1B3D34] text-white',
    grid: 'bg-[#F8F8F6] text-[#18211E] arch-grid-fine',
    muted: 'bg-[#F2F2EE] text-[#18211E]',
  };

  const spacingClasses = {
    none: 'py-0',
    sm: 'py-10 sm:py-14',
    md: 'py-14 sm:py-20',
    lg: 'py-16 sm:py-24 lg:py-28',
  };

  return (
    <section
      className={cn('w-full relative overflow-hidden', variantClasses[variant], spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </section>
  );
};

export interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  theme?: 'dark' | 'light';
  className?: string;
}

/**
 * SectionHeading — Clean, architectural section title block.
 */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  kicker,
  title,
  subtitle,
  align = 'left',
  action,
  theme = 'light',
  className,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        'mb-10 sm:mb-14',
        align === 'center' ? 'text-center max-w-3xl mx-auto' : 'flex flex-col md:flex-row md:items-end justify-between gap-6',
        className
      )}
    >
      <div className={align === 'center' ? '' : 'max-w-2xl'}>
        {kicker && (
          <div className="inline-flex items-center gap-1.5 mb-2.5">
            <span
              className={cn(
                'text-[11px] font-bold tracking-widest uppercase font-mono px-2 py-0.5 rounded-sm',
                isDark
                  ? 'bg-white/10 text-[#F28C28]'
                  : 'bg-[rgba(27,61,52,0.06)] text-[#1B3D34]'
              )}
            >
              {kicker}
            </span>
          </div>
        )}
        <h2
          className={cn(
            'text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading leading-tight',
            isDark ? 'text-white' : 'text-[#18211E]'
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              'mt-2.5 text-sm sm:text-base leading-relaxed',
              isDark ? 'text-white/70' : 'text-[#707873]'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

