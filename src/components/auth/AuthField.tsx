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
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div>
      <motion.label 
        className="mb-2 block text-sm font-medium text-stone-300"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label}
      </motion.label>
      
      <div className="relative">
        {/* Focus Glow Effect */}
        {isFocused && (
          <motion.div
            className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-emerald-500/30 blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        <motion.input
          type={inputType}
          className="relative w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3.5 pr-12 text-stone-100 placeholder-stone-500 shadow-inner transition-all duration-300 focus:border-amber-500/50 focus:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
        
        {showToggle && isPassword && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 transition-colors hover:text-amber-400"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              initial={false}
              animate={{ rotate: showPassword ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </motion.div>
          </motion.button>
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
      initial={{ opacity: 0, y: -10, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0 }}
      className="mt-2 flex items-center gap-2 text-sm text-red-400"
    >
      <motion.span 
        className="h-1.5 w-1.5 rounded-full bg-red-400"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
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
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 flex items-center gap-2 text-xs text-stone-400"
    >
      <motion.span 
        className="text-emerald-400"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        ✓
      </motion.span>
      Must be 8+ chars with uppercase, lowercase, and number
    </motion.p>
  );
}
