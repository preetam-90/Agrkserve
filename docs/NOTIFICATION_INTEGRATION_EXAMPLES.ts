/**
 * NOTIFICATION INTEGRATION EXAMPLES
 * 
 * This file shows how to integrate the notification system
 * into existing booking, payment, and message flows.
 */

import {
  notifyNewBookingRequest,
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyBookingCancelled,
  notifyBookingStartReminder,
  notifyBookingEndReminder,
  notifyPaymentDue,
  notifyPaymentReceived,
  notifyNewMessage,
  notifyNewReview,
} from '@/lib/services/notifications';

// =====================================================
// BOOKING FLOW INTEGRATION
// =====================================================

/**
 * Example: When a renter creates a new booking request
 */
export async function handleBookingCreated(bookingData: {
  id: string;
  owner_id: string;
  renter_id: string;
  renter_name: string;
  equipment_id: string;
  equipment_name: string;
  start_date: string;
  end_date: string;
}) {
  try {
    // Create the booking in database first
    // ... your existing booking creation logic

    // Send notification to equipment owner
    await notifyNewBookingRequest({
      ownerId: bookingData.owner_id,
      renterName: bookingData.renter_name,
      equipmentName: bookingData.equipment_name,
      equipmentId: bookingData.equipment_id,
      bookingId: bookingData.id,
      startDate: bookingData.start_date,
      endDate: bookingData.end_date,
    });

    console.log('✅ Booking created and owner notified');
  } catch (error) {
    console.error('❌ Failed to create booking or notify:', error);
    throw error;
  }
}

/**
 * Example: When an owner accepts a booking
 */
export async function handleBookingAccepted(bookingData: {
  id: string;
  renter_id: string;
  equipment_id: string;
  equipment_name: string;
  start_date: string;
}) {
  try {
    // Update booking status in database
    // ... your existing booking update logic

    // Notify renter
    await notifyBookingAccepted({
      renterId: bookingData.renter_id,
      equipmentName: bookingData.equipment_name,
      equipmentId: bookingData.equipment_id,
      bookingId: bookingData.id,
      startDate: bookingData.start_date,
    });

    console.log('✅ Booking accepted and renter notified');
  } catch (error) {
    console.error('❌ Failed to accept booking or notify:', error);
    throw error;
  }
}

/**
 * Example: When an owner rejects a booking
 */
export async function handleBookingRejected(bookingData: {
  id: string;
  renter_id: string;
  equipment_id: string;
  equipment_name: string;
}) {
  try {
    // Update booking status in database
    // ... your existing booking update logic

    // Notify renter
    await notifyBookingRejected({
      renterId: bookingData.renter_id,
      equipmentName: bookingData.equipment_name,
      equipmentId: bookingData.equipment_id,
      bookingId: bookingData.id,
    });

    console.log('✅ Booking rejected and renter notified');
  } catch (error) {
    console.error('❌ Failed to reject booking or notify:', error);
    throw error;
  }
}

/**
 * Example: When a booking is cancelled (by renter or owner)
 */
export async function handleBookingCancelled(bookingData: {
  id: string;
  owner_id: string;
  renter_id: string;
  equipment_id: string;
  equipment_name: string;
  cancelled_by: 'renter' | 'owner';
}) {
  try {
    // Update booking status in database
    // ... your existing booking update logic

    // Notify the other party
    const recipientId =
      bookingData.cancelled_by === 'renter'
        ? bookingData.owner_id
        : bookingData.renter_id;

    const cancelledByName =
      bookingData.cancelled_by === 'renter' ? 'the renter' : 'the owner';

    await notifyBookingCancelled({
      userId: recipientId,
      equipmentName: bookingData.equipment_name,
      equipmentId: bookingData.equipment_id,
      bookingId: bookingData.id,
      cancelledBy: cancelledByName,
    });

    console.log('✅ Booking cancelled and other party notified');
  } catch (error) {
    console.error('❌ Failed to cancel booking or notify:', error);
    throw error;
  }
}

// =====================================================
// SCHEDULED NOTIFICATIONS (CRON JOBS / BACKGROUND TASKS)
// =====================================================

/**
 * Example: Send booking start reminders
 * Run this as a cron job every hour
 */
export async function sendBookingStartReminders() {
  try {
    // Fetch bookings starting in the next 24 hours
    // const upcomingBookings = await getUpcomingBookings(24);

    // Example bookings (replace with your database query)
    const upcomingBookings = [
      {
        id: 'booking-1',
        renter_id: 'user-1',
        equipment_id: 'equip-1',
        equipment_name: 'Tractor X200',
        start_date: '2026-01-22T10:00:00Z',
      },
    ];

    for (const booking of upcomingBookings) {
      // Calculate time until start
      const startTime = new Date(booking.start_date);
      const now = new Date();
      const hoursUntil = Math.round((startTime.getTime() - now.getTime()) / (1000 * 60 * 60));

      await notifyBookingStartReminder({
        renterId: booking.renter_id,
        equipmentName: booking.equipment_name,
        equipmentId: booking.equipment_id,
        bookingId: booking.id,
        timeUntil: hoursUntil > 1 ? `in ${hoursUntil} hours` : 'tomorrow',
      });
    }

    console.log(`✅ Sent ${upcomingBookings.length} booking start reminders`);
  } catch (error) {
    console.error('❌ Failed to send booking start reminders:', error);
  }
}

/**
 * Example: Send booking end reminders
 * Run this as a cron job every hour
 */
export async function sendBookingEndReminders() {
  try {
    // Fetch bookings ending in the next 24 hours
    // const endingBookings = await getEndingBookings(24);

    const endingBookings = [
      {
        id: 'booking-1',
        renter_id: 'user-1',
        equipment_id: 'equip-1',
        equipment_name: 'Tractor X200',
        end_date: '2026-01-23T10:00:00Z',
      },
    ];

    for (const booking of endingBookings) {
      const endTime = new Date(booking.end_date);
      const now = new Date();
      const hoursUntil = Math.round((endTime.getTime() - now.getTime()) / (1000 * 60 * 60));

      await notifyBookingEndReminder({
        renterId: booking.renter_id,
        equipmentName: booking.equipment_name,
        equipmentId: booking.equipment_id,
        bookingId: booking.id,
        timeUntil: hoursUntil > 1 ? `in ${hoursUntil} hours` : 'soon',
      });
    }

    console.log(`✅ Sent ${endingBookings.length} booking end reminders`);
  } catch (error) {
    console.error('❌ Failed to send booking end reminders:', error);
  }
}

// =====================================================
// PAYMENT FLOW INTEGRATION
// =====================================================

/**
 * Example: When a payment is successfully processed
 */
export async function handlePaymentReceived(paymentData: {
  owner_id: string;
  amount: number;
  currency: string;
  booking_id: string;
  equipment_id: string;
  equipment_name: string;
}) {
  try {
    // Process payment
    // ... your existing payment processing logic

    // Format amount
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: paymentData.currency,
    }).format(paymentData.amount);

    // Notify equipment owner
    await notifyPaymentReceived({
      ownerId: paymentData.owner_id,
      amount: formattedAmount,
      equipmentName: paymentData.equipment_name,
      equipmentId: paymentData.equipment_id,
      bookingId: paymentData.booking_id,
    });

    console.log('✅ Payment processed and owner notified');
  } catch (error) {
    console.error('❌ Failed to process payment or notify:', error);
    throw error;
  }
}

/**
 * Example: Send payment due reminders
 * Run this as a cron job daily
 */
export async function sendPaymentDueReminders() {
  try {
    // Fetch bookings with payments due in the next 3 days
    // const duePayments = await getUpcomingDuePayments(3);

    const duePayments = [
      {
        booking_id: 'booking-1',
        renter_id: 'user-1',
        equipment_id: 'equip-1',
        equipment_name: 'Tractor X200',
        amount: 500,
        currency: 'USD',
      },
    ];

    for (const payment of duePayments) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: payment.currency,
      }).format(payment.amount);

      await notifyPaymentDue({
        userId: payment.renter_id,
        amount: formattedAmount,
        equipmentName: payment.equipment_name,
        equipmentId: payment.equipment_id,
        bookingId: payment.booking_id,
      });
    }

    console.log(`✅ Sent ${duePayments.length} payment due reminders`);
  } catch (error) {
    console.error('❌ Failed to send payment due reminders:', error);
  }
}

// =====================================================
// MESSAGE FLOW INTEGRATION
// =====================================================

/**
 * Example: When a new message is sent
 */
export async function handleNewMessage(messageData: {
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  conversation_id: string;
  content: string;
}) {
  try {
    // Save message to database
    // ... your existing message creation logic

    // Don't notify if sender is viewing the conversation
    // (implement your own logic here)
    const recipientIsViewing = false; // Check if recipient is currently viewing

    if (!recipientIsViewing) {
      await notifyNewMessage({
        recipientId: messageData.recipient_id,
        senderName: messageData.sender_name,
        senderId: messageData.sender_id,
        conversationId: messageData.conversation_id,
      });
    }

    console.log('✅ Message sent and recipient notified');
  } catch (error) {
    console.error('❌ Failed to send message or notify:', error);
    throw error;
  }
}

// =====================================================
// REVIEW FLOW INTEGRATION
// =====================================================

/**
 * Example: When a renter leaves a review
 */
export async function handleNewReview(reviewData: {
  owner_id: string;
  reviewer_id: string;
  reviewer_name: string;
  equipment_id: string;
  equipment_name: string;
  rating: number;
  comment: string;
}) {
  try {
    // Save review to database
    // ... your existing review creation logic

    // Notify equipment owner
    await notifyNewReview({
      ownerId: reviewData.owner_id,
      reviewerName: reviewData.reviewer_name,
      reviewerId: reviewData.reviewer_id,
      equipmentName: reviewData.equipment_name,
      equipmentId: reviewData.equipment_id,
      rating: reviewData.rating,
    });

    console.log('✅ Review posted and owner notified');
  } catch (error) {
    console.error('❌ Failed to post review or notify:', error);
    throw error;
  }
}

// =====================================================
// EXAMPLE: API ROUTE INTEGRATION
// =====================================================

/**
 * Example: API route for accepting a booking
 * File: app/api/bookings/[id]/accept/route.ts
 */
/*
import { NextRequest, NextResponse } from 'next/server';
import { notifyBookingAccepted } from '@/lib/services/notifications';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const bookingId = params.id;

  try {
    // Get current user (owner)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, equipment(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user is the owner
    if (booking.equipment.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'accepted' })
      .eq('id', bookingId);

    if (updateError) {
      throw updateError;
    }

    // Send notification to renter
    await notifyBookingAccepted({
      renterId: booking.renter_id,
      equipmentName: booking.equipment.name,
      equipmentId: booking.equipment_id,
      bookingId: booking.id,
      startDate: booking.start_date,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// =====================================================
// EXAMPLE: SERVER ACTION INTEGRATION
// =====================================================

/**
 * Example: Server action for creating a booking
 */
/*
'use server';

import { notifyNewBookingRequest } from '@/lib/services/notifications';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBooking(formData: FormData) {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const equipmentId = formData.get('equipment_id') as string;
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;

    // Get equipment details
    const { data: equipment } = await supabase
      .from('equipment')
      .select('*, profiles!owner_id(*)')
      .eq('id', equipmentId)
      .single();

    if (!equipment) throw new Error('Equipment not found');

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        equipment_id: equipmentId,
        renter_id: user.id,
        start_date: startDate,
        end_date: endDate,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Get renter name
    const { data: renterProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Send notification to equipment owner
    await notifyNewBookingRequest({
      ownerId: equipment.owner_id,
      renterName: renterProfile?.full_name || 'A user',
      equipmentName: equipment.name,
      equipmentId: equipment.id,
      bookingId: booking.id,
      startDate,
      endDate,
    });

    revalidatePath('/dashboard/bookings');
    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Failed to create booking' };
  }
}
*/
