import { Metadata } from 'next';
import StorageClient from './StorageClient';

export const metadata: Metadata = {
  title: 'Storage Management - Admin',
  robots: { index: false, follow: false },
};

export default function StoragePage() {
  return <StorageClient />;
}
