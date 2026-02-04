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
  Eye,
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
    bg: 'hover:bg-red-900/20',
    icon: 'text-red-400 bg-red-900/30 ring-1 ring-red-500/30',
    border: 'border-l-red-500',
  },
  high: {
    bg: 'hover:bg-orange-900/20',
    icon: 'text-orange-400 bg-orange-900/30 ring-1 ring-orange-500/30',
    border: 'border-l-orange-500',
  },
  normal: {
    bg: 'hover:bg-blue-900/20',
    icon: 'text-blue-400 bg-blue-900/30 ring-1 ring-blue-500/30',
    border: 'border-l-blue-500',
  },
  low: {
    bg: 'hover:bg-slate-800/30',
    icon: 'text-slate-400 bg-slate-800/50 ring-1 ring-slate-600/30',
    border: 'border-l-slate-500',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  booking: 'text-blue-400',
  message: 'text-emerald-400',
  payment: 'text-amber-400',
  system: 'text-slate-400',
  trust: 'text-purple-400',
  security: 'text-red-400',
  insight: 'text-indigo-400',
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
        'group relative flex cursor-pointer gap-5 border-l-[4px] p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10',
        'bg-slate-900/30 backdrop-blur-sm border-transparent hover:bg-slate-800/40',
        notification.is_read 
          ? 'opacity-90 hover:opacity-100' 
          : `bg-gradient-to-r from-slate-800/60 via-slate-900/40 to-slate-900/30 ${style.border} shadow-lg ring-1 ring-white/5`,
        isDeleting && 'pointer-events-none origin-center scale-95 opacity-0 transition-all duration-700',
        style.bg,
        'hover:scale-[1.02] hover:-translate-y-1 hover:ring-1 hover:ring-white/10'
      )}
    >
      <div className={cn('mt-1 flex-shrink-0')}>
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:rotate-3',
            style.icon,
            'backdrop-blur-sm'
          )}
        >
          <Icon className="h-7 w-7 drop-shadow-sm" />
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h4
            className={cn(
              'text-lg leading-tight transition-colors font-bold',
              notification.is_read ? 'text-slate-300' : 'text-white',
              'group-hover:text-blue-300 line-clamp-2 drop-shadow-sm'
            )}
          >
            {notification.title}
          </h4>

          <div className="flex items-center gap-2 opacity-0 transition-all duration-500 group-hover:opacity-100">
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 h-9 w-9 rounded-xl transition-all duration-300 ring-1 ring-blue-500/20 hover:ring-blue-400/40 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id);
                }}
                title="Mark as read"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-red-400 hover:bg-red-900/30 h-9 w-9 rounded-xl transition-all duration-300 ring-1 ring-slate-600/20 hover:ring-red-500/40 backdrop-blur-sm"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete notification"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p
          className={cn(
            'line-clamp-3 text-base leading-relaxed',
            notification.is_read ? 'text-slate-400' : 'text-slate-200'
          )}
        >
          {notification.message}
        </p>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="text-slate-500 group-hover:text-blue-400/80 flex items-center gap-2 text-sm transition-colors font-medium">
            <Clock className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Enhanced Priority indicator */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-3 w-3 rounded-full shadow-lg ring-2 ring-slate-900',
                notification.priority === 'critical' && 'bg-red-500 animate-pulse shadow-red-500/50',
                notification.priority === 'high' && 'bg-orange-500 shadow-orange-500/50',
                notification.priority === 'normal' && 'bg-blue-500 shadow-blue-500/50',
                notification.priority === 'low' && 'bg-slate-500 shadow-slate-500/50'
              )} />
              <span className="text-xs text-slate-500 font-medium capitalize">
                {notification.priority}
              </span>
            </div>
            
            {notification.action_url && notification.action_label && (
              <span
                className={cn(
                  'inline-flex items-center gap-2 text-sm font-bold hover:underline px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm',
                  categoryColor,
                  'bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 hover:text-blue-200 ring-1 ring-blue-500/30 hover:ring-blue-400/50 shadow-lg hover:shadow-blue-500/20'
                )}
              >
                {notification.action_label}
                <ExternalLink className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </div>

      {!notification.is_read && (
        <div className="absolute right-5 top-5">
          <div className="relative">
            <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 shadow-lg" />
          </div>
        </div>
      )}
      
      {/* Enhanced hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-slate-700/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none" />
      
      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-lg ring-1 ring-transparent group-hover:ring-white/10 transition-all duration-500 pointer-events-none" />
    </div>
  );
}
