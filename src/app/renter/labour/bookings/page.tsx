import { Metadata } from 'next';
import LabourBookingsClient from './LabourBookingsClient';

export const metadata: Metadata = {
  title: 'Labour Bookings - AgriServe',
  description: 'Manage your hired labour.',
};

export default function LabourBookingsPage() {
  return <LabourBookingsClient />;
}
