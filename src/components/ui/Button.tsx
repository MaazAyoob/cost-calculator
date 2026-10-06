import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] rounded-xl cursor-pointer select-none';

    const variants = {
      primary: 'bg-[#1B3D34] text-white hover:bg-[#132C25] shadow-xs hover:shadow-sm',
      accent: 'bg-[#F28C28] text-white hover:bg-[#D9771A] shadow-xs hover:shadow-sm font-semibold',
      secondary: 'bg-[rgba(27,61,52,0.06)] text-[#1B3D34] hover:bg-[rgba(27,61,52,0.10)] border border-[rgba(27,61,52,0.12)]',
      outline: 'border border-[#E5E7EB] bg-white text-[#1B3D34] hover:bg-[#F8F8F6] hover:border-[#D1D5DB] shadow-2xs',
      ghost: 'bg-transparent text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.05)]',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
