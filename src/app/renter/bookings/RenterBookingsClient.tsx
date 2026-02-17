'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ChevronRight, Tractor, Search, User } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Spinner,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { bookingService } from '@/lib/services';
import { Booking, Equipment, UserProfile, BookingStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useMyBookings } from '@/lib/hooks/use-booking-queries';
import { bookingKeys } from '@/lib/hooks/query-keys';
import toast from 'react-hot-toast';

export default function RenterBookingsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const { data: bookings = [], isLoading } = useMyBookings();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const hasShownSuccessRef = useRef(false);

  // Show success toast when redirected from booking
  useEffect(() => {
    if (success === 'true' && !hasShownSuccessRef.current) {
      toast.success('🎉 Booking confirmed! Your equipment has been reserved.');
      hasShownSuccessRef.current = true;
      // Clean the URL by removing the query param
      window.history.replaceState(null, '', '/renter/bookings');
    }
  }, [success]);

  // Real-time subscription — updates TanStack Query cache directly
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) return;

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
              if (payload.eventType === 'INSERT') {
                try {
                  const bookingData = payload.new as { id: string };
                  const newBooking = await bookingService.getById(bookingData.id);
                  if (newBooking) {
                    queryClient.setQueryData<Booking[]>(bookingKeys.myBookings(), (old = []) => [
                      newBooking,
                      ...old,
                    ]);
                  }
                } catch {
                  queryClient.invalidateQueries({ queryKey: bookingKeys.myBookings() });
                }
              } else if (payload.eventType === 'UPDATE') {
                const newStatus = (payload.new as { status: string }).status;
                const oldStatus = (payload.old as { status: string })?.status;
                const bookingData = payload.new as { id: string };

                queryClient.setQueryData<Booking[]>(bookingKeys.myBookings(), (old = []) =>
                  old.map((b) => (b.id === bookingData.id ? { ...b, ...bookingData } : b))
                );

                if (newStatus !== oldStatus) {
                  if (newStatus === 'confirmed') {
                    toast.success('Your booking has been confirmed!', {
                      duration: 4000,
                      icon: '✅',
                    });
                  } else if (newStatus === 'rejected' || newStatus === 'cancelled') {
                    toast.error('Your booking was declined', { duration: 4000 });
                  } else if (newStatus === 'in_progress') {
                    toast('Your booking is now in progress', { icon: '🚜' });
                  } else if (newStatus === 'completed') {
                    toast.success('Your booking is complete!', { icon: '✅' });
                  }
                }
              } else if (payload.eventType === 'DELETE') {
                queryClient.setQueryData<Booking[]>(bookingKeys.myBookings(), (old = []) =>
                  old.filter((b) => b.id !== payload.old.id)
                );
              }
            }
          )
          .subscribe();
      } catch {
        // Subscription setup failed silently
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

  const tabCounts = useMemo(
    () => ({
      all: bookings.length,
      active: bookings.filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status))
        .length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => ['cancelled', 'disputed'].includes(b.status)).length,
    }),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    if (activeTab === 'active') {
      filtered = bookings.filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status));
    } else if (activeTab === 'completed') {
      filtered = bookings.filter((b) => b.status === 'completed');
    } else if (activeTab === 'cancelled') {
      filtered = bookings.filter((b) => ['cancelled', 'disputed'].includes(b.status));
    }

    if (searchQuery) {
      filtered = filtered.filter((b) => {
        const equipment = (b as Booking & { equipment?: Equipment }).equipment;
        return equipment?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Deduplicate by booking ID to prevent duplicate key warnings
    const seen = new Set<string>();
    return filtered.filter((booking) => {
      if (seen.has(booking.id)) {
        return false;
      }
      seen.add(booking.id);
      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#020617]">
      <Header />

      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-6xl">
            {/* Hero Header */}
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 shadow-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-[#F8FAFC]">My Bookings</h1>
                  <p className="text-[#94A3B8]">Track and manage your equipment rentals</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#CBD5E1]">
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#22C55E]"></div>
                      {tabCounts.active} Active
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#3B82F6]"></div>
                      {tabCounts.completed} Completed
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#64748B]"></div>
                      {tabCounts.all} Total
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  className="cursor-pointer bg-[#22C55E] text-[#020617] transition-all duration-200 hover:bg-[#16A34A] hover:shadow-lg hover:shadow-[#22C55E]/20"
                >
                  <Link href="/equipment">Book Equipment</Link>
                </Button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by equipment name..."
                  className="border-[#1E293B] bg-[#0F172A] pl-10 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-6 border-[#1E293B] bg-[#0F172A]">
                <TabsTrigger
                  value="all"
                  className="cursor-pointer data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#020617]"
                >
                  All ({tabCounts.all})
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="cursor-pointer data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#020617]"
                >
                  Active ({tabCounts.active})
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="cursor-pointer data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#020617]"
                >
                  Completed ({tabCounts.completed})
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="cursor-pointer data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#020617]"
                >
                  Cancelled ({tabCounts.cancelled})
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Spinner size="lg" className="text-[#22C55E]" />
                  <p className="mt-4 text-[#64748B]">Loading your bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-12 text-center">
                  <Calendar className="mx-auto mb-4 h-16 w-16 text-[#64748B]" />
                  <h3 className="mb-2 text-xl font-semibold text-[#F8FAFC]">No bookings found</h3>
                  <p className="mb-6 text-[#94A3B8]">
                    {activeTab === 'all'
                      ? "You haven't made any bookings yet"
                      : `No ${activeTab} bookings found`}
                  </p>
                  {activeTab === 'all' && (
                    <Button
                      asChild
                      className="cursor-pointer bg-[#22C55E] text-[#020617] transition-all duration-200 hover:bg-[#16A34A]"
                    >
                      <Link href="/equipment">Browse Equipment</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  {filteredBookings.map((booking) => {
                    const equipment = (booking as Booking & { equipment?: Equipment }).equipment;
                    const provider = (booking as Booking & { provider?: UserProfile }).provider;

                    return (
                      <Link
                        key={booking.id}
                        href={`/renter/bookings/${booking.id}`}
                        className="group cursor-pointer"
                      >
                        <Card className="h-full border-[#1E293B] bg-[#0F172A] transition-all duration-200 hover:border-[#22C55E]/50 hover:shadow-xl hover:shadow-[#22C55E]/10">
                          <CardContent className="p-5">
                            <div className="flex gap-4">
                              {/* Equipment Image */}
                              <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-[#1E293B]">
                                {equipment?.images?.[0] ? (
                                  <Image
                                    src={equipment.images[0]}
                                    alt={equipment.name || 'Equipment'}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Tractor className="h-12 w-12 text-[#64748B]" />
                                  </div>
                                )}
                                {/* Status Badge Overlay */}
                                <div className="absolute right-2 top-2">
                                  {getStatusBadge(booking.status)}
                                </div>
                              </div>

                              {/* Booking Details */}
                              <div className="min-w-0 flex-1">
                                <div className="mb-2">
                                  <h3 className="mb-1 truncate text-lg font-semibold text-[#F8FAFC] transition-colors group-hover:text-[#22C55E]">
                                    {equipment?.name || 'Equipment'}
                                  </h3>
                                  <p className="flex items-center gap-1.5 text-sm text-[#94A3B8]">
                                    <User className="h-3.5 w-3.5" />
                                    {provider?.name || 'Provider'}
                                  </p>
                                </div>

                                <div className="space-y-2 text-sm text-[#CBD5E1]">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-[#64748B]" />
                                    <span className="truncate">
                                      {new Date(booking.start_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}{' '}
                                      -{' '}
                                      {new Date(booking.end_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-[#64748B]" />
                                    <span className="truncate">
                                      {booking.start_time} - {booking.end_time}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-[#1E293B] pt-3">
                                  <span className="text-lg font-bold text-[#22C55E]">
                                    {formatCurrency(booking.total_amount)}
                                  </span>
                                  <ChevronRight className="h-5 w-5 text-[#64748B] transition-transform group-hover:translate-x-1" />
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
