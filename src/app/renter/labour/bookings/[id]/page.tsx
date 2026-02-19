import { Metadata } from 'next';
import LabourBookingDetailClient from './LabourBookingDetailClient';

export const metadata: Metadata = {
  title: 'Labour Booking Details - AgriServe',
  description: 'View details of your labour booking request.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RenterLabourBookingDetailPage() {
  return <LabourBookingDetailClient />;
}
