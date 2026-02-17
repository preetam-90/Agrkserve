import { Metadata } from 'next';
import { Suspense } from 'react';
import { AIChatClient } from '@/components/ai-chat/AIChatClient';
import { Header } from '@/components/layout';
import { MessagesSkeleton } from '@/components/skeletons/MessagesSkeleton';

export const metadata: Metadata = {
  title: 'AI Assistant - AgriServe',
  description:
    'Chat with AgriServe AI assistant for farming advice, equipment rentals, and platform help.',
};

function AIChatLoadingFallback() {
  return (
    <main className="w-full min-h-0 flex-1 overflow-hidden pt-14">
      <MessagesSkeleton />
    </main>
  );
}

export default function AIChatPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#030a07]">
      <Header />
      <Suspense fallback={<AIChatLoadingFallback />}>
        <main className="min-h-0 flex-1 overflow-hidden pt-14">
          <AIChatClient />
        </main>
      </Suspense>
    </div>
  );
}
