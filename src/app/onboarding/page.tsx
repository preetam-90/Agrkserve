'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tractor,
  User,
  Wrench,
  Users,
  MapPin,
  Check,
  ArrowRight,
  ArrowLeft,
  Wheat,
  Leaf,
} from 'lucide-react';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { UserRole } from '@/lib/types';
import toast from 'react-hot-toast';

type OnboardingStep = 'role' | 'profile' | 'location';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'renter',
    title: 'Farmer / Renter',
    description: 'Browse and book agricultural equipment for your farm',
    icon: <User className="h-8 w-8" />,
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    role: 'provider',
    title: 'Equipment Provider',
    description: 'List your equipment and earn by renting it out',
    icon: <Wrench className="h-8 w-8" />,
    color: 'bg-green-500',
    gradient: 'from-green-400 to-green-600',
  },
  {
    role: 'labour',
    title: 'Labour Provider',
    description: 'Offer your agricultural services and skills',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-orange-500',
    gradient: 'from-orange-400 to-orange-600',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuthStore();

  const [step, setStep] = useState<OnboardingStep>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || profile?.name || '',
        email: user.email || profile?.email || '',
      }));
    }
  }, [user, profile]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.is_profile_complete) {
        router.push('/dashboard');
      }
    }
  }, [user, profile, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          if (data.display_name) {
            setFormData((prev) => ({
              ...prev,
              address: data.display_name,
              pincode: data.address?.postcode || prev.pincode,
            }));
          }
        } catch (err) {
          console.error('Failed to get address:', err);
        }

        setIsLocating(false);
        toast.success('Location detected successfully!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);

        let errorMessage = 'Failed to get location. Please enter manually.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please enter manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or enter manually.';
            break;
        }

        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleNext = () => {
    if (step === 'role' && selectedRole) {
      setStep('profile');
    } else if (step === 'profile' && formData.name) {
      setStep('location');
    }
  };

  const handleBack = () => {
    if (step === 'profile') {
      setStep('role');
    } else if (step === 'location') {
      setStep('profile');
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole || !formData.name || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      await authService.addUserRole(user.id, selectedRole);

      if (!profile?.phone) {
        toast.error('Phone number is required. Redirecting to phone setup...');
        router.push('/phone-setup');
        return;
      }

      const profileData = {
        id: user.id,
        phone: profile.phone,
        name: formData.name,
        email: formData.email || user.email || '',
        address: formData.address,
        pincode: formData.pincode || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        roles: [selectedRole],
        is_profile_complete: true,
        profile_image: user.user_metadata?.avatar_url || null,
        bio: null,
        preferred_language: 'en' as const,
        is_verified: false,
        last_login: null,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await authService.upsertProfile(user.id, profileData);

      if (!result) {
        console.warn('Profile table does not exist, but continuing...');
        useAuthStore.getState().setProfile(profileData);
        useAuthStore.getState().setRoles([selectedRole]);
        useAuthStore.getState().setActiveRole(selectedRole);
      }

      toast.success('Profile created successfully!');

      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Failed to update profile:', err);
      toast.error(error.message || 'Failed to create profile. Please try again.');
    } finally {
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

  const steps = ['role', 'profile', 'location'];
  const currentStepIndex = steps.indexOf(step);

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
      <header className="relative z-10 flex items-center justify-between p-6">
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

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <motion.div
              key={s}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                step === s
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-500 shadow-lg shadow-amber-500/30'
                  : currentStepIndex > i
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    : 'bg-stone-700'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-6">
        <AnimatePresence mode="wait">
          {step === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-2xl space-y-8"
            >
              <div className="text-center">
                <h1 className="mb-3 text-3xl font-bold text-stone-100">
                  How do you want to use AgriServe?
                </h1>
                <p className="text-stone-400">
                  Choose your primary role. You can switch roles later.
                </p>
              </div>

              <div className="grid gap-4">
                {roleOptions.map((option) => (
                  <motion.button
                    key={option.role}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setSelectedRole(option.role)}
                    className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all ${
                      selectedRole === option.role
                        ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 shadow-lg shadow-amber-500/20'
                        : 'border-stone-700/50 bg-stone-800/50 hover:border-amber-500/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-xl bg-gradient-to-br p-3 text-white ${option.gradient}`}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-stone-100">{option.title}</h3>
                        <p className="text-sm text-stone-400">{option.description}</p>
                      </div>
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                          selectedRole === option.role
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-stone-700'
                        }`}
                      >
                        {selectedRole === option.role && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNext}
                disabled={!selectedRole}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-4 font-semibold text-white transition-all duration-200 hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-md space-y-8"
            >
              <div className="text-center">
                <h1 className="mb-3 text-3xl font-bold text-stone-100">Tell us about yourself</h1>
                <p className="text-stone-400">This helps us personalize your experience</p>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 blur-xl" />
                <div className="relative overflow-hidden rounded-3xl border border-stone-700/30 bg-stone-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                  <div className="h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />
                  <div className="space-y-5 p-6">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-300">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-300">
                        Email (optional)
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      <p className="mt-1.5 text-xs text-stone-500">
                        For booking confirmations and updates
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleBack}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-4 font-medium text-stone-300 transition-all duration-200 hover:border-amber-500/50 hover:bg-stone-800/80 hover:shadow-lg hover:shadow-amber-500/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.name}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-4 font-semibold text-white transition-all duration-200 hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-md space-y-8"
            >
              <div className="text-center">
                <h1 className="mb-3 text-3xl font-bold text-stone-100">Where are you located?</h1>
                <p className="text-stone-400">We&apos;ll show you equipment and services nearby</p>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 blur-xl" />
                <div className="relative overflow-hidden rounded-3xl border border-stone-700/30 bg-stone-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                  <div className="h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />
                  <div className="space-y-5 p-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-4 font-semibold text-white transition-all duration-200 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLocating ? (
                        <>
                          <motion.div
                            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Detecting location...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-5 w-5" />
                          Use Current Location
                        </>
                      )}
                    </motion.button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-700/50" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-stone-900/60 px-4 text-xs uppercase text-stone-500">
                          Or enter manually
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-300">
                        Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Village, District, State"
                        className="w-full rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-300">
                        Pincode
                      </label>
                      <input
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className="w-full rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-3.5 text-stone-100 placeholder-stone-500 transition-all duration-200 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    {formData.latitude !== 0 && formData.longitude !== 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400"
                      >
                        <Check className="h-4 w-4" />
                        Location coordinates captured
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleBack}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-700/50 bg-stone-800/50 px-4 py-4 font-medium text-stone-300 transition-all duration-200 hover:border-amber-500/50 hover:bg-stone-800/80 hover:shadow-lg hover:shadow-amber-500/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSubmit}
                  disabled={!formData.address}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-4 font-semibold text-white transition-all duration-200 hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <motion.div
                      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      Complete Setup
                      <Check className="h-5 w-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
