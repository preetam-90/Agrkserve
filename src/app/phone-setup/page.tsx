import { Metadata } from 'next';
import PhoneSetupClient from './PhoneSetupClient';

export const metadata: Metadata = {
  title: 'Verify Phone - AgriServe',
  description: 'Verify your phone number.',
};

export default function PhoneSetupPage() {
  return <PhoneSetupClient />;
}
