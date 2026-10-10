import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  unit?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, unit, leftIcon, disabled, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-bold text-[#172722] tracking-tight"
            >
              {label}
            </label>
            {unit && !props.value && (
              <span className="text-[11px] font-medium text-[#687770]">{unit}</span>
            )}
          </div>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#687770] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={cn(
              'w-full bg-white border text-sm text-[#172722] placeholder:text-gray-400 rounded-lg px-3.5 py-2.5 transition-colors duration-150 ease-out outline-none min-h-[40px]',
              'border-[#E3E8E2] hover:border-[#CBD5CB] focus:border-[#1B3D34] focus:ring-2 focus:ring-[#1B3D34]/15',
              leftIcon && 'pl-10',
              unit && 'pr-14',
              error && 'border-red-400 focus:border-red-600 focus:ring-red-500/15',
              disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200',
              className
            )}
            {...props}
          />

          {unit && (
            <div className="absolute right-3 text-xs font-semibold text-[#687770] pointer-events-none select-none">
              {unit}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-medium text-red-600 leading-tight">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#687770] leading-tight">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
