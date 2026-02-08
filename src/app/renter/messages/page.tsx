import { Metadata } from 'next';
import MessagesClient from './MessagesClient';

export const metadata: Metadata = {
  title: 'Messages - AgriServe',
  description: 'Your conversations with providers.',
};

export default function RenterMessagesPage() {
  return <MessagesClient />;
}
