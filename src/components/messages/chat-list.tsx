'use client';

import { useEffect, useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Search } from 'lucide-react';
import { useMessagesStore, useAuthStore } from '@/lib/store';
import { Avatar, Spinner, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DMConversation, UserProfileMinimal } from '@/lib/types';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<UserProfileMinimal[]>([]);
  const [userResultsLoading, setUserResultsLoading] = useState(false);
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

  // Note: don't early-return when there are no conversations — allow searching users globally

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim();

    if (!q) return conversations;

    const qLower = q.toLowerCase();
    const tokens = qLower.split(/\s+/).filter(Boolean);

    return conversations.filter((c) => {
      const parts: string[] = [];
      if (c.other_user_name) parts.push(c.other_user_name);
      if ((c as any).other_participant?.name) parts.push((c as any).other_participant.name);
      if ((c as any).participant_1_name) parts.push((c as any).participant_1_name);
      if ((c as any).participant_2_name) parts.push((c as any).participant_2_name);
      if (c.last_message) parts.push(c.last_message);
      if (c.other_user_id) parts.push(c.other_user_id);
      if (c.id) parts.push(c.id);

      const hay = parts.join(' ').toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [conversations, searchQuery]);

  // Dev debug: show search activity in console to help diagnose issues
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      try {
        // eslint-disable-next-line no-console
        console.debug(
          '[ChatList] searchQuery:',
          searchQuery,
          'results:',
          filteredConversations.length
        );
      } catch (e) {
        // ignore
      }
    }
  }, [searchQuery, filteredConversations.length]);

  // Debounced server-side user search (so typing behaves like WhatsApp contact search)
  useEffect(() => {
    const q = searchQuery.trim();
    let mounted = true;
    if (!q) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setUserResultsLoading(true);
      try {
        const supabase = createSupabaseClient();

        // Build OR query for partial/ILIKE matches across name, phone, email
        const escaped = q.replace(/%/g, '\\%').replace(/_/g, '\\_');
        const orQuery = `name.ilike.%${escaped}%,phone.ilike.%${escaped}%,email.ilike.%${escaped}%`;

        let query = supabase
          .from('user_profiles')
          .select('id, name, profile_image')
          .or(orQuery)
          .limit(20);
        if (user?.id) query = query.neq('id', user.id);

        const { data, error } = await query;

        if (!mounted) return;
        if (error) {
          console.error('User search error:', error);
          setUserResults([]);
        } else {
          setUserResults((data as UserProfileMinimal[]) || []);
        }
      } catch (err) {
        console.error('User search failed:', err);
        if (mounted) setUserResults([]);
      } finally {
        if (mounted) setUserResultsLoading(false);
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, user?.id]);

  const handleStartConversationWithUser = async (otherUserId: string) => {
    try {
      const conversationId = await useMessagesStore.getState().startConversation(otherUserId);
      if (onSelectConversation) onSelectConversation(conversationId);
      setSearchQuery('');
      setUserResults([]);
    } catch (err) {
      console.error('Failed to start conversation with user:', err);
    }
  };

  return (
    <div className={cn('flex h-full flex-col bg-[#0a0a0a]', className)}>
      {/* Search */}
      <div className="border-b border-[#262626] bg-[#0a0a0a] p-2.5 sm:p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 sm:left-3.5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#333333] bg-[#1a1a1a] py-2 pl-9 pr-3 text-sm text-white transition-all placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:py-2.5 sm:pl-10 sm:pr-4"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#333333 #0a0a0a' }}
        data-lenis-prevent={true}
      >
        {conversationsLoading && conversations.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : searchQuery ? (
          <div className="space-y-2">
            {/* User search results (server-side) */}
            {userResultsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Spinner />
              </div>
            ) : userResults.length > 0 ? (
              <div className="divide-y divide-[#111] bg-[#0a0a0a]">
                {userResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversationWithUser(u.id)}
                    className="group flex w-full items-center gap-2 border-b border-[#1a1a1a] p-2.5 text-left transition-all duration-150 hover:bg-[#1a1a1a] sm:gap-3 sm:p-3"
                  >
                    <Avatar src={(u as any).profile_image} name={u.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-medium text-gray-200 sm:text-sm">
                          {u.name || 'Unknown User'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Conversation matches */}
            {filteredConversations.length > 0 ? (
              <div className="divide-y divide-[#111]">
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    currentUserId={user?.id}
                    onClick={() => handleSelectConversation(conversation)}
                  />
                ))}
              </div>
            ) : (
              // If no user results and no conversation results, show empty state
              userResults.length === 0 &&
              !userResultsLoading && (
                <div className="p-4">
                  <EmptyState
                    icon={<Search className="h-12 w-12 text-gray-600" />}
                    title="No results"
                    description={`No conversations or contacts match "${searchQuery}"`}
                  />
                </div>
              )
            )}
          </div>
        ) : (
          // Default: show all conversations
          <div className="divide-y divide-[#111]">
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
        )}
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
        'group flex w-full items-center gap-2 border-b border-[#1a1a1a] p-2.5 text-left transition-all duration-200 hover:bg-[#1a1a1a] sm:gap-3 sm:p-3',
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
              'truncate text-xs sm:text-sm',
              isUnread ? 'font-semibold text-white' : 'font-medium text-gray-200'
            )}
          >
            {conversation.other_user_name || 'Unknown User'}
          </span>
          {lastMessageTime && (
            <span
              className={cn(
                'flex-shrink-0 text-[10px] sm:text-xs',
                isUnread ? 'font-medium text-blue-400' : 'text-gray-500'
              )}
            >
              {lastMessageTime}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2 sm:mt-1">
          <p
            className={cn(
              'truncate text-[11px] sm:text-sm',
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
