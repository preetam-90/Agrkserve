import { Metadata } from 'next';
import EquipmentClient from './EquipmentClient';

export const metadata: Metadata = {
  title: 'Browse Equipment - AgriServe',
  description: 'Rent tractors, harvesters, and other farm equipment.',
};

export default function EquipmentPage() {
  return <EquipmentClient />;
}
