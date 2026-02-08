import { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms of Service - AgriServe',
  description: 'Read our terms and conditions.',
};

export default function TermsPage() {
  return <TermsClient />;
}
