import { Metadata } from 'next';
import RenterBookingsClient from './RenterBookingsClient';

export const metadata: Metadata = {
  title: 'My Bookings - AgriServe',
  description: 'Manage your equipment rentals.',
};

export default function RenterBookingsPage() {
  return <RenterBookingsClient />;
}
