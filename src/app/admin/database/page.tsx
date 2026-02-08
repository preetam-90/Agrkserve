import { Metadata } from 'next';
import DatabaseClient from './DatabaseClient';

export const metadata: Metadata = {
  title: 'Database Manager - Admin',
  robots: { index: false, follow: false },
};

export default function DatabasePage() {
  return <DatabaseClient />;
}
