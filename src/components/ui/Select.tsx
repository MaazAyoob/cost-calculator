import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, children, disabled, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[#1B3D34] tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'w-full bg-white border text-sm text-[#1B3D34] rounded-xl px-3.5 py-2.5 pr-10 transition-all outline-none appearance-none cursor-pointer',
              'border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#1B3D34] focus:ring-2 focus:ring-[#1B3D34]/15',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 text-[#4B5563] pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-[11px] font-medium text-red-600 leading-tight">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#4B5563] leading-tight">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
