'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ChevronRight,
  Users,
  CheckCircle,
  XCircle,
  Search,
  User,
} from 'lucide-react';
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
  Avatar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { labourService } from '@/lib/services';
import { LabourBooking, LabourProfile, UserProfile } from '@/lib/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAppStore, useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function RenterLabourBookingsPage() {
  const { sidebarOpen } = useAppStore();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<LabourBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'all'>(
    'pending'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBooking, setSelectedBooking] = useState<LabourBooking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await labourService.getMyEmployerBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedBooking || !user) return;

    setIsProcessing(true);
    try {
      await labourService.updateBookingStatus(selectedBooking.id, 'confirmed', user.id);
      toast.success('Booking confirmed!');
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      console.error('Failed to confirm booking:', err);
      toast.error('Failed to confirm booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking || !user) return;

    setIsProcessing(true);
    try {
      await labourService.cancelBooking(selectedBooking.id, 'Rejected by employer', user.id);
      toast.success('Booking rejected');
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      console.error('Failed to reject booking:', err);
      toast.error('Failed to reject booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'; label: string }
    > = {
      pending: { variant: 'warning', label: 'Pending' },
      confirmed: { variant: 'success', label: 'Confirmed' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const { variant, label } = config[status] || config.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const filterBookings = (tab: string) => {
    let filtered = bookings;

    if (tab === 'pending') {
      filtered = bookings.filter((b) => b.status === 'pending');
    } else if (tab === 'confirmed') {
      filtered = bookings.filter((b) => ['confirmed', 'in_progress'].includes(b.status));
    } else if (tab === 'completed') {
      filtered = bookings.filter((b) => ['completed', 'cancelled'].includes(b.status));
    }

    if (searchQuery) {
      filtered = filtered.filter((b) => {
        const labour = (b as LabourBooking & { labour?: LabourProfile }).labour;
        return labour?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    return filtered;
  };

  const filteredBookings = filterBookings(activeTab);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Labour Booking Requests</h1>
              <p className="text-gray-600">Manage your labour hiring requests</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by labour name..."
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
                    <span className="ml-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-xs text-white">
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
                  icon={<Users className="h-12 w-12" />}
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
                    const labour = (booking as LabourBooking & { labour?: LabourProfile }).labour;

                    return (
                      <Card key={booking.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {/* Labour Avatar */}
                            <div className="relative flex h-32 w-full flex-shrink-0 items-center justify-center bg-gray-100 sm:h-auto sm:w-48">
                              <Avatar
                                src={labour?.user?.profile_image}
                                name={labour?.user?.name}
                                size="lg"
                              />
                            </div>

                            {/* Booking Details */}
                            <div className="flex-1 p-4">
                              <div className="mb-2 flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {labour?.user?.name || 'Labour'}
                                  </h3>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                      {labour?.skills?.join(', ') || 'General Labour'}
                                    </span>
                                  </div>
                                </div>
                                {getStatusBadge(booking.status)}
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {formatDate(booking.start_date)} -{' '}
                                    {formatDate(booking.end_date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span>{booking.total_days} days</span>
                                </div>
                              </div>

                              {booking.notes && (
                                <p className="mt-2 text-sm text-gray-500">📝 {booking.notes}</p>
                              )}

                              <div className="mt-4 flex items-center justify-between border-t pt-4">
                                <span className="text-lg font-bold text-green-600">
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

                                  <Link href={`/renter/labour/${booking.labour_id}`}>
                                    <Button size="sm" variant="outline">
                                      Details
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Booking Request</DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <>
                  Request for{' '}
                  {(selectedBooking as LabourBooking & { labour?: LabourProfile }).labour?.user
                    ?.name || 'Labour'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Dates</p>
                  <p className="font-medium">
                    {formatDate(selectedBooking.start_date)} -{' '}
                    {formatDate(selectedBooking.end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Days</p>
                  <p className="font-medium">{selectedBooking.total_days} days</p>
                </div>
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Notes</p>
                    <p className="font-medium">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-green-50 p-3">
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
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleConfirmBooking} loading={isProcessing} className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
