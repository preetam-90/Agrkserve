'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, IndianRupee, Plus, X, Loader2, Sparkles, Target } from 'lucide-react';
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
} from '@/components/ui';
import { labourService } from '@/lib/services';
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

export default function CreateLabourProfilePage() {
  const router = useRouter();
  const { sidebarOpen } = useAppStore();
  const { user, profile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState({
    skills: [] as string[],
    experience_years: 1,
    daily_rate: '',
    hourly_rate: '',
    bio: '',
    certifications: [] as string[],
    city: '',
    address: '',
    latitude: profile?.latitude || 0,
    longitude: profile?.longitude || 0,
    service_radius_km: 25,
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');

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

        // Try to get address from coordinates
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
          toast.success('Location detected');
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

    if (!user) {
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
      const result = await labourService.create({
        user_id: user.id,
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

      console.log('Profile created successfully:', result);
      toast.success('Labour profile created successfully!');
      router.push('/provider/labour');
    } catch (err) {
      console.error('Failed to create profile:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));

      // Show more specific error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <Link href="/provider/labour">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>

            <div className="mb-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-4 py-1.5 text-sm text-teal-300">
                <Sparkles className="h-4 w-4" />
                Create Your Profile
              </div>
              <h1 className="mb-2 text-4xl font-bold text-white">Labour Profile Setup</h1>
              <p className="text-lg text-slate-400">
                Set up your profile to receive work requests from farmers
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
                  <p className="mt-1 text-sm text-slate-400">Showcase your expertise and qualifications</p>
                </div>

                <div className="p-6 space-y-6">
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
                            'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer',
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
                        <span className="mb-2 block text-sm font-medium text-slate-400">Selected Skills:</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30 px-3 py-1.5 text-sm font-medium text-teal-300"
                            >
                              {skill}
                              <button 
                                type="button" 
                                onClick={() => removeSkill(skill)}
                                className="hover:text-red-400 transition-colors duration-200"
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
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-sm font-medium text-blue-300"
                            >
                              {cert}
                              <button 
                                type="button" 
                                onClick={() => removeCertification(cert)}
                                className="hover:text-red-400 transition-colors duration-200"
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
                  <p className="mt-1 text-sm text-slate-400">Set your competitive rates</p>
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
                  <p className="mt-1 text-sm text-slate-400">Where you provide your services</p>
                </div>

                <div className="p-6 space-y-6">
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
                        📍 Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
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
                  <p className="mt-1 text-sm text-slate-400">Tell farmers what makes you stand out</p>
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
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-teal-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Profile
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
