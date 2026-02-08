import { Metadata } from 'next';
import BookEquipmentClient from './BookEquipmentClient';

export const metadata: Metadata = {
  title: 'Book Equipment - AgriServe',
  description: 'Rent this equipment.',
};

export default function BookEquipmentPage() {
  return <BookEquipmentClient />;
}
