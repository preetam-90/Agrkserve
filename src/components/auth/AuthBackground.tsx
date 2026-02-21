'use client';

import { motion } from 'framer-motion';
import { Wheat, Leaf, Sparkles } from 'lucide-react';

// Pre-generated random values for consistent rendering
const GRAIN_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${3 + i * 3.2}%`,
  top: `${5 + i * 3}%`,
  duration: 4 + (i % 3),
  delay: i * 0.15,
  size: 1 + (i % 3) * 0.5,
}));

const GRASS_ELEMENTS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${8 + i * 8}%`,
  duration: 3 + (i % 2),
  delay: i * 0.2,
}));

const FLOATING_SPARKLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${10 + i * 6}%`,
  top: `${10 + i * 5}%`,
  duration: 3 + (i % 4),
  delay: i * 0.3,
}));

/**
 * AuthBackground - Reusable animated agricultural background for auth pages
 * Eliminates ~80+ lines of duplicated code per auth page
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated Mesh Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />

      {/* Field Lines Pattern - Animated */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="fieldLines"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="30" x2="60" y2="30" stroke="#d97706" strokeWidth="0.5" />
            <line x1="30" y1="0" x2="30" y2="60" stroke="#10b981" strokeWidth="0.3" opacity="0.5" />
          </pattern>
          <pattern
            id="soilTexture"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="15" cy="15" r="1.5" fill="#78350f" opacity="0.4" />
            <circle cx="60" cy="40" r="1" fill="#78350f" opacity="0.3" />
            <circle cx="95" cy="60" r="1.8" fill="#78350f" opacity="0.35" />
            <circle cx="40" cy="85" r="1.2" fill="#78350f" opacity="0.4" />
            <circle cx="85" cy="100" r="1.5" fill="#78350f" opacity="0.3" />
            <circle cx="20" cy="50" r="0.8" fill="#10b981" opacity="0.3" />
            <circle cx="70" cy="20" r="1" fill="#10b981" opacity="0.25" />
          </pattern>
        </defs>
        <motion.rect
          width="100%"
          height="100%"
          fill="url(#fieldLines)"
          initial={{ x: 0 }}
          animate={{ x: -60 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <rect width="100%" height="100%" fill="url(#soilTexture)" />
      </svg>

      {/* Enhanced Animated Grain Particles */}
      {GRAIN_PARTICLES.map((particle) => (
        <motion.div
          key={`grain-${particle.id}`}
          className="absolute rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating Sparkles */}
      {FLOATING_SPARKLES.map((sparkle) => (
        <motion.div
          key={`sparkle-${sparkle.id}`}
          className="absolute text-amber-400/20"
          style={{
            left: sparkle.left,
            top: sparkle.top,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.6, 0],
            rotate: [0, 180, 360],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="h-3 w-3" />
        </motion.div>
      ))}

      {/* Animated Wheat Stalks - Enhanced */}
      <motion.svg
        className="text-amber-500/10 absolute bottom-0 left-10 h-56 w-28"
        viewBox="0 0 112 224"
        initial={{ rotate: 0 }}
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.path
          d="M56 224 Q54 160 56 112 Q58 60 56 0"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          animate={{
            pathLength: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <ellipse cx="56" cy="12" rx="5" ry="2.5" fill="currentColor" />
        <ellipse cx="50" cy="24" rx="4" ry="2" fill="currentColor" transform="rotate(-15, 50, 24)" />
        <ellipse cx="62" cy="24" rx="4" ry="2" fill="currentColor" transform="rotate(15, 62, 24)" />
        <ellipse cx="48" cy="38" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(-20, 48, 38)" />
        <ellipse cx="64" cy="38" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(20, 64, 38)" />
      </motion.svg>

      <motion.svg
        className="text-amber-500/10 absolute bottom-0 right-20 h-72 w-36"
        viewBox="0 0 144 288"
        initial={{ rotate: 0 }}
        animate={{ rotate: [4, -4, 4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.path
          d="M72 288 Q68 210 72 144 Q76 75 72 0"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          animate={{
            pathLength: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <ellipse cx="72" cy="15" rx="6" ry="3" fill="currentColor" />
        <ellipse cx="65" cy="30" rx="5" ry="2.5" fill="currentColor" transform="rotate(-12, 65, 30)" />
        <ellipse cx="79" cy="30" rx="5" ry="2.5" fill="currentColor" transform="rotate(12, 79, 30)" />
        <ellipse cx="62" cy="48" rx="4" ry="2" fill="currentColor" transform="rotate(-18, 62, 48)" />
        <ellipse cx="82" cy="48" rx="4" ry="2" fill="currentColor" transform="rotate(18, 82, 48)" />
      </motion.svg>

      {/* Enhanced Animated Grass/Leaves */}
      {GRASS_ELEMENTS.map((grass) => (
        <motion.div
          key={`grass-${grass.id}`}
          className="absolute bottom-0 h-20 w-1 origin-bottom bg-gradient-to-t from-emerald-600/15 via-emerald-500/10 to-transparent"
          style={{
            left: grass.left,
          }}
          animate={{
            rotate: [-8, 8, -8],
            scaleY: [1, 1.3, 1],
          }}
          transition={{
            duration: grass.duration,
            repeat: Infinity,
            delay: grass.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating Wheat Elements - Enhanced */}
      <motion.div
        className="absolute left-12 top-24 text-amber-500/12"
        animate={{ 
          y: [0, -25, 0], 
          rotate: [0, 8, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Wheat className="h-36 w-36" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-24 right-12 text-amber-500/12"
        animate={{ 
          y: [0, 25, 0], 
          rotate: [0, -8, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Wheat className="h-44 w-44" />
      </motion.div>
      
      <motion.div
        className="absolute right-1/4 top-1/2 text-emerald-500/12"
        animate={{ 
          y: [0, -18, 0],
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="h-28 w-28" />
      </motion.div>

      <motion.div
        className="absolute left-1/3 top-1/3 text-emerald-500/10"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -12, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Leaf className="h-32 w-32" />
      </motion.div>

      {/* Enhanced Gradient Orbs */}
      <motion.div 
        className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-amber-600/15 via-amber-500/10 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div 
        className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-600/15 via-emerald-500/10 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      
      <motion.div 
        className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-500/8 via-emerald-500/8 via-cyan-500/8 to-amber-500/8 blur-3xl"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
}
