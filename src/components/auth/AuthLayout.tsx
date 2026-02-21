'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tractor, Sparkles } from 'lucide-react';
import { AuthBackground } from './AuthBackground';

/**
 * AuthLayout - Reusable layout wrapper for auth pages
 * Eliminates ~30+ lines of duplicated header/footer code per auth page
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

interface ParticleConfig {
  left: string;
  top: string;
  duration: number;
  delay: number;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const currentYear = new Date().getFullYear();

  // Generate particles once using useState initializer
  // The initializer function runs once during mount, not during render
  const [particles] = useState<ParticleConfig[]>(() => {
    return Array.from({ length: 30 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 5,
    }));
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-900">
      <AuthBackground />

      {/* Animated Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1px),linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      </div>

      {/* Floating Particles */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-gradient-to-r from-amber-400/40 to-emerald-400/40"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="group flex w-fit items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: -8 }} 
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            {/* Animated Glow Ring */}
            <motion.div 
              className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 opacity-0 blur-xl transition-opacity group-hover:opacity-60"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            
            {/* Logo Container */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 shadow-lg shadow-amber-500/20">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Tractor className="h-6 w-6 text-amber-400" />
              </motion.div>
              
              {/* Sparkle Effect */}
              <motion.div
                className="absolute -right-1 -top-1"
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.span 
            className="bg-gradient-to-r from-stone-100 via-amber-100 to-emerald-100 bg-clip-text text-xl font-bold tracking-tight text-transparent"
            whileHover={{ scale: 1.02 }}
          >
            Agri<span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text">Serve</span>
          </motion.span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <motion.p 
          className="text-sm text-stone-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © {currentYear} AgriServe. <span className="text-amber-500/60">Cultivating connections.</span>
        </motion.p>
      </footer>
    </div>
  );
}
