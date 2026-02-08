import { Metadata } from 'next';
import OnboardingClient from './OnboardingClient';

export const metadata: Metadata = {
  title: 'Get Started - AgriServe',
  description: 'Complete your profile to get started.',
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
