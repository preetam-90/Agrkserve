'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const startTime = useRef<number>(0);
  const animationFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = end * easeOutQuart;
      setCount(currentValue);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [end, duration]);

  const formattedCount =
    decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString('en-IN');

  return (
    <div ref={ref} role="status" aria-live="polite">
      <span className="sr-only">{`${prefix}${end.toLocaleString('en-IN')}${suffix} ${label}`}</span>
      <span aria-hidden="true" className={className || 'text-4xl font-bold md:text-5xl'}>
        {prefix}
        {formattedCount}
        {suffix}
      </span>
    </div>
  );
}
