import { Metadata } from 'next';
import NotificationsSettingsClient from './NotificationsSettingsClient';

export const metadata: Metadata = {
  title: 'Notification Settings - AgriServe',
  description: 'Manage your notification preferences.',
};

export default function NotificationsSettingsPage() {
  return <NotificationsSettingsClient />;
}
