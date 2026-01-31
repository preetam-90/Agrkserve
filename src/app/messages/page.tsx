'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { ChatList, ChatWindow } from '@/components/messages';
import { useAuthStore, useMessagesStore } from '@/lib/store';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, isInitialized } = useAuthStore();
  const { setActiveConversation, unsubscribeAll } = useMessagesStore();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);

  // Handle URL params for conversation
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    const userParam = searchParams.get('user');

    if (conversationParam) {
      setSelectedConversationId(conversationParam);
      setIsMobileViewingChat(true);
    } else if (userParam && user) {
      // Start a new conversation with a user
      startConversationWithUser(userParam);
    }
  }, [searchParams, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !authLoading && !user) {
      router.push('/login?redirect=/messages');
    }
  }, [user, authLoading, isInitialized, router]);

  const startConversationWithUser = async (userId: string) => {
    try {
      const { startConversation } = useMessagesStore.getState();
      const conversationId = await startConversation(userId);
      setSelectedConversationId(conversationId);
      setIsMobileViewingChat(true);

      // Update URL without navigation
      router.replace(`/messages?conversation=${conversationId}`, { scroll: false });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsMobileViewingChat(true);

    // Update URL without full navigation
    router.replace(`/messages?conversation=${conversationId}`, { scroll: false });
  };

  const handleBackToList = () => {
    setIsMobileViewingChat(false);
    setSelectedConversationId(null);
    setActiveConversation(null);
    router.replace('/messages', { scroll: false });
  };

  if (!isInitialized || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <main className="w-full flex-1 px-0 pb-0 pt-16 md:px-0 md:pb-0">
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0a0a0a] md:h-[calc(100vh-64px)]">
        {/* Chat List (Sidebar) */}
        <div
          className={cn(
            'w-full flex-shrink-0 border-r border-[#262626] bg-[#0a0a0a] md:w-72 lg:w-80 xl:w-96',
            // Hide on mobile when viewing a chat
            isMobileViewingChat ? 'hidden md:flex md:flex-col' : 'flex flex-col'
          )}
        >
          {/* Header */}
          <div className="border-b border-[#262626] bg-[#0f0f0f] px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Messages</h1>
                  <p className="text-xs text-gray-500">Your conversations</p>
                </div>
              </div>
            </div>
          </div>

          <ChatList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            className="flex-1"
          />
        </div>

        {/* Chat Window */}
        <div
          className={cn(
            'flex flex-1 flex-col',
            // Hide on mobile when not viewing a chat
            !isMobileViewingChat ? 'hidden md:flex' : 'flex'
          )}
        >
          {selectedConversationId ? (
            <ChatWindow
              conversationId={selectedConversationId}
              onBack={handleBackToList}
              showBackButton={true}
              className="flex-1"
            />
          ) : (
            <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#0d0d0d]">
              <div className="px-4 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-2xl shadow-blue-500/10">
                  <MessageSquare className="h-12 w-12 text-blue-400" />
                </div>
                <h2 className="mb-3 text-2xl font-semibold text-white">Your Messages</h2>
                <p className="max-w-sm leading-relaxed text-gray-400">
                  Select a conversation from the list to start chatting, or visit a user&apos;s
                  profile to send them a message.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function MessagesLoadingFallback() {
  return (
    <main className="w-full flex-1 px-0 pb-0 pt-16 md:px-0 md:pb-0">
      <div className="flex h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-[#0a0a0a] md:h-[calc(100vh-64px)]">
        <Spinner size="lg" />
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <Header />
      <Suspense fallback={<MessagesLoadingFallback />}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
