import { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings - AgriServe',
  description: 'Manage your account settings.',
};

export default function SettingsPage() {
  return <SettingsClient />;
}
