'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * AuthSuccessState - Reusable success state component for auth forms
 * Used after successful operations like password reset, email sent, etc.
 */
interface AuthSuccessStateProps {
  title: string;
  subtitle: string;
  message?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function AuthSuccessState({
  title,
  subtitle,
  message,
  primaryAction,
  secondaryAction,
}: AuthSuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {message && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-center text-sm text-emerald-300">{message}</p>
        </div>
      )}

      {primaryAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={primaryAction.onClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-4 font-semibold text-white transition-all duration-200 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20"
        >
          {primaryAction.label}
        </motion.button>
      )}

      {secondaryAction && (
        <div className="text-center">
          <a
            href={secondaryAction.href}
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
          >
            {secondaryAction.label}
          </a>
        </div>
      )}
    </motion.div>
  );
}

/**
 * AuthSuccessIcon - Reusable success icon component
 */
interface AuthSuccessIconProps {
  icon?: ReactNode;
}

export function AuthSuccessIcon({ icon }: AuthSuccessIconProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
    >
      {icon || <CheckCircle className="h-8 w-8 text-emerald-400" />}
    </motion.div>
  );
}
