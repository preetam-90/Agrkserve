'use client';

import { useState, useMemo } from 'react';
import { useNotifications } from '@/lib/services/notifications/hooks';
import { NotificationItem } from './notification-item';
import { NotificationFilters } from './notification-filters';
import type { NotificationGroup, NotificationFilters as FilterType } from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, CheckCheck, Trash2, Settings, Loader2, Maximize2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

  // Group notifications by time
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
    if (window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
      try {
        await clearAll();
      } catch (err) {
        console.error('Failed to clear notifications:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}

          <Link href="/notifications">
            <Button
              variant="ghost"
              size="sm"
              title="View all notifications"
              onClick={onClose}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/notifications/settings">
            <Button
              variant="ghost"
              size="sm"
              title="Notification settings"
              onClick={onClose}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <NotificationFilters filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      <ScrollArea className="flex-1">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-center px-4">
            <p className="text-sm text-destructive">Failed to load notifications</p>
            <p className="text-xs text-muted-foreground">{error.message}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground">
              You're all caught up! 🎉
            </p>
          </div>
        ) : (
          <div className="py-2">
            {groupedNotifications.map((group, groupIndex) => (
              <div key={group.label}>
                {/* Group Label */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </h3>
                </div>

                {/* Notifications */}
                <div className="space-y-1 px-2">
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

                {groupIndex < groupedNotifications.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>

            <Link href="/notifications">
              <Button variant="link" size="sm" onClick={onClose}>
                View All Notifications
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
