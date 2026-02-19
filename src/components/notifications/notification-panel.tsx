/* eslint-disable */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useNotifications } from '@/lib/services/notifications/hooks';
import { NotificationItem } from './notification-item';
import type {
  NotificationGroup as BaseNotificationGroup,
  NotificationFilters as FilterType,
} from '@/lib/types/notifications';
import type { LucideIcon } from 'lucide-react';

interface NotificationGroup extends BaseNotificationGroup {
  icon?: LucideIcon;
}
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  CheckCheck,
  Settings,
  Loader2,
  Inbox,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
  Sparkles,
  Zap,
  BellRing,
  BellOff,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  onClose?: () => void;
}

type TabValue = 'all' | 'unread' | 'read';

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [filters, setFilters] = useState<FilterType>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [_showFilters, setShowFilters] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    hasMore,
  } = useNotifications(filters);

  // Initialize with entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab changes
  useEffect(() => {
    const newFilters = { ...filters };
    if (activeTab === 'unread') {
      newFilters.is_read = false;
    } else if (activeTab === 'read') {
      newFilters.is_read = true;
    } else {
      delete newFilters.is_read;
    }
    // eslint-disable-next-line renders

    setFilters(newFilters);
  }, [activeTab]);

  // Filter by search query
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const query = searchQuery.toLowerCase();
    return notifications.filter(
      (n) => n.title?.toLowerCase().includes(query) || n.message?.toLowerCase().includes(query)
    );
  }, [notifications, searchQuery]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.is_read).length;
    const read = total - unread;
    return { total, unread, read };
  }, [notifications]);

  return (
    <div
      className={cn(
        'relative flex max-h-[85vh] w-full max-w-lg flex-col',
        'rounded-[32px]',
        'transition-all duration-700 ease-out',
        isInitialized ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'
      )}
    >
      {/* Multi-Layer Glassmorphism Background - Agriculture Theme */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-[32px]">
        {/* Animated Gradient Mesh Background - Earth Tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 via-amber-100/25 to-emerald-200/30 dark:from-green-800/20 dark:via-amber-900/15 dark:to-emerald-800/20" />
        <div className="absolute inset-0 bg-gradient-to-tl from-yellow-100/20 via-transparent to-lime-100/20 dark:from-yellow-900/10 dark:to-lime-900/10" />

        {/* Frosted Glass Effect - Enhanced with Very Light Background */}
        <div className="absolute inset-0 backdrop-blur-[120px] backdrop-saturate-[180%]" />

        {/* Subtle Mesh Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floating Orbs - Agriculture Colors */}
        <div className="absolute -left-20 -top-20 h-60 w-60 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-green-300/25 to-emerald-400/25 blur-[80px]" />
        <div
          className="absolute -right-32 top-1/3 h-80 w-80 animate-[pulse_10s_ease-in-out_infinite] rounded-full bg-gradient-to-bl from-lime-300/20 to-green-400/20 blur-[100px]"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-24 left-1/4 h-72 w-72 animate-[pulse_12s_ease-in-out_infinite] rounded-full bg-gradient-to-tr from-amber-200/20 to-yellow-300/20 blur-[90px]"
          style={{ animationDelay: '4s' }}
        />

        {/* Glass Panel Base - Very Light with Enhanced Transparency */}
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/40" />

        {/* Shimmer Effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            animation: 'shimmer 8s ease-in-out infinite',
          }}
        />

        {/* Border Glow - Enhanced Agriculture Theme */}
        <div className="absolute inset-0 rounded-[32px] border-2 border-white/80 shadow-[0_8px_48px_0_rgba(34,197,94,0.15)] dark:border-white/50" />
        <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_0_80px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.25)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col overflow-hidden">
        {/* Premium Header */}
        <div className="relative flex shrink-0 flex-col gap-4 px-6 pb-4 pt-6">
          {/* Top Bar */}
          <div className="flex items-start justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              {/* Glowing Bell Icon - Agriculture Colors */}
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 opacity-40 blur-xl" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 shadow-lg shadow-green-500/30">
                  <BellRing className="h-7 w-7 animate-[wiggle_3s_ease-in-out_infinite] text-white" />
                  {unreadCount > 0 && (
                    <div className="absolute -right-2 -top-2">
                      <div className="relative flex h-7 w-7 items-center justify-center">
                        <span className="absolute inset-0 animate-ping rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 opacity-75" />
                        <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-rose-500 to-fuchsia-600 text-xs font-black text-white shadow-lg">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col gap-1">
                <h1 className="bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-2xl font-black text-transparent dark:from-white dark:via-green-200 dark:to-emerald-200">
                  Notifications
                </h1>
                <div className="flex items-center gap-2 text-sm">
                  {unreadCount > 0 ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 animate-pulse text-yellow-600" />
                      <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                        {unreadCount} new update{unreadCount > 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-700 dark:text-green-300">
                        You're all caught up!
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link href="/settings/notifications" onClick={onClose}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 rounded-xl border border-white/60 bg-white/60 shadow-lg backdrop-blur-xl transition-all hover:bg-white/80 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20"
                >
                  <Settings className="h-4.5 w-4.5 text-gray-700 dark:text-gray-300" />
                </Button>
              </Link>

              {onClose && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="h-10 w-10 rounded-xl border border-white/60 bg-white/60 shadow-lg backdrop-blur-xl transition-all hover:border-rose-500/50 hover:bg-rose-500/20 dark:border-white/20 dark:bg-white/10 dark:hover:bg-rose-500/30"
                >
                  <X className="h-4.5 w-4.5 text-gray-700 hover:text-rose-600 dark:text-gray-300" />
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="h-4.5 w-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'h-11 rounded-2xl pl-11 pr-10',
                'bg-white/70 dark:bg-white/10',
                'border-2 border-white/60 dark:border-white/20',
                'focus:border-violet-500/50 dark:focus:border-cyan-500/50',
                'shadow-lg backdrop-blur-xl',
                'text-gray-900 placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400',
                'transition-all duration-200'
              )}
            />
            {searchQuery && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Tabs with Stats */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 gap-2 rounded-2xl border border-white/60 bg-white/70 p-1.5 shadow-lg backdrop-blur-xl dark:border-white/30 dark:bg-white/10">
              <TabsTrigger
                value="all"
                className={cn(
                  'rounded-xl text-sm font-semibold transition-all duration-200 data-[state=active]:shadow-lg',
                  'data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-emerald-600',
                  'data-[state=active]:text-white',
                  'data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300',
                  'data-[state=inactive]:hover:bg-white/50 dark:data-[state=inactive]:hover:bg-white/10'
                )}
              >
                All
                <span
                  className={cn(
                    'ml-1.5 rounded-md px-1.5 py-0.5 text-xs font-bold',
                    activeTab === 'all'
                      ? 'bg-white/30 text-white'
                      : 'bg-green-500/20 text-green-700 dark:text-green-300'
                  )}
                >
                  {stats.total}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="unread"
                className={cn(
                  'rounded-xl text-sm font-semibold transition-all duration-200 data-[state=active]:shadow-lg',
                  'data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500',
                  'data-[state=active]:text-white',
                  'data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300',
                  'data-[state=inactive]:hover:bg-white/50 dark:data-[state=inactive]:hover:bg-white/10'
                )}
              >
                Unread
                <span
                  className={cn(
                    'ml-1.5 rounded-md px-1.5 py-0.5 text-xs font-bold',
                    activeTab === 'unread'
                      ? 'bg-white/30 text-white'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  )}
                >
                  {stats.unread}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="read"
                className={cn(
                  'rounded-xl text-sm font-semibold transition-all duration-200 data-[state=active]:shadow-lg',
                  'data-[state=active]:bg-gradient-to-br data-[state=active]:from-lime-500 data-[state=active]:to-green-500',
                  'data-[state=active]:text-white',
                  'data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300',
                  'data-[state=inactive]:hover:bg-white/50 dark:data-[state=inactive]:hover:bg-white/10'
                )}
              >
                Read
                <span
                  className={cn(
                    'ml-1.5 rounded-md px-1.5 py-0.5 text-xs font-bold',
                    activeTab === 'read'
                      ? 'bg-white/30 text-white'
                      : 'bg-lime-500/20 text-lime-700 dark:text-lime-300'
                  )}
                >
                  {stats.read}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Quick Actions Bar */}
          {unreadCount > 0 && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-9 gap-2 rounded-xl border border-green-500/40 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 text-sm font-semibold text-green-700 shadow-md backdrop-blur-xl transition-all hover:from-green-500/30 hover:to-emerald-500/30 dark:text-green-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            </div>
          )}
        </div>

        {/* Notifications Content Area - Fixed Scrolling */}
        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-green-500/40 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(34, 197, 94, 0.4) transparent',
          }}
        >
          <div className="space-y-3 pb-4">
            {loading && filteredNotifications.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 p-8">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 opacity-40 blur-2xl" />
                  <Loader2 className="relative h-14 w-14 animate-spin text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Loading notifications
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    This will only take a moment...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="rounded-3xl border-2 border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-fuchsia-500/10 p-6 shadow-xl backdrop-blur-xl">
                  <AlertTriangle className="h-12 w-12 text-rose-500" />
                </div>
                <div className="max-w-sm space-y-2">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Unable to load notifications
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {error.message || 'Something went wrong. Please try again.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-2 gap-2 rounded-xl border-rose-500/40 bg-rose-500/10 text-rose-600 backdrop-blur-xl hover:bg-rose-500/20 dark:text-rose-400"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </Button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="rounded-3xl border-2 border-white/70 bg-gradient-to-br from-white/80 to-white/60 p-8 shadow-xl backdrop-blur-xl dark:border-white/40 dark:from-white/20 dark:to-white/10">
                  {searchQuery ? (
                    <Search className="h-14 w-14 text-gray-400 dark:text-gray-500" />
                  ) : activeTab === 'unread' ? (
                    <BellOff className="h-14 w-14 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Inbox className="h-14 w-14 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div className="max-w-sm space-y-2">
                  <p className="text-xl font-black text-gray-900 dark:text-white">
                    {searchQuery
                      ? 'No matches found'
                      : activeTab === 'unread'
                        ? 'All caught up!'
                        : activeTab === 'read'
                          ? 'No read notifications'
                          : 'No notifications yet'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {searchQuery
                      ? `No notifications match "${searchQuery}"`
                      : activeTab === 'unread'
                        ? "You've read all your notifications. Great job!"
                        : activeTab === 'read'
                          ? "You haven't read any notifications yet."
                          : "You'll see new notifications here when they arrive."}
                  </p>
                </div>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 gap-2 rounded-xl bg-white/60 backdrop-blur-xl dark:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Notification Cards */}
                {filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="relative rounded-2xl border border-white/60 bg-white/50 p-3 backdrop-blur-xl transition-all duration-300 hover:bg-white/70 hover:shadow-lg dark:border-white/30 dark:bg-white/10 dark:hover:bg-white/15"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Unread Indicator Glow */}
                    {!notification.is_read && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-400 via-emerald-500 to-lime-500 blur-sm" />
                    )}

                    {/* Notification Content */}
                    <div className="relative">
                      <NotificationItem
                        notification={notification}
                        onMarkRead={markAsRead}
                        onDelete={deleteNotification}
                        onClose={onClose}
                      />
                    </div>

                    {/* Hover Gradient Overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                      disabled={loading}
                      className={cn(
                        'gap-2 rounded-xl px-6 font-semibold',
                        'bg-white/80 dark:bg-white/15',
                        'border-2 border-white/70 dark:border-white/30',
                        'hover:border-green-500/50 dark:hover:border-emerald-500/50',
                        'shadow-lg backdrop-blur-xl transition-all hover:shadow-xl'
                      )}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Load more
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer with View All Link */}
        {filteredNotifications.length > 0 && (
          <div className="shrink-0 border-t border-white/60 bg-white/70 p-4 backdrop-blur-xl dark:border-white/30 dark:bg-white/10">
            <Link href="/notifications" onClick={onClose} className="block">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  'w-full justify-center gap-2 rounded-xl text-sm font-bold',
                  'bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-lime-500/20',
                  'hover:from-green-500/30 hover:via-emerald-500/30 hover:to-lime-500/30',
                  'border-2 border-white/70 dark:border-white/30',
                  'text-gray-800 dark:text-white',
                  'shadow-lg backdrop-blur-xl transition-all hover:shadow-xl'
                )}
              >
                <Inbox className="h-4 w-4" />
                View all notifications
                <Sparkles className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Decorative Corner Accents - Agriculture Theme */}
      <div className="pointer-events-none absolute right-4 top-4 h-3 w-3 animate-pulse rounded-full bg-gradient-to-br from-green-400 to-emerald-500 opacity-40 blur-sm" />
      <div
        className="pointer-events-none absolute bottom-4 left-4 h-3 w-3 animate-pulse rounded-full bg-gradient-to-br from-lime-400 to-green-500 opacity-40 blur-sm"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="pointer-events-none absolute right-6 top-1/2 h-2 w-2 animate-pulse rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 opacity-30 blur-sm"
        style={{ animationDelay: '2s' }}
      />

      {/* CSS for Wiggle Animation */}
      <style jsx>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-15deg);
          }
          75% {
            transform: rotate(15deg);
          }
        }
        @keyframes shimmer {
          0%,
          100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
