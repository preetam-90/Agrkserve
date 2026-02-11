'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Tractor,
  Calendar,
  MessageSquare,
  ChevronRight,
  Filter,
  Star,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Heart,
  Bell,
  Settings,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Card, CardContent, Badge, EmptyState } from '@/components/ui';
import { equipmentService, bookingService } from '@/lib/services';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Equipment, Booking, InitialData } from '@/lib/types';
import { EQUIPMENT_CATEGORIES, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RenterDashboardProps {
  initialData?: InitialData;
}

export function EnhancedRenterDashboard({ initialData }: RenterDashboardProps) {
  const { profile } = useAuthStore();
  const { userLocation } = useAppStore();

  // Seed state from SSR data if available
  const hasSSRData = initialData?.equipment || initialData?.bookings;

  const [nearbyEquipment, setNearbyEquipment] = useState<Equipment[]>(
    hasSSRData ? initialData.equipment || [] : []
  );
  const [recentBookings, setRecentBookings] = useState<Booking[]>(
    hasSSRData ? (initialData.bookings || []).slice(0, 3) : []
  );
  const [isLoading, setIsLoading] = useState(!hasSSRData);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(() => {
    if (hasSSRData) {
      const bookings = initialData.bookings || [];
      const activeCount = bookings.filter(
        (b) => b.status === 'confirmed' || b.status === 'in_progress'
      ).length;
      const completedCount = bookings.filter((b) => b.status === 'completed').length;
      const totalSpent = bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum: number, b) => sum + (b.total_amount || 0), 0);
      return {
        totalSpent,
        activeBookings: activeCount,
        completedBookings: completedCount,
        savedItems: 0,
      };
    }
    return { totalSpent: 0, activeBookings: 0, completedBookings: 0, savedItems: 0 };
  });

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
          .channel('renter-dashboard-bookings')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookings',
              filter: `renter_id=eq.${currentUser.id}`,
            },
            async () => {
              loadDashboardData();
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to setup renter dashboard subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userLocation, hasSSRData]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [equipmentResult, bookingsResult] = await Promise.all([
        equipmentService.getEquipment({ limit: 8 }),
        bookingService.getMyBookings(),
      ]);

      setNearbyEquipment(equipmentResult.data);
      setRecentBookings(bookingsResult.slice(0, 3));

      // Calculate stats
      const activeCount = bookingsResult.filter(
        (b) => b.status === 'confirmed' || b.status === 'in_progress'
      ).length;
      const completedCount = bookingsResult.filter((b) => b.status === 'completed').length;
      const totalSpent = bookingsResult
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      setStats({
        totalSpent,
        activeBookings: activeCount,
        completedBookings: completedCount,
        savedItems: 0,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/equipment?search=${encodeURIComponent(searchQuery)}`;
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
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 p-8 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
                Welcome back, {profile?.name?.split(' ')[0] || 'Farmer'}! 👋
              </h1>
              <p className="flex items-center gap-2 text-lg text-gray-400">
                <MapPin className="h-5 w-5 text-emerald-400" />
                {profile?.address || 'Set your location'}
              </p>
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

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <form onSubmit={handleSearch}>
          <div className="group relative flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-emerald-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tractors, harvesters, tillers..."
                className="h-14 border-gray-700/50 bg-gray-800/50 pl-12 text-white backdrop-blur-xl placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
            </div>
            <Button
              type="submit"
              className="h-14 bg-gradient-to-r from-emerald-500 to-green-500 px-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20"
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-14 border-gray-700/50 bg-gray-800/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:bg-emerald-500/10"
            >
              <Link href="/equipment?filter=true">
                <Filter className="h-5 w-5 text-gray-400" />
              </Link>
            </Button>
          </div>
        </form>
      </motion.div>
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            icon: DollarSign,
            value: formatCurrency(stats.totalSpent),
            label: 'Total Spent',
            change: '+12.5%',
            trend: 'up',
            bgGradient: 'from-emerald-500/10 to-green-500/10',
            iconBg: 'from-emerald-500 to-green-500',
          },
          {
            icon: Calendar,
            value: stats.activeBookings,
            label: 'Active Bookings',
            change: `${stats.activeBookings} ongoing`,
            trend: 'neutral',
            bgGradient: 'from-blue-500/10 to-cyan-500/10',
            iconBg: 'from-blue-500 to-cyan-500',
          },
          {
            icon: CheckCircle2,
            value: stats.completedBookings,
            label: 'Completed',
            change: '+8 this month',
            trend: 'up',
            bgGradient: 'from-purple-500/10 to-pink-500/10',
            iconBg: 'from-purple-500 to-pink-500',
          },
          {
            icon: Heart,
            value: stats.savedItems,
            label: 'Saved Items',
            change: 'View favorites',
            trend: 'neutral',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            iconBg: 'from-amber-500 to-orange-500',
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 + idx * 0.03 }}
            className="group cursor-pointer"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              ></div>

              <CardContent className="relative p-6">
                <div className="mb-4 flex items-center justify-between">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    transition={{ duration: 0.2 }}
                    className={`relative flex rounded-xl bg-gradient-to-br p-3 ${stat.iconBg} shadow-lg`}
                  >
                    <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
                    <stat.icon className="relative h-6 w-6 text-white" />
                  </motion.div>
                  {stat.trend === 'up' && <TrendingUp className="h-5 w-5 text-emerald-400" />}
                </div>
                <div>
                  <p className="mb-1 text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mb-2 text-sm font-medium text-gray-400">{stat.label}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="mb-4 text-2xl font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Tractor,
              title: 'Browse Equipment',
              description: 'Find tractors, harvesters & more',
              href: '/equipment',
              gradient: 'from-emerald-500 to-green-500',
            },
            {
              icon: Users,
              title: 'Hire Labour',
              description: 'Find skilled farm workers',
              href: '/labour',
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              icon: Calendar,
              title: 'My Bookings',
              description: 'View and manage bookings',
              href: '/renter/bookings',
              gradient: 'from-purple-500 to-pink-500',
            },
            {
              icon: MessageSquare,
              title: 'Messages',
              description: 'Chat with providers',
              href: '/messages',
              gradient: 'from-amber-500 to-orange-500',
            },
            {
              icon: BarChart3,
              title: 'Activity',
              description: 'View your rental history',
              href: '/renter/activity',
              gradient: 'from-indigo-500 to-purple-500',
            },
            {
              icon: Heart,
              title: 'Favorites',
              description: 'Saved equipment & labour',
              href: '/renter/favorites',
              gradient: 'from-rose-500 to-pink-500',
            },
          ].map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + idx * 0.03 }}
            >
              <Link href={action.href}>
                <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/10">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                  ></div>
                  <CardContent className="flex items-center gap-4 p-6">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      transition={{ duration: 0.2 }}
                      className={`relative flex rounded-xl bg-gradient-to-br p-3 ${action.gradient}`}
                    >
                      <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
                      <action.icon className="relative h-6 w-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-white transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
      {/* Recent Activity Timeline */}
      {recentBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <Link
              href="/renter/bookings"
              className="group flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View All{' '}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.03 }}
              >
                <Link href={`/renter/bookings/${booking.id}`}>
                  <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-200 hover:-translate-x-0.5 hover:shadow-lg hover:shadow-emerald-500/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <CardContent className="flex items-center gap-4 p-5">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20"
                      >
                        <div className="absolute inset-0 rounded-xl bg-emerald-500/10 blur-xl"></div>
                        <Tractor className="relative h-8 w-8 text-emerald-400" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 truncate font-semibold text-white">
                          {(booking as Booking & { equipment?: Equipment }).equipment?.name ||
                            'Equipment'}
                        </p>
                        <p className="mb-2 flex items-center gap-1 text-sm text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(booking.start_date).toLocaleDateString()} -{' '}
                          {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-semibold text-emerald-400">
                          {formatCurrency(booking.total_amount || 0)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={cn('border', getStatusBadgeClass(booking.status))}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Equipment Categories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="mb-4 text-2xl font-bold text-white">Browse by Category</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {EQUIPMENT_CATEGORIES.slice(0, 8).map((category, idx) => (
            <motion.div
              key={category.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + idx * 0.02 }}
            >
              <Link
                href={`/equipment?category=${category.value}`}
                className="hover:scale-102 group flex cursor-pointer flex-col items-center rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 backdrop-blur-xl transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <motion.span
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="mb-2 text-3xl"
                >
                  {category.icon}
                </motion.span>
                <span className="text-center text-xs font-medium text-gray-400 transition-colors group-hover:text-white">
                  {category.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Available Equipment */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Available Near You</h2>
          <Link
            href="/equipment"
            className="group flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            View All{' '}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500"></div>
            </div>
          </div>
        ) : nearbyEquipment.length === 0 ? (
          <EmptyState
            icon={<Tractor className="h-12 w-12 text-gray-500" />}
            title="No equipment found"
            description="There's no equipment available in your area yet. Try expanding your search."
            action={
              <Button
                asChild
                className="hover:scale-102 bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all duration-200 hover:shadow-lg"
              >
                <Link href="/equipment">Browse All Equipment</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearbyEquipment.map((equipment, idx) => (
              <motion.div
                key={equipment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + idx * 0.02 }}
              >
                <Link href={`/equipment/item/${equipment.id}`}>
                  <Card className="group h-full cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
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
                          <Tractor className="h-12 w-12 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      {equipment.is_available && (
                        <Badge className="absolute right-3 top-3 border-emerald-500/30 bg-emerald-500/90 text-white backdrop-blur-sm">
                          Available
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 truncate font-semibold text-white">{equipment.name}</h3>
                      <p className="mb-3 truncate text-sm text-gray-400">
                        {equipment.location_name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-400">
                          {formatCurrency(equipment.price_per_day)}/day
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {equipment.rating?.toFixed(1) || 'New'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
