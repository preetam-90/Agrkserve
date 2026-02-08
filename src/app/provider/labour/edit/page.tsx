import { Metadata } from 'next';
import EditLabourClient from './EditLabourClient';

export const metadata: Metadata = {
  title: 'Edit Labour Profile - AgriServe',
  description: 'Update your skills, rates, and location.',
};

export default function EditLabourProfilePage() {
  return <EditLabourClient />;
}
