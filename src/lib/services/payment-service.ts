import { createClient } from '@/lib/supabase/client';
import type { Payment, PaymentStatus } from '@/lib/types';

const supabase = createClient();

export const paymentService = {
  // Get payment by ID
  async getById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get payment by booking ID
  async getByBookingId(bookingId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get payments for user
  async getUserPayments(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Payment[]; count: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
    };
  },

  // Create payment record
  async create(payment: {
    booking_id: string;
    user_id: string;
    amount: number;
    currency?: string;
    razorpay_order_id: string;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        booking_id: payment.booking_id,
        user_id: payment.user_id,
        amount: payment.amount,
        currency: payment.currency || 'INR',
        razorpay_order_id: payment.razorpay_order_id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update payment status
  async updateStatus(
    id: string,
    status: PaymentStatus,
    razorpayDetails?: {
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      payment_method?: string;
    }
  ): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        ...razorpayDetails,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Process refund
  async processRefund(
    id: string,
    refundAmount: number,
    reason: string
  ): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refund_amount: refundAmount,
        refund_reason: reason,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get payment statistics for provider
  async getProviderStats(ownerId: string): Promise<{
    total_earnings: number;
    pending_amount: number;
    this_month: number;
    last_month: number;
  }> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    // Get all successful payments for bookings owned by this provider
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('owner_id', ownerId);

    if (!bookings || bookings.length === 0) {
      return {
        total_earnings: 0,
        pending_amount: 0,
        this_month: 0,
        last_month: 0,
      };
    }

    const bookingIds = bookings.map((b) => b.id);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount, status, created_at')
      .in('booking_id', bookingIds);

    if (!payments) {
      return {
        total_earnings: 0,
        pending_amount: 0,
        this_month: 0,
        last_month: 0,
      };
    }

    const stats = {
      total_earnings: 0,
      pending_amount: 0,
      this_month: 0,
      last_month: 0,
    };

    payments.forEach((payment) => {
      if (payment.status === 'success') {
        stats.total_earnings += payment.amount;

        if (payment.created_at >= thisMonthStart) {
          stats.this_month += payment.amount;
        } else if (payment.created_at >= lastMonthStart && payment.created_at <= lastMonthEnd) {
          stats.last_month += payment.amount;
        }
      } else if (payment.status === 'pending') {
        stats.pending_amount += payment.amount;
      }
    });

    return stats;
  },

  // Create a Razorpay order for payment
  async createOrder(bookingId: string, amount: number): Promise<{
    order_id: string;
    amount: number;
    currency: string;
  }> {
    // In a real implementation, this would call your backend API
    // which would then call Razorpay's Create Order API
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment order');
    }

    return response.json();
  },

  // Verify payment signature
  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<boolean> {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const result = await response.json();
    return result.verified;
  },
};
