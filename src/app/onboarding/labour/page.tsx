import { Metadata } from 'next';
import LabourOnboardingClient from './LabourOnboardingClient';

export const metadata: Metadata = {
  title: 'Labour Registration - AgriServe',
  description: 'Register as a labourer.',
};

export default function LabourOnboardingPage() {
  return <LabourOnboardingClient />;
}
