import { Metadata } from 'next';
import BookingsClient from './BookingsClient';

export const metadata: Metadata = {
  title: 'Manage Bookings - Admin',
  robots: { index: false, follow: false },
};

export default function BookingsPage() {
  return <BookingsClient />;
}
