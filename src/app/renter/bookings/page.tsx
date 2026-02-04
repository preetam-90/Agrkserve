'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ChevronRight, Tractor, Search } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Spinner,
  EmptyState,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { bookingService } from '@/lib/services';
import { Booking, Equipment, UserProfile, BookingStatus } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useAppStore, useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function RenterBookingsPage() {
  const { sidebarOpen } = useAppStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBookings();

    // Set up real-time subscription
    const supabase = createClient();
    let channel: any = null;

    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) {
          console.log('No user found for real-time subscription');
          return;
        }

        console.log('Setting up renter real-time subscription for user:', currentUser.id);

        // Subscribe to bookings table changes for this renter
        channel = supabase
          .channel('renter-bookings-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookings',
              filter: `renter_id=eq.${currentUser.id}`,
            },
            async (payload) => {
              console.log('Real-time booking update:', payload);

              if (payload.eventType === 'INSERT') {
                console.log('New booking created');
                // Fetch the new booking with full details
                try {
                  const bookingData = payload.new as any;
                  const newBooking = await bookingService.getById(bookingData.id);
                  if (newBooking) {
                    setBookings((prev) => [newBooking, ...prev]);
                  }
                } catch (err) {
                  console.error('Failed to fetch new booking:', err);
                  refreshBookings();
                }
              } else if (payload.eventType === 'UPDATE') {
                const newStatus = (payload.new as any).status;
                const oldStatus = (payload.old as any)?.status;
                const bookingData = payload.new as any;

                // Update existing booking in place
                setBookings((prev) =>
                  prev.map((booking) =>
                    booking.id === bookingData.id ? { ...booking, ...bookingData } : booking
                  )
                );

                // Only show notification if status actually changed
                if (newStatus !== oldStatus) {
                  if (newStatus === 'confirmed') {
                    toast.success('Your booking has been confirmed!', {
                      duration: 4000,
                      icon: '✅',
                    });
                  } else if (newStatus === 'rejected' || newStatus === 'cancelled') {
                    toast.error('Your booking was declined', {
                      duration: 4000,
                    });
                  } else if (newStatus === 'in_progress') {
                    toast('Your booking is now in progress', {
                      icon: '🚜',
                    });
                  } else if (newStatus === 'completed') {
                    toast.success('Your booking is complete!', {
                      icon: '✅',
                    });
                  }
                }
              } else if (payload.eventType === 'DELETE') {
                // Remove deleted booking
                setBookings((prev) => prev.filter((booking) => booking.id !== payload.old.id));
              }
            }
          )
          .subscribe((status) => {
            console.log('Renter subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Successfully subscribed to renter booking changes');
            } else if (status === 'TIMED_OUT') {
              console.error('❌ Subscription timed out');
            }
          });
      } catch (error) {
        console.error('Failed to setup real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        console.log('Cleaning up renter real-time subscription');
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Silent refresh without loading state (for real-time updates)
  const refreshBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to refresh bookings:', err);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<
      BookingStatus,
      'default' | 'success' | 'warning' | 'destructive' | 'secondary'
    > = {
      pending: 'warning',
      confirmed: 'success',
      in_progress: 'default',
      completed: 'success',
      cancelled: 'destructive',
      disputed: 'destructive',
      approved: 'success',
      rejected: 'destructive',
    };

    const labels: Record<BookingStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
      approved: 'Approved',
      rejected: 'Rejected',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const filterBookings = (status: string) => {
    let filtered = bookings;

    if (status === 'active') {
      filtered = bookings.filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status));
    } else if (status === 'completed') {
      filtered = bookings.filter((b) => b.status === 'completed');
    } else if (status === 'cancelled') {
      filtered = bookings.filter((b) => ['cancelled', 'disputed'].includes(b.status));
    }

    if (searchQuery) {
      filtered = filtered.filter((b) => {
        const equipment = (b as Booking & { equipment?: Equipment }).equipment;
        return equipment?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    return filtered;
  };

  const filteredBookings = filterBookings(activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-600">Track and manage your equipment bookings</p>
              </div>
              <Button asChild>
                <Link href="/equipment">Book Equipment</Link>
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookings..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
                <TabsTrigger value="active">
                  Active (
                  {
                    bookings.filter((b) =>
                      ['pending', 'confirmed', 'in_progress'].includes(b.status)
                    ).length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({bookings.filter((b) => b.status === 'completed').length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled (
                  {bookings.filter((b) => ['cancelled', 'disputed'].includes(b.status)).length})
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="h-12 w-12" />}
                  title="No bookings found"
                  description={
                    activeTab === 'all'
                      ? "You haven't made any bookings yet"
                      : `No ${activeTab} bookings found`
                  }
                  action={
                    activeTab === 'all' && (
                      <Button asChild>
                        <Link href="/equipment">Browse Equipment</Link>
                      </Button>
                    )
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const equipment = (booking as Booking & { equipment?: Equipment }).equipment;
                    const provider = (booking as Booking & { provider?: UserProfile }).provider;

                    return (
                      <Link key={booking.id} href={`/renter/bookings/${booking.id}`}>
                        <Card className="transition-shadow hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Equipment Image */}
                              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {equipment?.images?.[0] ? (
                                  <Image
                                    src={equipment.images[0]}
                                    alt={equipment.name || 'Equipment'}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Tractor className="h-10 w-10 text-gray-300" />
                                  </div>
                                )}
                              </div>

                              {/* Booking Details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="truncate font-semibold text-gray-900">
                                      {equipment?.name || 'Equipment'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      by {provider?.name || 'Provider'}
                                    </p>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(booking.start_date).toLocaleDateString()} -{' '}
                                    {new Date(booking.end_date).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {booking.start_time} - {booking.end_time}
                                  </span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                  <span className="font-bold text-green-600">
                                    {formatCurrency(booking.total_amount)}
                                  </span>
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Tabs>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
