'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight, Users, CheckCircle, XCircle, Search, MapPin, Phone, Star, IndianRupee } from 'lucide-react';
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
import { LabourBooking, LabourProfile } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function LabourBookingsPage() {
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
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedBooking) return;

    setIsProcessing(true);
    try {
      console.log('Attempting to confirm booking:', selectedBooking.id);
      const result = await labourService.updateBookingStatus(selectedBooking.id, 'confirmed', user?.id);
      console.log('Booking confirmed successfully:', result);
      toast.success('Booking confirmed!');
      setSelectedBooking(null);
      loadBookings();
    } catch (err: any) {
      console.error('Detailed error object:', err);
      console.error('Error name:', err?.name);
      console.error('Error message:', err?.message);
      console.error('Error status:', err?.status);
      console.error('Error details:', err?.details);
      
      let errorMessage = 'Failed to confirm booking';
      if (err?.message) {
        errorMessage = `Failed to confirm booking: ${err.message}`;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = `Failed to confirm booking: ${JSON.stringify(err)}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking) return;

    setIsProcessing(true);
    try {
      console.log('Attempting to reject booking:', selectedBooking.id);
      await labourService.cancelBooking(selectedBooking.id, 'Rejected by employer', user?.id);
      console.log('Booking rejected successfully');
      toast.success('Booking rejected');
      setSelectedBooking(null);
      loadBookings();
    } catch (err: any) {
      console.error('Detailed error object (reject):', err);
      console.error('Error name (reject):', err?.name);
      console.error('Error message (reject):', err?.message);
      console.error('Error status (reject):', err?.status);
      console.error('Error details (reject):', err?.details);
      
      let errorMessage = 'Failed to reject booking';
      if (err?.message) {
        errorMessage = `Failed to reject booking: ${err.message}`;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = `Failed to reject booking: ${JSON.stringify(err)}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
      confirmed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Confirmed' },
      in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'In Progress' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completed' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
    };
    const { bg, text, label } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    );
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
        return labour?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               labour?.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      });
    }

    return filtered;
  };

  const filteredBookings = filterBookings(activeTab);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Labour Booking Dashboard</h1>
              <p className="text-slate-400">Manage and track your labour hiring requests</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#0F172A] rounded-xl p-5 border border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Bookings</p>
                    <p className="text-2xl font-bold text-white">{bookings.length}</p>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#0F172A] rounded-xl p-5 border border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-white">{pendingCount}</p>
                  </div>
                  <div className="bg-yellow-500/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#0F172A] rounded-xl p-5 border border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active</p>
                    <p className="text-2xl font-bold text-white">
                      {bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length}
                    </p>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <ChevronRight className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#0F172A] rounded-xl p-5 border border-[#1E293B]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-white">
                      {bookings.filter(b => b.status === 'completed').length}
                    </p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by labour name or skills..."
                  className="w-full bg-[#0F172A] border-[#1E293B] text-white pl-10 h-12"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-6 bg-[#0F172A] border border-[#1E293B] h-12">
                <TabsTrigger 
                  value="pending" 
                  className="relative data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
                >
                  Pending
                  {pendingCount > 0 && (
                    <span className="ml-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-xs text-white">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="confirmed" 
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
                >
                  History
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
                >
                  All
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-12 w-12 text-slate-500" />}
                  title="No bookings found"
                  description={
                    activeTab === 'pending'
                      ? 'No pending booking requests'
                      : 'No bookings match your criteria'
                  }
                  className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-12"
                />
              ) : (
                <div className="space-y-5">
                  {filteredBookings.map((booking) => {
                    const labour = (booking as LabourBooking & { labour?: LabourProfile }).labour;

                    return (
                      <Card 
                        key={booking.id} 
                        className="overflow-hidden bg-[#0F172A] border border-[#1E293B] hover:border-emerald-500/30 transition-all duration-300 cursor-pointer"
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            {/* Labour Avatar */}
                            <div className="relative flex h-40 w-full flex-shrink-0 items-center justify-center bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 md:h-auto md:w-48">
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                              <Avatar
                                src={labour?.user?.profile_image}
                                name={labour?.user?.name}
                                size="lg"
                                className="relative z-10"
                              />
                              {labour?.rating && (
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-white">{labour.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>

                            {/* Booking Details */}
                            <div className="flex-1 p-5">
                              <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-lg text-white">
                                    {labour?.user?.name || 'Labour'}
                                  </h3>
                                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                                    {labour?.skills?.slice(0, 3).map((skill, idx) => (
                                      <span 
                                        key={idx} 
                                        className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {labour?.skills && labour.skills.length > 3 && (
                                      <span className="text-xs text-slate-500">
                                        +{labour.skills.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-2 sm:mt-0">
                                  {getStatusBadge(booking.status)}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Calendar className="h-4 w-4 text-emerald-400" />
                                  <span>
                                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Clock className="h-4 w-4 text-emerald-400" />
                                  <span>{booking.total_days} days</span>
                                </div>
                                
                                {labour?.user?.address && (
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                    <span>{labour.user.address}</span>
                                  </div>
                                )}
                                
                                {labour?.user?.phone && (
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <Phone className="h-4 w-4 text-emerald-400" />
                                    <span>{labour.user.phone}</span>
                                  </div>
                                )}
                              </div>

                              {booking.notes && (
                                <div className="mb-4 p-3 bg-[#1E293B]/30 rounded-lg">
                                  <p className="text-sm text-slate-300 flex items-start gap-2">
                                    <span className="text-emerald-400">📝</span> 
                                    {booking.notes}
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[#1E293B]">
                                <div className="flex items-center gap-2 mb-3 sm:mb-0">
                                  <IndianRupee className="h-5 w-5 text-emerald-400" />
                                  <span className="text-xl font-bold text-white">
                                    {formatCurrency(booking.total_amount)}
                                  </span>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                  {booking.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBooking(booking);
                                      }}
                                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                    >
                                      Review
                                    </Button>
                                  )}

                                  <Link href={`/labour/${booking.labour_id}`}>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                    >
                                      View Profile
                                      <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                  </Link>
                                  
                                  {booking.status === 'confirmed' && (
                                    <Link href={`/messages/${labour?.user?.id}`}>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                      >
                                        Contact
                                      </Button>
                                    </Link>
                                  )}
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
        <DialogContent className="bg-[#0F172A] border-[#1E293B] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-emerald-400">Review Booking Request</DialogTitle>
            <DialogDescription className="text-slate-400">
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
                <div className="bg-[#1E293B]/30 p-3 rounded-lg">
                  <p className="text-slate-400">Start Date</p>
                  <p className="font-medium text-white">
                    {formatDate(selectedBooking.start_date)}
                  </p>
                </div>
                <div className="bg-[#1E293B]/30 p-3 rounded-lg">
                  <p className="text-slate-400">End Date</p>
                  <p className="font-medium text-white">
                    {formatDate(selectedBooking.end_date)}
                  </p>
                </div>
                <div className="bg-[#1E293B]/30 p-3 rounded-lg">
                  <p className="text-slate-400">Total Days</p>
                  <p className="font-medium text-white">{selectedBooking.total_days} days</p>
                </div>
                <div className="bg-[#1E293B]/30 p-3 rounded-lg">
                  <p className="text-slate-400">Amount</p>
                  <p className="font-medium text-white">
                    {formatCurrency(selectedBooking.total_amount)}
                  </p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bg-[#1E293B]/30 p-3 rounded-lg">
                  <p className="text-slate-400 mb-1">Notes</p>
                  <p className="text-white">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                <p className="text-sm text-slate-300">Total Amount</p>
                <p className="text-2xl font-bold text-emerald-400">
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
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button 
              onClick={handleConfirmBooking} 
              loading={isProcessing} 
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
