import { Metadata } from 'next';
import EquipmentClient from './EquipmentClient';

export const metadata: Metadata = {
  title: 'Manage Equipment - Admin',
  robots: { index: false, follow: false },
};

export default function EquipmentPage() {
  return <EquipmentClient />;
}
