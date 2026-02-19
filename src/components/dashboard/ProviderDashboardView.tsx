'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Tractor,
  Calendar,
  IndianRupee,
  Star,
  ChevronRight,
  Clock,
  Eye,
  Package,
  Users,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Award,
  BarChart3,
} from 'lucide-react';
import { Button, Card, CardContent, Badge, Spinner } from '@/components/ui';
import { equipmentService, bookingService, labourService } from '@/lib/services';
import { useAppStore } from '@/lib/store';
import { Equipment, Booking, InitialData, LabourBooking } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProviderDashboardProps {
  initialData?: InitialData;
}

export const ProviderDashboardView = React.memo(function ProviderDashboardView({
  initialData,
}: ProviderDashboardProps) {
   
  const { sidebarOpen } = useAppStore();

  // Seed state from SSR data if available
  const hasSSRData = !!(initialData?.equipment || initialData?.bookings);

  const [myEquipment, setMyEquipment] = useState<Equipment[]>(
    hasSSRData ? (initialData?.equipment || []).slice(0, 4) : []
  );
  const [pendingBookings, setPendingBookings] = useState<Booking[]>(() => {
    if (hasSSRData) {
      return (initialData?.bookings || []).filter((b) => b.status === 'pending').slice(0, 5);
    }
    return [];
  });
  const [pendingLabourBookings, setPendingLabourBookings] = useState<LabourBooking[]>(() => {
    if (hasSSRData) {
      return (initialData?.labourBookings || []).filter((b) => b.status === 'pending').slice(0, 5);
    }
    return [];
  });
  const [stats, setStats] = useState(() => {
    if (hasSSRData) {
      const equipment = initialData?.equipment || [];
      const bookings = initialData?.bookings || [];
      const totalEarnings = bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum: number, b) => sum + (b.total_amount || 0), 0);
      const ratings = equipment.filter((e) => e.rating).map((e) => e.rating as number);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : 0;
      return {
        totalEquipment: equipment.length,
        activeBookings: bookings.filter((b) => ['confirmed', 'in_progress'].includes(b.status))
          .length,
        totalEarnings,
        averageRating: avgRating,
      };
    }
    return { totalEquipment: 0, activeBookings: 0, totalEarnings: 0, averageRating: 0 };
  });
  const [isLoading, setIsLoading] = useState(!hasSSRData);

  const statsCards = useMemo(
    () => [
      {
        icon: Tractor,
        value: stats.totalEquipment,
        label: 'Total Equipment',
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-500/10 to-cyan-500/10',
        iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        trend: '+12%',
        trendUp: true,
      },
      {
        icon: Calendar,
        value: stats.activeBookings,
        label: 'Active Bookings',
        gradient: 'from-emerald-500 to-green-500',
        bgGradient: 'from-emerald-500/10 to-green-500/10',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
        trend: '+8%',
        trendUp: true,
      },
      {
        icon: IndianRupee,
        value: formatCurrency(stats.totalEarnings),
        label: 'Total Earnings',
        gradient: 'from-purple-500 to-pink-500',
        bgGradient: 'from-purple-500/10 to-pink-500/10',
        iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
        trend: '+23%',
        trendUp: true,
      },
      {
        icon: Star,
        value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
        label: 'Average Rating',
        gradient: 'from-amber-500 to-orange-500',
        bgGradient: 'from-amber-500/10 to-orange-500/10',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
        trend: '4.8/5',
        trendUp: true,
      },
    ],
    [stats.totalEquipment, stats.activeBookings, stats.totalEarnings, stats.averageRating]
  );

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

        const { data: equipmentData } = await supabase
          .from('equipment')
          .select('id')
          .eq('owner_id', currentUser.id);

        const equipmentIds = equipmentData?.map((e) => e.id) || [];
        if (equipmentIds.length === 0) return;

        channel = supabase
          .channel('dashboard-bookings-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
            async (payload) => {
              const bookingData = payload.new as Booking;
              if (bookingData && equipmentIds.includes(bookingData.equipment_id)) {
                loadDashboardData();
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to setup dashboard subscription:', error);
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
      const [equipmentResult, bookingsResult, labourBookingsResult] = await Promise.all([
        equipmentService.getMyEquipment(),
        bookingService.getProviderBookings(),
        labourService.getMyBookings(),
      ]);

      setMyEquipment(equipmentResult.slice(0, 4));

      const pending = bookingsResult.filter((b) => b.status === 'pending');
      setPendingBookings(pending.slice(0, 5));

      const pendingLabour = labourBookingsResult.filter((b) => b.status === 'pending');
      setPendingLabourBookings(pendingLabour.slice(0, 5));

      const totalEarnings = bookingsResult
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + b.total_amount, 0);

      const ratings = equipmentResult.filter((e) => e.rating).map((e) => e.rating as number);
      const avgRating =
        ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      setStats({
        totalEquipment: equipmentResult.length,
        activeBookings: bookingsResult.filter((b) =>
          ['confirmed', 'in_progress'].includes(b.status)
        ).length,
        totalEarnings,
        averageRating: avgRating,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="mb-4 flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-amber-400/50 blur-xl"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-amber-300" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Welcome Back, Provider!
                </h1>
                <p className="text-lg text-emerald-100">Manage your equipment empire</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex gap-3"
            >
              <Link href="/provider/equipment/new" className="block">
                <Button
                  size="lg"
                  className="group relative w-full overflow-hidden bg-white text-emerald-600 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Equipment
                </Button>
              </Link>
              <Link href="/provider/bookings">
                <button className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-white/30 px-8 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/10">
                  <Calendar className="h-5 w-5" />
                  View Bookings
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-50 blur-3xl"></div>
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <Tractor className="h-16 w-16 text-white/90" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {statsCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 + idx * 0.03 }}
            className="group relative"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/10">
              {/* Glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              ></div>

              {/* Animated gradient border */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-20`}
              ></div>

              <CardContent className="relative p-6">
                <div className="mb-4 flex items-start justify-between">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    transition={{ duration: 0.2 }}
                    className={`relative rounded-2xl p-4 ${stat.iconBg} shadow-lg transition-transform duration-300`}
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
                      className="text-gray-400 transition-colors group-hover:text-emerald-400"
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

      {/* Pending Requests Section */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Equipment Requests */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-2.5 shadow-lg">
                <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
                <Zap className="relative h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Equipment Requests</h2>
                {pendingBookings.length > 0 && (
                  <p className="text-sm text-gray-400">{pendingBookings.length} pending</p>
                )}
              </div>
            </div>
            <Link
              href="/provider/bookings"
              className="group flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View All
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {pendingBookings.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-700/50 bg-gray-800/30 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <div className="mb-4 inline-flex rounded-full bg-gray-700/50 p-4">
                  <Clock className="h-12 w-12 text-gray-500" />
                </div>
                <p className="font-medium text-gray-400">No pending requests</p>
                <p className="mt-1 text-sm text-gray-500">New requests will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + idx * 0.03 }}
                >
                  <Card className="group relative overflow-hidden border-0 border-l-4 border-l-orange-500 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-200 hover:-translate-x-0.5 hover:shadow-lg hover:shadow-orange-500/10">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                    <CardContent className="relative p-5">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                          className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 transition-transform duration-200 group-hover:scale-105"
                        >
                          <div className="absolute inset-0 rounded-2xl bg-orange-500/10 blur-xl"></div>
                          <Tractor className="relative h-8 w-8 text-orange-400" />
                        </motion.div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-semibold text-white">
                            {(booking as Booking & { equipment?: Equipment }).equipment?.name ||
                              'Equipment'}
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            {new Date(booking.start_date).toLocaleDateString()} -{' '}
                            {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            By{' '}
                            {(booking as Booking & { renter?: { name: string } }).renter?.name ||
                              'Renter'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="mb-2 text-2xl font-bold text-emerald-400">
                            {formatCurrency(booking.total_amount)}
                          </p>
                          <Link href={`/provider/bookings/${booking.id}`}>
                            <Button
                              size="lg"
                              className="group relative w-full overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                            >
                              <Plus className="mr-2 h-5 w-5" />
                              View Booking
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

        {/* Labour Requests */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 shadow-lg">
                <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
                <Users className="relative h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Labour Requests</h2>
                {pendingLabourBookings.length > 0 && (
                  <p className="text-sm text-gray-400">{pendingLabourBookings.length} pending</p>
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

          {pendingLabourBookings.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-700/50 bg-gray-800/30 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <div className="mb-4 inline-flex rounded-full bg-gray-700/50 p-4">
                  <Clock className="h-12 w-12 text-gray-500" />
                </div>
                <p className="font-medium text-gray-400">No pending requests</p>
                <p className="mt-1 text-sm text-gray-500">New requests will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingLabourBookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + idx * 0.03 }}
                >
                  <Card className="group relative overflow-hidden border-0 border-l-4 border-l-blue-500 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-200 hover:-translate-x-0.5 hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                    <CardContent className="relative p-5">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                          className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 transition-transform duration-200 group-hover:scale-105"
                        >
                          <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl"></div>
                          <Users className="relative h-8 w-8 text-blue-400" />
                        </motion.div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-semibold text-white">
                            {booking.employer?.name || 'Employer'}
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            {new Date(booking.start_date).toLocaleDateString()} -{' '}
                            {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Duration: {booking.total_days} days
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="mb-2 text-2xl font-bold text-emerald-400">
                            {formatCurrency(booking.total_amount)}
                          </p>
                          <Link href={`/provider/labour`}>
                            <Button
                              size="sm"
                              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg hover:from-blue-600 hover:to-indigo-600"
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
      </div>

      {/* My Equipment Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 p-2.5 shadow-lg">
              <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
              <Package className="relative h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">My Equipment</h2>
              <p className="text-sm text-gray-400">Your equipment inventory</p>
            </div>
          </div>
          <Link
            href="/provider/equipment"
            className="group flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            View All
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {myEquipment.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-700/50 bg-gray-800/30 backdrop-blur-xl">
            <CardContent className="p-16 text-center">
              <div className="mb-6 inline-flex rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-6">
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl"></div>
                <Package className="relative h-16 w-16 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">No equipment listed</h3>
              <p className="mx-auto mb-6 max-w-md text-gray-400">
                Start earning by listing your agricultural equipment
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-green-500 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <Link
                  href="/provider/equipment/new"
                  className="group relative flex items-center gap-2 overflow-hidden"
                >
                  <Plus className="h-5 w-5" />
                  <span className="relative z-10">Add Your First Equipment</span>
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {myEquipment.map((equipment, idx) => (
              <motion.div
                key={equipment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + idx * 0.03 }}
              >
                <Link href={`/provider/equipment/${equipment.id}`}>
                  <Card className="group h-full overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-700/50 to-gray-800/50">
                      {equipment.images?.[0] ? (
                        <Image
                          src={equipment.images[0]}
                          alt={equipment.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Tractor className="h-16 w-16 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                      <Badge
                        className={cn(
                          'absolute right-3 top-3 shadow-xl backdrop-blur-sm',
                          equipment.is_available
                            ? 'bg-emerald-500/90 text-white hover:bg-emerald-500'
                            : 'bg-gray-500/90 text-white hover:bg-gray-500'
                        )}
                      >
                        {equipment.is_available ? '● Available' : '● Unavailable'}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="mb-3 truncate text-lg font-bold text-white transition-colors group-hover:text-emerald-400">
                        {equipment.name}
                      </h3>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xl font-bold text-emerald-400">
                          {formatCurrency(equipment.price_per_day)}
                          <span className="text-sm text-gray-500">/day</span>
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Eye className="h-4 w-4" />
                          {equipment.total_bookings || 0}
                        </div>
                      </div>
                      {equipment.rating && (
                        <div className="flex items-center gap-2 border-t border-gray-700/50 pt-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-4 w-4 transition-all',
                                  i < Math.floor(equipment.rating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-600'
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {equipment.rating.toFixed(1)} ({equipment.review_count || 0})
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {[
          {
            href: '/provider/equipment/new',
            icon: Plus,
            label: 'Add Equipment',
            gradient: 'from-emerald-500 to-green-500',
            iconColor: 'text-emerald-600',
          },
          {
            href: '/provider/bookings',
            icon: Calendar,
            label: 'Bookings',
            gradient: 'from-blue-500 to-indigo-500',
            iconColor: 'text-blue-600',
          },
          {
            href: '/provider/earnings',
            icon: BarChart3,
            label: 'Earnings',
            gradient: 'from-purple-500 to-pink-500',
            iconColor: 'text-purple-600',
          },
          {
            href: '/provider/reviews',
            icon: Award,
            label: 'Reviews',
            gradient: 'from-amber-500 to-orange-500',
            iconColor: 'text-amber-600',
          },
        ].map((action, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + idx * 0.03 }}
          >
            <Link href={action.href}>
              <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20">
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
});
