'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AmbientBackdropProps {
  reducedMotion?: boolean;
}

const particles = Array.from({ length: 18 }).map((_, index) => ({
  id: index,
  left: `${(index * 17) % 100}%`,
  top: `${(index * 23) % 100}%`,
  duration: 14 + (index % 7) * 3,
  delay: (index % 5) * 0.6,
  size: 6 + (index % 5) * 4,
}));

export function AmbientBackdrop({ reducedMotion = false }: AmbientBackdropProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile viewport - critical for performance
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, render minimal static background - skip all animations
  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {/* Static gradient - no particles, no animations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(6,182,212,0.1),transparent_36%),linear-gradient(180deg,#030705_0%,#010201_48%,#000000_100%)]" />

        {/* Minimal grid */}
        <div className="absolute inset-0 opacity-20 [background-size:60px_60px] [background:linear-gradient(rgba(20,46,34,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(20,46,34,0.2)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
      </div>
    );
  }

  // Desktop - full effects
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(34,197,94,0.15),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(6,182,212,0.14),transparent_36%),radial-gradient(circle_at_50%_78%,rgba(120,53,15,0.16),transparent_48%),linear-gradient(180deg,#030705_0%,#010201_48%,#000000_100%)]" />

      <div className="absolute inset-0 opacity-35 [background-size:84px_84px] [background:linear-gradient(rgba(20,46,34,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(20,46,34,0.42)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />

      {!reducedMotion && (
        <>
          <motion.div
            className="absolute left-[-12%] top-[8%] h-[40vh] w-[40vh] rounded-full bg-emerald-400/10 blur-[140px]"
            animate={{ x: [0, 60, -40, 0], y: [0, -30, 22, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute right-[-8%] top-[26%] h-[46vh] w-[46vh] rounded-full bg-cyan-300/10 blur-[160px]"
            animate={{ x: [0, -75, 26, 0], y: [0, 26, -28, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute bottom-[-16%] left-[26%] h-[42vh] w-[42vh] rounded-full bg-amber-700/15 blur-[150px]"
            animate={{ x: [0, 20, -30, 0], y: [0, -20, 15, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          />

          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute rounded-full bg-emerald-200/40 shadow-[0_0_18px_rgba(110,231,183,0.4)]"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
              }}
              animate={{
                y: [0, -24, 0],
                x: [0, 12, -8, 0],
                opacity: [0.1, 0.5, 0.18],
                scale: [0.8, 1.2, 0.9],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,197,94,0.02)_0%,transparent_25%,rgba(6,182,212,0.03)_55%,transparent_78%)]" />
      <div className="absolute inset-0 opacity-20 mix-blend-soft-light [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0.5px,transparent_1px)] [background-size:3px_3px]" />
    </div>
  );
}
