'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  FileText,
  Download
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { 
  Button, 
  Card, 
  CardContent, 
  Badge, 
  Spinner, 
  Avatar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Textarea
} from '@/components/ui';
import { bookingService, reviewService } from '@/lib/services';
import { Booking, Equipment, UserProfile, BookingStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  useEffect(() => {
    loadBooking();
    
    if (isSuccess) {
      toast.success('Booking confirmed successfully!');
    }
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

  const getStatusInfo = (status: BookingStatus) => {
    const info: Record<BookingStatus, { color: string; icon: React.ReactNode; label: string; description: string }> = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="h-5 w-5" />,
        label: 'Pending Confirmation',
        description: 'Waiting for the provider to confirm your booking',
      },
      approved: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-5 w-5" />,
        label: 'Approved',
        description: 'Your booking has been approved',
      },
      rejected: {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="h-5 w-5" />,
        label: 'Rejected',
        description: 'Your booking request was rejected',
      },
      confirmed: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-5 w-5" />,
        label: 'Confirmed',
        description: 'Your booking has been confirmed',
      },
      in_progress: {
        color: 'bg-blue-100 text-blue-800',
        icon: <Tractor className="h-5 w-5" />,
        label: 'In Progress',
        description: 'Equipment is currently in use',
      },
      completed: {
        color: 'bg-gray-100 text-gray-800',
        icon: <CheckCircle className="h-5 w-5" />,
        label: 'Completed',
        description: 'Booking has been completed',
      },
      cancelled: {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="h-5 w-5" />,
        label: 'Cancelled',
        description: 'This booking has been cancelled',
      },
      disputed: {
        color: 'bg-orange-100 text-orange-800',
        icon: <AlertCircle className="h-5 w-5" />,
        label: 'Disputed',
        description: 'This booking is under dispute',
      },
    };
    return info[status];
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <Button asChild>
            <Link href="/renter/bookings">View All Bookings</Link>
          </Button>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Link 
          href="/renter/bookings"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to bookings
        </Link>

        {/* Status Banner */}
        <div className={`rounded-lg p-4 mb-6 ${statusInfo.color}`}>
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <p className="font-semibold">{statusInfo.label}</p>
              <p className="text-sm opacity-80">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Equipment Details</h2>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 relative overflow-hidden">
                    {equipment?.images?.[0] ? (
                      <Image
                        src={equipment.images[0]}
                        alt={equipment.name || 'Equipment'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tractor className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {equipment?.name || 'Equipment'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {equipment?.description?.slice(0, 100)}...
                    </p>
                    <Link 
                      href={`/renter/equipment/${booking.equipment_id}`}
                      className="text-sm text-green-600 hover:underline mt-2 inline-block"
                    >
                      View Equipment →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Schedule */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Booking Schedule</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dates</p>
                      <p className="font-medium">
                        {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">
                        {booking.start_time} - {booking.end_time}
                      </p>
                    </div>
                  </div>
                </div>
                
                {booking.delivery_address && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Delivery Address</p>
                        <p className="font-medium">{booking.delivery_address}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {booking.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700 mt-1">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider Details */}
            {provider && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4">Provider</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={provider.profile_image} name={provider.name} size="lg" />
                      <div>
                        <p className="font-semibold text-gray-900">{provider.name}</p>
                        {provider.address && (
                          <p className="text-sm text-gray-500">{provider.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Payment Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rental Amount</span>
                    <span>{formatCurrency(booking.total_amount - (booking.platform_fee || 0))}</span>
                  </div>
                  {booking.platform_fee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee</span>
                      <span>{formatCurrency(booking.platform_fee)}</span>
                    </div>
                  )}
                </div>
                <div className="pt-3 mt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(booking.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Payment completed</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6 space-y-3">
                {canCancel && (
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </Button>
                )}
                
                {canReview && (
                  <Button 
                    className="w-full"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  View Invoice
                </Button>
                
                <Button variant="outline" className="w-full">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>

            {/* Booking ID */}
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 text-center">
                  Booking ID: {booking.id.slice(0, 8)}
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Created: {formatDate(booking.created_at)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation
            </label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason..."
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelBooking}
              loading={isCancelling}
              className="flex-1"
            >
              Confirm Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              How was your experience with this equipment?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReview(r => ({ ...r, rating: star }))}
                    className="p-1"
                  >
                    <Star 
                      className={`h-8 w-8 transition-colors ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review (optional)
              </label>
              <Textarea
                value={review.comment}
                onChange={(e) => setReview(r => ({ ...r, comment: e.target.value }))}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowReviewDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              loading={isSubmittingReview}
              className="flex-1"
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
