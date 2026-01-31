'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Send, ArrowLeft, MoreVertical, Check, CheckCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useMessagesStore, useAuthStore } from '@/lib/store';
import { Avatar, Button, Spinner, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DirectMessage } from '@/lib/types';

interface ChatWindowProps {
  conversationId: string;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function ChatWindow({
  conversationId,
  onBack,
  showBackButton = false,
  className,
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const {
    activeConversation,
    messages,
    messagesLoading,
    hasMoreMessages,
    setActiveConversation,
    fetchMessages,
    sendMessage,
  } = useMessagesStore();

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set active conversation
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }

    return () => {
      // Don't clear active conversation on unmount to preserve state during navigation
    };
  }, [conversationId, setActiveConversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversationId]);

  // Load more messages on scroll
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || messagesLoading || !hasMoreMessages) return;

    // Load more when scrolled near the top
    if (container.scrollTop < 100) {
      fetchMessages(conversationId, true);
    }
  }, [conversationId, fetchMessages, hasMoreMessages, messagesLoading]);

  const handleSend = async () => {
    const trimmedContent = inputValue.trim();
    if (!trimmedContent || isSending) return;

    setIsSending(true);
    setInputValue('');

    try {
      await sendMessage(trimmedContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore input value on error
      setInputValue(trimmedContent);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation && messagesLoading) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!activeConversation) {
    return (
      <div className={cn('flex h-full items-center justify-center bg-[#0a0a0a]', className)}>
        <EmptyState
          icon={<div className="text-6xl">💬</div>}
          title="Select a conversation"
          description="Choose a conversation from the list to start messaging"
        />
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col bg-[#0a0a0a]', className)}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#262626] bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur-xl md:px-6 lg:px-8">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/10 md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <Link
          href={`/user/${activeConversation.other_user_id}`}
          className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="relative">
            <Avatar
              src={activeConversation.other_user_avatar}
              name={activeConversation.other_user_name}
              size="md"
              className="ring-2 ring-[#262626]"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0f0f0f] bg-[#22c55e] shadow-sm shadow-green-500/30"></span>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">
              {activeConversation.other_user_name || 'Unknown User'}
            </h2>
            <p className="flex items-center gap-1 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Online
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-1 overflow-y-auto bg-gradient-to-b from-[#0a0a0a] to-[#0d0d0d] px-4 py-6 md:px-6 lg:px-8"
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#333333 #0a0a0a',
        }}
      >
        {/* Load more indicator */}
        {messagesLoading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <Spinner size="sm" />
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 && !messagesLoading ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <span className="text-4xl">👋</span>
            </div>
            <p className="text-lg font-medium text-white">Start the conversation</p>
            <p className="mt-2 text-sm text-gray-400">
              Say hello to {activeConversation.other_user_name}
            </p>
          </div>
        ) : (
          <MessageList messages={messages} currentUserId={user?.id || ''} />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#262626] bg-[#0f0f0f]/95 p-4 backdrop-blur-xl md:px-6 lg:px-8">
        <div className="flex items-end gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full rounded-2xl border border-[#333333] bg-[#1a1a1a] px-5 py-3.5 pr-12 text-sm text-white transition-all placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={isSending}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="text-xs text-gray-600">
                {inputValue.length > 0 && `${inputValue.length}`}
              </span>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-0 shadow-lg shadow-blue-500/25 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30 disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-gray-600">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}

interface MessageListProps {
  messages: DirectMessage[];
  currentUserId: string;
}

function MessageList({ messages, currentUserId }: MessageListProps) {
  // Group messages by date
  const groupedMessages: { date: Date; messages: DirectMessage[] }[] = [];

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at);
    const lastGroup = groupedMessages[groupedMessages.length - 1];

    if (lastGroup && isSameDay(lastGroup.date, messageDate)) {
      lastGroup.messages.push(message);
    } else {
      groupedMessages.push({ date: messageDate, messages: [message] });
    }
  });

  return (
    <>
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Date separator */}
          <DateSeparator date={group.date} />

          {/* Messages for this date */}
          {group.messages.map((message, messageIndex) => {
            const isOwn = message.sender_id === currentUserId;
            const prevMessage = group.messages[messageIndex - 1];
            const nextMessage = group.messages[messageIndex + 1];

            // Check if consecutive messages are from the same sender
            const isFirstInGroup = !prevMessage || prevMessage.sender_id !== message.sender_id;
            const isLastInGroup = !nextMessage || nextMessage.sender_id !== message.sender_id;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={!isOwn && isLastInGroup}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

interface DateSeparatorProps {
  date: Date;
}

function DateSeparator({ date }: DateSeparatorProps) {
  let label: string;

  if (isToday(date)) {
    label = 'Today';
  } else if (isYesterday(date)) {
    label = 'Yesterday';
  } else {
    label = format(date, 'MMMM d, yyyy');
  }

  return (
    <div className="my-8 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#333333]" />
        <span className="rounded-full border border-[#333333] bg-[#1a1a1a] px-4 py-1.5 text-xs font-medium tracking-wide text-gray-400 shadow-sm">
          {label}
        </span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#333333]" />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: DirectMessage;
  isOwn: boolean;
  showAvatar: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  isFirstInGroup,
  isLastInGroup,
}: MessageBubbleProps) {
  const time = format(new Date(message.created_at), 'h:mm a');
  const deliveryStatus = message.delivery_status || (message.is_read ? 'read' : 'delivered');

  return (
    <div
      className={cn(
        'animate-message-in flex items-end gap-3',
        isOwn ? 'justify-end' : 'justify-start',
        !isLastInGroup ? 'mb-1' : 'mb-4'
      )}
    >
      {/* Avatar for received messages */}
      {!isOwn && (
        <div className="flex-shrink-0 pb-6">
          {showAvatar ? (
            <Avatar
              src={message.sender?.profile_image}
              name={message.sender?.name}
              size="sm"
              className="ring-2 ring-[#1a1a1a]"
            />
          ) : (
            <div className="h-8 w-8" />
          )}
        </div>
      )}

      {/* Message bubble */}
      <div className={cn('flex max-w-[75%] flex-col sm:max-w-[70%] md:max-w-[65%] lg:max-w-[60%]', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'break-words px-4 py-2.5 text-sm leading-relaxed',
            isOwn
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'border border-[#333333] bg-[#1a1a1a] text-white shadow-md shadow-black/20',
            // Bubble shape based on position in group
            isOwn
              ? isFirstInGroup && isLastInGroup
                ? 'rounded-2xl rounded-tr-sm'
                : isFirstInGroup
                  ? 'rounded-2xl rounded-tr-sm'
                  : isLastInGroup
                    ? 'rounded-2xl rounded-br-sm'
                    : 'rounded-2xl rounded-r-sm'
              : isFirstInGroup && isLastInGroup
                ? 'rounded-2xl rounded-tl-sm'
                : isFirstInGroup
                  ? 'rounded-2xl rounded-tl-sm'
                  : isLastInGroup
                    ? 'rounded-2xl rounded-bl-sm'
                    : 'rounded-2xl rounded-l-sm'
          )}
        >
          {message.content}
        </div>

        {/* Time and read status - always below message */}
        <div
          className={cn(
            'mt-1.5 flex items-center gap-1.5 text-[11px] font-medium tracking-wide',
            isOwn ? 'flex-row' : 'flex-row'
          )}
        >
          <span className={isOwn ? 'text-blue-400/70' : 'text-gray-500'}>{time}</span>
          {isOwn && (
            <span className="flex items-center">
              {deliveryStatus === 'read' ? (
                <span className="animate-read-receipt flex items-center gap-0.5 text-blue-400">
                  <CheckCheck className="h-3 w-3" />
                </span>
              ) : deliveryStatus === 'delivered' ? (
                <span className="flex items-center gap-0.5 text-gray-400">
                  <CheckCheck className="h-3 w-3" />
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-gray-400">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
