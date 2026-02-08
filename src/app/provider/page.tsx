import { Metadata } from 'next';
import ProviderLandingClient from './ProviderLandingClient';

export const metadata: Metadata = {
  title: 'Provider Portal - AgriServe',
  description: 'Manage your provider account.',
};

export default function ProviderPage() {
  return <ProviderLandingClient />;
}
