import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[#183B32]/[0.06]', className)}
      {...props}
    />
  );
};

export const Loader: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => {
  return (
    <div className={cn('flex items-center justify-center p-4 text-[#183B32]', className)}>
      <Loader2 size={size} className="animate-spin text-[#245747]" />
    </div>
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-soft-xs space-y-4', className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-1/3 rounded-lg" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-10 w-2/3 rounded-xl" />
    <div className="space-y-2 pt-2">
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-4/5 rounded" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; className?: string }> = ({ rows = 4, className }) => (
  <div className={cn('w-full bg-white rounded-2xl border border-[#E5E7EB] p-4 space-y-3', className)}>
    <div className="flex gap-4 pb-3 border-b border-[#E5E7EB]/80">
      <Skeleton className="h-4 w-1/4 rounded" />
      <Skeleton className="h-4 w-1/4 rounded" />
      <Skeleton className="h-4 w-1/4 rounded" />
      <Skeleton className="h-4 w-1/4 rounded" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-2 items-center">
        <Skeleton className="h-3.5 w-1/4 rounded" />
        <Skeleton className="h-3.5 w-1/4 rounded" />
        <Skeleton className="h-3.5 w-1/4 rounded" />
        <Skeleton className="h-3.5 w-1/4 rounded" />
      </div>
    ))}
  </div>
);
