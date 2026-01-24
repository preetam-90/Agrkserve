'use client';

import { useEffect, useState } from 'react';
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
  Sparkles,
  Zap,
  Award,
  BarChart3
} from 'lucide-react';
import { Header, Footer, Sidebar } from '@/components/layout';
import { Button, Card, CardContent, Badge, Spinner, EmptyState } from '@/components/ui';
import { equipmentService, bookingService, labourService } from '@/lib/services';
import { useAppStore } from '@/lib/store';
import { Equipment, Booking } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function ProviderDashboard() {
  const { sidebarOpen } = useAppStore();
  
  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [pendingLabourBookings, setPendingLabourBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    const supabase = createClient();
    let channel: any = null;
    
    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        const { data: equipmentData } = await supabase
          .from('equipment')
          .select('id')
          .eq('owner_id', currentUser.id);
        
        const equipmentIds = equipmentData?.map(e => e.id) || [];
        if (equipmentIds.length === 0) return;

        channel = supabase
          .channel('dashboard-bookings-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' },
            async (payload) => {
              const bookingData = payload.new as any;
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
      
      const pending = bookingsResult.filter(b => b.status === 'pending');
      setPendingBookings(pending.slice(0, 5));
      
      const pendingLabour = labourBookingsResult.filter(b => b.status === 'pending');
      setPendingLabourBookings(pendingLabour.slice(0, 5));
      
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
      <Header />
      
      <div className="flex">
        <Sidebar role="provider" />
        
        <main className={cn("flex-1 p-4 lg:p-8 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-0")}>
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 p-8 mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                  <h1 className="text-4xl font-bold text-white">
                    Welcome Back, Provider!
                  </h1>
                </div>
                <p className="text-green-100 text-lg mb-6 max-w-2xl">
                  Manage your equipment, track bookings, and grow your agricultural business
                </p>
                <div className="flex gap-4">
                  <Button asChild size="lg" className="bg-white text-green-700 hover:bg-green-50 shadow-xl">
                    <Link href="/provider/equipment/new">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Equipment
                    </Link>
                  </Button>
                  <Link href="/provider/bookings">
                    <button className="inline-flex items-center justify-center gap-2 h-12 px-8 text-base font-medium rounded-lg border-2 border-white text-white hover:bg-white hover:text-green-700 transition-all duration-300 backdrop-blur-sm">
                      <Calendar className="h-5 w-5" />
                      View Bookings
                    </button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50"></div>
                  <Tractor className="h-32 w-32 text-white relative z-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                icon: Tractor, 
                value: stats.totalEquipment, 
                label: 'Total Equipment', 
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50',
                iconBg: 'bg-blue-500',
                trend: '+12%',
                trendUp: true
              },
              { 
                icon: Calendar, 
                value: stats.activeBookings, 
                label: 'Active Bookings', 
                gradient: 'from-green-500 to-emerald-500',
                bgGradient: 'from-green-50 to-emerald-50',
                iconBg: 'bg-green-500',
                trend: '+8%',
                trendUp: true
              },
              { 
                icon: IndianRupee, 
                value: formatCurrency(stats.totalEarnings), 
                label: 'Total Earnings', 
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-50 to-pink-50',
                iconBg: 'bg-purple-500',
                trend: '+23%',
                trendUp: true
              },
              { 
                icon: Star, 
                value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A', 
                label: 'Average Rating', 
                gradient: 'from-yellow-500 to-orange-500',
                bgGradient: 'from-yellow-50 to-orange-50',
                iconBg: 'bg-yellow-500',
                trend: '4.8/5',
                trendUp: true
              }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      {stat.trend}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last 30 days</span>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pending Requests Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Equipment Requests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Equipment Requests</h2>
                    {pendingBookings.length > 0 && (
                      <p className="text-sm text-gray-600">{pendingBookings.length} pending requests</p>
                    )}
                  </div>
                </div>
                <Link href="/provider/bookings" className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 group">
                  View All 
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {pendingBookings.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                      <Clock className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No pending requests</p>
                    <p className="text-gray-500 text-sm mt-1">New requests will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map((booking) => (
                    <Card key={booking.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 bg-white overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Tractor className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-lg truncate">
                              {(booking as Booking & { equipment?: Equipment }).equipment?.name || 'Equipment'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              By {(booking as Booking & { renter?: { name: string } }).renter?.name || 'Renter'}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-xl mb-2">{formatCurrency(booking.total_amount)}</p>
                            <Link href={`/provider/bookings/${booking.id}`}>
                              <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg">
                                Review
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Labour Requests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Labour Requests</h2>
                    {pendingLabourBookings.length > 0 && (
                      <p className="text-sm text-gray-600">{pendingLabourBookings.length} pending requests</p>
                    )}
                  </div>
                </div>
                <Link href="/provider/labour" className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 group">
                  View All 
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {pendingLabourBookings.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                      <Clock className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No pending requests</p>
                    <p className="text-gray-500 text-sm mt-1">New requests will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingLabourBookings.map((booking) => (
                    <Card key={booking.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-white overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-lg truncate">
                              {booking.employer?.full_name || 'Employer'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {booking.total_days} days
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-xl mb-2">{formatCurrency(booking.total_amount)}</p>
                            <Link href={`/provider/labour`}>
                              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                                Review
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Equipment Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Equipment</h2>
                  <p className="text-sm text-gray-600">Your equipment inventory</p>
                </div>
              </div>
              <Link href="/provider/equipment" className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 group">
                View All 
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {myEquipment.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-16 text-center">
                  <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6">
                    <Package className="h-16 w-16 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No equipment listed</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start earning by listing your agricultural equipment
                  </p>
                  <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl">
                    <Link href="/provider/equipment/new">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Your First Equipment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {myEquipment.map((equipment) => (
                  <Link key={equipment.id} href={`/provider/equipment/${equipment.id}`}>
                    <Card className="group h-full hover:shadow-2xl transition-all duration-500 overflow-hidden border-none bg-white hover:-translate-y-2">
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {equipment.images?.[0] ? (
                          <Image
                            src={equipment.images[0]}
                            alt={equipment.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tractor className="h-16 w-16 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Badge 
                          className={cn(
                            "absolute top-3 right-3 shadow-xl backdrop-blur-sm",
                            equipment.is_available 
                              ? "bg-green-500/90 hover:bg-green-500" 
                              : "bg-gray-500/90 hover:bg-gray-500"
                          )}
                        >
                          {equipment.is_available ? '● Available' : '● Unavailable'}
                        </Badge>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-gray-900 truncate text-lg mb-3 group-hover:text-green-600 transition-colors">
                          {equipment.name}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-green-600 text-xl">
                            {formatCurrency(equipment.price_per_day)}
                            <span className="text-sm text-gray-500">/day</span>
                          </span>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Eye className="h-4 w-4" />
                            {equipment.total_bookings || 0}
                          </div>
                        </div>
                        {equipment.rating && (
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "h-4 w-4",
                                    i < Math.floor(equipment.rating || 0) 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-gray-300"
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
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/provider/equipment/new', icon: Plus, label: 'Add Equipment', gradient: 'from-green-500 to-emerald-500', iconColor: 'text-green-600' },
              { href: '/provider/bookings', icon: Calendar, label: 'Bookings', gradient: 'from-blue-500 to-indigo-500', iconColor: 'text-blue-600' },
              { href: '/provider/earnings', icon: BarChart3, label: 'Earnings', gradient: 'from-purple-500 to-pink-500', iconColor: 'text-purple-600' },
              { href: '/provider/reviews', icon: Award, label: 'Reviews', gradient: 'from-yellow-500 to-orange-500', iconColor: 'text-yellow-600' }
            ].map((action, idx) => (
              <Link key={idx} href={action.href}>
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-none bg-white overflow-hidden hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.gradient} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {action.label}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
