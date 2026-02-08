import { Metadata } from 'next';
import ReviewsClient from './ReviewsClient';

export const metadata: Metadata = {
  title: 'Manage Reviews - Admin',
  robots: { index: false, follow: false },
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}
