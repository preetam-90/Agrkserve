'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { ChatList } from '@/components/messages';
import dynamic from 'next/dynamic';

const ChatWindow = dynamic(
  () => import('@/components/messages').then((mod) => ({ default: mod.ChatWindow })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    ),
  }
);
import { useAuthStore, useMessagesStore } from '@/lib/store';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, isInitialized } = useAuthStore();
  const { setActiveConversation, unsubscribeAll, startConversation } = useMessagesStore();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsMobileViewingChat(true);
    setActiveConversation(conversationId);
  };

  // Handle back to list (mobile)
  const handleBackToList = () => {
    setIsMobileViewingChat(false);
  };

  // Start conversation with a user
  const startConversationWithUser = async (userId: string) => {
    try {
      const conversationId = await startConversation(userId);
      if (conversationId) {
        handleSelectConversation(conversationId);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

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

  // Check if loading or not authenticated
  const isLoading = !isInitialized || authLoading;
  const isAuthenticated = isInitialized && user;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/messages');
    }
  }, [isLoading, isAuthenticated, router]);

  // Always return the same structure - never return early
  return (
    <main className="w-full flex-1 px-0 pb-0 pt-14 md:px-0 md:pb-0">
      {/* Loading state - show spinner while loading */}
      {isLoading ? (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0a0a0a] sm:min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100vh-3.5rem)]">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0a0a] sm:h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
          {/* Chat List (Sidebar) */}
          <div
            className={cn(
              'min-h-0 w-full flex-shrink-0 border-r border-[#262626] bg-[#0a0a0a] sm:w-80 md:w-72 lg:w-80 xl:w-96 2xl:w-[28rem]',
              // Hide on mobile when viewing a chat
              isMobileViewingChat ? 'hidden md:flex md:flex-col' : 'flex min-h-0 flex-col'
            )}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-[#262626] bg-[#0f0f0f] px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 sm:h-10 sm:w-10">
                    <MessageSquare className="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-base font-bold text-white sm:text-lg">Messages</h1>
                    <p className="text-[10px] text-gray-500 sm:text-xs">Your conversations</p>
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
              'flex min-h-0 flex-1 flex-col',
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
                <div className="w-full max-w-md px-4 text-center sm:px-6">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-2xl shadow-blue-500/10 sm:mb-6 sm:h-24 sm:w-24">
                    <MessageSquare className="h-10 w-10 text-blue-400 sm:h-12 sm:w-12" />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-white sm:mb-3 sm:text-2xl">
                    Your Messages
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-400 sm:text-base">
                    Select a conversation from the list to start chatting, or visit a user&apos;s
                    profile to send them a message.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function MessagesLoadingFallback() {
  return (
    <main className="w-full flex-1 px-0 pb-0 pt-14 md:px-0 md:pb-0">
      <div className="flex h-[calc(100vh-56px)] items-center justify-center overflow-hidden bg-[#0a0a0a] md:h-[calc(100vh-56px)]">
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
