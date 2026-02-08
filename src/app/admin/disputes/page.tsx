import { Metadata } from 'next';
import DisputesClient from './DisputesClient';

export const metadata: Metadata = {
  title: 'Manage Disputes - Admin',
  robots: { index: false, follow: false },
};

export default function DisputesPage() {
  return <DisputesClient />;
}
