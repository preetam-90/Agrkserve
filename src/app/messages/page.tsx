import { Metadata } from 'next';
import MessagesClient from './MessagesClient';

export const metadata: Metadata = {
  title: 'Messages - AgriServe',
  description: 'Chat with equipment providers and agricultural workers.',
};

export default function MessagesPage() {
  return <MessagesClient />;
}
