'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/lib/services/notifications/hooks';
import { NotificationPanel } from './notification-panel';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  asButton?: boolean;
  buttonClassName?: string;
}

export function NotificationBell({
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  asButton = true,
  buttonClassName,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { unreadCount, loading } = useNotifications();

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  const BellIcon = (
    <>
      <Bell className="h-[18px] w-[18px]" />

      {/* Unread Badge */}
      {hasUnread && !loading && (
        <span className="ring-background animate-in zoom-in absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 duration-300">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
          <span className="relative z-10">{displayCount}</span>
        </span>
      )}

      {showLabel && <span className="ml-2 font-medium">Notifications</span>}
    </>
  );

  if (!asButton) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-lg active:scale-95',
              className
            )}
            aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ''}`}
          >
            <span className="relative flex h-8 w-8 items-center justify-center text-white">
              {BellIcon}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="border-border/50 w-[400px] overflow-hidden rounded-xl border p-0 shadow-2xl"
          sideOffset={8}
        >
          <NotificationPanel onClose={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary relative h-9 w-9 rounded-full transition-all duration-200',
            buttonClassName
          )}
          aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ''}`}
        >
          {BellIcon}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="border-border/50 w-[380px] overflow-hidden rounded-xl border p-0 shadow-2xl sm:w-[420px]"
        sideOffset={8}
      >
        <NotificationPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

// Standalone notification bell for mobile
export function NotificationBellMobile() {
  return <NotificationBell className="sm:hidden" variant="ghost" size="icon" />;
}

// Notification bell with label for desktop
export function NotificationBellDesktop() {
  return (
    <NotificationBell className="hidden sm:flex" variant="ghost" size="default" showLabel={false} />
  );
}
