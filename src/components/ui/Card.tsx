import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'flat' | 'ghost' | 'accent';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-[#E3E8E2] shadow-xs rounded-[14px]',
      interactive:
        'bg-white border border-[#E3E8E2] shadow-xs hover:shadow-sm hover:border-[#1B3D34]/35 active:scale-[0.985] transition-all duration-150 ease-out cursor-pointer rounded-[14px] select-none',
      flat: 'bg-[#F8F8F6] border border-[#E3E8E2] rounded-[14px]',
      ghost: 'bg-transparent border border-transparent rounded-[14px]',
      accent: 'bg-white border-2 border-[#1B3D34] shadow-xs rounded-[14px]',
    };

    return (
      <div ref={ref} className={cn(variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 p-5 sm:p-6 border-b border-[#E3E8E2]', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-bold text-[#172722] font-heading tracking-tight text-base sm:text-lg', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-xs sm:text-sm text-[#687770] font-normal leading-relaxed', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 sm:p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center p-5 sm:p-6 pt-0 border-t border-[#E3E8E2] mt-2', className)} {...props}>
    {children}
  </div>
);
