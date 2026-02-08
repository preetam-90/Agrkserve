import { Metadata } from 'next';
import BookingsClient from './BookingsClient';

export const metadata: Metadata = {
  title: 'My Bookings - AgriServe',
  description: 'View and manage your farm equipment and labour bookings.',
};

export default function BookingsPage() {
  return <BookingsClient />;
}
