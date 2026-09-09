import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardContent } from '../ui/Card';
import { Search, Check, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

/* Icon Button */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}) => {
  const sizes = {
    sm: 'w-7 h-7 p-1 text-xs',
    md: 'w-9 h-9 p-2 text-sm',
    lg: 'w-11 h-11 p-2.5 text-base',
  };

  return (
    <Button variant={variant} className={cn('rounded-lg p-0 flex items-center justify-center', sizes[size], className)} {...props}>
      {icon}
    </Button>
  );
};

/* Info Card */
export const InfoCard: React.FC<{ title: string; description: string; icon?: React.ReactNode; className?: string }> = ({
  title,
  description,
  icon,
  className,
}) => (
  <Card className={cn('bg-blue-50/50 border-blue-200/80', className)}>
    <CardContent className="p-4 flex gap-3 items-start">
      {icon || <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>
    </CardContent>
  </Card>
);

/* Divider */
export const Divider: React.FC<{ label?: string; className?: string }> = ({ label, className }) => (
  <div className={cn('relative my-4 flex items-center justify-center', className)}>
    <div className="w-full border-t border-slate-200" />
    {label && <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase">{label}</span>}
  </div>
);

/* Stepper */
export const Stepper: React.FC<{ steps: string[]; currentStep: number }> = ({ steps, currentStep }) => (
  <div className="flex items-center justify-between w-full">
    {steps.map((step, idx) => {
      const stepNum = idx + 1;
      const isCompleted = stepNum < currentStep;
      const isCurrent = stepNum === currentStep;

      return (
        <React.Fragment key={idx}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                isCurrent
                  ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                  : isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            <span className={cn('text-xs font-semibold hidden md:inline', isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400')}>
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={cn('flex-1 h-0.5 mx-3', isCompleted ? 'bg-emerald-500' : 'bg-slate-200')} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* Empty State */
export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
    <FileText className="w-12 h-12 text-slate-300 stroke-[1.5] mb-3" />
    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
    {action}
  </div>
);

/* Search Box */
export const SearchBox: React.FC<{ value: string; onChange: (val: string) => void; placeholder?: string }> = ({
  value,
  onChange,
  placeholder = 'Search...',
}) => (
  <div className="relative w-full">
    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
    />
  </div>
);
