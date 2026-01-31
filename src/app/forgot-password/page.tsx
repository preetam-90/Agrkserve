'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, Mail, ArrowLeft, Wheat, Leaf } from 'lucide-react';
import { authService } from '@/lib/services';
import toast from 'react-hot-toast';

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Animated Agriculture Textures */}
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
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`grain-${i}`}
            className="absolute h-1 w-1 rounded-full bg-amber-500/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
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
          <ellipse
            cx="44"
            cy="20"
            rx="3"
            ry="1.5"
            fill="currentColor"
            transform="rotate(-15, 44, 20)"
          />
          <ellipse
            cx="52"
            cy="20"
            rx="3"
            ry="1.5"
            fill="currentColor"
            transform="rotate(15, 52, 20)"
          />
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
          <ellipse
            cx="58"
            cy="25"
            rx="4"
            ry="2"
            fill="currentColor"
            transform="rotate(-12, 58, 25)"
          />
          <ellipse
            cx="70"
            cy="25"
            rx="4"
            ry="2"
            fill="currentColor"
            transform="rotate(12, 70, 25)"
          />
          <ellipse
            cx="56"
            cy="40"
            rx="3"
            ry="1.5"
            fill="currentColor"
            transform="rotate(-18, 56, 40)"
          />
          <ellipse
            cx="72"
            cy="40"
            rx="3"
            ry="1.5"
            fill="currentColor"
            transform="rotate(18, 72, 40)"
          />
        </motion.svg>

        {/* Animated Grass/Leaves */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`grass-${i}`}
            className="absolute bottom-0 h-16 w-1 origin-bottom bg-gradient-to-t from-emerald-600/10 to-transparent"
            style={{
              left: `${10 + i * 12}%`,
            }}
            animate={{
              rotate: [-5, 5, -5],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 1,
              ease: 'easeInOut',
            }}
          />
        ))}

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

        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-gradient-to-bl from-amber-600/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-600/10 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-500/5 via-emerald-500/5 to-amber-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="group flex w-fit items-center gap-3">
          <motion.div whileHover={{ scale: 1.05, rotate: -5 }} className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 opacity-50 blur-md transition-opacity group-hover:opacity-70" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/20 bg-gradient-to-br from-stone-900 to-emerald-950">
              <Tractor className="h-6 w-6 text-amber-400" />
            </div>
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-stone-100">
            Agri<span className="text-amber-500">Serve</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 blur-xl" />

            <div className="relative overflow-hidden rounded-3xl border border-stone-700/30 bg-stone-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div className="h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />

              <div className="p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-emerald-500/10"
                  >
                    <Mail className="h-8 w-8 text-amber-400" />
                  </motion.div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={emailSent ? 'sent' : 'form'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h1 className="mb-2 text-2xl font-bold text-stone-100">
                        {emailSent ? 'Check Your Email' : 'Reset Password'}
                      </h1>
                      <p className="text-stone-400">
                        {emailSent
                          ? `We've sent a reset link to ${email}`
                          : 'Enter your email to receive a password reset link'}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

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
                          Click the link in the email to reset your password. The link will expire
                          in 1 hour.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-center text-sm text-stone-400">
                          Didn't receive the email?
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setEmailSent(false)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 font-medium text-stone-200 transition-all duration-200 hover:border-amber-500/50 hover:bg-stone-800/80 hover:shadow-lg hover:shadow-amber-500/10"
                        >
                          Try Again
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
                        <label className="mb-1.5 block text-sm font-medium text-stone-300">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          placeholder="you@example.com"
                          autoFocus
                          disabled={isLoading}
                          className="w-full rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 flex items-center gap-1 text-sm text-red-400"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            {error}
                          </motion.p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-4 font-semibold text-white transition-all duration-200 hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoading ? (
                          <motion.div
                            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                        ) : (
                          'Send Reset Link'
                        )}
                      </motion.button>

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
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-stone-500">
          © {new Date().getFullYear()} AgriServe. Cultivating connections.
        </p>
      </footer>
    </div>
  );
}
