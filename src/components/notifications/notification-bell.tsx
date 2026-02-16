'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';

import { useNotifications } from '@/lib/services/notifications/hooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function NotificationBell({
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}: NotificationBellProps) {
  const { unreadCount, loading } = useNotifications();

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <Link
      href="/notifications"
      className={cn(
        'relative inline-flex rounded-full transition-all duration-200',
        'hover:bg-primary/10 hover:text-primary',
        className
      )}
      aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ''}`}
    >
      <Button
        variant={variant}
        size={size}
        className={cn(
          'relative rounded-full transition-all duration-200',
          'hover:bg-primary/10 hover:text-primary',
          className
        )}
        aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="relative flex items-center">
          <Bell className="h-5 w-5" />

          {/* Unread badge */}
          {hasUnread && !loading && (
            <span className="ring-background absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1.5 text-[10px] font-bold text-white shadow-lg ring-2">
              {displayCount}
            </span>
          )}
        </span>

        {showLabel && <span className="ml-2 text-sm font-medium">Notifications</span>}
      </Button>
    </Link>
  );
}
