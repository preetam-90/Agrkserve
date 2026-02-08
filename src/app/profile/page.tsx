import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'My Profile - AgriServe',
  description: 'Manage your personal information.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
