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
  Clock
} from 'lucide-react';
import { Header, Footer, Sidebar } from '@/components/layout';
import { Button, Input, Card, CardContent, Badge, Spinner, EmptyState } from '@/components/ui';
import { equipmentService, bookingService } from '@/lib/services';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Equipment, Booking } from '@/lib/types';
import { EQUIPMENT_CATEGORIES, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function RenterDashboard() {
  const { profile } = useAuthStore();
  const { userLocation, searchFilters, setFilters, sidebarOpen } = useAppStore();
  
  const [nearbyEquipment, setNearbyEquipment] = useState<Equipment[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [userLocation]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [equipmentResult, bookingsResult] = await Promise.all([
        equipmentService.getEquipment({ limit: 8 }),
        bookingService.getMyBookings(),
      ]);
      
      setNearbyEquipment(equipmentResult.data);
      setRecentBookings(bookingsResult.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
    window.location.href = `/renter/equipment?search=${encodeURIComponent(searchQuery)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'in_progress': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar role="renter" />
        
        <main className={cn("flex-1 p-4 lg:p-6 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-0")}>
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.name?.split(' ')[0] || 'Farmer'}! 👋
            </h1>
            <p className="text-gray-600 flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {profile?.address || 'Set your location'}
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tractors, harvesters, tillers..."
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              <Button variant="outline" asChild>
                <Link href="/renter/equipment?filter=true">
                  <Filter className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentBookings.length}</p>
                  <p className="text-sm text-gray-600">Active Bookings</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Tractor className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{nearbyEquipment.length}</p>
                  <p className="text-sm text-gray-600">Available Near You</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Messages</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Browse Categories</h2>
              <Link href="/renter/equipment" className="text-sm text-green-600 hover:underline flex items-center">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
              {EQUIPMENT_CATEGORIES.slice(0, 8).map((category) => (
                <Link
                  key={category.value}
                  href={`/renter/equipment?category=${category.value}`}
                  className="flex flex-col items-center p-3 bg-white rounded-lg border hover:border-green-500 hover:shadow-sm transition-all"
                >
                  <span className="text-2xl mb-1">{category.icon}</span>
                  <span className="text-xs text-center text-gray-700">{category.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          {recentBookings.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Bookings</h2>
                <Link href="/renter/bookings" className="text-sm text-green-600 hover:underline flex items-center">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <Link key={booking.id} href={`/renter/bookings/${booking.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Tractor className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {(booking as Booking & { equipment?: Equipment }).equipment?.name || 'Equipment'}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Available Near You</h2>
              <Link href="/renter/equipment" className="text-sm text-green-600 hover:underline flex items-center">
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
                    <Link href="/renter/equipment">Browse All Equipment</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {nearbyEquipment.map((equipment) => (
                  <Link key={equipment.id} href={`/renter/equipment/${equipment.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="aspect-[4/3] bg-gray-100 relative">
                        {equipment.images?.[0] ? (
                          <Image
                            src={equipment.images[0]}
                            alt={equipment.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tractor className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        {equipment.is_available && (
                          <Badge className="absolute top-2 right-2" variant="success">
                            Available
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-gray-900 truncate">{equipment.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{equipment.location_name}</p>
                        <div className="flex items-center justify-between mt-2">
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
