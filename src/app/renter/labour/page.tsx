import { Metadata } from 'next';
import LabourListClient from './LabourListClient';

export const metadata: Metadata = {
  title: 'Find Labour - AgriServe',
  description: 'Hire skilled agricultural labour for your farm.',
};

export default function LabourListPage() {
  return <LabourListClient />;
}
