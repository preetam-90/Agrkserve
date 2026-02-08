import { Metadata } from 'next';
import RolesSettingsClient from './RolesSettingsClient';

export const metadata: Metadata = {
  title: 'Role Settings - AgriServe',
  description: 'Manage your account roles.',
};

export default function RolesSettingsPage() {
  return <RolesSettingsClient />;
}
