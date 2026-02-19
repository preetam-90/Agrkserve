'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  IndianRupee,
  Plus,
  X,
  Loader2,
  Save,
  Target,
} from 'lucide-react';
import { Header } from '@/components/layout';
import {
  Button,
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
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { useGeolocation } from '@/hooks/useGeolocation';
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
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLocating, getLocationWithCallback } = useGeolocation();
  const [profileId, setProfileId] = useState<string>('');

  const [formData, setFormData] = useState({
    skills: [] as string[],
    experience_years: 1,
    daily_rate: '',
    hourly_rate: '',
    bio: '',
    certifications: [] as string[],
    city: '',
    address: '',
    latitude: 0,
    longitude: 0,
    service_radius_km: 25,
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    loadProfile();
     
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const profile = await labourService.getByUserId(user.id);
      if (profile) {
        setProfileId(profile.id);
        setFormData({
          skills: profile.skills || [],
          experience_years: profile.experience_years || 1,
          daily_rate: String(profile.daily_rate || ''),
          hourly_rate: profile.hourly_rate ? String(profile.hourly_rate) : '',
          bio: profile.bio || '',
          certifications: profile.certifications || [],
          city: profile.city || '',
          address: profile.address || '',
          latitude: profile.latitude || 0,
          longitude: profile.longitude || 0,
          service_radius_km: profile.service_radius_km || 25,
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

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
    getLocationWithCallback(({ latitude, longitude }) => {
      setFormData((prev) => ({ ...prev, latitude, longitude }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profileId) {
      toast.error('Profile not found');
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
      await labourService.update(profileId, {
        skills: formData.skills,
        experience_years: formData.experience_years,
        daily_rate: Number(formData.daily_rate),
        hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : undefined,
        bio: formData.bio || undefined,
        certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27]">
        <Header />
        <div className="flex">
          <main className="flex-1 p-4 transition-all duration-300 lg:p-6">
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      <Header />

      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-400 hover:bg-slate-800/50 hover:text-white"
              >
                <Link href="/provider/labour">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>

            <div className="mb-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-4 py-1.5 text-sm text-teal-300">
                <Save className="h-4 w-4" />
                Edit Profile
              </div>
              <h1 className="mb-2 text-4xl font-bold text-white">Update Labour Profile</h1>
              <p className="text-lg text-slate-400">
                Keep your profile up to date to attract more opportunities
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Skills Section */}
              <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm">
                <div className="border-b border-slate-700/50 bg-slate-800/30 px-6 py-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <Briefcase className="h-5 w-5 text-teal-400" />
                    Skills &amp; Experience
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Update your expertise and qualifications
                  </p>
                </div>

                <div className="space-y-6 p-6">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-300">
                      Skills <span className="text-red-400">*</span>
                    </label>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {COMMON_SKILLS.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className={cn(
                            'cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200',
                            formData.skills.includes(skill)
                              ? 'border-teal-500/50 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 shadow-lg shadow-teal-500/20'
                              : 'border-slate-600/50 bg-slate-800/50 text-slate-300 hover:border-teal-500/30 hover:bg-slate-700/50'
                          )}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>

                    {formData.skills.length > 0 && (
                      <div className="mb-4 rounded-xl bg-slate-800/50 p-4">
                        <span className="mb-2 block text-sm font-medium text-slate-400">
                          Selected Skills:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-2 rounded-lg border border-teal-500/30 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-3 py-1.5 text-sm font-medium text-teal-300"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="transition-colors duration-200 hover:text-red-400"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
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
                        className="border-slate-600/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addSkill(newSkill)}
                        className="border-slate-600/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-300">
                      Years of Experience
                    </label>
                    <Select
                      value={String(formData.experience_years)}
                      onValueChange={(value) => handleSelectChange('experience_years', value)}
                    >
                      <SelectTrigger className="border-slate-600/50 bg-slate-800/50 text-white focus:border-teal-500/50 focus:ring-teal-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700 bg-slate-800 text-slate-200">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}+ years
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-300">
                      Certifications (Optional)
                    </label>
                    {formData.certifications.length > 0 && (
                      <div className="mb-4 rounded-xl bg-slate-800/50 p-4">
                        <div className="flex flex-wrap gap-2">
                          {formData.certifications.map((cert) => (
                            <span
                              key={cert}
                              className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-sm font-medium text-blue-300"
                            >
                              {cert}
                              <button
                                type="button"
                                onClick={() => removeCertification(cert)}
                                className="transition-colors duration-200 hover:text-red-400"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
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
                        className="border-slate-600/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addCertification}
                        className="border-slate-600/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm">
                <div className="border-b border-slate-700/50 bg-slate-800/30 px-6 py-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <IndianRupee className="h-5 w-5 text-teal-400" />
                    Pricing
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">Update your competitive rates</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-3 block text-sm font-medium text-slate-300">
                        Daily Rate (₹) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          type="number"
                          name="daily_rate"
                          placeholder="e.g., 500"
                          value={formData.daily_rate}
                          onChange={handleInputChange}
                          min="0"
                          className="border-slate-600/50 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-3 block text-sm font-medium text-slate-300">
                        Hourly Rate (₹) - Optional
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          type="number"
                          name="hourly_rate"
                          placeholder="e.g., 75"
                          value={formData.hourly_rate}
                          onChange={handleInputChange}
                          min="0"
                          className="border-slate-600/50 bg-slate-800/50 pl-10 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm">
                <div className="border-b border-slate-700/50 bg-slate-800/30 px-6 py-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <MapPin className="h-5 w-5 text-teal-400" />
                    Location
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Update where you provide your services
                  </p>
                </div>

                <div className="space-y-6 p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-3 block text-sm font-medium text-slate-300">
                        City/Town <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="city"
                        placeholder="Your city or town"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="border-slate-600/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-3 block text-sm font-medium text-slate-300">
                        Address
                      </label>
                      <div className="flex gap-2">
                        <Input
                          name="address"
                          placeholder="Your address (optional)"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="flex-1 border-slate-600/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetLocation}
                          disabled={isLocating}
                          className="border-slate-600/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
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
                    <div className="rounded-lg bg-slate-800/50 p-3">
                      <p className="text-xs text-slate-400">
                        📍 Coordinates: {formData.latitude.toFixed(4)},{' '}
                        {formData.longitude.toFixed(4)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-300">
                      Service Radius (km)
                    </label>
                    <Select
                      value={String(formData.service_radius_km)}
                      onValueChange={(value) => handleSelectChange('service_radius_km', value)}
                    >
                      <SelectTrigger className="border-slate-600/50 bg-slate-800/50 text-white focus:border-teal-500/50 focus:ring-teal-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700 bg-slate-800 text-slate-200">
                        {[5, 10, 15, 25, 50, 75, 100].map((km) => (
                          <SelectItem key={km} value={String(km)}>
                            {km} km
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm">
                <div className="border-b border-slate-700/50 bg-slate-800/30 px-6 py-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <Target className="h-5 w-5 text-teal-400" />
                    About You
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">Update what makes you stand out</p>
                </div>

                <div className="p-6">
                  <Textarea
                    name="bio"
                    placeholder="Tell farmers about yourself, your experience, and what makes you a great worker..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={5}
                    className="border-slate-600/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1 border-slate-600/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 transition-all duration-200 hover:from-teal-600 hover:to-cyan-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
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
