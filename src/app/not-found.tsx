import { Metadata } from 'next';
import NotFoundClient from './not-found-client';

export const metadata: Metadata = {
  title: 'Page Not Found - AgriServe',
  description: 'The page you are looking for does not exist.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <NotFoundClient />;
}
