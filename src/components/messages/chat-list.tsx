'use client';

import { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Search } from 'lucide-react';
import { useMessagesStore, useAuthStore } from '@/lib/store';
import { Avatar, Spinner, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DMConversation } from '@/lib/types';

interface ChatListProps {
  onSelectConversation?: (conversationId: string) => void;
  selectedConversationId?: string | null;
  className?: string;
}

export function ChatList({ 
  onSelectConversation, 
  selectedConversationId,
  className 
}: ChatListProps) {
  const { user } = useAuthStore();
  const { 
    conversations, 
    conversationsLoading, 
    fetchConversations,
    subscribeToConversations,
    fetchUnreadCount,
  } = useMessagesStore();

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUnreadCount();
      subscribeToConversations(user.id);
    }
  }, [user, fetchConversations, fetchUnreadCount, subscribeToConversations]);

  const handleSelectConversation = (conversation: DMConversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation.id);
    }
  };

  if (conversationsLoading && conversations.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        <EmptyState
          icon={<MessageSquare className="h-12 w-12 text-gray-400" />}
          title="No conversations yet"
          description="Start chatting with other users to see your conversations here."
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Search (placeholder for future) */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            disabled
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedConversationId === conversation.id}
            currentUserId={user?.id}
            onClick={() => handleSelectConversation(conversation)}
          />
        ))}
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: DMConversation;
  isSelected: boolean;
  currentUserId?: string;
  onClick: () => void;
}

function ConversationItem({ 
  conversation, 
  isSelected, 
  currentUserId,
  onClick 
}: ConversationItemProps) {
  const unreadCount = conversation.unread_count || 0;
  const isUnread = unreadCount > 0;
  const lastMessageTime = conversation.last_message_at 
    ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
    : null;
  
  // Check if the last message was sent by the current user
  const isOwnLastMessage = conversation.last_message_sender_id === currentUserId;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100",
        isSelected && "bg-green-50 hover:bg-green-50",
        isUnread && !isSelected && "bg-blue-50/50"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={conversation.other_user_avatar}
          name={conversation.other_user_name}
          size="md"
        />
        {/* Online indicator (future feature) */}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "font-medium text-gray-900 truncate",
            isUnread && "font-semibold"
          )}>
            {conversation.other_user_name || 'Unknown User'}
          </span>
          {lastMessageTime && (
            <span className="text-xs text-gray-500 flex-shrink-0">
              {lastMessageTime}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn(
            "text-sm truncate",
            isUnread ? "text-gray-900 font-medium" : "text-gray-500"
          )}>
            {isOwnLastMessage && (
              <span className="text-gray-400">You: </span>
            )}
            {conversation.last_message || 'No messages yet'}
          </p>
          
          {isUnread && (
            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-green-600 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
