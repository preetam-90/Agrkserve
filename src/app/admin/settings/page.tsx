import { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Admin Settings',
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
