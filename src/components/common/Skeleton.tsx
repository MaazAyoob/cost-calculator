import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[#1B3D34]/[0.06]', className)}
      {...props}
    />
  );
};

export const Loader: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => {
  return (
    <div className={cn('flex items-center justify-center p-4 text-[#1B3D34]', className)}>
      <Loader2 size={size} className="animate-spin" />
    </div>
  );
};
