import { Metadata } from 'next';
import EquipmentFormClient from '../[id]/EquipmentFormClient';

export const metadata: Metadata = {
  title: 'Add Equipment - AgriServe',
  description: 'Add a new equipment listing to your inventory.',
};

export default function NewEquipmentPage() {
  return <EquipmentFormClient />;
}
