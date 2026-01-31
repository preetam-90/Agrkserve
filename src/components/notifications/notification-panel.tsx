'use client';

import { useState, useMemo } from 'react';
import { useNotifications } from '@/lib/services/notifications/hooks';
import { NotificationItem } from './notification-item';
import { NotificationFilters } from './notification-filters';
import type {
  NotificationGroup,
  NotificationFilters as FilterType,
} from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, CheckCheck, Trash2, Settings, Loader2, Maximize2, Inbox } from 'lucide-react';
import Link from 'next/link';

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [filters, setFilters] = useState<FilterType>({});
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    loadMore,
    hasMore,
  } = useNotifications(filters);

  const groupedNotifications = useMemo<NotificationGroup[]>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: NotificationGroup[] = [
      { label: 'Today', notifications: [] },
      { label: 'Yesterday', notifications: [] },
      { label: 'Earlier', notifications: [] },
    ];

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.created_at);

      if (notificationDate >= today) {
        groups[0].notifications.push(notification);
      } else if (notificationDate >= yesterday) {
        groups[1].notifications.push(notification);
      } else {
        groups[2].notifications.push(notification);
      }
    });

    return groups.filter((group) => group.notifications.length > 0);
  }, [notifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')
    ) {
      try {
        await clearAll();
      } catch (err) {
        console.error('Failed to clear notifications:', err);
      }
    }
  };

  return (
    <div className="bg-background flex h-[600px] flex-col">
      <div className="bg-muted/30 flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="text-foreground h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
              </span>
            )}
          </div>
          <div>
            <h2 className="text-base font-bold leading-none">Notifications</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'No new notifications'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
              onClick={handleMarkAllRead}
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}

          <Link href="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
              title="View all notifications"
              onClick={onClose}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/notifications/settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
              title="Notification settings"
              onClick={onClose}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <NotificationFilters filters={filters} onFiltersChange={setFilters} />

      <ScrollArea className="bg-muted/5 flex-1">
        {loading && notifications.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">Loading updates...</p>
          </div>
        ) : error ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-destructive text-sm font-medium">Failed to load notifications</p>
            <p className="text-muted-foreground text-xs">{error.message}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
              <Inbox className="text-muted-foreground/50 h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground text-base font-medium">No notifications yet</p>
              <p className="text-muted-foreground mx-auto max-w-[200px] text-sm">
                We'll notify you when something important happens.
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-4">
            {groupedNotifications.map((group, groupIndex) => (
              <div key={group.label} className="relative">
                <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/50 sticky top-0 z-10 flex items-center gap-4 border-b px-4 py-2 shadow-sm backdrop-blur">
                  <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {group.label}
                  </h3>
                  <div className="bg-border/50 h-px flex-1" />
                </div>

                <div className="divide-border/50 divide-y">
                  {group.notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center p-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full max-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    'Load Previous'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {notifications.length > 0 && (
        <div className="bg-background flex items-center justify-between border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 text-xs font-medium"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Clear All
          </Button>

          <Link href="/notifications">
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 h-8 text-xs"
            >
              View All
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
