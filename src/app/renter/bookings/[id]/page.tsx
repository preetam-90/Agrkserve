'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Tractor,
  CreditCard,
  Package,
  TrendingUp,
  User,
  Download,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Spinner,
  Avatar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Textarea,
} from '@/components/ui';
import { bookingService, reviewService } from '@/lib/services';
import { Booking, Equipment, UserProfile, BookingStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
// @react-pdf/renderer and InvoicePDF are dynamically imported in handleDownloadInvoice
// to avoid loading ~500KB+ bundle on page load (only ~5% of users click "Download Invoice")

function BookingDetailPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params.id as string;
  const isSuccess = searchParams.get('success') === 'true';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [review, setReview] = useState({
    rating: 5,
    comment: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  useEffect(() => {
    loadBooking();

    if (isSuccess) {
      toast.success('Booking confirmed successfully!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, isSuccess]);

  const loadBooking = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getBookingById(bookingId);
      setBooking(data);
    } catch (err) {
      console.error('Failed to load booking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    setIsCancelling(true);
    try {
      await bookingService.cancelBooking(booking.id, cancelReason);
      toast.success('Booking cancelled successfully');
      setShowCancelDialog(false);
      loadBooking();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      toast.error('Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking) return;

    setIsSubmittingReview(true);
    try {
      await reviewService.createReview({
        booking_id: booking.id,
        equipment_id: booking.equipment_id,
        rating: review.rating,
        comment: review.comment || undefined,
      });
      toast.success('Review submitted successfully!');
      setShowReviewDialog(false);
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!booking) return;

    setIsGeneratingInvoice(true);
    try {
      // Dynamically import heavy PDF dependencies (~500KB+) only when needed
      const [{ pdf }, { InvoicePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/invoice/InvoicePDF'),
      ]);
      const invoiceDoc = <InvoicePDF booking={booking} />;
      const blob = await pdf(invoiceDoc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${booking.id.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      toast.error('Failed to generate invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const getStatusInfo = (status: BookingStatus) => {
    const info: Record<
      BookingStatus,
      {
        color: string;
        bgGradient: string;
        icon: React.ReactNode;
        label: string;
        description: string;
        step: number;
      }
    > = {
      pending: {
        color: 'text-yellow-400',
        bgGradient: 'from-yellow-500/20 to-yellow-600/10',
        icon: <Clock className="h-5 w-5" />,
        label: 'Pending Confirmation',
        description: 'Waiting for the provider to confirm your booking',
        step: 1,
      },
      approved: {
        color: 'text-[#22C55E]',
        bgGradient: 'from-[#22C55E]/20 to-[#16A34A]/10',
        icon: <CheckCircle className="h-5 w-5" />,
        label: 'Approved',
        description: 'Your booking has been approved',
        step: 2,
      },
      rejected: {
        color: 'text-red-400',
        bgGradient: 'from-red-500/20 to-red-600/10',
        icon: <XCircle className="h-5 w-5" />,
        label: 'Rejected',
        description: 'Your booking request was rejected',
        step: 0,
      },
      confirmed: {
        color: 'text-[#22C55E]',
        bgGradient: 'from-[#22C55E]/20 to-[#16A34A]/10',
        icon: <CheckCircle className="h-5 w-5" />,
        label: 'Confirmed',
        description: 'Your booking has been confirmed',
        step: 2,
      },
      in_progress: {
        color: 'text-blue-400',
        bgGradient: 'from-blue-500/20 to-blue-600/10',
        icon: <TrendingUp className="h-5 w-5" />,
        label: 'In Progress',
        description: 'Equipment is currently in use',
        step: 3,
      },
      completed: {
        color: 'text-[#22C55E]',
        bgGradient: 'from-[#22C55E]/20 to-[#16A34A]/10',
        icon: <CheckCircle className="h-5 w-5" />,
        label: 'Completed',
        description: 'Booking has been completed',
        step: 4,
      },
      cancelled: {
        color: 'text-red-400',
        bgGradient: 'from-red-500/20 to-red-600/10',
        icon: <XCircle className="h-5 w-5" />,
        label: 'Cancelled',
        description: 'This booking has been cancelled',
        step: 0,
      },
      disputed: {
        color: 'text-orange-400',
        bgGradient: 'from-orange-500/20 to-orange-600/10',
        icon: <AlertCircle className="h-5 w-5" />,
        label: 'Disputed',
        description: 'This booking is under dispute',
        step: 0,
      },
    };
    return info[status];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" className="text-[#22C55E]" />
            <p className="mt-4 text-[#94A3B8]">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-12 pt-28 text-center">
          <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-12">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
            <h1 className="mb-2 text-2xl font-bold text-[#F8FAFC]">Booking Not Found</h1>
            <p className="mb-6 text-[#94A3B8]">
              The booking you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button
              asChild
              className="cursor-pointer bg-[#22C55E] text-[#020617] transition-all duration-200 hover:bg-[#16A34A]"
            >
              <Link href="/renter/bookings">View All Bookings</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const equipment = (booking as Booking & { equipment?: Equipment }).equipment;
  const provider = (booking as Booking & { provider?: UserProfile }).provider;
  const statusInfo = getStatusInfo(booking.status);
  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed';

  return (
    <div className="min-h-screen bg-[#020617]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 lg:px-6">
        {/* Back Button */}
        <Link
          href="/renter/bookings"
          className="group mb-6 inline-flex cursor-pointer items-center gap-2 text-[#94A3B8] transition-colors duration-200 hover:text-[#22C55E]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to bookings</span>
        </Link>

        {/* Status Banner with Progress */}
        <div
          className={`mb-8 overflow-hidden rounded-2xl border border-[#1E293B] bg-gradient-to-br ${statusInfo.bgGradient} backdrop-blur-sm`}
        >
          <div className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className={`rounded-xl bg-[#0F172A]/50 p-3 ${statusInfo.color}`}>
                  {statusInfo.icon}
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </h2>
                  <p className="mt-1 text-sm text-[#CBD5E1]">{statusInfo.description}</p>
                </div>
              </div>

              {/* Progress Steps */}
              {statusInfo.step > 0 && (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                          step <= statusInfo.step
                            ? 'bg-[#22C55E] text-[#020617]'
                            : 'border border-[#1E293B] bg-[#0F172A] text-[#64748B]'
                        }`}
                      >
                        {step}
                      </div>
                      {step < 4 && (
                        <div
                          className={`h-0.5 w-8 transition-all duration-300 ${
                            step < statusInfo.step ? 'bg-[#22C55E]' : 'bg-[#1E293B]'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Equipment Details */}
            <Card className="group overflow-hidden border-[#1E293B] bg-[#0F172A] transition-all duration-300 hover:border-[#22C55E]/50 hover:shadow-xl hover:shadow-[#22C55E]/10">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-lg font-semibold text-[#F8FAFC]">Equipment Details</h2>
                </div>
                <div className="flex gap-6">
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-[#1E293B]">
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
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#F8FAFC]">
                      {equipment?.name || 'Equipment'}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                      {equipment?.description?.slice(0, 150)}
                      {equipment?.description && equipment.description.length > 150 ? '...' : ''}
                    </p>
                    <Link
                      href={`/equipment/${booking.equipment_id}`}
                      className="mt-4 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-[#22C55E] transition-colors duration-200 hover:text-[#16A34A]"
                    >
                      View Full Details
                      <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Schedule */}
            <Card className="border-[#1E293B] bg-[#0F172A]">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-lg font-semibold text-[#F8FAFC]">Booking Schedule</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="group cursor-default rounded-xl border border-[#1E293B] bg-[#0F172A]/50 p-4 transition-all duration-200 hover:border-[#22C55E]/30">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-lg bg-[#22C55E]/10 p-2">
                        <Calendar className="h-4 w-4 text-[#22C55E]" />
                      </div>
                      <p className="text-sm text-[#94A3B8]">Rental Period</p>
                    </div>
                    <p className="font-medium text-[#F8FAFC]">{formatDate(booking.start_date)}</p>
                    <p className="text-sm text-[#64748B]">to</p>
                    <p className="font-medium text-[#F8FAFC]">{formatDate(booking.end_date)}</p>
                  </div>
                  <div className="group cursor-default rounded-xl border border-[#1E293B] bg-[#0F172A]/50 p-4 transition-all duration-200 hover:border-[#22C55E]/30">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-lg bg-blue-500/10 p-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                      </div>
                      <p className="text-sm text-[#94A3B8]">Time Slot</p>
                    </div>
                    <p className="font-medium text-[#F8FAFC]">{booking.start_time}</p>
                    <p className="text-sm text-[#64748B]">to</p>
                    <p className="font-medium text-[#F8FAFC]">{booking.end_time}</p>
                  </div>
                </div>

                {booking.delivery_address && (
                  <div className="mt-4 rounded-xl border border-[#1E293B] bg-[#0F172A]/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-purple-500/10 p-2">
                        <MapPin className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#94A3B8]">Delivery Address</p>
                        <p className="mt-1 font-medium text-[#F8FAFC]">
                          {booking.delivery_address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {booking.notes && (
                  <div className="mt-4 rounded-xl border border-[#1E293B] bg-[#0F172A]/50 p-4">
                    <p className="mb-2 text-sm font-medium text-[#94A3B8]">Additional Notes</p>
                    <p className="text-sm leading-relaxed text-[#CBD5E1]">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider Details */}
            {provider && (
              <Card className="border-[#1E293B] bg-[#0F172A]">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#22C55E]" />
                    <h2 className="text-lg font-semibold text-[#F8FAFC]">Provider Information</h2>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar src={provider.profile_image} name={provider.name} size="lg" />
                      <div>
                        <p className="font-semibold text-[#F8FAFC]">{provider.name}</p>
                        {provider.address && (
                          <p className="mt-1 text-sm text-[#94A3B8]">{provider.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] transition-all duration-200 hover:border-[#22C55E] hover:bg-[#22C55E]/10"
                      >
                        <Phone className="mr-1.5 h-4 w-4" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] transition-all duration-200 hover:border-[#22C55E] hover:bg-[#22C55E]/10"
                      >
                        <MessageSquare className="mr-1.5 h-4 w-4" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Payment Summary */}
            <Card className="border-[#1E293B] bg-[#0F172A]">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-lg font-semibold text-[#F8FAFC]">Payment Summary</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">Rental Amount</span>
                    <span className="font-medium text-[#F8FAFC]">
                      {formatCurrency(booking.total_amount - (booking.platform_fee || 0))}
                    </span>
                  </div>
                  {booking.platform_fee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94A3B8]">Platform Fee</span>
                      <span className="font-medium text-[#F8FAFC]">
                        {formatCurrency(booking.platform_fee)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="my-4 border-t border-[#1E293B]"></div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#F8FAFC]">Total Paid</span>
                  <span className="text-xl font-bold text-[#22C55E]">
                    {formatCurrency(booking.total_amount)}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#22C55E]/10 p-3">
                  <CheckCircle className="h-4 w-4 text-[#22C55E]" />
                  <span className="text-sm font-medium text-[#22C55E]">Payment completed</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-[#1E293B] bg-[#0F172A]">
              <CardContent className="space-y-3 p-6">
                <h3 className="mb-3 text-sm font-semibold text-[#F8FAFC]">Quick Actions</h3>

                {canCancel && (
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer border-red-500/30 bg-red-500/5 text-red-400 transition-all duration-200 hover:border-red-500 hover:bg-red-500/10"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </Button>
                )}

                {canReview && (
                  <Button
                    className="w-full cursor-pointer bg-[#22C55E] text-[#020617] transition-all duration-200 hover:bg-[#16A34A]"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Write a Review
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full cursor-pointer border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] transition-all duration-200 hover:border-[#22C55E] hover:bg-[#22C55E]/10"
                  onClick={handleDownloadInvoice}
                  loading={isGeneratingInvoice}
                  disabled={isGeneratingInvoice}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isGeneratingInvoice ? 'Generating...' : 'Download Invoice'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full cursor-pointer border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] transition-all duration-200 hover:border-[#22C55E] hover:bg-[#22C55E]/10"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>

            {/* Booking Info */}
            <Card className="border-[#1E293B] bg-[#0F172A]">
              <CardContent className="p-4">
                <div className="space-y-2 text-center">
                  <p className="text-xs text-[#64748B]">Booking ID</p>
                  <p className="font-mono text-sm font-medium text-[#94A3B8]">
                    {booking.id.slice(0, 8).toUpperCase()}
                  </p>
                  <div className="border-t border-[#1E293B] pt-2">
                    <p className="text-xs text-[#64748B]">
                      Created on {formatDate(booking.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="border-[#1E293B] bg-[#0F172A]">
          <DialogHeader>
            <DialogTitle className="text-[#F8FAFC]">Cancel Booking</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
              Reason for cancellation
            </label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason..."
              rows={3}
              className="border-[#1E293B] bg-[#020617] text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="flex-1 cursor-pointer border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] transition-all duration-200 hover:border-[#22C55E] hover:bg-[#22C55E]/10"
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              loading={isCancelling}
              className="flex-1 cursor-pointer bg-red-500 text-white transition-all duration-200 hover:bg-red-600"
            >
              Confirm Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="border-[#1E293B] bg-[#0F172A]">
          <DialogHeader>
            <DialogTitle className="text-[#F8FAFC]">Rate Your Experience</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              How was your experience with this equipment?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReview((r) => ({ ...r, rating: star }))}
                    className="cursor-pointer p-1 transition-transform duration-200 hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors duration-200 ${
                        star <= review.rating ? 'fill-[#22C55E] text-[#22C55E]' : 'text-[#64748B]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
                Your Review (optional)
              </label>
              <Textarea
                value={review.comment}
                onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
                placeholder="Share your experience..."
                rows={4}
                className="border-[#1E293B] bg-[#020617] text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              className="flex-1 cursor-pointer border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] transition-all duration-200 hover:border-[#22C55E] hover:bg-[#22C55E]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              loading={isSubmittingReview}
              className="flex-1 cursor-pointer bg-[#22C55E] text-[#020617] transition-all duration-200 hover:bg-[#16A34A]"
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#020617]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[#22C55E]" />
            <p className="mt-4 text-[#94A3B8]">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingDetailPageContent />
    </Suspense>
  );
}
