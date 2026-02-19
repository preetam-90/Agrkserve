'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Star,
  ChevronRight,
  Clock,
  TrendingUp,
  MapPin,
  CheckSquare,
  ClipboardList,
  FileText,
  Map as MapIcon,
} from 'lucide-react';
import { Button, Card, CardContent, Badge, Spinner, Switch } from '@/components/ui';
import { labourService } from '@/lib/services';
import { useAppStore, useAuthStore } from '@/lib/store';
import { formatCurrency, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { InitialData, LabourProfile, LabourBooking } from '@/lib/types';

interface LabourInitialData extends InitialData {
  labourProfile?: LabourProfile;
}

interface LabourDashboardProps {
  initialData?: LabourInitialData;
}

export function LabourDashboardView({ initialData }: LabourDashboardProps) {
  // sidebarOpen intentionally destructured but unused - kept for future sidebar toggle feature
  const { sidebarOpen: _sidebarOpen } = useAppStore();
  const { profile } = useAuthStore();

  // Seed state from SSR data if available
  const hasSSRData = initialData?.labourProfile || initialData?.labourBookings;

  const [pendingJobs, setPendingJobs] = useState<LabourBooking[]>(() => {
    if (hasSSRData) {
      return (initialData.labourBookings || [])
        .filter((b: LabourBooking) => b.status === 'pending')
        .slice(0, 5);
    }
    return [];
  });
   
  const [_upcomingJobs, setUpcomingJobs] = useState<LabourBooking[]>(() => {
    if (hasSSRData) {
      return (initialData.labourBookings || [])
        .filter((b: LabourBooking) => ['confirmed', 'in_progress'].includes(b.status))
        .slice(0, 4);
    }
    return [];
  });
   
  const [_completedJobs, setCompletedJobs] = useState<unknown[]>(() => {
    if (hasSSRData) {
      return (initialData.labourBookings || [])
        .filter((b: LabourBooking) => b.status === 'completed')
        .slice(0, 3);
    }
    return [];
  });
   
  const [_labourProfile, setLabourProfile] = useState<unknown>(
    hasSSRData ? initialData.labourProfile : null
  );
  const [stats, setStats] = useState(() => {
    if (hasSSRData) {
      const jobs = initialData.labourBookings || [];
      const completed = jobs.filter((b: LabourBooking) => b.status === 'completed');
      const upcoming = jobs.filter((b: LabourBooking) =>
        ['confirmed', 'in_progress'].includes(b.status)
      );
      const totalEarnings = completed.reduce(
        (sum: number, b: LabourBooking) => sum + (b.total_amount || 0),
        0
      );
      const avgRating = initialData.labourProfile?.average_rating || 0;
      return {
        totalJobs: jobs.length,
        totalEarnings,
        averageRating: avgRating,
        activeJobs: upcoming.length,
      };
    }
    return { totalJobs: 0, totalEarnings: 0, averageRating: 0, activeJobs: 0 };
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(!hasSSRData);

  useEffect(() => {
    // Skip initial fetch if SSR data was provided
    if (!hasSSRData) {
      loadDashboardData();
    }

    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user;
        if (!currentUser) return;

        channel = supabase
          .channel('labour-dashboard-bookings')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'labour_bookings',
            },
            async () => {
              loadDashboardData();
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to setup labour dashboard subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
     
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) return;

      const { data: profileData } = await supabase
        .from('labour_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      setLabourProfile(profileData);

      const jobsResult = await labourService.getMyBookings();

      const pending = jobsResult.filter((b) => b.status === 'pending');
      const upcoming = jobsResult.filter((b) => ['confirmed', 'in_progress'].includes(b.status));
      const completed = jobsResult.filter((b) => b.status === 'completed');

      setPendingJobs(pending.slice(0, 5));
      setUpcomingJobs(upcoming.slice(0, 4));
      setCompletedJobs(completed.slice(0, 3));

      const totalEarnings = completed.reduce((sum, b) => sum + b.total_amount, 0);

      const avgRating = profileData?.average_rating || 0;

      setStats({
        totalJobs: jobsResult.length,
        totalEarnings,
        averageRating: avgRating,
        activeJobs: upcoming.length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      setIsAvailable(newStatus);
      console.log('Availability toggled to:', newStatus);
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const reviewCount =
    (initialData?.labourProfile as LabourProfile | undefined)?.review_count ?? 124;

  // Format date to short month format like "Oct 12"
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="h-16 w-16 animate-pulse rounded-full border-4 border-[#22c55e]/30 border-t-[#22c55e]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          </div>
          <p className="mt-6 text-sm font-medium text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#0a0f0c] p-6 text-gray-100">
      {/* ── 1. HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Labour Provider Dashboard</h1>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-gray-500">
            WELCOME BACK, {profile?.name?.toUpperCase() || 'RAJESH'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Available for Hire toggle */}
          <div className="flex items-center gap-3 rounded-full border border-[#1a2520] px-4 py-2">
            <span className="text-sm font-medium text-white">Available for Hire</span>
            <Switch
              checked={isAvailable}
              onCheckedChange={toggleAvailability}
              className="border-[#1a2520] data-[state=checked]:bg-[#22c55e]"
            />
          </div>
        </div>
      </motion.div>

      {/* ── 2. STATS CARDS ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: Total Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden rounded-xl border border-[#1a2520] bg-[#0f1a14] shadow-lg">
            <CardContent className="flex items-start justify-between p-6">
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                <p className="text-4xl font-bold tracking-tight text-white">
                  {formatCurrency(stats.totalEarnings)}
                </p>
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#22c55e]">
                  <TrendingUp className="h-4 w-4" />
                  +12% from last month
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a2520]">
                <FileText className="h-6 w-6 text-[#22c55e]" />
              </div>
            </CardContent>

            {/* Large Watermark FileText */}
            <div className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 opacity-5">
              <FileText className="h-24 w-24 text-[#22c55e]" />
            </div>
          </Card>
        </motion.div>

        {/* Card 2: Active Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden rounded-xl border border-[#1a2520] bg-[#0f1a14] shadow-lg">
            <CardContent className="flex items-start justify-between p-6">
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-400">Active Bookings</p>
                <p className="text-4xl font-bold tracking-tight text-white">{stats.activeJobs}</p>
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#22c55e]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#22c55e]"></span>
                  Live and Upcoming
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a2520]">
                <CheckSquare className="h-6 w-6 text-[#22c55e]" />
              </div>
            </CardContent>

            {/* Large Watermark CheckSquare */}
            <div className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 opacity-5">
              <CheckSquare className="h-24 w-24 text-[#22c55e]" />
            </div>
          </Card>
        </motion.div>

        {/* Card 3: Avg. Rating */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden rounded-xl border border-[#1a2520] bg-[#0f1a14] shadow-lg">
            <CardContent className="relative z-10 flex h-full flex-col justify-between p-6">
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-400">Avg. Rating</p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold tracking-tight text-white">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '4.8'}
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          'h-4 w-4',
                          s <= Math.round(stats.averageRating || 4.8)
                            ? 'fill-[#22c55e] text-[#22c55e]'
                            : 'fill-gray-700 text-gray-700'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500">Based on {reviewCount} reviews</p>
              </div>
            </CardContent>

            {/* Large Watermark Star */}
            <div className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 opacity-5">
              <Star className="h-24 w-24 fill-[#22c55e] text-[#22c55e]" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── 3. PENDING BOOKING REQUESTS ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="overflow-hidden rounded-xl border border-[#1a2520] bg-[#0f1a14]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1a2520] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a2520]">
                <ClipboardList className="h-5 w-5 text-[#22c55e]" />
              </div>
              <h2 className="text-lg font-bold text-white">Pending Booking Requests</h2>
            </div>
            {pendingJobs.length > 0 && (
              <Badge
                variant="outline"
                className="rounded-full bg-[#22c55e] px-3 py-0.5 text-xs font-bold text-black"
              >
                {pendingJobs.length} NEW
              </Badge>
            )}
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#1a2520]">
            {pendingJobs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a2520]">
                  <Clock className="h-8 w-8 text-[#4a6d52]" />
                </div>
                <p className="font-medium text-gray-400">No pending job requests</p>
              </div>
            ) : (
              pendingJobs.map((job) => (
                <div
                  key={job.id}
                  className="group flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-[#1a2520] sm:flex-row sm:items-center"
                >
                  {/* Avatar + Name + Location */}
                  <div className="flex min-w-[200px] flex-1 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#1a2520] bg-[#1a2520]">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">
                        {job.employer?.name || 'Gopal Deshmukh'}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5 text-[#22c55e]" />
                        {job.labour?.location_name || job.labour?.city || 'Nashik, Maharashtra'}
                      </p>
                    </div>
                  </div>

                  {/* Booking Dates */}
                  <div className="min-w-[150px] flex-1">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      BOOKING DATES
                    </p>
                    <div className="flex items-center gap-2 font-medium text-white">
                      <Calendar className="h-4 w-4 text-[#22c55e]" />
                      {formatShortDate(job.start_date)} - {formatShortDate(job.end_date)}
                    </div>
                  </div>

                  {/* Work Force (mapped from duration as requested) */}
                  <div className="min-w-[120px] flex-1">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      WORK FORCE
                    </p>
                    <div className="font-bold text-white">{job.total_days || 12} Members</div>
                  </div>

                  {/* Actions */}
                  <div className="ml-auto flex items-center gap-3">
                    <Link href="/provider/labour">
                      <Button className="h-10 rounded-lg bg-[#22c55e] px-6 font-medium text-black hover:bg-[#16a34a]">
                        Accept
                      </Button>
                    </Link>
                    <Link href="/provider/labour">
                      <Button
                        variant="outline"
                        className="h-10 rounded-lg border border-[#3a4d42] bg-transparent px-6 text-gray-400 hover:bg-[#2a3d32]"
                      >
                        Reject
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {pendingJobs.length > 0 && (
            <div className="border-t border-[#1a2520] bg-[#14241c] py-3 text-center">
              <Link
                href="/provider/labour"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#22c55e]"
              >
                View All Requests <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── 4. BOTTOM SECTION (2 Cards) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Earnings Hotspots */}
        <Card className="relative overflow-hidden rounded-xl border border-[#1a2520] bg-[#0f1a14]">
          <CardContent className="p-6">
            <h3 className="mb-2 text-lg font-bold text-white">Earnings Hotspots</h3>
            <p className="max-w-[80%] text-sm leading-relaxed text-gray-400">
              Demand is currently high in Punjab and Maharashtra regions.
            </p>

            {/* Large stylized icon on right */}
            <div className="pointer-events-none absolute bottom-4 right-4 opacity-10">
              <MapIcon className="h-20 w-20 text-[#22c55e]" />
            </div>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card className="overflow-hidden rounded-xl border border-[#1a2520] bg-[#0f1a14]">
          <CardContent className="p-6">
            <h3 className="mb-2 text-lg font-bold text-white">Platform Performance</h3>
            <p className="mb-6 text-sm text-gray-400">
              You are in the top 5% of providers in your region.
            </p>

            {/* Bar Chart Visualization */}
            <div className="mt-auto flex h-24 items-end justify-between gap-2">
              {[30, 45, 35, 60, 50, 75, 65, 90].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
                  className={cn(
                    'w-full rounded-t-sm opacity-80',
                    // Green gradient effect from left (darker) to right (brighter)
                    i < 4 ? 'bg-[#1a4d32]' : 'bg-[#22c55e]'
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
