'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import { authService } from '@/lib/services';
import toast from 'react-hot-toast';
import {
  AuthLayout,
  AuthForm,
  AuthFormHeader,
  AuthField,
  AuthSubmitButton,
} from '@/components/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.updatePassword(password);
      setIsSuccess(true);
      toast.success('Password updated successfully!');

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to update password. Please try again.');
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthForm>
        <AuthFormHeader
          icon={isSuccess ? (
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          ) : (
            <Lock className="h-8 w-8 text-amber-400" />
          )}
          title={isSuccess ? 'Password Updated!' : 'Set New Password'}
          subtitle={isSuccess 
            ? 'Your password has been successfully updated'
            : 'Create a secure new password'
          }
        />

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-center text-sm text-emerald-300">
                  Redirecting you to dashboard...
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-4 font-semibold text-white transition-all duration-200 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                Go to Dashboard
              </motion.button>
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
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter new password"
                  disabled={isLoading}
                  showToggle
                />
              </div>

              <div>
                <AuthField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                  showToggle
                  error={error}
                />
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="text-xs text-amber-200">
                  Password must be at least 6 characters long
                </p>
              </div>

              <AuthSubmitButton isLoading={isLoading}>
                Update Password
              </AuthSubmitButton>
            </motion.form>
          )}
        </AnimatePresence>
      </AuthForm>
    </AuthLayout>
  );
}
