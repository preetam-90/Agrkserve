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
    <main className="flex-1 container mx-auto px-0 md:px-4 py-0 md:py-6 max-w-6xl">
      <div className="bg-white rounded-none md:rounded-xl shadow-sm overflow-hidden h-[calc(100vh-64px)] md:h-[calc(100vh-160px)] flex">
        {/* Chat List (Sidebar) */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r flex-shrink-0",
          // Hide on mobile when viewing a chat
          isMobileViewingChat ? "hidden md:flex md:flex-col" : "flex flex-col"
        )}>
          {/* Header */}
          <div className="px-4 py-4 border-b bg-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            </div>
          </div>
          
          <ChatList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            className="flex-1"
          />
        </div>

        {/* Chat Window */}
        <div className={cn(
          "flex-1 flex flex-col",
          // Hide on mobile when not viewing a chat
          !isMobileViewingChat ? "hidden md:flex" : "flex"
        )}>
          {selectedConversationId ? (
            <ChatWindow
              conversationId={selectedConversationId}
              onBack={handleBackToList}
              showBackButton={true}
              className="flex-1"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Your Messages
                </h2>
                <p className="text-gray-500 max-w-sm">
                  Select a conversation from the list to start chatting, or visit a user&apos;s profile to send them a message.
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
    <main className="flex-1 container mx-auto px-0 md:px-4 py-0 md:py-6 max-w-6xl">
      <div className="bg-white rounded-none md:rounded-xl shadow-sm overflow-hidden h-[calc(100vh-64px)] md:h-[calc(100vh-160px)] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Suspense fallback={<MessagesLoadingFallback />}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
