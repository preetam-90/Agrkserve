import { Metadata } from 'next';
import ReviewsClient from './ReviewsClient';

export const metadata: Metadata = {
  title: 'My Reviews - AgriServe',
  description: 'View feedback from your clients.',
};

export default function ProviderReviewsPage() {
  return <ReviewsClient />;
}
