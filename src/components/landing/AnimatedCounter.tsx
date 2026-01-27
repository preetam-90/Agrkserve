'use client';

import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
  label = '',
  className = '',
}: AnimatedCounterProps) {
  const { count, ref } = useCountUp(end, duration);
  
  const formattedCount = decimals > 0
    ? count.toFixed(decimals)
    : count.toLocaleString();
  
  return (
    <div ref={ref} role="status" aria-live="polite">
      <span className="sr-only">
        {`${prefix}${end.toLocaleString()}${suffix} ${label}`}
      </span>
      <span aria-hidden="true" className={className || 'text-4xl md:text-5xl font-bold'}>
        {prefix}{formattedCount}{suffix}
      </span>
    </div>
  );
}
