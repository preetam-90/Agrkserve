'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/lib/services/notifications/hooks';
import { NotificationPanel } from './notification-panel';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  const [open, setOpen] = useState(false);
  const { unreadCount, loading } = useNotifications();

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('relative', className)}
          aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          
          {/* Unread Badge */}
          {hasUnread && !loading && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white ring-2 ring-background">
              {displayCount}
            </span>
          )}

          {/* Pulse animation for new notifications */}
          {hasUnread && !loading && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-ping rounded-full bg-red-400 opacity-75" />
          )}

          {showLabel && (
            <span className="ml-2">
              Notifications
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[400px] p-0"
        sideOffset={8}
      >
        <NotificationPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

// Standalone notification bell for mobile
export function NotificationBellMobile() {
  return (
    <NotificationBell
      className="sm:hidden"
      variant="ghost"
      size="icon"
    />
  );
}

// Notification bell with label for desktop
export function NotificationBellDesktop() {
  return (
    <NotificationBell
      className="hidden sm:flex"
      variant="ghost"
      size="default"
      showLabel={false}
    />
  );
}
