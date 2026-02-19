'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, User } from 'lucide-react';
import { Textarea } from '@/components/ui';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import type { UserProfile } from '@/lib/types';
import toast from 'react-hot-toast';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import {
  AuthLayout,
  AuthForm,
  AuthFormHeader,
  AuthField,
  AuthSubmitButton,
} from '@/components/auth';

export default function PhoneSetupPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, isLoading: authLoading, initialize } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'details'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && profile?.phone) {
      if (!profile.is_profile_complete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!user) {
      setError('Please login again to continue');
      toast.error('Session expired. Please login again.');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.upsertProfile(user.id, {
        phone: phoneNumber,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      });

      if (!result) {
        throw new Error('Failed to save phone number. Please try again.');
      }

      await refreshProfile();
      toast.success('Phone number saved!');
      setStep('details');
    } catch (err: unknown) {
      console.error('[PhoneSetup] Phone update error:', err);
      let errorMessage = 'Failed to save phone number. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentUser = await authService.getUser();
    if (!currentUser) {
      toast.error('Session expired. Please login again.');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: Partial<UserProfile> = {};

      if (address) {
        updateData.address = address;
      }

      if (profileImage) {
        updateData.profile_image = profileImage;
      }

      if (Object.keys(updateData).length > 0) {
        await authService.upsertProfile(currentUser.id, updateData);
        await refreshProfile();
      }

      toast.success('Profile updated successfully!');

      if (!profile?.is_profile_complete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      console.error('Profile update error:', err);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipDetails = () => {
    if (!profile?.is_profile_complete) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  if (authLoading) {
    return (
      <AuthLayout>
        <div className="flex min-h-screen items-center justify-center">
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
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <AuthFormHeader
                icon={<Phone className="h-8 w-8 text-amber-400" />}
                title="Phone Number Required"
                subtitle="We need your phone number for booking notifications and communication"
              />

              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="flex">
                      <div className="flex items-center rounded-xl border border-stone-700/50 bg-stone-800/50 px-4">
                        <span className="font-medium text-stone-300">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhoneNumber(value);
                          setError('');
                        }}
                        placeholder="9876543210"
                        disabled={isLoading}
                        maxLength={10}
                        autoFocus
                        className="flex-1 rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
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
                  <p className="mt-1 text-xs text-stone-500">Enter your 10-digit mobile number</p>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-xs text-amber-200">
                    Your phone number is mandatory for receiving booking updates and connecting with
                    service providers.
                  </p>
                </div>

                <AuthSubmitButton isLoading={isLoading}>
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </AuthSubmitButton>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <AuthFormHeader
                icon={<User className="h-8 w-8 text-amber-400" />}
                title="Complete Your Profile"
                subtitle="Add your address and profile picture (optional)"
              />

              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-300">
                    Profile Picture
                  </label>
                  <div className="flex justify-center">
                    {user && (
                      <ProfilePictureUpload
                        currentImage={profileImage}
                        onUpload={setProfileImage}
                        userId={user.id}
                        size="lg"
                      />
                    )}
                    {!user && (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-stone-700/50 bg-stone-800/50">
                        <User className="h-12 w-12 text-stone-500" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-center text-xs text-stone-500">
                    Help others recognize you
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-300">Address</label>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address (e.g., Village, District, State)"
                    disabled={isLoading}
                    rows={3}
                    className="border-stone-700/50 bg-stone-800/50 text-stone-100 placeholder-stone-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="mt-1 text-xs text-stone-500">
                    This helps service providers locate you
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-xs text-emerald-300">
                    You can add more details like bio and location in your profile settings later.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <AuthSubmitButton isLoading={isLoading}>
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </AuthSubmitButton>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSkipDetails}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 font-medium text-stone-300 transition-all duration-200 hover:border-amber-500/50 hover:bg-stone-800/80 hover:shadow-lg hover:shadow-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Skip for Now
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </AuthForm>
    </AuthLayout>
  );
}
