'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, User, Tractor, Wheat, Leaf } from 'lucide-react';
import { Textarea } from '@/components/ui';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import type { UserProfile } from '@/lib/types';
import toast from 'react-hot-toast';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';

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

    const currentUser = await authService.getUser();
    if (!currentUser) {
      setError('Please login again to continue');
      toast.error('Session expired. Please login again.');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      await authService.upsertProfile(currentUser.id, {
        phone: phoneNumber,
        email: currentUser.email || '',
        name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '',
      });

      await refreshProfile();
      toast.success('Phone number saved!');
      setStep('details');
    } catch (err: unknown) {
      console.error('Phone update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save phone number';
      setError(errorMessage);
      toast.error('Failed to save phone number');
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
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05, rotate: -5 }} className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 opacity-50 blur-md transition-opacity" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/20 bg-gradient-to-br from-stone-900 to-emerald-950">
              <Tractor className="h-6 w-6 text-amber-400" />
            </div>
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-stone-100">
            Agri<span className="text-amber-500">Serve</span>
          </span>
        </div>
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
                      {/* Header */}
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', duration: 0.5 }}
                          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-emerald-500/10"
                        >
                          <Phone className="h-8 w-8 text-amber-400" />
                        </motion.div>

                        <h1 className="mb-2 text-2xl font-bold text-stone-100">
                          Phone Number Required
                        </h1>
                        <p className="text-stone-400">
                          We need your phone number for booking notifications and communication
                        </p>
                      </div>

                      {/* Form */}
                      <form onSubmit={handlePhoneSubmit} className="space-y-5">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-stone-300">
                            Phone Number
                          </label>
                          <div className="flex gap-2">
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
                              className="flex-1 rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                              autoFocus
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
                          <p className="mt-1 text-xs text-stone-500">
                            Enter your 10-digit mobile number
                          </p>
                        </div>

                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                          <p className="text-xs text-amber-200">
                            Your phone number is mandatory for receiving booking updates and
                            connecting with service providers.
                          </p>
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
                            <>
                              Continue
                              <ArrowRight className="h-5 w-5" />
                            </>
                          )}
                        </motion.button>
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
                      {/* Header */}
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', duration: 0.5 }}
                          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-emerald-500/10"
                        >
                          <User className="h-8 w-8 text-amber-400" />
                        </motion.div>

                        <h1 className="mb-2 text-2xl font-bold text-stone-100">
                          Complete Your Profile
                        </h1>
                        <p className="text-stone-400">
                          Add your address and profile picture (optional)
                        </p>
                      </div>

                      <form onSubmit={handleDetailsSubmit} className="space-y-6">
                        {/* Profile Picture Upload */}
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

                        {/* Address Field */}
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-stone-300">
                            Address
                          </label>
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
                            You can add more details like bio and location in your profile settings
                            later.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
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
                                Continue
                                <ArrowRight className="h-5 w-5" />
                              </>
                            )}
                          </motion.button>

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
