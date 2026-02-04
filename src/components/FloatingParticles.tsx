'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map(() => {
      const x = `${Math.random() * 100}%`;
      const y = `${Math.random() * 100}%`;
      const yAnim = [`${Math.random() * 100}%`, `${Math.random() * 100}%`];
      const duration = 4 + Math.random() * 4;
      const delay = Math.random() * 2;
      return { x, y, yAnim, duration, delay };
    });
  }, []);

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="pointer-events-none absolute"
          initial={{ x: p.x, y: p.y }}
          animate={{ y: p.yAnim, opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        >
          <div className="h-1 w-1 rounded-full bg-emerald-400/40" />
        </motion.div>
      ))}
    </>
  );
}
