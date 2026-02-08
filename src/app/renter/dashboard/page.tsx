import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Renter Dashboard - AgriServe',
  description: 'Overview of your rentals and activity.',
};

export default function RenterDashboardPage() {
  return <DashboardClient />;
}
