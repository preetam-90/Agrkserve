import { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy - AgriServe',
  description: 'Read our privacy policy.',
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
