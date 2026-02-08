import { Metadata } from 'next';
import OfflineClient from './OfflineClient';

export const metadata: Metadata = {
  title: 'Offline - AgriServe',
  description: 'You are currently offline.',
};

export default function OfflinePage() {
  return <OfflineClient />;
}
