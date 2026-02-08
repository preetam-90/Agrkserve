import { Metadata } from 'next';
import CreateLabourClient from './CreateLabourClient';

export const metadata: Metadata = {
  title: 'Create Labour Profile - AgriServe',
  description: 'Set up your profile to start receiving work.',
};

export default function CreateLabourProfilePage() {
  return <CreateLabourClient />;
}
