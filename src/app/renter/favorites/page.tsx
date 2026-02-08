import { Metadata } from 'next';
import FavoritesClient from './FavoritesClient';

export const metadata: Metadata = {
  title: 'Favorites - AgriServe',
  description: 'Your saved equipment and labour.',
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
