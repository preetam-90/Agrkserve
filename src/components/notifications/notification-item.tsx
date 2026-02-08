'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  X,
  ArrowRight,
  LucideIcon,
  Bell,
  MessageSquare,
  DollarSign,
  Info,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  booking: Bell,
  message: MessageSquare,
  payment: DollarSign,
  system: Info,
};

const EVENT_ICONS: Record<string, LucideIcon> = {
  booking_request: Bell,
  booking_accepted: CheckCircle,
  booking_rejected: XCircle,
  booking_cancelled: XCircle,
  payment_due: DollarSign,
  payment_received: DollarSign,
  new_message: MessageSquare,
  new_review: Star,
  new_login: Shield,
  high_demand: TrendingUp,
  welcome: CheckCircle,
};

const PRIORITY_STYLES: Record<string, { dot: string; bg: string }> = {
  critical: {
    dot: 'bg-red-500',
    bg: 'hover:bg-red-50 dark:hover:bg-red-950/20',
  },
  high: {
    dot: 'bg-orange-500',
    bg: 'hover:bg-orange-50 dark:hover:bg-orange-950/20',
  },
  normal: {
    dot: 'bg-blue-500',
    bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/20',
  },
  low: {
    dot: 'bg-gray-400',
    bg: 'hover:bg-gray-50 dark:hover:bg-gray-900/20',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  booking: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950',
  message: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950',
  payment: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950',
  system: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900',
  trust: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950',
  security: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950',
  insight: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950',
};

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
    EVENT_ICONS[notification.event_type] || NOTIFICATION_ICONS[notification.category] || Info;

  const priorityStyle = PRIORITY_STYLES[notification.priority] || PRIORITY_STYLES.normal;
  const categoryColor = CATEGORY_COLORS[notification.category] || CATEGORY_COLORS.system;

  const handleClick = useCallback(async () => {
    if (!notification.is_read) {
      try {
        await onMarkRead(notification.id);
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    if (notification.action_url) {
      onClose?.();
      router.push(notification.action_url);
    }
  }, [notification, onMarkRead, onClose, router]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);

    try {
      await onDelete(notification.id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setIsDeleting(false);
    }
  }, [notification.id, onDelete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleDelete(e as any);
      }
    };

    const element = document.getElementById(`notification-${notification.id}`);
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [notification.id, handleDelete]);

  return (
    <div
      id={`notification-${notification.id}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${notification.title}. ${notification.message}. ${notification.is_read ? 'Read' : 'Unread'}`}
      aria-describedby={`notification-desc-${notification.id}`}
      className={cn(
        'group relative flex cursor-pointer gap-3 p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900',
        notification.is_read 
          ? 'bg-background hover:bg-muted/50' 
          : 'bg-primary/5 hover:bg-primary/10',
        priorityStyle.bg,
        isDeleting && 'pointer-events-none scale-95 opacity-0',
        notification.action_url && 'cursor-pointer'
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110',
            categoryColor
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm font-semibold leading-tight',
              notification.is_read ? 'text-foreground/80' : 'text-foreground'
            )}
          >
            {notification.title}
          </h4>

          {/* Unread indicator */}
          {!notification.is_read && (
            <div 
              className={cn('mt-1 h-2 w-2 flex-shrink-0 rounded-full', priorityStyle.dot)}
              aria-label="Unread notification"
            />
          )}
        </div>

        <p
          id={`notification-desc-${notification.id}`}
          className={cn(
            'line-clamp-2 text-xs leading-relaxed',
            notification.is_read ? 'text-muted-foreground' : 'text-foreground/70'
          )}
        >
          {notification.message}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          {notification.action_url && notification.action_label && (
            <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
              {notification.action_label}
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        onClick={handleDelete}
        disabled={isDeleting}
        title="Delete notification"
        aria-label="Delete notification"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
