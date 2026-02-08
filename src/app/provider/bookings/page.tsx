'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  ChevronRight,
  Tractor,
  CheckCircle,
  XCircle,
  Search,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  Avatar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { bookingService } from '@/lib/services';
import { Booking, Equipment, UserProfile, BookingStatus } from '@/lib/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export default function ProviderBookingsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'all'>(
    'pending'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadBookings();

    // Set up real-time subscription
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    // Get current user's equipment IDs to filter bookings
    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) {
          console.log('No user found for real-time subscription');
          return;
        }

        console.log('Setting up real-time subscription for user:', currentUser.id);

        // Fetch user's equipment IDs
        const { data: equipmentData, error: equipError } = await supabase
          .from('equipment')
          .select('id')
          .eq('owner_id', currentUser.id);

        if (equipError) {
          console.error('Error fetching equipment:', equipError);
          return;
        }

        const equipmentIds = equipmentData?.map((e) => e.id) || [];
        console.log('Monitoring equipment IDs:', equipmentIds);

        if (equipmentIds.length === 0) {
          console.log('No equipment found, skipping real-time subscription');
          return;
        }

        // Clean up any existing channel first
        const existingChannel = supabase.channel('provider-bookings-changes');
        await supabase.removeChannel(existingChannel);

        // Subscribe to bookings table changes (listen to ALL bookings, filter client-side)
        channel = supabase
          .channel('provider-bookings-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookings',
            },
            (payload) => {
              console.log('Real-time booking event received:', payload);

              // Filter client-side to only process bookings for our equipment
              const bookingData = payload.new as {
                equipment_id: string;
                id: string;
                status: BookingStatus;
                updated_at: string;
              };
              if (!bookingData || !equipmentIds.includes(bookingData.equipment_id)) {
                console.log('Booking not for our equipment, ignoring');
                return;
              }

              console.log('Processing booking update for our equipment');

              if (payload.eventType === 'INSERT') {
                // Show notification for new booking
                toast.success('New booking request received!', {
                  duration: 4000,
                  icon: '🔔',
                });

                // Fetch the new booking with full details, then add it
                bookingService
                  .getById(bookingData.id)
                  .then((newBooking) => {
                    if (newBooking) {
                      setBookings((current) => {
                        // Check if it already exists
                        if (current.some((b) => b.id === newBooking.id)) {
                          return current;
                        }
                        return [newBooking, ...current];
                      });
                    }
                  })
                  .catch((err) => {
                    console.error('Failed to fetch new booking details:', err);
                  });
              } else if (payload.eventType === 'UPDATE') {
                // Update existing booking in place
                setBookings((prev) =>
                  prev.map((booking) =>
                    booking.id === bookingData.id
                      ? {
                          ...booking,
                          status: bookingData.status,
                          updated_at: bookingData.updated_at,
                        }
                      : booking
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                // Remove deleted booking
                setBookings((prev) => prev.filter((booking) => booking.id !== payload.old.id));
              }
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Successfully subscribed to booking changes');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Channel error in subscription');
              // Channel errors often mean realtime is not enabled in Supabase
              console.log('💡 Please enable Realtime in Supabase Dashboard:');
              console.log('   Database → Replication → Enable realtime for "bookings" table');
            } else if (status === 'TIMED_OUT') {
              console.error('❌ Subscription timed out');
              console.log('💡 Check your internet connection and Supabase project status');
            }
          });
      } catch (error) {
        console.error('Failed to setup real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadBookings = async () => {
    console.log('loadBookings called - setting isLoading true');
    setIsLoading(true);
    try {
      const data = await bookingService.getProviderBookings();
      console.log('loadBookings received:', data.length, 'bookings');
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      console.log('loadBookings complete - setting isLoading false');
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedBooking || !user) return;

    const bookingId = selectedBooking.id;
    setIsProcessing(true);

    // Optimistic update - update UI immediately
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b))
    );
    setSelectedBooking(null);

    try {
      await bookingService.updateBookingStatus(bookingId, 'confirmed', user.id);
      toast.success('Booking confirmed!');
    } catch (err: unknown) {
      console.error('Failed to confirm booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm booking';
      toast.error(errorMessage);
      // Revert optimistic update on error
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'pending' as BookingStatus } : b))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking || !user) return;

    const bookingId = selectedBooking.id;
    const previousStatus = selectedBooking.status;
    setIsProcessing(true);

    // Optimistic update - update UI immediately
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b))
    );
    setSelectedBooking(null);

    try {
      await bookingService.cancelBooking(bookingId, 'Rejected by provider', user.id);
      toast.success('Booking rejected');
    } catch (err: unknown) {
      console.error('Failed to reject booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject booking';
      toast.error(errorMessage);
      // Revert optimistic update on error
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: previousStatus } : b))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartBooking = async (bookingId: string) => {
    // Optimistic update - update UI immediately
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'in_progress' as BookingStatus } : b))
    );

    try {
      await bookingService.updateBookingStatus(bookingId, 'in_progress');
      toast.success('Booking started');
    } catch (err) {
      console.error('Failed to start booking:', err);
      toast.error('Failed to start booking');
      // Revert optimistic update on error
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b))
      );
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    // Optimistic update - update UI immediately
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' as BookingStatus } : b))
    );

    try {
      await bookingService.updateBookingStatus(bookingId, 'completed');
      toast.success('Booking completed');
    } catch (err) {
      console.error('Failed to complete booking:', err);
      toast.error('Failed to complete booking');
      // Revert optimistic update on error
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'in_progress' as BookingStatus } : b))
      );
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const config: Record<
      BookingStatus,
      {
        variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
        label: string;
        bgColor: string;
        textColor: string;
      }
    > = {
      pending: {
        variant: 'warning',
        label: 'Pending Review',
        bgColor: 'bg-[#FEF3C7]/20',
        textColor: 'text-[#FCD34D]',
      },
      approved: {
        variant: 'success',
        label: 'Approved',
        bgColor: 'bg-[#D1FAE5]/20',
        textColor: 'text-[#22C55E]',
      },
      rejected: {
        variant: 'destructive',
        label: 'Rejected',
        bgColor: 'bg-[#FEE2E2]/20',
        textColor: 'text-[#EF4444]',
      },
      confirmed: {
        variant: 'success',
        label: 'Confirmed',
        bgColor: 'bg-[#DBEAFE]/20',
        textColor: 'text-[#60A5FA]',
      },
      in_progress: {
        variant: 'default',
        label: 'In Progress',
        bgColor: 'bg-[#E0E7FF]/20',
        textColor: 'text-[#818CF8]',
      },
      completed: {
        variant: 'success',
        label: 'Completed',
        bgColor: 'bg-[#D1FAE5]/20',
        textColor: 'text-[#22C55E]',
      },
      cancelled: {
        variant: 'destructive',
        label: 'Cancelled',
        bgColor: 'bg-[#FEE2E2]/20',
        textColor: 'text-[#EF4444]',
      },
      disputed: {
        variant: 'destructive',
        label: 'Disputed',
        bgColor: 'bg-[#FEE2E2]/20',
        textColor: 'text-[#EF4444]',
      },
    };
    const { label, bgColor, textColor } = config[status];
    return (
      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', bgColor, textColor)}>
        {label}
      </span>
    );
  };

  const filterBookings = (tab: string) => {
    let filtered = bookings;

    console.log('filterBookings called:', { tab, totalBookings: bookings.length, isLoading });

    if (tab === 'pending') {
      filtered = bookings.filter((b) => b.status === 'pending');
    } else if (tab === 'confirmed') {
      filtered = bookings.filter((b) => ['confirmed', 'in_progress'].includes(b.status));
    } else if (tab === 'completed') {
      filtered = bookings.filter((b) => ['completed', 'cancelled'].includes(b.status));
    }

    if (searchQuery) {
      filtered = filtered.filter((b) => {
        const equipment = (b as Booking & { equipment?: Equipment }).equipment;
        const renter = (b as Booking & { renter?: UserProfile }).renter;
        return (
          equipment?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          renter?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    console.log('filterBookings result:', { filteredCount: filtered.length });
    return filtered;
  };

  const filteredBookings = filterBookings(activeTab);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) =>
    ['confirmed', 'in_progress'].includes(b.status)
  ).length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#020617]">
      <Header />

      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-7xl">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#F8FAFC]">Booking Management</h1>
              <p className="mt-2 text-[#94A3B8]">Track and manage all your equipment bookings</p>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm transition-all duration-200 hover:border-[#22C55E]/30 hover:shadow-lg hover:shadow-[#22C55E]/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#94A3B8]">Pending</p>
                      <p className="mt-2 text-3xl font-bold text-[#F8FAFC]">{pendingCount}</p>
                    </div>
                    <div className="rounded-full bg-[#FEF3C7]/10 p-3">
                      <Clock className="h-6 w-6 text-[#FCD34D]" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-[#64748B]">Awaiting your response</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm transition-all duration-200 hover:border-[#22C55E]/30 hover:shadow-lg hover:shadow-[#22C55E]/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#94A3B8]">Active</p>
                      <p className="mt-2 text-3xl font-bold text-[#F8FAFC]">{confirmedCount}</p>
                    </div>
                    <div className="rounded-full bg-[#DBEAFE]/10 p-3">
                      <TrendingUp className="h-6 w-6 text-[#60A5FA]" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-[#64748B]">Confirmed & in progress</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm transition-all duration-200 hover:border-[#22C55E]/30 hover:shadow-lg hover:shadow-[#22C55E]/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#94A3B8]">Completed</p>
                      <p className="mt-2 text-3xl font-bold text-[#F8FAFC]">{completedCount}</p>
                    </div>
                    <div className="rounded-full bg-[#D1FAE5]/10 p-3">
                      <CheckCircle className="h-6 w-6 text-[#22C55E]" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-[#64748B]">Successfully finished</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm transition-all duration-200 hover:border-[#22C55E]/30 hover:shadow-lg hover:shadow-[#22C55E]/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#94A3B8]">Revenue</p>
                      <p className="mt-2 text-2xl font-bold text-[#22C55E]">
                        {formatCurrency(totalRevenue)}
                      </p>
                    </div>
                    <div className="rounded-full bg-[#D1FAE5]/10 p-3">
                      <DollarSign className="h-6 w-6 text-[#22C55E]" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-[#64748B]">Total earnings</p>
                </CardContent>
              </Card>
            </div>

            {/* Search & Filter Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by equipment or renter name..."
                  className="border-[#1E293B] bg-[#0F172A]/80 pl-10 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E]/50 focus:ring-[#22C55E]/20"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-6 border-[#1E293B] bg-[#0F172A]/80">
                <TabsTrigger
                  value="pending"
                  className="relative data-[state=active]:bg-[#22C55E]/10 data-[state=active]:text-[#22C55E]"
                >
                  Pending
                  {pendingCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FCD34D] text-xs font-bold text-[#0F172A]">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="confirmed"
                  className="data-[state=active]:bg-[#22C55E]/10 data-[state=active]:text-[#22C55E]"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-[#22C55E]/10 data-[state=active]:text-[#22C55E]"
                >
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#22C55E]/10 data-[state=active]:text-[#22C55E]"
                >
                  All
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#1E293B] border-t-[#22C55E]"></div>
                    <Package className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-[#22C55E]" />
                  </div>
                  <p className="mt-4 text-sm text-[#64748B]">Loading bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="rounded-xl border border-[#1E293B] bg-[#0F172A]/50 p-12 text-center backdrop-blur-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1E293B]">
                    <Calendar className="h-8 w-8 text-[#64748B]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#F8FAFC]">No bookings found</h3>
                  <p className="text-sm text-[#64748B]">
                    {activeTab === 'pending'
                      ? 'No pending booking requests at the moment'
                      : 'No bookings match your current filters'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const equipment = (booking as Booking & { equipment?: Equipment }).equipment;
                    const renter = (booking as Booking & { renter?: UserProfile }).renter;

                    return (
                      <Card
                        key={booking.id}
                        className="group cursor-pointer overflow-hidden border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm transition-all duration-200 hover:border-[#22C55E]/30 hover:shadow-lg hover:shadow-[#22C55E]/10"
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {/* Equipment Image */}
                            <div className="relative h-40 w-full flex-shrink-0 overflow-hidden bg-[#1E293B] sm:h-auto sm:w-56">
                              {equipment?.images?.[0] ? (
                                <Image
                                  src={equipment.images[0]}
                                  alt={equipment.name || 'Equipment'}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Tractor className="h-12 w-12 text-[#475569]" />
                                </div>
                              )}
                              {/* Status Indicator Overlay */}
                              <div className="absolute right-2 top-2">
                                {getStatusBadge(booking.status)}
                              </div>
                            </div>

                            {/* Booking Details */}
                            <div className="flex-1 p-5">
                              <div className="mb-3 flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-[#F8FAFC] transition-colors group-hover:text-[#22C55E]">
                                    {equipment?.name || 'Equipment'}
                                  </h3>
                                  <div className="mt-2 flex items-center gap-2">
                                    <Avatar
                                      src={renter?.profile_image}
                                      name={renter?.name}
                                      size="sm"
                                    />
                                    <span className="text-sm text-[#94A3B8]">
                                      {renter?.name || 'Renter'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-2 rounded-lg bg-[#1E293B]/50 p-3">
                                  <Calendar className="h-4 w-4 text-[#22C55E]" />
                                  <div>
                                    <p className="text-xs text-[#64748B]">Duration</p>
                                    <p className="text-sm font-medium text-[#F8FAFC]">
                                      {formatDate(booking.start_date)} -{' '}
                                      {formatDate(booking.end_date)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-[#1E293B]/50 p-3">
                                  <Clock className="h-4 w-4 text-[#22C55E]" />
                                  <div>
                                    <p className="text-xs text-[#64748B]">Time</p>
                                    <p className="text-sm font-medium text-[#F8FAFC]">
                                      {booking.start_time} - {booking.end_time}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {booking.delivery_address && (
                                <div className="mt-3 rounded-lg bg-[#1E293B]/30 p-3">
                                  <p className="text-xs text-[#64748B]">Delivery Location</p>
                                  <p className="mt-1 text-sm text-[#94A3B8]">
                                    {booking.delivery_address}
                                  </p>
                                </div>
                              )}

                              <div className="mt-4 flex flex-col gap-3 border-t border-[#1E293B] pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xs text-[#64748B]">Total Amount</span>
                                  <span className="text-2xl font-bold text-[#22C55E]">
                                    {formatCurrency(booking.total_amount)}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {booking.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => setSelectedBooking(booking)}
                                      className="bg-[#22C55E] text-[#0F172A] hover:bg-[#16A34A]"
                                    >
                                      Review Request
                                    </Button>
                                  )}

                                  {booking.status === 'confirmed' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStartBooking(booking.id)}
                                      className="bg-[#60A5FA] text-[#0F172A] hover:bg-[#3B82F6]"
                                    >
                                      Start Booking
                                    </Button>
                                  )}

                                  {booking.status === 'in_progress' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleCompleteBooking(booking.id)}
                                      className="bg-[#22C55E] text-[#0F172A] hover:bg-[#16A34A]"
                                    >
                                      Mark Complete
                                    </Button>
                                  )}

                                  <Link href={`/provider/bookings/${booking.id}`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-[#1E293B] bg-transparent text-[#F8FAFC] hover:border-[#22C55E]/50 hover:bg-[#22C55E]/10"
                                    >
                                      View Details
                                      <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Tabs>
          </div>
        </main>
      </div>

      {/* Review Booking Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="border-[#1E293B] bg-[#0F172A] text-[#F8FAFC]">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#F8FAFC]">Review Booking Request</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              {selectedBooking && (
                <>
                  Request from{' '}
                  <span className="font-semibold text-[#22C55E]">
                    {(selectedBooking as Booking & { renter?: UserProfile }).renter?.name ||
                      'Renter'}
                  </span>{' '}
                  for{' '}
                  <span className="font-semibold text-[#22C55E]">
                    {(selectedBooking as Booking & { equipment?: Equipment }).equipment?.name ||
                      'Equipment'}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#22C55E]" />
                    <p className="text-xs font-medium text-[#64748B]">Booking Dates</p>
                  </div>
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    {formatDate(selectedBooking.start_date)}
                  </p>
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    {formatDate(selectedBooking.end_date)}
                  </p>
                </div>
                <div className="rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#22C55E]" />
                    <p className="text-xs font-medium text-[#64748B]">Time Slot</p>
                  </div>
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    {selectedBooking.start_time}
                  </p>
                  <p className="text-sm font-semibold text-[#F8FAFC]">{selectedBooking.end_time}</p>
                </div>
              </div>

              {selectedBooking.delivery_address && (
                <div className="rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4">
                  <p className="mb-2 text-xs font-medium text-[#64748B]">Delivery Address</p>
                  <p className="text-sm text-[#F8FAFC]">{selectedBooking.delivery_address}</p>
                </div>
              )}

              {selectedBooking.notes && (
                <div className="rounded-lg border border-[#1E293B] bg-[#1E293B]/30 p-4">
                  <p className="mb-2 text-xs font-medium text-[#64748B]">Special Notes</p>
                  <p className="text-sm text-[#F8FAFC]">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 p-4">
                <p className="mb-1 text-xs font-medium text-[#64748B]">Total Payment</p>
                <p className="text-3xl font-bold text-[#22C55E]">
                  {formatCurrency(selectedBooking.total_amount)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRejectBooking}
              loading={isProcessing}
              className="flex-1 border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Request
            </Button>
            <Button
              onClick={handleConfirmBooking}
              loading={isProcessing}
              className="flex-1 bg-[#22C55E] text-[#0F172A] hover:bg-[#16A34A]"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
