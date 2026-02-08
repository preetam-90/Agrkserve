import { Metadata } from 'next';
import LabourClient from './LabourClient';

export const metadata: Metadata = {
  title: 'My Labour Profile - AgriServe',
  description: 'Manage your labour availability and bookings.',
};

export default function ProviderLabourPage() {
  return <LabourClient />;
}
