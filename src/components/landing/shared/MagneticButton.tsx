'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  href?: string;
  children: ReactNode;
  className?: string;
  strength?: number;
  magnetic?: 'auto' | 'on' | 'off';
}

function ButtonInner({ href, children, className }: Pick<MagneticButtonProps, 'href' | 'children' | 'className'>) {
  if (href) {
    return (
      <Link
        href={href}
        className={`group relative flex items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-xl transition duration-300 hover:border-emerald-200/45 hover:text-emerald-50 ${className ?? ''}`}
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.32),transparent_46%),linear-gradient(120deg,rgba(16,185,129,0.25),rgba(6,182,212,0.18))] opacity-80 transition group-hover:opacity-100" />
        <span className="relative z-10">{children}</span>
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
}

function MagneticContainer({
  href,
  children,
  className,
  strength,
}: Required<Pick<MagneticButtonProps, 'strength'>> & Pick<MagneticButtonProps, 'href' | 'children' | 'className'>) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 22, mass: 0.3 });
  const y = useSpring(my, { stiffness: 220, damping: 22, mass: 0.3 });

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaX = event.clientX - (rect.left + rect.width / 2);
    const deltaY = event.clientY - (rect.top + rect.height / 2);
    mx.set(deltaX * strength);
    my.set(deltaY * strength);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      className="inline-block"
      data-magnetic
    >
      <ButtonInner href={href} className={className}>
        {children}
      </ButtonInner>
    </motion.div>
  );
}

export function MagneticButton({
  href,
  children,
  className = '',
  strength = 0.24,
  magnetic = 'auto',
}: MagneticButtonProps) {
  const canUseMagnetic = useMemo(() => {
    if (magnetic === 'on') {
      return true;
    }

    if (magnetic === 'off' || typeof window === 'undefined') {
      return false;
    }

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const hoverCapable = window.matchMedia('(hover: hover)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowCpu =
      typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
    const lowMemory =
      'deviceMemory' in navigator &&
      typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === 'number' &&
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;

    return finePointer && hoverCapable && !reducedMotion && !lowCpu && !lowMemory;
  }, [magnetic]);

  if (!canUseMagnetic) {
    return (
      <div className="inline-block">
        <ButtonInner href={href} className={className}>
          {children}
        </ButtonInner>
      </div>
    );
  }

  return (
    <MagneticContainer href={href} className={className} strength={strength}>
      {children}
    </MagneticContainer>
  );
}
