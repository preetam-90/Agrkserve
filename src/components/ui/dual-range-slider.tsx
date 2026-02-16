'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const colorSchemes = {
  emerald: {
    range: 'bg-emerald-500',
    thumb:
      'border-emerald-500 bg-emerald-400 shadow-emerald-500/30 hover:bg-emerald-300 focus-visible:ring-emerald-500',
  },
  cyan: {
    range: 'bg-cyan-500',
    thumb:
      'border-cyan-500 bg-cyan-400 shadow-cyan-500/30 hover:bg-cyan-300 focus-visible:ring-cyan-500',
  },
  slate: {
    range: 'bg-slate-500',
    thumb:
      'border-slate-500 bg-slate-400 shadow-slate-500/30 hover:bg-slate-300 focus-visible:ring-slate-500',
  },
} as const;

type ColorScheme = keyof typeof colorSchemes;

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  className?: string;
  colorScheme?: ColorScheme;
}

const DualRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualRangeSliderProps
>(
  (
    { className, min, max, step = 1, value, onValueChange, colorScheme = 'slate', ...props },
    ref
  ) => {
    const colors = colorSchemes[colorScheme];
    const thumbClass = cn(
      'block h-4 w-4 rounded-full border-2 shadow-lg transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50',
      colors.thumb
    );

    return (
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(newValue) => onValueChange(newValue as [number, number])}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-700">
          <SliderPrimitive.Range className={cn('absolute h-full', colors.range)} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className={thumbClass} />
        <SliderPrimitive.Thumb className={thumbClass} />
      </SliderPrimitive.Root>
    );
  }
);
DualRangeSlider.displayName = 'DualRangeSlider';

export { DualRangeSlider };
export type { DualRangeSliderProps, ColorScheme };
