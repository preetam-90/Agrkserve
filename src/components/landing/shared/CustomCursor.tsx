'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

function subscribeFinePointer(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const media = window.matchMedia('(pointer: fine)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getFinePointerSnapshot() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(pointer: fine)').matches;
}

function getFinePointerServerSnapshot() {
  // Keep server and initial hydration snapshot stable to prevent mismatch.
  return false;
}

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 40, mass: 0.25 });
  const sy = useSpring(y, { stiffness: 520, damping: 40, mass: 0.25 });

  const enabled = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot
  );
  const [visible, setVisible] = useState(false);
  const [isActiveTarget, setIsActiveTarget] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const onMouseMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = event.target as HTMLElement | null;
      setIsActiveTarget(
        Boolean(target?.closest('[data-magnetic], button, a, [role="button"], .cursor-pointer'))
      );
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseDown = () => setIsPressing(true);
    const onMouseUp = () => setIsPressing(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [enabled, x, y]);

  const cursorState = useMemo(() => {
    if (isPressing) return { scale: 0.8, glow: 0.75, ring: 0.18 };
    if (isActiveTarget) return { scale: 1.45, glow: 0.95, ring: 0.36 };
    return { scale: 1, glow: 0.52, ring: 0.22 };
  }, [isActiveTarget, isPressing]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <svg className="pointer-events-none fixed h-0 w-0" aria-hidden>
        <defs>
          <filter id="cursor-blob" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="2"
              result="noise"
              seed="17"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <motion.div
        aria-hidden
        style={{ left: sx, top: sy }}
        className="pointer-events-none fixed z-[140] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/70 bg-gradient-to-br from-cyan-200/35 to-emerald-200/40 mix-blend-screen md:block"
        animate={{
          opacity: visible ? 1 : 0,
          scale: cursorState.scale,
        }}
        transition={{ duration: 0.18 }}
      />

      <motion.div
        aria-hidden
        style={{ left: sx, top: sy, filter: 'url(#cursor-blob)' }}
        className="pointer-events-none fixed z-[139] hidden h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.35),rgba(6,182,212,0.06)_58%,transparent_75%)] blur-2xl md:block"
        animate={{
          opacity: visible ? cursorState.glow : 0,
          scale: cursorState.scale * 0.95,
          rotate: isActiveTarget ? 18 : 0,
        }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        aria-hidden
        style={{ left: sx, top: sy }}
        className="pointer-events-none fixed z-[138] hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/30 md:block"
        animate={{
          opacity: visible ? cursorState.ring : 0,
          scale: cursorState.scale * 1.5,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
