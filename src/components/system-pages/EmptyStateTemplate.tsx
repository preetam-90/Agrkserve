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
        'flex flex-col items-center justify-center px-4 py-8 text-center md:py-12',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Illustration */}
      <div className="mb-6 h-48 w-48 md:h-56 md:w-56">{illustration}</div>

      {/* Title */}
      <h2 className="mb-3 max-w-xl text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl">
        {title}
      </h2>

      {/* Description */}
      <p className="mb-6 max-w-lg text-base text-gray-600 md:text-lg">{description}</p>

      {/* Tip (optional) */}
      {tip && (
        <div className="mb-6 max-w-md rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <p className="whitespace-pre-line">{tip}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handlePrimaryAction}
          size="lg"
          className="min-h-[44px] min-w-[140px] bg-green-600 text-white hover:bg-green-700"
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
