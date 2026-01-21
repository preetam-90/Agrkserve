'use client';

import { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useMessagesStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MessageBadgeProps {
  className?: string;
  showIcon?: boolean;
  iconOnly?: boolean;
}

export function MessageBadge({ 
  className, 
  showIcon = true,
  iconOnly = false,
}: MessageBadgeProps) {
  const { user } = useAuthStore();
  const { unreadCount, fetchUnreadCount, subscribeToConversations } = useMessagesStore();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      subscribeToConversations(user.id);
    }
  }, [user, fetchUnreadCount, subscribeToConversations]);

  if (iconOnly) {
    return (
      <Link 
        href="/messages" 
        className={cn(
          "relative p-2 text-gray-600 hover:text-gray-900 transition-colors",
          className
        )}
      >
        {showIcon && <MessageSquare className="h-5 w-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-green-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link 
      href="/messages" 
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors",
        className
      )}
    >
      {showIcon && (
        <div className="relative">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-green-600 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      )}
      <span className="text-sm font-medium text-gray-700">Messages</span>
      {!showIcon && unreadCount > 0 && (
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-green-600 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
