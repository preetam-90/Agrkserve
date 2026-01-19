'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Tractor,
  Calendar,
  IndianRupee,
  TrendingUp,
  Star,
  ChevronRight,
  Clock,
  Eye,
  Package
} from 'lucide-react';
import { Header, Footer, Sidebar } from '@/components/layout';
import { Button, Card, CardContent, Badge, Spinner, EmptyState } from '@/components/ui';
import { equipmentService, bookingService } from '@/lib/services';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Equipment, Booking } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import Image from 'next/image';

export default function ProviderDashboard() {
  const { profile } = useAuthStore();
  const { sidebarOpen } = useAppStore();
  
  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [equipmentResult, bookingsResult] = await Promise.all([
        equipmentService.getMyEquipment(),
        bookingService.getProviderBookings(),
      ]);
      
      setMyEquipment(equipmentResult.slice(0, 4));
      
      const pending = bookingsResult.filter(b => b.status === 'pending');
      setPendingBookings(pending.slice(0, 5));
      
      // Calculate stats
      const totalEarnings = bookingsResult
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.total_amount, 0);
      
      const ratings = equipmentResult
        .filter(e => e.rating)
        .map(e => e.rating as number);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;
      
      setStats({
        totalEquipment: equipmentResult.length,
        activeBookings: bookingsResult.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length,
        totalEarnings,
        averageRating: avgRating,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar role="provider" />
        
        <main className={cn("flex-1 p-4 lg:p-6 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-0")}>
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Provider Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your equipment and bookings
              </p>
            </div>
            <Button asChild>
              <Link href="/provider/equipment/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Tractor className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalEquipment}</p>
                    <p className="text-sm text-gray-600">My Equipment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeBookings}</p>
                    <p className="text-sm text-gray-600">Active Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <IndianRupee className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Bookings */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Requests ({pendingBookings.length})
              </h2>
              <Link href="/provider/bookings" className="text-sm text-green-600 hover:underline flex items-center">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-600">No pending booking requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Tractor className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {(booking as Booking & { equipment?: Equipment }).equipment?.name || 'Equipment'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(booking as Booking & { renter?: { name: string } }).renter?.name || 'Renter'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(booking.total_amount)}</p>
                            <Badge variant="warning">Pending</Badge>
                          </div>
                          <Link href={`/provider/bookings/${booking.id}`}>
                            <Button size="sm">Review</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* My Equipment */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Equipment</h2>
              <Link href="/provider/equipment" className="text-sm text-green-600 hover:underline flex items-center">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {myEquipment.length === 0 ? (
              <EmptyState
                icon={<Package className="h-12 w-12" />}
                title="No equipment listed"
                description="Start earning by listing your agricultural equipment"
                action={
                  <Button asChild>
                    <Link href="/provider/equipment/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Equipment
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {myEquipment.map((equipment) => (
                  <Link key={equipment.id} href={`/provider/equipment/${equipment.id}`}>
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
                        <Badge 
                          className="absolute top-2 right-2" 
                          variant={equipment.is_available ? 'success' : 'secondary'}
                        >
                          {equipment.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-gray-900 truncate">{equipment.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-green-600">
                            {formatCurrency(equipment.price_per_day)}/day
                          </span>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Eye className="h-4 w-4" />
                            {equipment.total_bookings || 0}
                          </div>
                        </div>
                        {equipment.rating && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {equipment.rating.toFixed(1)} ({equipment.review_count || 0} reviews)
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/provider/equipment/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium">Add Equipment</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/provider/bookings">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium">All Bookings</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/provider/earnings">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-medium">Earnings</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/provider/reviews">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="font-medium">Reviews</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
