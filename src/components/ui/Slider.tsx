import React from 'react';
import { cn } from '../../utils/cn';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  unit?: string;
  showValues?: boolean;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      min,
      max,
      step = 1,
      value,
      onChange,
      disabled = false,
      label,
      unit,
      showValues = false,
      id,
      ...props
    },
    ref
  ) => {
    const sliderId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    // Calculate progress percentage for active track fill
    const range = max - min;
    const percentage = range > 0 ? Math.min(100, Math.max(0, ((value - min) / range) * 100)) : 0;

    return (
      <div className="w-full space-y-1.5 text-left">
        {(label || showValues) && (
          <div className="flex items-center justify-between text-xs font-semibold text-[#172722]">
            {label && <label htmlFor={sliderId}>{label}</label>}
            {showValues && (
              <span className="font-mono text-xs text-[#1B3D34] font-bold">
                {value.toLocaleString()} {unit || ''}
              </span>
            )}
          </div>
        )}

        <div className="relative flex items-center py-1">
          <input
            ref={ref}
            id={sliderId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={onChange}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-label={label || props['aria-label'] || 'Range slider'}
            style={{
              '--range-progress': `${percentage}%`,
            } as React.CSSProperties}
            className={cn('hutty-slider w-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed', className)}
            {...props}
          />
        </div>

        {showValues && (
          <div className="flex justify-between text-[10px] font-mono text-[#687770]">
            <span>
              {min.toLocaleString()} {unit || ''}
            </span>
            <span>
              {max.toLocaleString()} {unit || ''}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';
