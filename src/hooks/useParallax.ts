'use client';

import { useScroll, useTransform, MotionValue } from 'framer-motion';

export function useParallax(speed: number = 0.5): MotionValue<number> {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed]);
  return y;
}
