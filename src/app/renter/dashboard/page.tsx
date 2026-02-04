'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Tractor,
  Calendar,
  MessageSquare,
  Bell,
  ChevronRight,
  Filter,
  Star,
  Clock,
  Users,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button, Input, Card, CardContent, Badge, Spinner, EmptyState } from '@/components/ui';
import { equipmentService, bookingService, labourService } from '@/lib/services';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Equipment, Booking } from '@/lib/types';
import { EQUIPMENT_CATEGORIES, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function RenterDashboard() {
  const { profile } = useAuthStore();
  const { userLocation, sidebarOpen } = useAppStore();

  const [nearbyEquipment, setNearbyEquipment] = useState<Equipment[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentLabourBookings, setRecentLabourBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();

    // Set up real-time subscription
    const supabase = createClient();
    let channel: any = null;

    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) {
          console.log('No user found for renter dashboard subscription');
          return;
        }

        console.log('Setting up renter dashboard subscription');

        // Subscribe to bookings changes for this renter
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
              // Reload dashboard data to get updated bookings
              loadDashboardData();
            }
          )
          .subscribe((status) => {
            console.log('Renter dashboard subscription status:', status);
          });
      } catch (error) {
        console.error('Failed to setup renter dashboard subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        console.log('Cleaning up renter dashboard subscription');
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

  const getStatusColor = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <main className="flex-1 p-4 pt-28 transition-all duration-300 lg:p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.name?.split(' ')[0] || 'Farmer'}! 👋
            </h1>
            <p className="mt-1 flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              {profile?.address || 'Set your location'}
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tractors, harvesters, tillers..."
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              <Button variant="outline" asChild>
                <Link href="/equipment?filter=true">
                  <Filter className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentBookings.length}</p>
                  <p className="text-sm text-gray-600">Active Bookings</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-green-100 p-2">
                  <Tractor className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{nearbyEquipment.length}</p>
                  <p className="text-sm text-gray-600">Available Near You</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-purple-100 p-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Messages</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Notifications</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Browse Services</h2>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <Link href="/equipment">
                <Card className="cursor-pointer transition-all hover:border-teal-500 hover:shadow-lg">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-lg bg-teal-100 p-3">
                      <Tractor className="h-8 w-8 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Find Equipment</h3>
                      <p className="text-sm text-gray-600">Browse tractors, harvesters & more</p>
                    </div>
                    <ChevronRight className="ml-auto h-6 w-6 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/renter/labour">
                <Card className="cursor-pointer transition-all hover:border-teal-500 hover:shadow-lg">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-lg bg-blue-100 p-3">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Find Labour</h3>
                      <p className="text-sm text-gray-600">Hire skilled farm workers</p>
                    </div>
                    <ChevronRight className="ml-auto h-6 w-6 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
              {EQUIPMENT_CATEGORIES.slice(0, 8).map((category) => (
                <Link
                  key={category.value}
                  href={`/equipment?category=${category.value}`}
                  className="flex flex-col items-center rounded-lg border bg-white p-3 transition-all hover:border-green-500 hover:shadow-sm"
                >
                  <span className="mb-1 text-2xl">{category.icon}</span>
                  <span className="text-center text-xs text-gray-700">{category.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          {recentBookings.length > 0 && (
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Equipment Bookings</h2>
                <Link
                  href="/renter/bookings"
                  className="flex items-center text-sm text-green-600 hover:underline"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <Link key={booking.id} href={`/renter/bookings/${booking.id}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                          <Tractor className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">
                            {(booking as Booking & { equipment?: Equipment }).equipment?.name ||
                              'Equipment'}
                          </p>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(booking.start_date).toLocaleDateString()} -{' '}
                            {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Labour Bookings */}
          {recentLabourBookings.length > 0 && (
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Labour Bookings</h2>
                <Link
                  href="/renter/labour/bookings"
                  className="flex items-center text-sm text-green-600 hover:underline"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentLabourBookings.map((booking) => (
                  <Link key={booking.id} href={`/renter/labour/bookings`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">
                            {booking.labour?.user?.full_name || 'Labour'}
                          </p>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(booking.start_date).toLocaleDateString()} -{' '}
                            {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Equipment */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Available Near You</h2>
              <Link
                href="/equipment"
                className="flex items-center text-sm text-green-600 hover:underline"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : nearbyEquipment.length === 0 ? (
              <EmptyState
                icon={<Tractor className="h-12 w-12" />}
                title="No equipment found"
                description="There's no equipment available in your area yet. Try expanding your search."
                action={
                  <Button asChild>
                    <Link href="/equipment">Browse All Equipment</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {nearbyEquipment.map((equipment) => (
                  <Link key={equipment.id} href={`/equipment/${equipment.id}`}>
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative aspect-[4/3] bg-gray-100">
                        {equipment.images?.[0] ? (
                          <Image
                            src={equipment.images[0]}
                            alt={equipment.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Tractor className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        {equipment.is_available && (
                          <Badge className="absolute right-2 top-2" variant="success">
                            Available
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="truncate font-medium text-gray-900">{equipment.name}</h3>
                        <p className="truncate text-sm text-gray-500">{equipment.location_name}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-bold text-green-600">
                            {formatCurrency(equipment.price_per_day)}/day
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {equipment.rating?.toFixed(1) || 'New'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
