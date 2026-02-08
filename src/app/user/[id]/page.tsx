import { Metadata } from 'next';
import UserProfileClient from './UserProfileClient';

export const metadata: Metadata = {
  title: 'User Profile - AgriServe',
  description: 'View user profile, equipment listings, and services.',
};

export default function PublicUserProfilePage() {
  return <UserProfileClient />;
}
