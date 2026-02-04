'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, IndianRupee, Plus, X, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/components/ui';
import { labourService } from '@/lib/services';
import { LabourAvailability, LabourProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppStore, useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const COMMON_SKILLS = [
  'Plowing',
  'Harvesting',
  'Irrigation',
  'Planting',
  'Spraying',
  'Weeding',
  'Fertilizing',
  'Tractor Operation',
  'Harvester Operation',
  'General Farm Work',
  'Animal Husbandry',
  'Pruning',
  'Grafting',
  'Pest Control',
];

export default function EditLabourProfilePage() {
  const router = useRouter();
  const { sidebarOpen } = useAppStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [profile, setProfile] = useState<LabourProfile | null>(null);

  const [formData, setFormData] = useState({
    skills: [] as string[],
    experience_years: 1,
    daily_rate: '',
    hourly_rate: '',
    bio: '',
    certifications: [] as string[],
    availability: 'available' as LabourAvailability,
    city: '',
    address: '',
    latitude: 0,
    longitude: 0,
    service_radius_km: 25,
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const data = await labourService.getByUserId(user.id);
        if (data) {
          setProfile(data);
          setFormData({
            skills: data.skills || [],
            experience_years: data.experience_years || 1,
            daily_rate: String(data.daily_rate || ''),
            hourly_rate: data.hourly_rate ? String(data.hourly_rate) : '',
            bio: data.bio || '',
            certifications: data.certifications || [],
            availability: data.availability || 'available',
            city: data.city || data.location_name || '',
            address: data.address || '',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            service_radius_km: data.service_radius_km || 25,
          });
        } else {
          toast.error('No labour profile found');
          router.push('/provider/labour');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        toast.error('Failed to load profile');
        router.push('/provider/labour');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addCertification = () => {
    if (newCertification && !formData.certifications.includes(newCertification)) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification],
      }));
    }
    setNewCertification('');
  };

  const removeCertification = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== cert),
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            setFormData((prev) => ({
              ...prev,
              city: city || prev.city,
              address: data.display_name || prev.address,
            }));
          }
          toast.success('Location updated');
        } catch {
          toast.success('Coordinates captured');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get location');
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast.error('Please log in first');
      return;
    }

    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    if (!formData.daily_rate) {
      toast.error('Please enter a daily rate');
      return;
    }

    if (!formData.city) {
      toast.error('Please enter your city/town');
      return;
    }

    setIsSubmitting(true);
    try {
      await labourService.update(profile.id, {
        skills: formData.skills,
        experience_years: formData.experience_years,
        daily_rate: Number(formData.daily_rate),
        hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : undefined,
        bio: formData.bio || undefined,
        certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
        availability: formData.availability,
        city: formData.city,
        address: formData.address || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        service_radius_km: formData.service_radius_km,
      });

      toast.success('Profile updated successfully!');
      router.push('/provider/labour');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
            <div className="flex min-h-[400px] items-center justify-center">
              <Spinner size="lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/provider/labour">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Edit Labour Profile</h1>
              <p className="text-gray-600">Update your profile information</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Skills Section */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Briefcase className="h-5 w-5 text-teal-600" />
                    Skills &amp; Experience
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Skills <span className="text-red-500">*</span>
                      </label>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {COMMON_SKILLS.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className={cn(
                              'rounded-full border px-3 py-1 text-sm transition-colors',
                              formData.skills.includes(skill)
                                ? 'border-teal-500 bg-teal-100 text-teal-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-teal-500'
                            )}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>

                      {formData.skills.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="text-sm text-gray-600">Selected:</span>
                          {formData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-1 text-sm text-teal-700"
                            >
                              {skill}
                              <button type="button" onClick={() => removeSkill(skill)}>
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill(newSkill);
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={() => addSkill(newSkill)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Years of Experience
                      </label>
                      <Select
                        value={String(formData.experience_years)}
                        onValueChange={(value) => handleSelectChange('experience_years', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year}+ years
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Certifications (Optional)
                      </label>
                      {formData.certifications.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {formData.certifications.map((cert) => (
                            <span
                              key={cert}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-700"
                            >
                              {cert}
                              <button type="button" onClick={() => removeCertification(cert)}>
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Tractor License, Pesticide Certificate"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCertification();
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={addCertification}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Section */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <IndianRupee className="h-5 w-5 text-teal-600" />
                    Pricing
                  </h2>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Daily Rate (₹) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        name="daily_rate"
                        placeholder="e.g., 500"
                        value={formData.daily_rate}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Hourly Rate (₹) - Optional
                      </label>
                      <Input
                        type="number"
                        name="hourly_rate"
                        placeholder="e.g., 75"
                        value={formData.hourly_rate}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Section */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    Location &amp; Availability
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          City/Town <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="city"
                          placeholder="Your city or town"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <div className="flex gap-2">
                          <Input
                            name="address"
                            placeholder="Your address (optional)"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                          >
                            {isLocating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    {formData.latitude !== 0 && (
                      <p className="text-xs text-gray-500">
                        Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Service Radius (km)
                        </label>
                        <Select
                          value={String(formData.service_radius_km)}
                          onValueChange={(value) => handleSelectChange('service_radius_km', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 15, 25, 50, 75, 100].map((km) => (
                              <SelectItem key={km} value={String(km)}>
                                {km} km
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Availability Status
                        </label>
                        <Select
                          value={formData.availability}
                          onValueChange={(value) => handleSelectChange('availability', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="unavailable">Unavailable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bio Section */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">About You</h2>
                  <Textarea
                    name="bio"
                    placeholder="Tell farmers about yourself, your experience, and what makes you a great worker..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
