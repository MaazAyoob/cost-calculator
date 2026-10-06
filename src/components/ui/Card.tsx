import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'flat' | 'ghost' | 'accent';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-[#E5E7EB] shadow-xs rounded-2xl',
      interactive:
        'bg-white border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#1B3D34]/30 transition-all duration-200 cursor-pointer rounded-2xl',
      flat: 'bg-[#F8F8F6] border border-[#E5E7EB] rounded-2xl',
      ghost: 'bg-transparent border border-transparent rounded-2xl',
      accent: 'bg-white border-2 border-[#1B3D34] shadow-sm rounded-2xl',
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
  <div className={cn('flex flex-col space-y-1.5 p-5 sm:p-6 border-b border-[#E5E7EB]/70', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-bold text-[#1B3D34] font-heading tracking-tight text-base sm:text-lg', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-xs sm:text-sm text-[#4B5563] font-normal leading-relaxed', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 sm:p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center p-5 sm:p-6 pt-0 border-t border-[#E5E7EB]/70 mt-2', className)} {...props}>
    {children}
  </div>
);
