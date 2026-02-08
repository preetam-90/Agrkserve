import { Metadata } from 'next';
import BookingsClient from './BookingsClient';

export const metadata: Metadata = {
  title: 'Provider Bookings - AgriServe',
  description: 'Manage equipment bookings and requests.',
};

export default function ProviderBookingsPage() {
  return <BookingsClient />;
}
