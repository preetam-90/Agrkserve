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
  className 
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
      <div className={cn("flex items-center justify-center h-full", className)}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!activeConversation) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-gray-50", className)}>
        <EmptyState
          icon={<div className="text-6xl">💬</div>}
          title="Select a conversation"
          description="Choose a conversation from the list to start messaging"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-10">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Link 
          href={`/user/${activeConversation.other_user_id}`}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={activeConversation.other_user_avatar}
            name={activeConversation.other_user_name}
            size="md"
          />
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">
              {activeConversation.other_user_name || 'Unknown User'}
            </h2>
            {/* Online status placeholder */}
            <p className="text-xs text-gray-500">Tap to view profile</p>
          </div>
        </Link>

        <Button variant="ghost" size="sm">
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        onScroll={handleScroll}
      >
        {/* Load more indicator */}
        {messagesLoading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <Spinner size="sm" />
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 && !messagesLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-gray-600 font-medium">Start the conversation</p>
            <p className="text-sm text-gray-500 mt-1">
              Say hello to {activeConversation.other_user_name}
            </p>
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            currentUserId={user?.id || ''} 
          />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
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
    <div className="flex items-center justify-center my-4">
      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        {label}
      </span>
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

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOwn ? "justify-end" : "justify-start",
        !isLastInGroup ? "mb-0.5" : "mb-2"
      )}
    >
      {/* Avatar for received messages */}
      {!isOwn && (
        <div className="w-8 flex-shrink-0">
          {showAvatar && (
            <Avatar
              src={message.sender?.profile_image}
              name={message.sender?.name}
              size="sm"
            />
          )}
        </div>
      )}

      {/* Message bubble */}
      <div className={cn(
        "max-w-[70%] flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}>
        <div
          className={cn(
            "px-4 py-2 text-sm break-words",
            isOwn 
              ? "bg-green-600 text-white" 
              : "bg-gray-100 text-gray-900",
            // Bubble shape based on position in group
            isOwn ? (
              isFirstInGroup && isLastInGroup 
                ? "rounded-2xl" 
                : isFirstInGroup 
                  ? "rounded-2xl rounded-br-md" 
                  : isLastInGroup 
                    ? "rounded-2xl rounded-tr-md" 
                    : "rounded-2xl rounded-r-md"
            ) : (
              isFirstInGroup && isLastInGroup 
                ? "rounded-2xl" 
                : isFirstInGroup 
                  ? "rounded-2xl rounded-bl-md" 
                  : isLastInGroup 
                    ? "rounded-2xl rounded-tl-md" 
                    : "rounded-2xl rounded-l-md"
            )
          )}
        >
          {message.content}
        </div>

        {/* Time and read status */}
        {isLastInGroup && (
          <div className={cn(
            "flex items-center gap-1 mt-1 text-xs text-gray-500",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}>
            <span>{time}</span>
            {isOwn && (
              message.is_read ? (
                <CheckCheck className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
