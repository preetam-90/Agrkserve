'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  IndianRupee,
  Star,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button, Card, CardContent, Badge, Spinner, EmptyState } from '@/components/ui';
import { labourService } from '@/lib/services';
import { useAppStore, useAuthStore } from '@/lib/store';
import { formatCurrency, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function LabourDashboardView() {
  const { sidebarOpen } = useAppStore();
  const { profile } = useAuthStore();

  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [labourProfile, setLabourProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    activeJobs: 0,
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    const supabase = createClient();
    let channel: any = null;

    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
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
        data: { user: currentUser },
      } = await supabase.auth.getUser();

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

      const avgRating = profileData?.rating || 0;

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const statsCards = [
    {
      icon: Users,
      value: stats.totalJobs,
      label: 'Total Jobs',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      trend: '+15%',
      trendUp: true,
    },
    {
      icon: Calendar,
      value: stats.activeJobs,
      label: 'Active Jobs',
      gradient: 'from-emerald-500 to-green-500',
      bgGradient: 'from-emerald-500/10 to-green-500/10',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
      trend: '+5%',
      trendUp: true,
    },
    {
      icon: IndianRupee,
      value: formatCurrency(stats.totalEarnings),
      label: 'Total Earnings',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      trend: '+28%',
      trendUp: true,
    },
    {
      icon: Star,
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
      label: 'Average Rating',
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      trend: '4.9/5',
      trendUp: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="h-16 w-16 animate-pulse rounded-full border-4 border-emerald-500/30 border-t-emerald-500"></div>
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
    <>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl"></div>
          <div
            className="absolute -bottom-32 -left-32 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute right-1/4 top-1/4 h-32 w-32 animate-pulse rounded-full bg-white/5 blur-2xl"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-amber-400/50 blur-xl"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Welcome Back, Labour!
                </h1>
                <p className="text-lg text-blue-100">
                  Manage your work schedule and grow your services
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-3"
            >
              <Button
                onClick={toggleAvailability}
                size="lg"
                className={cn(
                  'group relative overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl',
                  isAvailable
                    ? 'bg-emerald-500/90 text-white hover:bg-emerald-500'
                    : 'bg-red-500/90 text-white hover:bg-red-500'
                )}
              >
                <Users className="mr-2 h-5 w-5" />
                {isAvailable ? 'Available' : 'Unavailable'}
              </Button>
              <Link href="/provider/labour">
                <button className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-white/30 px-8 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/10">
                  <Calendar className="h-5 w-5" />
                  View Schedule
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-50 blur-3xl"></div>
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <Users className="h-16 w-16 text-white/90" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {statsCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
            className="group relative"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-blue-500/20">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              ></div>

              <CardContent className="relative p-6">
                <div className="mb-4 flex items-start justify-between">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`relative rounded-2xl p-4 ${stat.iconBg} shadow-xl transition-transform duration-500`}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-lg"></div>
                    <stat.icon className="relative h-7 w-7 text-white" />
                  </motion.div>

                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </div>
                </div>

                <div className="space-y-1">
                  <motion.p className="text-3xl font-bold tracking-tight text-white transition-transform duration-300 group-hover:scale-105">
                    {stat.value}
                  </motion.p>
                  <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                </div>

                <div className="mt-4 border-t border-gray-700/50 pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last 30 days</span>
                    <motion.div
                      className="text-gray-400 transition-colors group-hover:text-blue-400"
                      whileHover={{ x: 3 }}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pending Job Requests */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 shadow-lg">
              <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
              <AlertCircle className="relative h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Pending Job Requests</h2>
              {pendingJobs.length > 0 && (
                <p className="text-sm text-gray-400">{pendingJobs.length} requests to review</p>
              )}
            </div>
          </div>
          <Link
            href="/provider/labour"
            className="group flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            View All
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {pendingJobs.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-700/50 bg-gray-800/30 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <div className="mb-4 inline-flex rounded-full bg-gray-700/50 p-4">
                <Clock className="h-12 w-12 text-gray-500" />
              </div>
              <p className="font-medium text-gray-400">No pending job requests</p>
              <p className="mt-1 text-sm text-gray-500">New requests will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pendingJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
              >
                <Card className="group relative overflow-hidden border-0 border-l-4 border-l-amber-500 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-x-1 hover:shadow-2xl hover:shadow-amber-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                  <CardContent className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-start gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 transition-transform duration-300 group-hover:scale-110"
                        >
                          <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl"></div>
                          <Users className="relative h-8 w-8 text-amber-400" />
                        </motion.div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-semibold text-white">
                            {job.employer?.full_name || 'Employer'}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="h-4 w-4" />
                            {job.location_name || 'Location'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(job.start_date).toLocaleDateString()} -{' '}
                            {new Date(job.end_date).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Duration: {job.total_days} days • {job.workers_required} workers
                          </p>
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <p className="mb-2 text-2xl font-bold text-emerald-400">
                          {formatCurrency(job.total_amount)}
                        </p>
                        <Link href={`/provider/labour`}>
                          <Button
                            size="sm"
                            className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg hover:from-amber-600 hover:to-orange-600"
                          >
                            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Upcoming Jobs */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 p-2.5 shadow-lg">
              <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
              <Calendar className="relative h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Upcoming Jobs</h2>
              {upcomingJobs.length > 0 && (
                <p className="text-sm text-gray-400">{upcomingJobs.length} jobs scheduled</p>
              )}
            </div>
          </div>
          <Link
            href="/provider/labour/schedule"
            className="group flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            View Schedule
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {upcomingJobs.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-700/50 bg-gray-800/30 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <div className="mb-4 inline-flex rounded-full bg-gray-700/50 p-4">
                <Calendar className="h-12 w-12 text-gray-500" />
              </div>
              <p className="font-medium text-gray-400">No upcoming jobs</p>
              <p className="mt-1 text-sm text-gray-500">Your scheduled jobs will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {upcomingJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
              >
                <Card className="group relative overflow-hidden border-0 border-l-4 border-l-emerald-500 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-x-1 hover:shadow-2xl hover:shadow-emerald-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                  <CardContent className="relative p-5">
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 transition-transform duration-300 group-hover:scale-110"
                      >
                        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-xl"></div>
                        <Users className="relative h-8 w-8 text-emerald-400" />
                      </motion.div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-semibold text-white">
                          {job.employer?.full_name || 'Employer'}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="h-4 w-4" />
                          {job.location_name || 'Location'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(job.start_date).toLocaleDateString()} -{' '}
                          {new Date(job.end_date).toLocaleDateString()}
                        </p>
                      </div>

                      <Badge className={cn('border', getStatusBadgeClass(job.status))}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {[
          {
            href: '/provider/labour/schedule',
            icon: Calendar,
            label: 'Work Schedule',
            gradient: 'from-blue-500 to-indigo-500',
          },
          {
            href: '/provider/earnings',
            icon: BarChart3,
            label: 'Earnings',
            gradient: 'from-purple-500 to-pink-500',
          },
          {
            href: '/provider/labour/reviews',
            icon: Star,
            label: 'Ratings',
            gradient: 'from-amber-500 to-orange-500',
          },
          {
            href: '/provider/labour/availability',
            icon: Users,
            label: 'Availability',
            gradient: 'from-emerald-500 to-green-500',
          },
        ].map((action, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
          >
            <Link href={action.href}>
              <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`relative inline-flex rounded-2xl bg-gradient-to-br p-4 ${action.gradient} mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl"></div>
                    <action.icon className="relative h-6 w-6 text-white" />
                  </motion.div>
                  <p className="font-semibold text-white transition-colors group-hover:text-emerald-400">
                    {action.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
