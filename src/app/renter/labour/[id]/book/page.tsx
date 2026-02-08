import { Metadata } from 'next';
import BookLabourClient from './BookLabourClient';

export const metadata: Metadata = {
  title: 'Book Labour - AgriServe',
  description: 'Schedule labour services.',
};

export default function BookLabourPage() {
  return <BookLabourClient />;
}
