'use client';

import { Loader2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { NotificationGroup as NotificationGroupType } from '@/lib/types/notifications';
import { NotificationGroup } from './NotificationGroup';
import { NotificationEmptyState } from './NotificationEmptyState';

interface NotificationsListProps {
  activeTab: 'all' | 'unread' | 'read';
  onTabChange: (tab: 'all' | 'unread' | 'read') => void;
  groupedNotifications: NotificationGroupType[];
  filteredNotifications: unknown[];
  notifications: unknown[];
  unreadCount: number;
  loading: boolean;
  error: { message: string } | null;
  searchQuery: string;
  onMarkRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onClearAll: () => Promise<void>;
  onClearSearch: () => void;
}

function NotificationsList({
  activeTab,
  onTabChange,
  groupedNotifications,
  filteredNotifications,
  notifications,
  unreadCount,
  loading,
  error,
  searchQuery,
  onMarkRead,
  onDelete,
  onMarkAllRead,
  onClearAll,
  onClearSearch,
}: NotificationsListProps) {
  return (
    <Card className="border-slate-700/50 bg-slate-900/60 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
      <CardHeader className="border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-white drop-shadow-sm">
              All Notifications
            </CardTitle>
            <div className="flex items-center gap-3 text-lg text-slate-300">
              {unreadCount > 0 ? (
                <>
                  <div className="relative">
                    <div className="absolute h-3 w-3 animate-ping rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                  </div>
                  <CardDescription className="text-lg text-slate-300">
                    You have <span className="font-semibold text-red-400">{unreadCount}</span>{' '}
                    unread notification{unreadCount > 1 ? 's' : ''}
                  </CardDescription>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 text-emerald-400" />
                  <CardDescription className="text-lg text-slate-300">
                    You&apos;re all caught up! 🎉
                  </CardDescription>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllRead}
                className="cursor-pointer border-emerald-600/50 bg-emerald-900/30 text-emerald-300 ring-1 ring-emerald-500/20 transition-all duration-300 hover:bg-emerald-800/40 hover:text-emerald-200 hover:shadow-lg hover:shadow-emerald-500/20"
                aria-label={`Mark all ${unreadCount} notifications as read`}
              >
                Mark All Read
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="cursor-pointer border-red-600/50 bg-red-900/30 text-red-300 ring-1 ring-red-500/20 transition-all duration-300 hover:bg-red-800/40 hover:text-red-200 hover:shadow-lg hover:shadow-red-500/20"
                aria-label="Clear all notifications"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} className="w-full">
          <div className="border-b border-slate-700/50 bg-slate-800/20 px-6 pt-6">
            <div
              className="mx-auto grid w-full max-w-md grid-cols-3 rounded-lg border border-slate-700/50 bg-slate-800/60 ring-1 ring-white/5 backdrop-blur-sm"
              role="tablist"
              aria-label="Notification filters"
            >
              <button
                onClick={() => onTabChange('all')}
                role="tab"
                aria-selected={activeTab === 'all'}
                aria-controls="notifications-panel"
                id="tab-all"
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                All
                <Badge
                  variant="secondary"
                  className="ml-2 border-slate-600 bg-slate-700 text-slate-300"
                  aria-label={`${notifications.length} total notifications`}
                >
                  {notifications.length}
                </Badge>
              </button>
              <button
                onClick={() => onTabChange('unread')}
                role="tab"
                aria-selected={activeTab === 'unread'}
                aria-controls="notifications-panel"
                id="tab-unread"
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'unread'
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Unread
                <Badge
                  variant="secondary"
                  className="ml-2 border-red-700/50 bg-red-900/50 text-red-300"
                  aria-label={`${unreadCount} unread notifications`}
                >
                  {unreadCount}
                </Badge>
              </button>
              <button
                onClick={() => onTabChange('read')}
                role="tab"
                aria-selected={activeTab === 'read'}
                aria-controls="notifications-panel"
                id="tab-read"
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'read'
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Read
                <Badge
                  variant="secondary"
                  className="ml-2 border-emerald-700/50 bg-emerald-900/50 text-emerald-300"
                  aria-label={`${notifications.length - unreadCount} read notifications`}
                >
                  {notifications.length - unreadCount}
                </Badge>
              </button>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <div
              id="notifications-panel"
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {loading && notifications.length === 0 ? (
                <div className="flex h-96 items-center justify-center">
                  <div className="space-y-6 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-2xl" />
                      <Loader2 className="relative h-16 w-16 animate-spin text-blue-400 drop-shadow-lg" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-lg font-semibold text-white">Loading notifications...</p>
                      <p className="text-slate-400">Please wait while we fetch your updates</p>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex h-96 flex-col items-center justify-center gap-6 p-8 text-center">
                  <div className="rounded-2xl bg-red-900/30 p-6 ring-1 ring-red-500/20">
                    <Bell className="h-12 w-12 text-red-400" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-lg font-semibold text-red-400">
                      Failed to load notifications
                    </p>
                    <p className="max-w-md text-red-300">{error.message}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="cursor-pointer border-red-600/50 bg-red-900/30 text-red-300 ring-1 ring-red-500/20 hover:bg-red-800/40 hover:text-red-200"
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <NotificationEmptyState
                  searchQuery={searchQuery}
                  activeTab={activeTab}
                  onClearSearch={onClearSearch}
                />
              ) : (
                <div
                  className="divide-y divide-slate-700/30"
                  role="list"
                  aria-label={`${activeTab} notifications`}
                >
                  {groupedNotifications.map((group) => (
                    <NotificationGroup
                      key={group.label}
                      group={group}
                      onMarkRead={onMarkRead}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
