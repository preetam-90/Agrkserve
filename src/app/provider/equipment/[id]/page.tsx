import { Metadata } from 'next';
import EquipmentFormClient from './EquipmentFormClient';

export const metadata: Metadata = {
  title: 'Manage Equipment - AgriServe',
  description: 'Add or edit equipment details.',
};

export default function EquipmentFormPage() {
  return <EquipmentFormClient />;
}
