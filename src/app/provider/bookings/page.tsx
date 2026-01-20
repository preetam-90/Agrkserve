'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  ChevronRight,
  Tractor,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { Header, Footer, Sidebar } from '@/components/layout';
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
  Avatar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui';
import { bookingService } from '@/lib/services';
import { Booking, Equipment, UserProfile, BookingStatus } from '@/lib/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAppStore, useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ProviderBookingsPage() {
  const { sidebarOpen } = useAppStore();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadBookings();

    // Set up real-time subscription
    const supabase = createClient();
    let channel: any = null;
    
    // Get current user's equipment IDs to filter bookings
    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
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
        
        const equipmentIds = equipmentData?.map(e => e.id) || [];
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
              table: 'bookings'
            },
            (payload) => {
              console.log('Real-time booking event received:', payload);
              
              // Filter client-side to only process bookings for our equipment
              const bookingData = payload.new as any;
              if (!bookingData || !equipmentIds.includes(bookingData.equipment_id)) {
                console.log('Booking not for our equipment, ignoring');
                return;
              }
              
              console.log('Processing booking update for our equipment');
              
              if (payload.eventType === 'INSERT') {
                // Show notification for new booking
                toast.success('New booking request received!', {
                  duration: 4000,
                  icon: '🔔'
                });
                
                // Fetch the new booking with full details, then add it
                bookingService.getById(bookingData.id).then(newBooking => {
                  if (newBooking) {
                    setBookings(current => {
                      // Check if it already exists
                      if (current.some(b => b.id === newBooking.id)) {
                        return current;
                      }
                      return [newBooking, ...current];
                    });
                  }
                }).catch(err => {
                  console.error('Failed to fetch new booking details:', err);
                });
              } else if (payload.eventType === 'UPDATE') {
                // Update existing booking in place
                setBookings(prev => prev.map(booking => 
                  booking.id === bookingData.id 
                    ? { ...booking, status: bookingData.status, updated_at: bookingData.updated_at }
                    : booking
                ));
              } else if (payload.eventType === 'DELETE') {
                // Remove deleted booking
                setBookings(prev => prev.filter(booking => booking.id !== payload.old.id));
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
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b
    ));
    setSelectedBooking(null);
    
    try {
      await bookingService.updateBookingStatus(bookingId, 'confirmed', user.id);
      toast.success('Booking confirmed!');
    } catch (err: any) {
      console.error('Failed to confirm booking:', err);
      const errorMessage = err?.message || 'Failed to confirm booking';
      toast.error(errorMessage);
      // Revert optimistic update on error
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'pending' as BookingStatus } : b
      ));
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
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
    ));
    setSelectedBooking(null);
    
    try {
      await bookingService.cancelBooking(bookingId, 'Rejected by provider', user.id);
      toast.success('Booking rejected');
    } catch (err: any) {
      console.error('Failed to reject booking:', err);
      const errorMessage = err?.message || 'Failed to reject booking';
      toast.error(errorMessage);
      // Revert optimistic update on error
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: previousStatus } : b
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartBooking = async (bookingId: string) => {
    // Optimistic update - update UI immediately
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'in_progress' as BookingStatus } : b
    ));
    
    try {
      await bookingService.updateBookingStatus(bookingId, 'in_progress');
      toast.success('Booking started');
    } catch (err) {
      console.error('Failed to start booking:', err);
      toast.error('Failed to start booking');
      // Revert optimistic update on error
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b
      ));
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    // Optimistic update - update UI immediately
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'completed' as BookingStatus } : b
    ));
    
    try {
      await bookingService.updateBookingStatus(bookingId, 'completed');
      toast.success('Booking completed');
    } catch (err) {
      console.error('Failed to complete booking:', err);
      toast.error('Failed to complete booking');
      // Revert optimistic update on error
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'in_progress' as BookingStatus } : b
      ));
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const config: Record<BookingStatus, { variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'; label: string }> = {
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      confirmed: { variant: 'success', label: 'Confirmed' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      disputed: { variant: 'destructive', label: 'Disputed' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const filterBookings = (tab: string) => {
    let filtered = bookings;
    
    console.log('filterBookings called:', { tab, totalBookings: bookings.length, isLoading });
    
    if (tab === 'pending') {
      filtered = bookings.filter(b => b.status === 'pending');
    } else if (tab === 'confirmed') {
      filtered = bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));
    } else if (tab === 'completed') {
      filtered = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(b => {
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
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar role="provider" />
        
        <main className={cn("flex-1 p-4 lg:p-6 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-0")}>
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
              <p className="text-gray-600">Manage booking requests for your equipment</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by equipment or renter name..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-6">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {pendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="confirmed">Active</TabsTrigger>
                <TabsTrigger value="completed">History</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
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
                    activeTab === 'pending'
                      ? 'No pending booking requests'
                      : 'No bookings match your criteria'
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const equipment = (booking as Booking & { equipment?: Equipment }).equipment;
                    const renter = (booking as Booking & { renter?: UserProfile }).renter;
                    
                    return (
                      <Card key={booking.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {/* Equipment Image */}
                            <div className="w-full sm:w-48 h-32 sm:h-auto bg-gray-100 relative flex-shrink-0">
                              {equipment?.images?.[0] ? (
                                <Image
                                  src={equipment.images[0]}
                                  alt={equipment.name || 'Equipment'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Tractor className="h-12 w-12 text-gray-300" />
                                </div>
                              )}
                            </div>

                            {/* Booking Details */}
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {equipment?.name || 'Equipment'}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Avatar 
                                      src={renter?.profile_image} 
                                      name={renter?.name} 
                                      size="sm" 
                                    />
                                    <span className="text-sm text-gray-600">
                                      {renter?.name || 'Renter'}
                                    </span>
                                  </div>
                                </div>
                                {getStatusBadge(booking.status)}
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span>{booking.start_time} - {booking.end_time}</span>
                                </div>
                              </div>

                              {booking.delivery_address && (
                                <p className="mt-2 text-sm text-gray-500 truncate">
                                  📍 {booking.delivery_address}
                                </p>
                              )}

                              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <span className="font-bold text-green-600 text-lg">
                                  {formatCurrency(booking.total_amount)}
                                </span>
                                
                                <div className="flex gap-2">
                                  {booking.status === 'pending' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setSelectedBooking(booking)}
                                      >
                                        Review
                                      </Button>
                                    </>
                                  )}
                                  
                                  {booking.status === 'confirmed' && (
                                    <Button 
                                      size="sm"
                                      onClick={() => handleStartBooking(booking.id)}
                                    >
                                      Start
                                    </Button>
                                  )}
                                  
                                  {booking.status === 'in_progress' && (
                                    <Button 
                                      size="sm"
                                      onClick={() => handleCompleteBooking(booking.id)}
                                    >
                                      Complete
                                    </Button>
                                  )}
                                  
                                  <Link href={`/provider/bookings/${booking.id}`}>
                                    <Button size="sm" variant="outline">
                                      Details
                                      <ChevronRight className="h-4 w-4 ml-1" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Booking Request</DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <>
                  Request from {((selectedBooking as Booking & { renter?: UserProfile }).renter)?.name || 'Renter'} for{' '}
                  {((selectedBooking as Booking & { equipment?: Equipment }).equipment)?.name || 'Equipment'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Dates</p>
                  <p className="font-medium">
                    {formatDate(selectedBooking.start_date)} - {formatDate(selectedBooking.end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-medium">
                    {selectedBooking.start_time} - {selectedBooking.end_time}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Delivery Address</p>
                  <p className="font-medium">{selectedBooking.delivery_address || 'Not specified'}</p>
                </div>
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Notes</p>
                    <p className="font-medium">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-green-600">
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
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={handleConfirmBooking}
              loading={isProcessing}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
