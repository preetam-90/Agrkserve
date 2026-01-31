'use client';

import { useState } from 'react';
import type { Notification } from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  X,
  ExternalLink,
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

const NOTIFICATION_STYLES: Record<string, { bg: string; icon: string; border: string }> = {
  critical: {
    bg: 'hover:bg-red-50/50',
    icon: 'text-red-600 bg-red-100',
    border: 'border-l-red-500',
  },
  high: {
    bg: 'hover:bg-orange-50/50',
    icon: 'text-orange-600 bg-orange-100',
    border: 'border-l-orange-500',
  },
  normal: {
    bg: 'hover:bg-blue-50/50',
    icon: 'text-blue-600 bg-blue-100',
    border: 'border-l-blue-500',
  },
  low: {
    bg: 'hover:bg-gray-50/50',
    icon: 'text-gray-600 bg-gray-100',
    border: 'border-l-gray-300',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  booking: 'text-blue-600',
  message: 'text-emerald-600',
  payment: 'text-amber-600',
  system: 'text-slate-600',
  trust: 'text-purple-600',
  security: 'text-red-600',
  insight: 'text-indigo-600',
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

  const style = NOTIFICATION_STYLES[notification.priority] || NOTIFICATION_STYLES.normal;
  const categoryColor = CATEGORY_COLORS[notification.category] || 'text-gray-600';

  const handleClick = async () => {
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
        'group relative flex cursor-pointer gap-4 border-l-[3px] p-4 transition-all duration-300',
        'bg-background border-transparent hover:shadow-md',
        notification.is_read ? 'opacity-80 hover:opacity-100' : `bg-primary/5 ${style.border}`,
        isDeleting && 'pointer-events-none origin-center scale-95 opacity-0',
        style.bg
      )}
    >
      <div className={cn('mt-0.5 flex-shrink-0')}>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110',
            style.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm leading-tight transition-colors',
              notification.is_read ? 'text-foreground/80 font-medium' : 'text-foreground font-bold',
              'group-hover:text-primary'
            )}
          >
            {notification.title}
          </h4>

          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-6 w-6 rounded-full"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete notification"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <p
          className={cn(
            'line-clamp-2 text-sm leading-relaxed',
            notification.is_read ? 'text-muted-foreground' : 'text-foreground/90'
          )}
        >
          {notification.message}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="text-muted-foreground group-hover:text-primary/70 flex items-center gap-1.5 text-xs transition-colors">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          {notification.action_url && notification.action_label && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold hover:underline',
                categoryColor
              )}
            >
              {notification.action_label}
              <ExternalLink className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>

      {!notification.is_read && (
        <span className="bg-primary absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full" />
      )}
    </div>
  );
}
