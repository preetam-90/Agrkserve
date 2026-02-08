import { Metadata } from 'next';
import LabourClient from './LabourClient';

export const metadata: Metadata = {
  title: 'Manage Labour - Admin',
  robots: { index: false, follow: false },
};

export default function LabourPage() {
  return <LabourClient />;
}
