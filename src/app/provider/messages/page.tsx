import { Metadata } from 'next';
import MessagesClient from './MessagesClient';

export const metadata: Metadata = {
  title: 'Provider Messages - AgriServe',
  description: 'Chat with farmers and renters.',
};

export default function ProviderMessagesPage() {
  return <MessagesClient />;
}
