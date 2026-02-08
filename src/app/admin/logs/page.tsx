import { Metadata } from 'next';
import LogsClient from './LogsClient';

export const metadata: Metadata = {
  title: 'System Logs - Admin',
  robots: { index: false, follow: false },
};

export default function LogsPage() {
  return <LogsClient />;
}
