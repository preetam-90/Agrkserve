import { Metadata } from 'next';
import ConversationClient from './ConversationClient';

export const metadata: Metadata = {
  title: 'Chat - AgriServe',
  description: 'Secure messaging with your agricultural network.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConversationPage() {
  return <ConversationClient />;
}
