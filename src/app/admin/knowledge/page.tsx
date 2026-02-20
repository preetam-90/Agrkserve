import { Metadata } from 'next';
import KnowledgeClient from './KnowledgeClient';

export const metadata: Metadata = {
  title: 'Platform Knowledge Management',
  robots: { index: false, follow: false },
};

export default function KnowledgePage() {
  return <KnowledgeClient />;
}
