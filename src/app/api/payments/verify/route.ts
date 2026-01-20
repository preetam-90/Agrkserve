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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id, is_mock } = await request.json();

    // Handle mock payment verification
    if (is_mock && payment_id) {
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment_id);

      if (updateError) {
        console.error('Payment update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update payment status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        verified: true,
        message: 'Mock payment verified successfully',
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification data' },
        { status: 400 }
      );
    }

    // In a real implementation, you would verify the payment signature with Razorpay
    // For now, we'll simulate successful verification
    // In production, replace this with actual Razorpay signature verification
    
    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        transaction_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', razorpay_payment_id);

    if (updateError) {
      console.error('Payment update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      verified: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}