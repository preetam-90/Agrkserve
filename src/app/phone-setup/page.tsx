'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, MapPin, User } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, Spinner, Textarea } from '@/components/ui';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
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

  // Initialize auth store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Check if user already has phone
  useEffect(() => {
    if (!authLoading && profile?.phone) {
      // If phone is already set, redirect to onboarding or dashboard
      if (!profile.is_profile_complete) {
        router.push('/onboarding');
      } else {
        const dashboardPath = profile.roles?.includes('provider') 
          ? '/provider/dashboard'
          : profile.roles?.includes('labour')
            ? '/labour/dashboard'
            : '/renter/dashboard';
        router.push(dashboardPath);
      }
    }
  }, [profile, authLoading, router]);

  // Redirect if not logged in
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

    // Get fresh user data
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
        name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || ''
      });

      await refreshProfile();
      toast.success('Phone number saved!');
      setStep('details');
    } catch (err: any) {
      console.error('Phone update error:', err);
      setError(err.message || 'Failed to save phone number');
      toast.error('Failed to save phone number');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get fresh user data
    const currentUser = await authService.getUser();
    if (!currentUser) {
      toast.error('Session expired. Please login again.');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: any = {};
      
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
      
      // Always redirect to onboarding to complete role selection
      if (!profile?.is_profile_complete) {
        router.push('/onboarding');
      } else {
        const dashboardPath = profile.roles?.includes('provider') 
          ? '/provider/dashboard'
          : profile.roles?.includes('labour')
            ? '/labour/dashboard'
            : '/renter/dashboard';
        router.push(dashboardPath);
      }
    } catch (err: any) {
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
      const dashboardPath = profile.roles?.includes('provider') 
        ? '/provider/dashboard'
        : profile.roles?.includes('labour')
          ? '/labour/dashboard'
          : '/renter/dashboard';
      router.push(dashboardPath);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        {step === 'phone' ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Phone Number Required</CardTitle>
              <CardDescription>
                We need your phone number for booking notifications and communication
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-gray-700 font-medium">+91</span>
                    </div>
                    <Input
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
                      className="flex-1"
                      autoFocus
                    />
                  </div>
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your 10-digit mobile number
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Your phone number is mandatory for receiving booking updates and connecting with service providers.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>
                Add your address and profile picture (optional)
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-center text-gray-500">
                    Help others recognize you
                  </p>
                </div>

                {/* Address Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address (e.g., Village, District, State)"
                    disabled={isLoading}
                    rows={3}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This helps service providers locate you
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs text-yellow-800">
                    You can add more details like bio and location in your profile settings later.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    loading={isLoading}
                    className="w-full"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkipDetails}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Skip for Now
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
