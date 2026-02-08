import { Metadata } from 'next';
import DebugNotificationsClient from './DebugNotificationsClient';

export const metadata: Metadata = {
  title: 'Debug Notifications - AgriServe',
  description: 'Debug notification system.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DebugNotificationsPage() {
  return <DebugNotificationsClient />;
}
