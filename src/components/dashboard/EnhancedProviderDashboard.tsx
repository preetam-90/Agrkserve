'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Plus,
  Tractor,
  Calendar,
  Star,
  ChevronRight,
  Clock,
  Eye,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Zap,
  Award,
  BarChart3,
  Activity,
  MessageSquare,
  Settings,
  Bell,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { equipmentService, bookingService, labourService } from '@/lib/services';
import { Equipment, Booking, InitialData, LabourBooking } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function EnhancedProviderDashboard({ initialData }: { initialData?: InitialData | null }) {
  const hasSSRData = !!(initialData?.equipment || initialData?.bookings);

  const [myEquipment, setMyEquipment] = useState<Equipment[]>(
    hasSSRData ? ((initialData!.equipment as Equipment[]) || []).slice(0, 4) : []
  );
  const [pendingBookings, setPendingBookings] = useState<Booking[]>(
    hasSSRData
      ? (initialData!.bookings || []).filter((b: Booking) => b.status === 'pending').slice(0, 5)
      : []
  );
  const [pendingLabourBookings, setPendingLabourBookings] = useState<LabourBooking[]>(
    hasSSRData
      ? (initialData!.labourBookings || [])
          .filter((b: LabourBooking) => b.status === 'pending')
          .slice(0, 5)
      : []
  );
  const [recentBookings, setRecentBookings] = useState<Booking[]>(
    hasSSRData ? (initialData!.bookings || []).slice(0, 5) : []
  );
  const [stats, setStats] = useState(() => {
    if (hasSSRData) {
      const allEquipment = initialData!.equipment || [];
      const allBookings = initialData!.bookings || [];
      const allLabour = initialData!.labourBookings || [];
      const pending = allBookings.filter((b: Booking) => b.status === 'pending');
      const pendingLabour = allLabour.filter((b: LabourBooking) => b.status === 'pending');
      const totalEarnings = allBookings
        .filter((b: Booking) => b.status === 'completed')
        .reduce((sum: number, b: Booking) => sum + b.total_amount, 0);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyEarnings = allBookings
        .filter((b: Booking) => b.status === 'completed' && new Date(b.created_at) >= thirtyDaysAgo)
        .reduce((sum: number, b: Booking) => sum + b.total_amount, 0);
      const ratings = allEquipment
        .filter((e: Equipment) => e.rating)
        .map((e: Equipment) => e.rating as number);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : 0;
      const completedCount = allBookings.filter((b: Booking) => b.status === 'completed').length;
      const completionRate =
        allBookings.length > 0 ? (completedCount / allBookings.length) * 100 : 0;
      return {
        totalEquipment: allEquipment.length,
        activeBookings: allBookings.filter((b: Booking) =>
          ['confirmed', 'in_progress'].includes(b.status)
        ).length,
        totalEarnings,
        averageRating: avgRating,
        monthlyEarnings,
        pendingRequests: pending.length + pendingLabour.length,
        completionRate,
        responseTime: 2.5,
      };
    }
    return {
      totalEquipment: 0,
      activeBookings: 0,
      totalEarnings: 0,
      averageRating: 0,
      monthlyEarnings: 0,
      pendingRequests: 0,
      completionRate: 0,
      responseTime: 0,
    };
  });
  const [isLoading, setIsLoading] = useState(!hasSSRData);

  useEffect(() => {
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

        const equipmentIds = (equipmentData || []).map((e: { id: string }) => e.id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setRecentBookings(bookingsResult.slice(0, 5));

      const pending = bookingsResult.filter((b) => b.status === 'pending');
      setPendingBookings(pending.slice(0, 5));

      const pendingLabour = labourBookingsResult.filter((b) => b.status === 'pending');
      setPendingLabourBookings(pendingLabour.slice(0, 5));

      const totalEarnings = bookingsResult
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + b.total_amount, 0);

      // Calculate monthly earnings (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyEarnings = bookingsResult
        .filter((b) => b.status === 'completed' && new Date(b.created_at) >= thirtyDaysAgo)
        .reduce((sum, b) => sum + b.total_amount, 0);

      const ratings = equipmentResult.filter((e) => e.rating).map((e) => e.rating as number);
      const avgRating =
        ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      const completedCount = bookingsResult.filter((b) => b.status === 'completed').length;
      const totalCount = bookingsResult.length;
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      setStats({
        totalEquipment: equipmentResult.length,
        activeBookings: bookingsResult.filter((b) =>
          ['confirmed', 'in_progress'].includes(b.status)
        ).length,
        totalEarnings,
        averageRating: avgRating,
        monthlyEarnings,
        pendingRequests: pending.length + pendingLabour.length,
        completionRate,
        responseTime: 2.5, // Mock data - could be calculated from actual response times
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
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500"></div>
          </div>
          <p className="mt-6 text-sm font-medium text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 p-8 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 rounded-2xl bg-emerald-400/50 blur-xl"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    Welcome Back, Provider!
                  </h1>
                  <p className="text-lg text-gray-400">Manage your equipment empire</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/provider/equipment/new">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Equipment
                  </Button>
                </Link>
                <Link href="/provider/bookings">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-700/50 bg-gray-800/50 backdrop-blur-xl hover:border-emerald-500/50 hover:bg-emerald-500/10"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    View Bookings
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                className="border-gray-700/50 bg-gray-800/50 backdrop-blur-xl hover:border-emerald-500/50 hover:bg-emerald-500/10"
              >
                <Bell className="h-5 w-5 text-gray-400" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-700/50 bg-gray-800/50 backdrop-blur-xl hover:border-emerald-500/50 hover:bg-emerald-500/10"
              >
                <Settings className="h-5 w-5 text-gray-400" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Stats Grid - Enhanced with 8 metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            icon: DollarSign,
            value: formatCurrency(stats.monthlyEarnings),
            label: 'Monthly Revenue',
            change: '+23.5%',
            trend: 'up',
            bgGradient: 'from-emerald-500/10 to-green-500/10',
            iconBg: 'from-emerald-500 to-green-500',
            description: 'Last 30 days',
          },
          {
            icon: Tractor,
            value: stats.totalEquipment,
            label: 'Total Equipment',
            change: `${stats.totalEquipment} active`,
            trend: 'neutral',
            bgGradient: 'from-blue-500/10 to-cyan-500/10',
            iconBg: 'from-blue-500 to-cyan-500',
            description: 'In inventory',
          },
          {
            icon: Calendar,
            value: stats.activeBookings,
            label: 'Active Bookings',
            change: '+8.2%',
            trend: 'up',
            bgGradient: 'from-purple-500/10 to-pink-500/10',
            iconBg: 'from-purple-500 to-pink-500',
            description: 'Ongoing rentals',
          },
          {
            icon: Star,
            value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
            label: 'Average Rating',
            change: '4.8/5.0',
            trend: 'up',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            iconBg: 'from-amber-500 to-orange-500',
            description: 'Customer satisfaction',
          },
          {
            icon: AlertCircle,
            value: stats.pendingRequests,
            label: 'Pending Requests',
            change: 'Needs attention',
            trend: stats.pendingRequests > 0 ? 'down' : 'neutral',
            bgGradient: 'from-red-500/10 to-orange-500/10',
            iconBg: 'from-red-500 to-orange-500',
            description: 'Awaiting response',
          },
          {
            icon: Target,
            value: `${stats.completionRate.toFixed(0)}%`,
            label: 'Completion Rate',
            change: '+5.3%',
            trend: 'up',
            bgGradient: 'from-indigo-500/10 to-purple-500/10',
            iconBg: 'from-indigo-500 to-purple-500',
            description: 'Success rate',
          },
          {
            icon: Clock,
            value: `${stats.responseTime}h`,
            label: 'Avg Response Time',
            change: '-0.5h',
            trend: 'up',
            bgGradient: 'from-teal-500/10 to-cyan-500/10',
            iconBg: 'from-teal-500 to-cyan-500',
            description: 'Reply speed',
          },
          {
            icon: TrendingUp,
            value: formatCurrency(stats.totalEarnings),
            label: 'Total Earnings',
            change: 'All time',
            trend: 'up',
            bgGradient: 'from-green-500/10 to-emerald-500/10',
            iconBg: 'from-green-500 to-emerald-500',
            description: 'Lifetime revenue',
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 + idx * 0.05 }}
            className="group cursor-pointer"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              ></div>

              <CardContent className="relative p-6">
                <div className="mb-4 flex items-center justify-between">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`relative flex rounded-xl bg-gradient-to-br p-3 ${stat.iconBg} shadow-lg`}
                  >
                    <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
                    <stat.icon className="relative h-6 w-6 text-white" />
                  </motion.div>
                  {stat.trend === 'up' && <TrendingUp className="h-5 w-5 text-emerald-400" />}
                  {stat.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-400" />}
                </div>
                <div>
                  <p className="mb-1 text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mb-2 text-sm font-medium text-gray-400">{stat.label}</p>
                  <div className="flex items-center justify-between border-t border-gray-700/50 pt-2">
                    <p className="text-xs text-gray-500">{stat.description}</p>
                    <p className="text-xs font-semibold text-emerald-400">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {/* Pending Requests Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Equipment Requests */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
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
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <p className="font-medium text-gray-400">All caught up!</p>
                <p className="mt-1 text-sm text-gray-500">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + idx * 0.1 }}
                >
                  <Card className="group relative overflow-hidden border-0 border-l-4 border-l-orange-500 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-x-1 hover:shadow-2xl hover:shadow-orange-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                    <CardContent className="relative p-5">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20"
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
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg hover:from-emerald-600 hover:to-green-600"
                            >
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

        {/* Labour Requests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
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
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <p className="font-medium text-gray-400">All caught up!</p>
                <p className="mt-1 text-sm text-gray-500">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingLabourBookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + idx * 0.1 }}
                >
                  <Card className="group relative overflow-hidden border-0 border-l-4 border-l-blue-500 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-x-1 hover:shadow-2xl hover:shadow-blue-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                    <CardContent className="relative p-5">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20"
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
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg hover:from-blue-600 hover:to-indigo-600"
                            >
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
      {/* Recent Activity */}
      {recentBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 shadow-lg">
                <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
                <Activity className="relative h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                <p className="text-sm text-gray-400">Latest bookings</p>
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

          <div className="space-y-3">
            {recentBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.1 }}
              >
                <Link href={`/provider/bookings/${booking.id}`}>
                  <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <Tractor className="h-8 w-8 text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">
                          {(booking as Booking & { equipment?: Equipment }).equipment?.name ||
                            'Equipment'}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          {new Date(booking.start_date).toLocaleDateString()} -{' '}
                          {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={cn(
                            'mb-2 border',
                            booking.status === 'completed'
                              ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                              : booking.status === 'confirmed'
                                ? 'border-blue-500/30 bg-blue-500/20 text-blue-400'
                                : 'border-amber-500/30 bg-amber-500/20 text-amber-400'
                          )}
                        >
                          {booking.status}
                        </Badge>
                        <p className="text-lg font-bold text-emerald-400">
                          {formatCurrency(booking.total_amount)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {/* My Equipment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
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
              <div className="relative mb-6 inline-flex">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl"></div>
                <div className="relative rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-6">
                  <Package className="h-16 w-16 text-emerald-400" />
                </div>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">No equipment listed</h3>
              <p className="mx-auto mb-6 max-w-md text-gray-400">
                Start earning by listing your agricultural equipment
              </p>
              <Link href="/provider/equipment/new">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-green-500 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Equipment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {myEquipment.map((equipment, idx) => (
              <motion.div
                key={equipment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + idx * 0.1 }}
              >
                <Link href={`/provider/equipment/${equipment.id}`}>
                  <Card className="group h-full cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-700/50 to-gray-800/50">
                      {equipment.images?.[0] ? (
                        <Image
                          src={equipment.images[0]}
                          alt={equipment.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
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
                          <span className="text-sm font-medium text-gray-400">
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
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <h2 className="mb-4 text-2xl font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {[
            {
              href: '/provider/equipment/new',
              icon: Plus,
              label: 'Add Equipment',
              gradient: 'from-emerald-500 to-green-500',
            },
            {
              href: '/provider/bookings',
              icon: Calendar,
              label: 'Bookings',
              gradient: 'from-blue-500 to-indigo-500',
            },
            {
              href: '/earnings',
              icon: BarChart3,
              label: 'Earnings',
              gradient: 'from-purple-500 to-pink-500',
            },
            {
              href: '/provider/reviews',
              icon: Award,
              label: 'Reviews',
              gradient: 'from-amber-500 to-orange-500',
            },
            {
              href: '/messages',
              icon: MessageSquare,
              label: 'Messages',
              gradient: 'from-teal-500 to-cyan-500',
            },
            {
              href: '/provider/equipment',
              icon: Package,
              label: 'Inventory',
              gradient: 'from-rose-500 to-pink-500',
            },
          ].map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
            >
              <Link href={action.href}>
                <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20">
                  <CardContent className="p-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className={`relative mb-4 inline-flex rounded-2xl bg-gradient-to-br p-4 ${action.gradient} shadow-lg`}
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
        </div>
      </motion.div>
    </div>
  );
}
