'use client';

import { motion } from 'framer-motion';
import { Wheat, Leaf } from 'lucide-react';

// Pre-generated random values for consistent rendering
const GRAIN_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${3 + i * 4.8 + (i % 3) * 2}%`,
  top: `${5 + i * 4.5 + (i % 5) * 3}%`,
  duration: 4 + (i % 3),
  delay: i * 0.1,
}));

const GRASS_ELEMENTS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + i * 12}%`,
  duration: 3 + (i % 2),
  delay: i * 0.15,
}));

/**
 * AuthBackground - Reusable animated agricultural background for auth pages
 * Eliminates ~80+ lines of duplicated code per auth page
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Field Lines Pattern - Animated */}
      <svg
        className="absolute inset-0 h-full w-full opacity-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="fieldLines"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="20" x2="40" y2="20" stroke="#d97706" strokeWidth="0.5" />
          </pattern>
          <pattern
            id="soilTexture"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1" fill="#78350f" opacity="0.3" />
            <circle cx="50" cy="30" r="0.8" fill="#78350f" opacity="0.2" />
            <circle cx="80" cy="50" r="1.2" fill="#78350f" opacity="0.25" />
            <circle cx="30" cy="70" r="0.7" fill="#78350f" opacity="0.3" />
            <circle cx="70" cy="85" r="1" fill="#78350f" opacity="0.2" />
          </pattern>
        </defs>
        <motion.rect
          width="100%"
          height="100%"
          fill="url(#fieldLines)"
          initial={{ x: 0 }}
          animate={{ x: -40 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <rect width="100%" height="100%" fill="url(#soilTexture)" />
      </svg>

      {/* Animated Grain Particles */}
      {GRAIN_PARTICLES.map((particle) => (
        <motion.div
          key={`grain-${particle.id}`}
          className="absolute h-1 w-1 rounded-full bg-amber-500/20"
          style={{
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Animated Wheat Stalks */}
      <motion.svg
        className="text-amber-500/8 absolute bottom-0 left-10 h-48 w-24"
        viewBox="0 0 96 192"
        initial={{ rotate: 0 }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M48 192 Q46 140 48 96 Q50 50 48 0"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <ellipse cx="48" cy="10" rx="4" ry="2" fill="currentColor" />
        <ellipse cx="44" cy="20" rx="3" ry="1.5" fill="currentColor" transform="rotate(-15, 44, 20)" />
        <ellipse cx="52" cy="20" rx="3" ry="1.5" fill="currentColor" transform="rotate(15, 52, 20)" />
      </motion.svg>

      <motion.svg
        className="text-amber-500/8 absolute bottom-0 right-20 h-64 w-32"
        viewBox="0 0 128 256"
        initial={{ rotate: 0 }}
        animate={{ rotate: [3, -3, 3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M64 256 Q60 190 64 128 Q68 65 64 0"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <ellipse cx="64" cy="12" rx="5" ry="2.5" fill="currentColor" />
        <ellipse cx="58" cy="25" rx="4" ry="2" fill="currentColor" transform="rotate(-12, 58, 25)" />
        <ellipse cx="70" cy="25" rx="4" ry="2" fill="currentColor" transform="rotate(12, 70, 25)" />
        <ellipse cx="56" cy="40" rx="3" ry="1.5" fill="currentColor" transform="rotate(-18, 56, 40)" />
        <ellipse cx="72" cy="40" rx="3" ry="1.5" fill="currentColor" transform="rotate(18, 72, 40)" />
      </motion.svg>

      {/* Animated Grass/Leaves */}
      {GRASS_ELEMENTS.map((grass) => (
        <motion.div
          key={`grass-${grass.id}`}
          className="absolute bottom-0 h-16 w-1 origin-bottom bg-gradient-to-t from-emerald-600/10 to-transparent"
          style={{
            left: grass.left,
          }}
          animate={{
            rotate: [-5, 5, -5],
            scaleY: [1, 1.2, 1],
          }}
          transition={{
            duration: grass.duration,
            repeat: Infinity,
            delay: grass.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating Wheat Elements */}
      <motion.div
        className="absolute left-10 top-20 text-amber-500/10"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Wheat className="h-32 w-32" />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-amber-500/10"
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Wheat className="h-40 w-40" />
      </motion.div>
      <motion.div
        className="absolute right-1/4 top-1/2 text-emerald-500/10"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="h-24 w-24" />
      </motion.div>

      {/* Gradient Orbs */}
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-gradient-to-bl from-amber-600/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-600/10 to-transparent blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-500/5 via-emerald-500/5 to-amber-500/5 blur-3xl" />
    </div>
  );
}
