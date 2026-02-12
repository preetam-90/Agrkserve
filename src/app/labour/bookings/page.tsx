import { Metadata } from 'next';
import LabourBookingsClient from './LabourBookingsClient';

export const metadata: Metadata = {
  title: 'Labour Bookings - AgriServe',
  description: 'View and manage labour bookings.',
};

export default function LabourBookingsPage() {
  return <LabourBookingsClient />;
}