'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * AuthForm - Reusable card container with glass styling for auth forms
 * Eliminates ~20+ lines of duplicated card markup per auth page
 */
interface AuthFormProps {
  children: ReactNode;
}

export function AuthForm({ children }: AuthFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1],
        scale: { type: 'spring', stiffness: 200, damping: 20 }
      }}
      className="w-full max-w-md"
    >
      <div className="relative">
        {/* Animated Outer Glow */}
        <motion.div 
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/30 via-emerald-500/30 via-cyan-500/30 to-amber-500/30 blur-2xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Card Container */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/40 bg-gradient-to-br from-slate-900/90 via-indigo-950/80 to-slate-900/90 shadow-[0_20px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Animated Top Gradient Line */}
          <motion.div 
            className="h-1 bg-gradient-to-r from-amber-500 via-emerald-500 via-cyan-500 to-amber-500"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          />

          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 opacity-0"
            animate={{
              opacity: [0, 0.1, 0],
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            }}
          />

          {/* Inner Glow Spots */}
          <div className="pointer-events-none absolute left-10 top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative p-8">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * AuthFormHeader - Reusable header for auth forms with icon, title, and subtitle
 */
interface AuthFormHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthFormHeader({ icon, title, subtitle }: AuthFormHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: 'spring', 
          duration: 0.8,
          bounce: 0.4,
        }}
        className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center"
      >
        {/* Rotating Ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-amber-500/30"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        
        {/* Icon Container */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-cyan-500/20 shadow-lg shadow-amber-500/20">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {icon}
          </motion.div>
        </div>

        {/* Pulse Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="mb-3 bg-gradient-to-r from-stone-100 via-amber-100 to-stone-100 bg-clip-text text-3xl font-bold text-transparent">
            {title}
          </h1>
          <p className="text-stone-400">{subtitle}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * AuthError - Reusable error message component
 */
interface AuthErrorProps {
  error: string;
}

export function AuthError({ error }: AuthErrorProps) {
  if (!error) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 flex items-center gap-1 text-sm text-red-400"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
      {error}
    </motion.p>
  );
}

/**
 * AuthSubmitButton - Reusable submit button with loading state
 */
interface AuthSubmitButtonProps {
  isLoading: boolean;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function AuthSubmitButton({ isLoading, children, variant = 'primary' }: AuthSubmitButtonProps) {
  const gradientClasses = variant === 'primary'
    ? 'from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500'
    : 'from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-500';

  const shadowColor = variant === 'primary' ? 'amber' : 'emerald';

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={isLoading}
      className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r ${gradientClasses} px-4 py-4 font-semibold text-white shadow-lg shadow-${shadowColor}-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-${shadowColor}-500/40 disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {/* Shimmer Effect on Hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        }}
      />

      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}

/**
 * AuthDivider - Reusable divider with "or" text
 */
export function AuthDivider() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-700/50" />
      </div>
      <div className="relative flex justify-center">
        <motion.span 
          className="bg-gradient-to-br from-slate-900/90 via-indigo-950/80 to-slate-900/90 px-4 text-sm text-stone-500"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          or continue with email
        </motion.span>
      </div>
    </div>
  );
}
