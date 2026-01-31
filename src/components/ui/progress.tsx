'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className, value, max = 100, showValue = false, size = 'md', variant = 'default', ...props },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };

    const variantClasses = {
      default: 'bg-green-600',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-gray-200',
            sizeClasses[size]
          )}
        >
          <div
            className={cn('h-full transition-all duration-500 ease-out', variantClasses[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <div className="mt-1 flex justify-between text-xs text-gray-600">
            <span>{Math.round(percentage)}% Complete</span>
            <span>
              {value}/{max}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
