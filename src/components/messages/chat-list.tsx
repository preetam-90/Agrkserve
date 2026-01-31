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
  className,
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
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={cn('p-4', className)}>
        <EmptyState
          icon={<MessageSquare className="h-12 w-12 text-gray-600" />}
          title="No conversations yet"
          description="Start chatting with other users to see your conversations here."
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col bg-[#0a0a0a]', className)}>
      {/* Search */}
      <div className="border-b border-[#262626] bg-[#0a0a0a] p-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full rounded-xl border border-[#333333] bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm text-white transition-all placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled
          />
        </div>
      </div>

      {/* Conversations List */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#333333 #0a0a0a' }}
      >
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
  onClick,
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
        'group flex w-full items-center gap-3 border-b border-[#1a1a1a] p-3 text-left transition-all duration-200 hover:bg-[#1a1a1a]',
        isSelected && 'border-l-[3px] border-l-blue-500 bg-[#1a1a1a]',
        isUnread && !isSelected && 'bg-[#111111]/50'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={conversation.other_user_avatar}
          name={conversation.other_user_name}
          size="md"
          className={cn(
            'transition-transform duration-200',
            isSelected ? 'ring-2 ring-blue-500/50' : 'group-hover:ring-2 group-hover:ring-[#333333]'
          )}
        />
        {/* Online indicator */}
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0a] bg-green-500 shadow-sm shadow-green-500/30"></span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm',
              isUnread ? 'font-semibold text-white' : 'font-medium text-gray-200'
            )}
          >
            {conversation.other_user_name || 'Unknown User'}
          </span>
          {lastMessageTime && (
            <span
              className={cn(
                'flex-shrink-0 text-xs',
                isUnread ? 'font-medium text-blue-400' : 'text-gray-500'
              )}
            >
              {lastMessageTime}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p
            className={cn(
              'truncate text-sm',
              isUnread ? 'font-medium text-gray-300' : 'text-gray-500'
            )}
          >
            {isOwnLastMessage && (
              <span className={isUnread ? 'text-blue-400/70' : 'text-gray-600'}>You: </span>
            )}
            {conversation.last_message || 'No messages yet'}
          </p>

          {isUnread && (
            <span className="inline-flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-blue-500/25">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
