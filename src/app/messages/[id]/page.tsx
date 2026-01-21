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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-0 md:px-4 py-0 md:py-6 max-w-4xl">
        <div className="bg-white rounded-none md:rounded-xl shadow-sm overflow-hidden h-[calc(100vh-64px)] md:h-[calc(100vh-160px)]">
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
