'use client';

import { useState } from 'react';
import type { Notification } from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { X, ExternalLink, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NOTIFICATION_ICONS, EVENT_ICONS, NOTIFICATION_COLORS, CATEGORY_COLORS } from '@/lib/services/notifications/config';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose?: () => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onClose,
}: NotificationItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon: LucideIcon =
    EVENT_ICONS[notification.event_type] ||
    NOTIFICATION_ICONS[notification.category];

  const colors = NOTIFICATION_COLORS[notification.priority];
  const categoryColor = CATEGORY_COLORS[notification.category];

  const handleClick = async () => {
    // Mark as read if not already
    if (!notification.is_read) {
      try {
        await onMarkRead(notification.id);
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    // Navigate if action URL exists
    if (notification.action_url) {
      onClose?.();
      router.push(notification.action_url);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);

    try {
      await onDelete(notification.id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex gap-3 p-3 rounded-lg transition-all duration-200',
        'hover:bg-accent cursor-pointer',
        !notification.is_read && 'bg-blue-50/50',
        isDeleting && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0', categoryColor)}>
        <div
          className={cn(
            'flex items-center justify-center h-10 w-10 rounded-full',
            colors.bg
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title & Time */}
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm font-medium leading-tight',
              !notification.is_read && 'font-semibold'
            )}
          >
            {notification.title}
          </h4>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Message */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>

        {/* Footer: Time & Action */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </span>

          {notification.action_url && notification.action_label && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs font-medium"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {notification.action_label}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Unread Indicator */}
      {!notification.is_read && (
        <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-600" />
      )}

      {/* Priority Indicator */}
      {notification.priority === 'critical' && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-red-500 ring-offset-2 pointer-events-none" />
      )}
      {notification.priority === 'high' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-lg" />
      )}
    </div>
  );
}
