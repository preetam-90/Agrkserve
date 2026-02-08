import { Metadata } from 'next';
import EquipmentListClient from './EquipmentListClient';

export const metadata: Metadata = {
  title: 'My Equipment - AgriServe',
  description: 'Manage your equipment inventory.',
};

export default function ProviderEquipmentPage() {
  return <EquipmentListClient />;
}
