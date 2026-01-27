'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export type EmptyStateVariant = 'default' | 'search' | 'bookings' | 'notifications';

export interface EmptyStateTemplateProps {
  illustration: ReactNode;
  title: string;
  description: string;
  primaryAction: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  variant?: EmptyStateVariant;
  className?: string;
  tip?: string;
}

/**
 * EmptyStateTemplate Component
 * Reusable template for empty state displays
 * 
 * Features:
 * - Positive, encouraging messaging
 * - Never resembles error state
 * - Clear next action guidance
 * - Contextual illustrations
 * - Multiple variants for different contexts
 */
export function EmptyStateTemplate({
  illustration,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'default',
  className,
  tip,
}: EmptyStateTemplateProps) {
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (primaryAction.onClick) {
      primaryAction.onClick();
    } else if (primaryAction.href) {
      router.push(primaryAction.href);
    }
  };

  const handleSecondaryAction = () => {
    if (secondaryAction?.onClick) {
      secondaryAction.onClick();
    } else if (secondaryAction?.href) {
      router.push(secondaryAction.href);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4 py-8 md:py-12',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Illustration */}
      <div className="w-48 h-48 md:w-56 md:h-56 mb-6">
        {illustration}
      </div>

      {/* Title */}
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 max-w-xl">
        {title}
      </h2>

      {/* Description */}
      <p className="text-base md:text-lg text-gray-600 mb-6 max-w-lg">
        {description}
      </p>

      {/* Tip (optional) */}
      {tip && (
        <div className="mb-6 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg text-sm max-w-md">
          <p className="whitespace-pre-line">{tip}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handlePrimaryAction}
          size="lg"
          className="min-h-[44px] min-w-[140px] bg-green-600 hover:bg-green-700 text-white"
        >
          {primaryAction.label}
        </Button>

        {secondaryAction && (
          <Button
            onClick={handleSecondaryAction}
            variant="outline"
            size="lg"
            className="min-h-[44px] min-w-[140px]"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
