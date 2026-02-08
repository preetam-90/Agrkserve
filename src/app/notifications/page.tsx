import { Metadata } from 'next';
import NotificationsClient from './NotificationsClient';

export const metadata: Metadata = {
  title: 'Notifications - AgriServe',
  description: 'Your recent alerts and messages.',
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
