import { Metadata } from 'next';
import UserDetailClient from './UserDetailClient';

export const metadata: Metadata = {
  title: 'User Details - Admin',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage(props: PageProps) {
  // Pass the promise directly to the client component
  return <UserDetailClient params={props.params} />;
}
