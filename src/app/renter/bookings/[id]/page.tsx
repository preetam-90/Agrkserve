import { Metadata } from 'next';
import BookingDetailClient from './BookingDetailClient';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Booking, Equipment, UserProfile } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Booking Details - AgriServe',
  description: 'View booking details and status.',
  robots: {
    index: false,
    follow: false,
  },
};

type Params = Promise<{ id: string }>;
type BookingWithRelations = Booking & {
  equipment?: Equipment | null;
  provider?: UserProfile | null;
};

export default async function BookingDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch booking with equipment details.
  // Provider details are derived from equipment.owner_id (bookings table has no provider_id column).
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      equipment:equipment(*)
    `
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching booking on server:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return notFound();
  }

  if (!booking) {
    // Backward compatibility: labour booking IDs were previously redirected here by mistake.
    // If this ID belongs to labour_bookings, send the user to the correct route.
    const { data: labourBooking, error: labourBookingError } = await supabase
      .from('labour_bookings')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (labourBookingError) {
      console.warn('Failed to check labour booking fallback route:', {
        bookingId: id,
        code: labourBookingError.code,
        message: labourBookingError.message,
      });
    }

    if (labourBooking?.id) {
      redirect(`/renter/labour/bookings/${labourBooking.id}`);
    }

    return notFound();
  }

  const initialBooking: BookingWithRelations = booking as BookingWithRelations;
  const ownerId = initialBooking.equipment?.owner_id;

  if (ownerId) {
    const { data: provider, error: providerError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', ownerId)
      .maybeSingle();

    if (providerError) {
      console.warn('Failed to fetch provider profile for booking page:', {
        bookingId: initialBooking.id,
        ownerId,
        code: providerError.code,
        message: providerError.message,
      });
    } else if (provider) {
      initialBooking.provider = provider;
    }
  }

  return <BookingDetailClient initialBooking={initialBooking} />;
}
