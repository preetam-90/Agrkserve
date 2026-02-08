import { Metadata } from 'next';
import UsersClient from './UsersClient';

export const metadata: Metadata = {
  title: 'Manage Users - Admin',
  robots: { index: false, follow: false },
};

export default function UsersPage() {
  return <UsersClient />;
}
