import { Metadata } from 'next';
import PaymentsClient from './PaymentsClient';

export const metadata: Metadata = {
  title: 'Payments & Transactions - Admin',
  robots: { index: false, follow: false },
};

export default function PaymentsPage() {
  return <PaymentsClient />;
}
