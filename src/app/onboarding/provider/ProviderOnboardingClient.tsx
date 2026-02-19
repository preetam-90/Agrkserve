'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tractor,
  CheckCircle,
  ArrowRight,
  Upload,
  DollarSign,
  Calendar,
  MapPin,
} from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Add Your Equipment',
    description: 'Upload photos and details of your agricultural equipment',
    action: 'Go to Equipment',
    href: '/provider/equipment',
  },
  {
    icon: DollarSign,
    title: 'Set Your Prices',
    description: 'Define rental rates per hour or per day',
    action: 'Set Pricing',
    href: '/provider/equipment',
  },
  {
    icon: Calendar,
    title: 'Manage Availability',
    description: 'Set when your equipment is available for rent',
    action: 'Set Schedule',
    href: '/provider/equipment',
  },
  {
    icon: MapPin,
    title: 'Add Location',
    description: 'Help renters find equipment near them',
    action: 'Update Profile',
    href: '/profile',
  },
];

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push('/provider/equipment');
  };

  const handleSkip = () => {
    router.push('/provider/dashboard');
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
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-emerald-500/10 p-4">
            <Tractor className="h-12 w-12 text-emerald-500" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-[#F8FAFC]">
            Welcome, Equipment Provider! 🚜
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#94A3B8]">
            You&apos;re now registered as an Equipment Provider. Let&apos;s get your equipment
            listed and start earning!
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mb-12 grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-[#1E293B] bg-[#0F172A]/80 transition-all hover:border-emerald-500/30">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-emerald-500/10 p-3">
                        <Icon className="h-6 w-6 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-[#F8FAFC]">{step.title}</CardTitle>
                        <CardDescription className="mt-1 text-[#94A3B8]">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => router.push(step.href)}
                    >
                      {step.action}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits */}
        <Card className="mb-8 border-[#1E293B] bg-[#0F172A]/80">
          <CardHeader>
            <CardTitle className="text-[#F8FAFC]">What You Can Do</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'List unlimited equipment for rent',
                'Set your own pricing and availability',
                'Receive booking requests from farmers',
                'Track your earnings and bookings',
                'Build your reputation with reviews',
                'Manage everything from your dashboard',
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-[#94A3B8]">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white hover:from-[#166534] hover:to-[#16A34A]"
            onClick={handleGetStarted}
          >
            <Tractor className="mr-2 h-5 w-5" />
            Add Your First Equipment
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
            onClick={handleSkip}
          >
            I&apos;ll Do This Later
          </Button>
        </div>
      </div>
    </div>
  );
}
