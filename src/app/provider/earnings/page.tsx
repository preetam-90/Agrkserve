import { Metadata } from 'next';
import EarningsClient from './EarningsClient';

export const metadata: Metadata = {
  title: 'Earnings & Payments - AgriServe',
  description: 'Track your revenue and manage payouts.',
};

export default function ProviderEarningsPage() {
  return <EarningsClient />;
}
