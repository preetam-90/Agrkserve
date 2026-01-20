'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Tractor, 
  User, 
  Wrench, 
  Users, 
  MapPin, 
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button, Input, Card, CardContent, Spinner } from '@/components/ui';
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
}

const roleOptions: RoleOption[] = [
  {
    role: 'renter',
    title: 'Farmer / Renter',
    description: 'Browse and book agricultural equipment for your farm',
    icon: <User className="h-8 w-8" />,
    color: 'bg-blue-500',
  },
  {
    role: 'provider',
    title: 'Equipment Provider',
    description: 'List your equipment and earn by renting it out',
    icon: <Wrench className="h-8 w-8" />,
    color: 'bg-green-500',
  },
  {
    role: 'labour',
    title: 'Labour Provider',
    description: 'Offer your agricultural services and skills',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-orange-500',
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

  // Initialize form data with user information
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || profile?.name || '',
        email: user.email || profile?.email || '',
      }));
    }
  }, [user, profile]);

  // Redirect if not logged in or already onboarded
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.is_profile_complete) {
        const dashboardPath = profile.roles?.includes('provider') 
          ? '/provider/dashboard'
          : profile.roles?.includes('labour')
            ? '/labour/dashboard'
            : '/renter/dashboard';
        router.push(dashboardPath);
      }
    }
  }, [user, profile, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        setFormData(prev => ({ ...prev, latitude, longitude }));
        
        // Try to get address from coordinates
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          if (data.display_name) {
            setFormData(prev => ({
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
        
        // Provide specific error messages
        let errorMessage = 'Failed to get location. Please enter manually.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
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
        maximumAge: 0
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
      // First, add the user role
      await authService.addUserRole(user.id, selectedRole);

      // Then update the profile
      const profileData = {
        id: user.id,
        phone: user.phone || '',
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
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await authService.upsertProfile(user.id, profileData);

      // If table doesn't exist, store in local state and continue
      if (!result) {
        console.warn('Profile table does not exist, but continuing...');
        // Update the auth store with the profile data
        useAuthStore.getState().setProfile(profileData);
        useAuthStore.getState().setRoles([selectedRole]);
        useAuthStore.getState().setActiveRole(selectedRole);
      }

      toast.success('Profile created successfully!');
      
      // Redirect to appropriate dashboard
      const dashboardPath = selectedRole === 'provider' 
        ? '/provider/dashboard'
        : selectedRole === 'labour'
          ? '/labour/dashboard'
          : '/renter/dashboard';
      
      router.push(dashboardPath);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600">
            <Tractor className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">AgriServe</span>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {['role', 'profile', 'location'].map((s, i) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                step === s
                  ? 'bg-green-600'
                  : ['role', 'profile', 'location'].indexOf(step) > i
                    ? 'bg-green-400'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4">
        {step === 'role' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                How do you want to use AgriServe?
              </h1>
              <p className="text-gray-600 mt-2">
                Choose your primary role. You can switch roles later.
              </p>
            </div>

            <div className="grid gap-4">
              {roleOptions.map((option) => (
                <Card
                  key={option.role}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRole === option.role
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : ''
                  }`}
                  onClick={() => setSelectedRole(option.role)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`p-3 rounded-lg text-white ${option.color}`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === option.role
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedRole === option.role && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!selectedRole}
              className="w-full"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Tell us about yourself
              </h1>
              <p className="text-gray-600 mt-2">
                This helps us personalize your experience
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (optional)
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    For booking confirmations and updates
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!formData.name}
                className="flex-1"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'location' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Where are you located?
              </h1>
              <p className="text-gray-600 mt-2">
                We&apos;ll show you equipment and services nearby
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <Button
                  variant="outline"
                  onClick={handleGetLocation}
                  loading={isLocating}
                  className="w-full"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {isLocating ? 'Detecting location...' : 'Use Current Location'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Or enter manually
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Village, District, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <Input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>

                {formData.latitude !== 0 && formData.longitude !== 0 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Location coordinates captured
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.address}
                loading={isLoading}
                className="flex-1"
              >
                Complete Setup
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
