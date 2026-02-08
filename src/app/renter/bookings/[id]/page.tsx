import { Metadata } from 'next';
import BookingDetailClient from './BookingDetailClient';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Booking Details - AgriServe',
  description: 'View booking details and status.',
  robots: {
    index: false,
    follow: false,
  },
};

type Params = Promise<{ id: string }>;

export default async function BookingDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch booking with equipment and provider details on the server
  // Fetch with retry logic for better performance/resilience
  let booking = null;
  let error = null;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await supabase
      .from('bookings')
      .select(
        `
        *,
        equipment:equipment_id(*),
        renter:renter_id(*),
        provider:provider_id!bookings_provider_id_fkey(*)
      `
      )
      .eq('id', id)
      .single();

    booking = result.data;
    error = result.error;

    if (!error && booking) break;

    if (attempt < maxRetries) {
      // Exponential backoff: 500ms, 1000ms
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 500));
    }
  }

  if (error || !booking) {
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching booking on server:', error);
    }
    return notFound();
  }

  return <BookingDetailClient initialBooking={booking} />;
}
