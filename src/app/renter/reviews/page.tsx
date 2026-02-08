import { Metadata } from 'next';
import ReviewsClient from './ReviewsClient';

export const metadata: Metadata = {
  title: 'My Reviews - AgriServe',
  description: 'Reviews you have given and received.',
};

export default function RenterReviewsPage() {
  return <ReviewsClient />;
}
