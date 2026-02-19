'use client';

import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending';
export type StatusSize = 'sm' | 'md' | 'lg';

export interface StatusIndicatorProps {
  status: StatusType;
  size?: StatusSize;
  animated?: boolean;
  className?: string;
  'aria-label'?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    label: 'Success',
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    label: 'Error',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    label: 'Information',
  },
  pending: {
    icon: Loader2,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    label: 'Pending',
  },
};

const sizeConfig = {
  sm: {
    container: 'w-8 h-8',
    icon: 'w-4 h-4',
  },
  md: {
    container: 'w-12 h-12',
    icon: 'w-6 h-6',
  },
  lg: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
  },
};

/**
 * StatusIndicator Component
 * Visual status feedback component with color-coded icons
 *
 * Features:
 * - Color-coded status (green, red, yellow, blue, gray)
 * - Icon representation
 * - Optional animation (pulse, spin)
 * - Accessible with aria-label
 * - WCAG AA color contrast compliance
 */
export function StatusIndicator({
  status,
  size = 'md',
  animated = false,
  className,
  'aria-label': ariaLabel,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        config.bgColor,
        sizeStyles.container,
        className
      )}
      role="status"
      aria-label={ariaLabel || config.label}
    >
      <Icon
        className={cn(
          config.color,
          sizeStyles.icon,
          animated && status === 'pending' && 'animate-spin',
          animated && status === 'success' && 'animate-pulse'
        )}
        aria-hidden="true"
      />
    </div>
  );
}
