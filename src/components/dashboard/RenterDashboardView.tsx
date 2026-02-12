'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Sparkles,
} from 'lucide-react';
import { Button, Input, Card, CardContent, Badge, EmptyState } from '@/components/ui';
import { equipmentService, bookingService, labourService } from '@/lib/services';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Equipment, Booking, LabourBooking } from '@/lib/types';
import { EQUIPMENT_CATEGORIES, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function RenterDashboardView() {
  const { profile } = useAuthStore();
  const { userLocation } = useAppStore();

  const [nearbyEquipment, setNearbyEquipment] = useState<Equipment[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentLabourBookings, setRecentLabourBookings] = useState<LabourBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();

    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) {
          console.log('No user found for renter dashboard subscription');
          return;
        }

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
            async (payload) => {
              console.log('Renter dashboard real-time update:', payload);
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
  }, [userLocation]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [equipmentResult, bookingsResult, labourBookingsResult] = await Promise.all([
        equipmentService.getEquipment({ limit: 8 }),
        bookingService.getMyBookings(),
        labourService.getMyEmployerBookings(),
      ]);

      setNearbyEquipment(equipmentResult.data);
      setRecentBookings(bookingsResult.slice(0, 3));
      setRecentLabourBookings(labourBookingsResult.slice(0, 3));
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
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
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back, {profile?.name?.split(' ')[0] || 'Farmer'}! 👋
        </h1>
        <p className="mt-2 flex items-center gap-2 text-gray-400">
          <MapPin className="h-4 w-4" />
          {profile?.address || 'Set your location'}
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <form onSubmit={handleSearch}>
          <div className="group relative flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-emerald-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tractors, harvesters, tillers..."
                className="border-gray-700/50 bg-gray-800/50 pl-12 text-white backdrop-blur-xl placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
            </div>
            <Button
              type="submit"
              className="group relative w-full overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
            <Button
              variant="outline"
              asChild
              className="group border-gray-700/50 bg-gray-800/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:bg-emerald-500/10"
            >
              <Link href="/equipment?filter=true">
                <Filter className="h-5 w-5 text-gray-400 transition-colors group-hover:text-emerald-400" />
              </Link>
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {[
          {
            icon: Calendar,
            value: recentBookings.length,
            label: 'Active Bookings',
            bgGradient: 'from-blue-500/10 to-cyan-500/10',
            iconBg: 'from-blue-500 to-cyan-500',
          },
          {
            icon: Tractor,
            value: nearbyEquipment.length,
            label: 'Available Near You',
            bgGradient: 'from-emerald-500/10 to-green-500/10',
            iconBg: 'from-emerald-500 to-green-500',
          },
          {
            icon: MessageSquare,
            value: 0,
            label: 'Messages',
            bgGradient: 'from-purple-500/10 to-pink-500/10',
            iconBg: 'from-purple-500 to-pink-500',
          },
          {
            icon: Sparkles,
            value: 0,
            label: 'Notifications',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            iconBg: 'from-amber-500 to-orange-500',
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
          >
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              ></div>

              <CardContent className="relative p-5">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`relative flex rounded-xl bg-gradient-to-br p-3 ${stat.iconBg} shadow-lg transition-transform duration-500 group-hover:scale-110`}
                  >
                    <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl"></div>
                    <stat.icon className="relative h-5 w-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Browse Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Browse Services</h2>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <Link href="/equipment">
            <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <CardContent className="flex items-center gap-4 p-6">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 p-3"
                >
                  <div className="absolute inset-0 rounded-xl bg-emerald-500/10 blur-xl"></div>
                  <Tractor className="relative h-8 w-8 text-emerald-400" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-emerald-400">
                    Find Equipment
                  </h3>
                  <p className="text-sm text-gray-400">Browse tractors, harvesters & more</p>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/renter/labour">
            <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <CardContent className="flex items-center gap-4 p-6">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-3"
                >
                  <div className="absolute inset-0 rounded-xl bg-blue-500/10 blur-xl"></div>
                  <Users className="relative h-8 w-8 text-blue-400" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
                    Find Labour
                  </h3>
                  <p className="text-sm text-gray-400">Hire skilled farm workers</p>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
          {EQUIPMENT_CATEGORIES.slice(0, 8).map((category, idx) => (
            <motion.div
              key={category.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + idx * 0.05 }}
            >
              <Link
                href={`/equipment?category=${category.value}`}
                className="group flex flex-col items-center rounded-xl border bg-gray-800/30 p-3 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-xl"
              >
                <motion.span
                  whileHover={{ rotate: 10, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                  className="mb-1.5 text-2xl"
                >
                  {category.icon}
                </motion.span>
                <span className="text-center text-xs text-gray-400 transition-colors group-hover:text-white">
                  {category.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Equipment Bookings</h2>
            <Link
              href="/renter/bookings"
              className="group flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View All{' '}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
              >
                <Link href={`/renter/bookings/${booking.id}`}>
                  <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-x-1 hover:shadow-2xl hover:shadow-emerald-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <CardContent className="flex items-center gap-4 p-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 transition-transform duration-300 group-hover:scale-110"
                      >
                        <div className="absolute inset-0 rounded-xl bg-emerald-500/10 blur-xl"></div>
                        <Tractor className="relative h-8 w-8 text-emerald-400" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {(booking as Booking & { equipment?: Equipment }).equipment?.name ||
                            'Equipment'}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(booking.start_date).toLocaleDateString()} -{' '}
                          {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={cn('border', getStatusBadgeClass(booking.status))}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Labour Bookings */}
      {recentLabourBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Labour Bookings</h2>
            <Link
              href="/labour/bookings"
              className="group flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View All{' '}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentLabourBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
              >
                <Link href={`/labour/bookings`}>
                  <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-x-1 hover:shadow-2xl hover:shadow-emerald-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <CardContent className="flex items-center gap-4 p-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 transition-transform duration-300 group-hover:scale-110"
                      >
                        <div className="absolute inset-0 rounded-xl bg-blue-500/10 blur-xl"></div>
                        <Users className="relative h-8 w-8 text-blue-400" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {booking.labour?.user?.name || 'Labour'}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(booking.start_date).toLocaleDateString()} -{' '}
                          {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={cn('border', getStatusBadgeClass(booking.status))}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Nearby Equipment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Available Near You</h2>
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
                className="group relative block overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
              >
                <Link href={`/equipment/item/${equipment.id}`}>
                  <Card className="group h-full overflow-hidden border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20">
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
                          <Tractor className="h-12 w-12 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                      {equipment.is_available && (
                        <Badge className="absolute right-3 top-3 border-emerald-500/30 bg-emerald-500/90 text-white backdrop-blur-sm">
                          Available
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 truncate font-medium text-white">{equipment.name}</h3>
                      <p className="truncate text-sm text-gray-400">{equipment.location_name}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold text-emerald-400">
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
    </>
  );
}
