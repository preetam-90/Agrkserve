'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit, 
  Save,
  X,
  Shield,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { 
  Button, 
  Input, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Spinner,
  Badge
} from '@/components/ui';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, refreshProfile, isLoading: authLoading } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile_image: '',
    bio: '',
    address: '',
    pincode: ''
  });

  // Initialize form data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profile_image: profile.profile_image || '',
        bio: profile.bio || '',
        address: profile.address || '',
        pincode: profile.pincode || ''
      });
    }
  }, [profile]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureUpload = async (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profile_image: imageUrl }));
    
    // Auto-save profile picture
    if (user && !isEditing) {
      setIsLoading(true);
      try {
        await authService.upsertProfile(user.id, {
          profile_image: imageUrl
        });
        await refreshProfile();
        toast.success('Profile picture updated!');
      } catch (err: any) {
        console.error('Profile picture update error:', err);
        toast.error('Failed to update profile picture');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      await authService.upsertProfile(user.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        profile_image: formData.profile_image,
        bio: formData.bio,
        address: formData.address,
        pincode: formData.pincode
      });

      await refreshProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Profile update error:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profile_image: profile.profile_image || '',
        bio: profile.bio || '',
        address: profile.address || '',
        pincode: profile.pincode || ''
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Profile
            </h1>
          </div>
          
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Profile Picture & Basic Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                {user ? (
                  <div className="space-y-2">
                    <ProfilePictureUpload
                      currentImage={formData.profile_image}
                      onUpload={handleProfilePictureUpload}
                      userId={user.id}
                      size="lg"
                    />
                    {!isEditing && (
                      <p className="text-xs text-center text-gray-500">
                        Click to change picture
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                    {formData.profile_image ? (
                      <img
                        src={formData.profile_image}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-20 h-20 text-gray-400" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formData.name || 'No name set'}
                </h2>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.roles?.map((role) => (
                    <Badge key={role} variant="secondary" className="capitalize">
                      {role}
                    </Badge>
                  ))}
                  {profile.is_verified && (
                    <Badge variant="default" className="bg-blue-500">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                {formData.bio && !isEditing && (
                  <p className="text-gray-600 mt-2">{formData.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                ) : (
                  <p className="text-gray-900">{formData.email || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-gray-700 font-medium">+91</span>
                    </div>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData(prev => ({ ...prev, phone: value }));
                      }}
                      placeholder="9876543210"
                      disabled={isLoading}
                      maxLength={10}
                      className="flex-1"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900">
                    {formData.phone ? `+91 ${formData.phone}` : 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    disabled={isLoading}
                  />
                ) : (
                  <p className="text-gray-900">{formData.name || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            {isEditing && (
              <div className="flex items-start gap-3">
                <Edit className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    disabled={isLoading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Your address"
                    disabled={isLoading}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.address || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Pincode */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData(prev => ({ ...prev, pincode: value }));
                    }}
                    placeholder="123456"
                    disabled={isLoading}
                    maxLength={6}
                  />
                ) : (
                  <p className="text-gray-900">{formData.pincode || 'Not provided'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>

            {profile.last_login && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(profile.last_login)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full justify-start">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/auth/reset-password">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
