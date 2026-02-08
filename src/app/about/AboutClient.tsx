'use client';

import React, { useRef, useState, useEffect } from 'react';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { BackButton } from '@/components/ui/back-button';

import {
  Tractor,
  Users,
  Wrench,
  Leaf,
  Shield,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Heart,
  Zap,
  IndianRupee,
  Linkedin as LinkedinIcon,
  Twitter as TwitterIcon,
  Mail,
  ChevronRight,
  Sprout,
  Truck,
  UserCheck,
  Search,
  Handshake,
  Sparkles,
  Loader2,
} from 'lucide-react';

import { adminService } from '@/lib/services/admin-service';
import type { PlatformAnalytics } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  profile_image?: string;
}

// AboutPage JSON-LD for SEO
const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: "About AgriServe - India's Trusted Agricultural Equipment Rental Platform",
  description:
    'Learn about AgriServe - empowering farmers across India with quality agricultural equipment rental and skilled labor hiring services.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app'}/about`,
  inLanguage: 'en-IN',
  author: {
    '@type': 'Organization',
    name: 'AgriServe',
    url: 'https://agriserve.in',
    description: "India's leading agricultural equipment rental and labor hiring platform",
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app'}/logo.png`,
    },
    foundingDate: '2024',
    areaServed: {
      '@type': 'Place',
      name: 'India',
      containsPlace: [
        { '@type': 'Place', name: 'Maharashtra' },
        { '@type': 'Place', name: 'Karnataka' },
        { '@type': 'Place', name: 'Tamil Nadu' },
        { '@type': 'Place', name: 'Gujarat' },
        { '@type': 'Place', name: 'Punjab' },
        { '@type': 'Place', name: 'Haryana' },
        { '@type': 'Place', name: 'Uttar Pradesh' },
      ],
    },
    serviceArea: {
      '@type': 'Place',
      name: 'India',
      description: 'Serving farmers across all major agricultural states',
    },
    sameAs: [
      'https://facebook.com/agriserve',
      'https://twitter.com/agriserve',
      'https://instagram.com/agriserve',
      'https://linkedin.com/company/agriserve',
    ],
  },
  mainEntity: {
    '@type': 'Organization',
    name: 'AgriServe',
    description:
      'AgriServe is dedicated to revolutionizing agriculture in India by providing easy access to modern farming equipment and skilled agricultural labor.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app'}/logo.png`,
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app'}/about-image.jpg`,
    foundingDate: '2024',
    foundingLocation: 'Bangalore, Karnataka, India',
    areaServed: 'India',
    mission:
      'Empowering farmers across India with quality agricultural equipment and skilled labor',
    values: ['Farmer First', 'Quality', 'Affordability', 'Sustainability'],
    services: [
      {
        '@type': 'Service',
        name: 'Equipment Rental',
        description:
          'Access a wide range of agricultural machinery from tractors to harvesters at affordable rates',
      },
      {
        '@type': 'Service',
        name: 'Labor Hiring',
        description:
          'Connect with skilled agricultural workers for seasonal and permanent positions',
      },
    ],
  },
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animated Counter Component
function AnimatedCounter({
  end,
  duration = 2,
  suffix = '',
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className="text-4xl font-bold text-white">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

// Section Wrapper Component
function SectionWrapper({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Hero Section
function HeroSection() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsData, profilesData] = await Promise.all([
          adminService.getAnalytics(),
          fetchUserProfiles(),
        ]);
        setAnalytics(analyticsData);
        setUserProfiles(profilesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function fetchUserProfiles(): Promise<UserProfile[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, profile_image')
        .not('profile_image', 'is', null)
        .limit(4);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch user profiles:', error);
      return [];
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
      <div className="absolute left-6 top-6 z-20">
        <BackButton variant="minimal" />
      </div>
      {/* Background Image */}
      <div className="absolute inset-0 z-0"></div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full blur-[150px]"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ backgroundColor: 'rgba(20, 184, 166, 0.25)' }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px]"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMDQgMEgwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span>India&apos;s #1 Agri-Rental Platform</span>
              </motion.div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl"
            >
              Empowering{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Farmers
              </span>{' '}
              Across India
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl leading-relaxed text-gray-200">
              AgriServe is revolutionizing agriculture by providing easy access to modern farming
              equipment and skilled agricultural labor. We believe every farmer deserves the tools
              to maximize productivity and profitability.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link href="/equipment">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-yellow-500/30 transition-all hover:shadow-xl hover:shadow-yellow-500/40"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link href="/how-it-works">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Learn More
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            ) : (
              <>
                <motion.div variants={scaleIn} className="grid gap-4 sm:grid-cols-2">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-full bg-green-500/20 p-3">
                        <Users className="h-6 w-6 text-green-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">Happy Farmers</span>
                    </div>
                    <AnimatedCounter end={analytics?.total_users || 0} suffix="+" />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-full bg-blue-500/20 p-3">
                        <Tractor className="h-6 w-6 text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">Equipment</span>
                    </div>
                    <AnimatedCounter end={analytics?.total_equipment || 0} suffix="+" />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-full bg-purple-500/20 p-3">
                        <UserCheck className="h-6 w-6 text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">Skilled Labor</span>
                    </div>
                    <AnimatedCounter end={analytics?.total_labour || 0} suffix="+" />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-full bg-orange-500/20 p-3">
                        <MapPin className="h-6 w-6 text-orange-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">Bookings</span>
                    </div>
                    <AnimatedCounter end={analytics?.total_bookings || 0} suffix="+" />
                  </motion.div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 backdrop-blur-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {userProfiles.length > 0
                        ? userProfiles.map((user, i) => (
                            <motion.div
                              key={user.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="h-10 w-10 overflow-hidden rounded-full border-2 border-white"
                            >
                              {user.profile_image ? (
                                <Image
                                  src={user.profile_image}
                                  alt={user.name}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 text-xs font-bold text-white">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </motion.div>
                          ))
                        : [1, 2, 3, 4].map((i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-blue-500"
                            />
                          ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Join {analytics?.total_users || 0}+ farmers
                      </p>
                      <p className="text-xs text-gray-300">Already using AgriServe</p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronRight className="h-8 w-8 rotate-90 text-white/50" />
      </motion.div>
    </section>
  );
}

// How It Works Section
const HowItWorksSection = React.memo(function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'renter' | 'provider' | 'labor'>('renter');

  const renterSteps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: 'Search Equipment',
      description: 'Browse through thousands of verified equipment listings across India',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Book Online',
      description: 'Select your dates, compare prices, and book instantly',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Get Delivered',
      description: 'Equipment delivered to your farm on time, every time',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <CheckCircle2 className="h-8 w-8" />,
      title: 'Complete & Review',
      description: 'Complete your rental and leave a review for the provider',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const providerSteps = [
    {
      icon: <Wrench className="h-8 w-8" />,
      title: 'List Equipment',
      description: 'Add your equipment with photos, pricing, and availability',
      color: 'from-emerald-500 to-green-500',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Get Verified',
      description: 'Complete verification to build trust with renters',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: <Handshake className="h-8 w-8" />,
      title: 'Receive Bookings',
      description: 'Get booking requests and manage your schedule easily',
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: <IndianRupee className="h-8 w-8" />,
      title: 'Earn Money',
      description: 'Receive payments securely and grow your business',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const laborSteps = [
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: 'Create Profile',
      description: 'List your skills, experience, and availability to get hired',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Get Verified',
      description: 'Complete identity verification to build trust with farmers',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: <Handshake className="h-8 w-8" />,
      title: 'Get Hired',
      description: 'Receive job offers directly from farmers in your area',
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: <IndianRupee className="h-8 w-8" />,
      title: 'Get Paid',
      description: 'Receive secure daily or weekly payments for your work',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <SectionWrapper className="bg-gradient-to-b from-white to-gray-50 py-24 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800"
          >
            <Zap className="h-4 w-4" />
            <span>Simple Process</span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-4xl font-bold text-gray-900 dark:text-white"
          >
            How It Works
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400"
          >
            Get started in minutes with our simple and intuitive platform
          </motion.p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-12 flex justify-center"
        >
          <div className="inline-flex rounded-full bg-gray-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('renter')}
              className={`rounded-full px-8 py-3 text-sm font-semibold transition-all ${
                activeTab === 'renter'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              For Renters
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`rounded-full px-8 py-3 text-sm font-semibold transition-all ${
                activeTab === 'provider'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              For Providers
            </button>
            <button
              onClick={() => setActiveTab('labor')}
              className={`rounded-full px-8 py-3 text-sm font-semibold transition-all ${
                activeTab === 'labor'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              For Labor
            </button>
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {(activeTab === 'renter'
            ? renterSteps
            : activeTab === 'provider'
              ? providerSteps
              : laborSteps
          ).map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className="absolute -left-4 -top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-lg font-bold text-white shadow-lg">
                {index + 1}
              </div>
              <motion.div
                className="relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 transition-opacity group-hover:opacity-10`}
                />
                <div
                  className={`inline-flex rounded-xl bg-gradient-to-br ${step.color} mb-6 p-4 text-white shadow-lg`}
                >
                  {step.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
});

// What We Do Section
const WhatWeDoSection = React.memo(function WhatWeDoSection() {
  const services = [
    {
      icon: <Tractor className="h-12 w-12" />,
      title: 'Equipment Rental',
      description:
        'Access a wide range of agricultural machinery from tractors to harvesters at affordable rates. All equipment is verified and well-maintained.',
      features: ['Tractors', 'Harvesters', 'Tillers', 'Sprayers', 'Trucks & Trailers'],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: 'Labor Hiring',
      description:
        'Connect with skilled agricultural workers for seasonal and permanent positions. Find experienced labor for all your farming needs.',
      features: ['Skilled Workers', 'Seasonal Labor', 'Machine Operators', 'Farm Supervisors'],
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
  ];

  return (
    <SectionWrapper className="bg-gradient-to-b from-gray-50 to-white py-24 dark:from-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
          >
            <Sprout className="h-4 w-4" />
            <span>Our Services</span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-4xl font-bold text-gray-900 dark:text-white"
          >
            What We Do
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400"
          >
            Comprehensive solutions for all your agricultural equipment and labor needs
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-8 lg:grid-cols-2"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={index === 0 ? fadeInLeft : fadeInRight}
              whileHover={{ y: -10 }}
              className="group"
            >
              <motion.div
                className={`relative h-full rounded-3xl ${service.bgColor} overflow-hidden border border-gray-200 p-8 lg:p-12 dark:border-slate-700`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className={`absolute right-0 top-0 h-64 w-64 bg-gradient-to-br ${service.color} rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20`}
                />
                <div className="relative">
                  <motion.div
                    className={`inline-flex rounded-2xl bg-gradient-to-br ${service.color} mb-6 p-4 text-white shadow-xl`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {service.icon}
                  </motion.div>
                  <h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                    {service.title}
                  </h3>
                  <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                  <div className="space-y-3">
                    <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                      Includes:
                    </p>
                    {service.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
});

// Mission Section
const MissionSection = React.memo(function MissionSection() {
  return (
    <SectionWrapper className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full w-full"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          <motion.div variants={fadeInLeft} className="space-y-8">
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Heart className="h-4 w-4" />
                <span>Our Purpose</span>
              </div>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold leading-tight text-white">
              Our Mission
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl leading-relaxed text-white/90">
              AgriServe is dedicated to revolutionizing agriculture in India by providing easy
              access to modern farming equipment and skilled agricultural labor. We believe that
              every farmer deserves access to the tools and expertise needed to maximize their
              productivity and profitability.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link href="/equipment">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-green-600 shadow-lg transition-all hover:shadow-xl"
                >
                  Join Our Mission
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInRight} className="relative">
            <motion.div
              className="relative rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-md lg:p-12"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="grid gap-6">
                {[
                  {
                    icon: <TrendingUp className="h-8 w-8" />,
                    title: 'Increase Productivity',
                    desc: 'Access modern equipment to boost farm output',
                  },
                  {
                    icon: <DollarSign className="h-8 w-8" />,
                    title: 'Reduce Costs',
                    desc: 'Rent instead of buying expensive machinery',
                  },
                  {
                    icon: <Award className="h-8 w-8" />,
                    title: 'Quality Assured',
                    desc: 'All equipment and labor verified',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="rounded-xl bg-white/20 p-3 text-white">{item.icon}</div>
                    <div>
                      <h4 className="mb-1 text-lg font-semibold text-white">{item.title}</h4>
                      <p className="text-white/80">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
});

// Values Section
const ValuesSection = React.memo(function ValuesSection() {
  const values = [
    {
      icon: <Heart className="h-10 w-10" />,
      title: 'Farmer First',
      description:
        "We prioritize the needs of farmers in everything we do. Every decision is made with the farmer's best interest at heart.",
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: 'Quality',
      description:
        'We ensure all equipment is well-maintained and reliable. Every piece of machinery undergoes thorough inspection.',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: <DollarSign className="h-10 w-10" />,
      title: 'Affordability',
      description:
        "Fair pricing that makes modern farming accessible to all. We believe quality equipment shouldn't break the bank.",
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Leaf className="h-10 w-10" />,
      title: 'Sustainability',
      description:
        'Promoting eco-friendly farming practices and supporting sustainable agriculture for future generations.',
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  return (
    <SectionWrapper className="bg-gradient-to-b from-white to-gray-50 py-24 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800"
          >
            <Award className="h-4 w-4" />
            <span>Our Core Values</span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-4xl font-bold text-gray-900 dark:text-white"
          >
            What We Stand For
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400"
          >
            The principles that guide everything we do
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {values.map((value, index) => (
            <motion.div key={index} variants={fadeInUp} whileHover={{ y: -10 }} className="group">
              <motion.div
                className="relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className={`absolute right-0 top-0 h-48 w-48 bg-gradient-to-br ${value.color} rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-10`}
                />
                <div className="relative">
                  <motion.div
                    className={`inline-flex rounded-2xl bg-gradient-to-br ${value.color} mb-6 p-4 text-white shadow-xl`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {value.icon}
                  </motion.div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
});

// Team Section
const TeamSection = React.memo(function TeamSection() {
  const team = [
    {
      name: 'Anubhav',
      role: 'Founder & CEO',
      image:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=2574',
      bio: 'Former agricultural engineer with 15+ years of experience in farm mechanization.',
      social: { linkedin: '#', twitter: '#' },
    },
    {
      name: 'Nancy',
      role: 'COO',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=2576',
      bio: 'Operations expert with a passion for connecting farmers with the right resources.',
      social: { linkedin: '#', twitter: '#' },
    },
    {
      name: 'Saurabh',
      role: 'CTO',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=2670',
      bio: 'Tech visionary building scalable solutions for agricultural challenges.',
      social: { linkedin: '#', twitter: '#' },
    },
    {
      name: 'Kuldeep',
      role: 'Head of Operations',
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=2661',
      bio: 'Agricultural scientist focused on quality assurance and farmer support.',
      social: { linkedin: '#', twitter: '#' },
    },
  ];

  return (
    <SectionWrapper className="bg-gradient-to-b from-white to-gray-50 py-24 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-800"
          >
            <Users className="h-4 w-4" />
            <span>Meet the Team</span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-4xl font-bold text-gray-900 dark:text-white"
          >
            The People Behind AgriServe
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400"
          >
            A passionate team dedicated to transforming Indian agriculture
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {team.map((member, index) => (
            <motion.div key={index} variants={fadeInUp} whileHover={{ y: -10 }} className="group">
              <motion.div
                className="relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-10" />
                <div className="relative">
                  <motion.div
                    className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-green-400 to-blue-500 shadow-xl dark:border-slate-700"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                  <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="mb-3 text-sm font-semibold text-green-600 dark:text-green-400">
                    {member.role}
                  </p>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {member.bio}
                  </p>
                  <div className="flex justify-center gap-3">
                    <motion.a
                      href={member.social.linkedin}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    >
                      <LinkedinIcon className="h-4 w-4" />
                    </motion.a>
                    <motion.a
                      href={member.social.twitter}
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    >
                      <TwitterIcon className="h-4 w-4" />
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
});

// CTA Section
const CTASection = React.memo(function CTASection() {
  return (
    <SectionWrapper className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full blur-[150px]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full blur-[120px]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
          >
            Ready to Transform Your Farming?
          </motion.h2>
          <motion.p variants={fadeInUp} className="mx-auto max-w-2xl text-xl text-white/90">
            Join thousands of farmers across India who are already using AgriServe to access quality
            equipment and skilled labor.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
            <Link href="/equipment">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-green-600 shadow-lg transition-all hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Contact Sales
                <Mail className="h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
});

// Main About Page Component
export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <div className="min-h-screen">
        <HeroSection />
        <HowItWorksSection />
        <WhatWeDoSection />
        <MissionSection />
        <ValuesSection />
        <TeamSection />
        <CTASection />
      </div>
    </>
  );
}
