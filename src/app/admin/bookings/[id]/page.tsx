import { Metadata } from 'next';
import BookingDetailClient from './BookingDetailClient';

export const metadata: Metadata = {
  title: 'Booking Details - Admin',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetailPage(props: PageProps) {
  // Pass the promise directly to the client component
  // The client component uses `use(params)` to unwrap it
  return <BookingDetailClient params={props.params} />;
}
