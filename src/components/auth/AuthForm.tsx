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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div className="relative">
        {/* Card Glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 blur-xl" />

        <div className="relative overflow-hidden rounded-3xl border border-stone-700/30 bg-stone-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          {/* Top Gradient Line */}
          <div className="h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />

          <div className="p-8">
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
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-emerald-500/10"
      >
        {icon}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="mb-2 text-2xl font-bold text-stone-100">{title}</h1>
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
  const baseClasses = variant === 'primary'
    ? 'from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 hover:shadow-amber-500/20'
    : 'from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-emerald-500/20';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={isLoading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${baseClasses} px-4 py-4 font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {isLoading ? (
        <motion.div
          className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        children
      )}
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
        <div className="w-full border-t border-stone-700/50" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-stone-900/60 px-4 text-sm text-stone-500">
          or continue with email
        </span>
      </div>
    </div>
  );
}
