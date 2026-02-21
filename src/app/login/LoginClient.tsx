'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Tractor, Mail, Chrome, ArrowRight, Sprout } from 'lucide-react';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import {
  AuthLayout,
  AuthForm,
  AuthFormHeader,
  AuthField,
  AuthDivider,
  AuthSubmitButton,
  usePasswordValidation,
} from '@/components/auth';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const requestedMode = searchParams.get('mode');

  const { user, isLoading: authLoading } = useAuthStore();
  const { validatePassword } = usePasswordValidation();

  const [mode, setMode] = useState<'signin' | 'signup'>(
    requestedMode === 'signup' ? 'signup' : 'signin'
  );
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

  // Allow deep-linking into signup mode
  useEffect(() => {
    if (requestedMode === 'signup') {
      setMode('signup');
    } else if (requestedMode === 'signin') {
      setMode('signin');
    }
  }, [requestedMode]);

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
      const passwordError = validatePassword(password, true);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    } else {
      const passwordError = validatePassword(password, false);
      if (passwordError) {
        setError(passwordError);
        return;
      }
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
        } else if (profile?.roles?.includes('admin')) {
          router.push('/admin');
        } else if (profile?.roles?.includes('provider')) {
          router.push('/provider/dashboard');
        } else if (profile?.roles?.includes('renter')) {
          router.push('/renter/dashboard');
        } else {
          // No role set - redirect to onboarding
          router.push('/onboarding');
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
      <AuthLayout>
        <div className="flex items-center justify-center">
          <motion.div
            className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthForm>
        <AuthFormHeader
          icon={<Mail className="h-8 w-8 text-amber-400" />}
          title={mode === 'signin' ? 'Welcome Back' : 'Join AgriServe'}
          subtitle={mode === 'signin' ? 'Sign in to continue your journey' : 'Create an account to get started'}
        />

        {/* Google Sign In */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="group relative mb-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3.5 font-medium text-stone-200 shadow-lg transition-all duration-300 hover:border-amber-500/50 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-amber-500/10"
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
          
          <Chrome className="relative z-10 h-5 w-5 text-blue-400" />
          <span className="relative z-10">Continue with Google</span>
        </motion.button>

        <AuthDivider />

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
                <AuthField
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AuthField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="you@example.com"
            disabled={isLoading}
          />

          <div>
            <AuthField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
              disabled={isLoading}
              showToggle
            />

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

          <AuthSubmitButton isLoading={isLoading}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="h-5 w-5" />
          </AuthSubmitButton>
        </form>

        {/* Toggle Mode */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-stone-400">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <motion.button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
            className="font-semibold text-amber-400 transition-colors hover:text-amber-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </motion.button>
        </motion.div>

        {/* Terms */}
        <motion.p 
          className="mt-6 text-center text-xs text-stone-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-amber-400 transition-colors hover:text-amber-300 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-amber-400 transition-colors hover:text-amber-300 hover:underline">
            Privacy Policy
          </Link>
        </motion.p>
      </AuthForm>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="flex items-center justify-center">
            <motion.div
              className="h-12 w-12 rounded-full border-4 border-amber-500/20 border-t-amber-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </AuthLayout>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
