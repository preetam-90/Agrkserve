'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { ChatWindow } from '@/components/messages';
import { useAuthStore, useMessagesStore } from '@/lib/store';
import { Spinner } from '@/components/ui';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const { user, isLoading: authLoading, isInitialized } = useAuthStore();
  const { unsubscribeAll } = useMessagesStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !authLoading && !user) {
      router.push(`/login?redirect=/messages/${conversationId}`);
    }
  }, [user, authLoading, isInitialized, router, conversationId]);

  const handleBack = () => {
    router.push('/messages');
  };

  if (!isInitialized || authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <Header />

      <main className="w-full flex-1 px-0 pb-0 pt-14 md:px-0 md:pb-0">
        <div className="h-[calc(100vh-56px)] overflow-hidden bg-[#0a0a0a] md:h-[calc(100vh-56px)]">
          <ChatWindow
            conversationId={conversationId}
            onBack={handleBack}
            showBackButton={true}
            className="h-full"
          />
        </div>
      </main>
    </div>
  );
}
