import { Metadata } from 'next';
import ProviderOnboardingClient from './ProviderOnboardingClient';

export const metadata: Metadata = {
  title: 'Provider Registration - AgriServe',
  description: 'Register as a service provider.',
};

export default function ProviderOnboardingPage() {
  return <ProviderOnboardingClient />;
}
