'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, CheckCircle, User, DollarSign, Award, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const commonSkills = [
  'Tractor Operator',
  'Harvester Operator',
  'Planting',
  'Irrigation',
  'Pesticide Spraying',
  'Pruning',
  'Weeding',
  'General Labour',
  'Livestock Care',
  'Loading/Unloading',
];

export default function LabourOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    skills: [] as string[],
    experience_years: '',
    daily_rate: '',
    hourly_rate: '',
    bio: '',
  });

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.skills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    if (!formData.daily_rate) {
      toast.error('Please set your daily rate');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/labour/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          daily_rate: parseFloat(formData.daily_rate),
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          experience_years: parseInt(formData.experience_years) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create labour profile');
      }

      toast.success('Labour profile created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating labour profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="minimal" fallbackUrl="/settings/roles" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-amber-500/10 p-4">
            <Briefcase className="h-12 w-12 text-amber-500" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-[#F8FAFC]">
            Welcome, Agricultural Worker! 👨‍🌾
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#94A3B8]">
            You&apos;re now registered as Agricultural Labour. Let&apos;s set up your profile so
            farmers can find and hire you!
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skills Selection */}
          <Card className="border-[#1E293B] bg-[#0F172A]/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                <Award className="h-5 w-5 text-amber-500" />
                Your Skills
              </CardTitle>
              <CardDescription className="text-[#94A3B8]">
                Select all skills that apply to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {commonSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-lg border p-3 text-sm transition-all ${
                      formData.skills.includes(skill)
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        : 'border-[#1E293B] bg-[#1E293B]/30 text-[#94A3B8] hover:border-amber-500/30'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience & Rates */}
          <Card className="border-[#1E293B] bg-[#0F172A]/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                <DollarSign className="h-5 w-5 text-amber-500" />
                Experience & Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="experience" className="text-[#F8FAFC]">
                  Years of Experience
                </Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  placeholder="e.g., 5"
                  value={formData.experience_years}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, experience_years: e.target.value }))
                  }
                  className="border-[#1E293B] bg-[#1E293B]/30 text-[#F8FAFC]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="daily_rate" className="text-[#F8FAFC]">
                    Daily Rate (₹) *
                  </Label>
                  <Input
                    id="daily_rate"
                    type="number"
                    min="0"
                    placeholder="e.g., 800"
                    value={formData.daily_rate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, daily_rate: e.target.value }))
                    }
                    className="border-[#1E293B] bg-[#1E293B]/30 text-[#F8FAFC]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hourly_rate" className="text-[#F8FAFC]">
                    Hourly Rate (₹) <span className="text-[#64748B]">(Optional)</span>
                  </Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    placeholder="e.g., 100"
                    value={formData.hourly_rate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, hourly_rate: e.target.value }))
                    }
                    className="border-[#1E293B] bg-[#1E293B]/30 text-[#F8FAFC]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-[#1E293B] bg-[#0F172A]/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                <User className="h-5 w-5 text-amber-500" />
                About You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Tell farmers about your experience and what makes you a great worker..."
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                className="min-h-[120px] border-[#1E293B] bg-[#1E293B]/30 text-[#F8FAFC]"
              />
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-[#1E293B] bg-[#0F172A]/80">
            <CardHeader>
              <CardTitle className="text-[#F8FAFC]">What You Get</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  'Get hired directly by farmers',
                  'Set your own rates',
                  'Build your reputation with reviews',
                  'Manage your bookings easily',
                  'Receive notifications for new opportunities',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-[#94A3B8]">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Complete Setup
                </>
              )}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
              onClick={handleSkip}
              disabled={isLoading}
            >
              I&apos;ll Do This Later
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
