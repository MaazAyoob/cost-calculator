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
      'inline-flex items-center justify-center font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D34] focus-visible:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.985] rounded-lg cursor-pointer select-none touch-manipulation';

    const variants = {
      primary: 'bg-[#1B3D34] text-white hover:bg-[#142F28] active:bg-[#112821] border border-[#1B3D34] shadow-xs hover:shadow-sm',
      accent: 'bg-[#F28C28] text-white hover:bg-[#D9771A] active:bg-[#C26715] border border-[#F28C28] shadow-xs hover:shadow-sm font-bold',
      secondary: 'bg-[rgba(27,61,52,0.06)] text-[#172722] hover:bg-[rgba(27,61,52,0.12)] active:bg-[rgba(27,61,52,0.18)] border border-[rgba(27,61,52,0.15)]',
      outline: 'border border-[#E3E8E2] bg-white text-[#172722] hover:bg-[#F8F8F6] hover:border-[#CBD5CB] active:bg-[#EDF3ED] shadow-2xs',
      ghost: 'bg-transparent text-[#687770] hover:text-[#172722] hover:bg-[rgba(27,61,52,0.05)] active:bg-[rgba(27,61,52,0.1)]',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
      md: 'h-10 px-4 text-sm gap-2 rounded-lg',
      lg: 'h-11 px-5 text-sm sm:text-base gap-2.5 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], isLoading && 'cursor-wait', className)}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && (
          <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
