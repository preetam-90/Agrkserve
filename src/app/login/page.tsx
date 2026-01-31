'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, Mail, Chrome, Eye, EyeOff, ArrowRight, Leaf, Wheat, Sprout } from 'lucide-react';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const { user, isLoading: authLoading } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirect);
    }
  }, [user, authLoading, router, redirect]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Please enter your name');
      return;
    }

    // Enhanced password validation for signup
    if (mode === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError('Password must contain at least one lowercase letter');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError('Password must contain at least one number');
        return;
      }
    } else if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        await authService.signInWithEmail(email, password);
        toast.success('Login successful!');

        // Check if user has phone number
        const user = await authService.getUser();
        const profile = user ? await authService.getProfile(user.id) : null;

        if (user && !profile?.phone) {
          router.push('/phone-setup');
        } else if (!profile?.is_profile_complete) {
          router.push('/onboarding');
        } else {
          router.push(redirect);
        }
      } else {
        const signupResult = await authService.signUpWithEmail(email, password, name);

        // Check if email confirmation is required
        if (signupResult.user && !signupResult.user.email_confirmed_at) {
          toast.success(
            'Account created! Please check your email to confirm your account before logging in.',
            { duration: 6000 }
          );
          setMode('signin');
          setPassword('');
          setError(
            'Please confirm your email before logging in. Check your inbox for the confirmation link.'
          );
        } else {
          toast.success('Account created successfully!');
          // After signup, automatically go to phone setup
          router.push('/phone-setup');
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Authentication error:', err);

      // Provide better error messages
      let errorMessage = error.message || 'Authentication failed. Please try again.';

      if (errorMessage.includes('Email not confirmed')) {
        errorMessage =
          'Please confirm your email before logging in. Check your inbox for the confirmation link.';
      } else if (errorMessage.includes('Invalid login credentials')) {
        errorMessage =
          'Invalid email or password. If you just signed up, please confirm your email first.';
      }

      setError(errorMessage);
      toast.error(mode === 'signin' ? 'Login failed' : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await authService.signInWithGoogle();
      // User will be redirected to Google and back to the app
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Google sign-in error:', err);
      setError(error.message || 'Google sign-in failed');
      toast.error('Google sign-in failed');
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900">
        <motion.div
          className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

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
          {/* Glass Card */}
          <div className="relative">
            {/* Card Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 blur-xl" />

            <div className="relative overflow-hidden rounded-3xl border border-stone-700/30 bg-stone-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              {/* Top Gradient Line */}
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
                      key={mode}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h1 className="mb-2 text-2xl font-bold text-stone-100">
                        {mode === 'signin' ? 'Welcome Back' : 'Join AgriServe'}
                      </h1>
                      <p className="text-stone-400">
                        {mode === 'signin'
                          ? 'Sign in to continue your journey'
                          : 'Create an account to get started'}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Google Sign In */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 font-medium text-stone-200 transition-all duration-200 hover:border-amber-500/50 hover:bg-stone-800/80 hover:shadow-lg hover:shadow-amber-500/10"
                >
                  <Chrome className="h-5 w-5 text-blue-400" />
                  Continue with Google
                </motion.button>

                {/* Divider */}
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

                {/* Form */}
                <form onSubmit={handleEmailAuth} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="mb-1.5 block text-sm font-medium text-stone-300">
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              setError('');
                            }}
                            placeholder="John Doe"
                            disabled={isLoading}
                            className="w-full rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        placeholder="you@example.com"
                        disabled={isLoading}
                        className="w-full rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-300">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        placeholder={
                          mode === 'signup' ? 'Create a secure password' : 'Enter your password'
                        }
                        disabled={isLoading}
                        className="w-full rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 pr-12 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
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
                    </div>

                    {mode === 'signup' && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 flex items-center gap-1 text-xs text-stone-400"
                      >
                        <Sprout className="h-3 w-3 text-emerald-400" />
                        Must be 8+ chars with uppercase, lowercase, and number
                      </motion.p>
                    )}

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

                  {mode === 'signin' && (
                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

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
                      <>
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                  <span className="text-stone-400">
                    {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signin' ? 'signup' : 'signin');
                      setError('');
                    }}
                    className="font-semibold text-amber-400 transition-colors hover:text-amber-300"
                  >
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </button>
                </div>

                {/* Terms */}
                <p className="mt-6 text-center text-xs text-stone-500">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-amber-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-amber-400 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900">
          <motion.div
            className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
