import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { bookingId, amount } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId and amount' },
        { status: 400 }
      );
    }

    // In a real implementation, you would call Razorpay's API here
    // For now, we'll create a mock order response
    // In production, replace this with actual Razorpay integration
    
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a payment record in the database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        booking_id: bookingId,
        amount: amount,
        currency: 'INR',
        payment_method: 'razorpay',
        payment_gateway: 'razorpay',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: orderId,
      amount: amount,
      currency: 'INR',
      payment_id: payment.id,
      is_mock: true, // Flag to indicate mock payment
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}