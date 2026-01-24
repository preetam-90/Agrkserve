'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CountdownFormat = 'mm:ss' | 'seconds';

export interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  format?: CountdownFormat;
  className?: string;
  showIcon?: boolean;
}

/**
 * CountdownTimer Component
 * Countdown display for rate limiting (429 errors)
 * 
 * Features:
 * - Real-time countdown display
 * - Callback on completion
 * - Accessible time announcement
 * - Automatic retry button enable
 * - Multiple format options (mm:ss or seconds)
 */
export function CountdownTimer({
  initialSeconds,
  onComplete,
  format = 'mm:ss',
  className,
  showIcon = true,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  const formatTime = useCallback((seconds: number): string => {
    if (format === 'seconds') {
      return `${seconds}`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [format]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onComplete]);

  const timeDisplay = formatTime(secondsLeft);
  const ariaLabel = format === 'seconds' 
    ? `${secondsLeft} seconds remaining`
    : `${Math.floor(secondsLeft / 60)} minutes and ${secondsLeft % 60} seconds remaining`;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700',
        className
      )}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={ariaLabel}
    >
      {showIcon && <Clock className="w-5 h-5" aria-hidden="true" />}
      <span className="font-mono text-lg font-semibold tabular-nums">
        {timeDisplay}
      </span>
      {format === 'seconds' && (
        <span className="text-sm">
          {secondsLeft === 1 ? 'second' : 'seconds'}
        </span>
      )}
    </div>
  );
}
