'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { authService } from '@/lib/services';
import toast from 'react-hot-toast';
import {
  AuthLayout,
  AuthForm,
  AuthFormHeader,
  AuthField,
  AuthSubmitButton,
} from '@/components/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword(email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Failed to send reset email:', err);
      setError(error.message || 'Failed to send reset email. Please try again.');
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthForm>
        <AuthFormHeader
          icon={<Mail className="h-8 w-8 text-amber-400" />}
          title={emailSent ? 'Check Your Email' : 'Reset Password'}
          subtitle={emailSent 
            ? `We've sent a reset link to ${email}` 
            : 'Enter your email to receive a password reset link'
          }
        />

        <AnimatePresence mode="wait">
          {emailSent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="text-sm text-amber-200">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-center text-sm text-stone-400">
                  Did not receive the email?
                </p>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3.5 font-medium text-stone-200 shadow-lg transition-all duration-300 hover:border-amber-500/50 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-amber-500/10"
                >
                  {/* Hover Shimmer */}
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
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    }}
                  />
                  <span className="relative z-10">Try Again</span>
                </motion.button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <AuthField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  autoFocus
                  disabled={isLoading}
                  error={error}
                />
              </div>

              <AuthSubmitButton isLoading={isLoading}>
                Send Reset Link
              </AuthSubmitButton>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </AuthForm>
    </AuthLayout>
  );
}
