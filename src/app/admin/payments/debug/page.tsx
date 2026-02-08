import { Metadata } from 'next';
import DebugClient from './DebugClient';

export const metadata: Metadata = {
  title: 'Payment Debugger - Admin',
  robots: { index: false, follow: false },
};

export default function DebugPage() {
  return <DebugClient />;
}
