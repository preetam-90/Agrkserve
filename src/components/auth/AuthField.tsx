'use client';

import { ReactNode, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

/**
 * AuthField - Reusable input field component with label and optional toggle visibility
 */
interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
  showToggle?: boolean;
  icon?: ReactNode;
}

export function AuthField({ 
  label, 
  error, 
  showToggle = false,
  icon,
  type = 'text',
  ...props 
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-stone-300">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          className="w-full rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 pr-12 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
          {...props}
        />
        {showToggle && isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 transition-colors hover:text-stone-300"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <AuthFieldError error={error} />}
    </div>
  );
}

/**
 * AuthFieldError - Reusable error message for form fields
 */
interface AuthFieldErrorProps {
  error: string;
}

export function AuthFieldError({ error }: AuthFieldErrorProps) {
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
 * AuthPasswordRequirements - Shows password requirements for signup
 */
interface AuthPasswordRequirementsProps {
  show?: boolean;
}

export function AuthPasswordRequirements({ show = true }: AuthPasswordRequirementsProps) {
  if (!show) return null;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-2 flex items-center gap-1 text-xs text-stone-400"
    >
      <span className="text-emerald-400">✓</span>
      Must be 8+ chars with uppercase, lowercase, and number
    </motion.p>
  );
}
