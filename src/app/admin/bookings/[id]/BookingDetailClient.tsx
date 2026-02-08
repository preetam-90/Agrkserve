/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';
import { STATUS_COLORS, BOOKING_STATUS_OPTIONS } from '@/lib/utils/admin-constants';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const supabase = createClient();
  const _router = useRouter();

  useEffect(() => {
    fetchBookingDetails();

     
  }, [resolvedParams.id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      // Get booking with equipment and renter details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(
          `
          *,
          equipment:equipment(*),
          renter:user_profiles!renter_id(*)
        `
        )
        .eq('id', resolvedParams.id)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      // Get payment details
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', resolvedParams.id)
        .single();

      setPayment(paymentData);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to "${newStatus}"?`)) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', resolvedParams.id);

      if (error) throw error;

      // Send notification to renter
      if (booking && typeof booking === 'object' && 'renter_id' in booking) {
        await supabase.from('notifications').insert({
          user_id: (booking as any).renter_id,
          title: 'Booking Status Updated',
          message: `Your booking status has been updated to ${newStatus}`,
          type: 'booking',
          data: { booking_id: resolvedParams.id },
        });
      }

      alert('Status updated successfully');
      fetchBookingDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!booking) {
    return <div className="py-8 text-center">Booking not found</div>;
  }

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="text-primary mb-6 inline-flex items-center gap-2 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <p className="text-text-secondary mt-1">ID: {booking.id}</p>
        </div>
        <span className={`admin-badge px-4 py-2 text-lg ${STATUS_COLORS[booking.status]}`}>
          {booking.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Equipment Details */}
          <div className="admin-card">
            <h2 className="mb-4 text-xl font-bold">Equipment Details</h2>
            <div className="flex gap-4">
              {booking.equipment?.images?.[0] && (
                <img
                  src={booking.equipment.images[0]}
                  alt={booking.equipment.name}
                  className="h-32 w-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{booking.equipment?.name}</h3>
                <p className="text-text-secondary capitalize">{booking.equipment?.category}</p>
                <p className="text-text-secondary mt-2">{booking.equipment?.description}</p>
                <div className="mt-3 flex gap-4">
                  <div>
                    <span className="text-text-secondary text-sm">Brand:</span>
                    <span className="ml-2 font-medium">{booking.equipment?.brand || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm">Model:</span>
                    <span className="ml-2 font-medium">{booking.equipment?.model || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Renter Details */}
          <div className="admin-card">
            <h2 className="mb-4 text-xl font-bold">Renter Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="admin-label">Name</label>
                <p className="text-lg font-medium">{booking.renter?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="admin-label">Email</label>
                <p className="text-lg font-medium">{booking.renter?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="admin-label">Phone</label>
                <p className="text-lg font-medium">{booking.renter?.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="admin-label">Location</label>
                <p className="text-lg font-medium">
                  {booking.renter?.city ? `${booking.renter.city}, ${booking.renter.state}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="admin-card">
            <h2 className="mb-4 text-xl font-bold">Booking Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="admin-label">Start Date</label>
                <p className="flex items-center gap-2 text-lg font-medium">
                  <Calendar className="text-primary h-5 w-5" />
                  {new Date(booking.start_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="admin-label">End Date</label>
                <p className="flex items-center gap-2 text-lg font-medium">
                  <Calendar className="text-primary h-5 w-5" />
                  {new Date(booking.end_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="admin-label">Total Days</label>
                <p className="text-lg font-medium">{booking.total_days} days</p>
              </div>
              <div>
                <label className="admin-label">Price per Day</label>
                <p className="text-lg font-medium">{formatCurrency(booking.price_per_day)}</p>
              </div>
              {booking.delivery_address && (
                <div className="md:col-span-2">
                  <label className="admin-label">Delivery Address</label>
                  <p className="flex items-start gap-2 text-lg font-medium">
                    <MapPin className="text-primary mt-1 h-5 w-5" />
                    {booking.delivery_address}
                  </p>
                </div>
              )}
              {booking.notes && (
                <div className="md:col-span-2">
                  <label className="admin-label">Notes</label>
                  <p className="flex items-start gap-2 text-lg font-medium">
                    <FileText className="text-primary mt-1 h-5 w-5" />
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          {payment && (
            <div className="admin-card">
              <h2 className="mb-4 text-xl font-bold">Payment Details</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="admin-label">Payment Status</label>
                  <span
                    className={`admin-badge ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {payment.status}
                  </span>
                </div>
                <div>
                  <label className="admin-label">Transaction ID</label>
                  <p className="font-mono text-lg">{payment.transaction_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="admin-label">Payment Method</label>
                  <p className="text-lg font-medium">{payment.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <label className="admin-label">Payment Gateway</label>
                  <p className="text-lg font-medium">{payment.payment_gateway || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="admin-card">
            <h3 className="mb-4 font-bold">Total Amount</h3>
            <div className="text-primary flex items-center gap-2 text-3xl font-bold">
              <DollarSign className="h-8 w-8" />
              {formatCurrency(booking.total_amount)}
            </div>
          </div>

          <div className="admin-card">
            <h3 className="mb-4 font-bold">Update Status</h3>
            <div className="space-y-2">
              {BOOKING_STATUS_OPTIONS.filter((opt) => opt.value !== '').map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusUpdate(option.value)}
                  disabled={updating || booking.status === option.value}
                  className={`admin-btn w-full ${
                    booking.status === option.value
                      ? 'admin-btn-primary cursor-not-allowed'
                      : 'admin-btn-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <h3 className="mb-4 font-bold">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="admin-label">Created</label>
                <p>{new Date(booking.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="admin-label">Last Updated</label>
                <p>{new Date(booking.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
