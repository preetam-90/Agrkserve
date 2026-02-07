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
  filteredNotifications: any[];
  notifications: any[];
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

export function NotificationsList({
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
    <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-2xl ring-1 ring-white/5">
      <CardHeader className="border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-white drop-shadow-sm">All Notifications</CardTitle>
            <div className="flex items-center gap-3 text-lg text-slate-300">
              {unreadCount > 0 ? (
                <>
                  <div className="relative">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-ping absolute" />
                    <div className="h-3 w-3 bg-red-500 rounded-full" />
                  </div>
                  <CardDescription className="text-lg text-slate-300">You have <span className="text-red-400 font-semibold">{unreadCount}</span> unread notification{unreadCount > 1 ? 's' : ''}</CardDescription>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 text-emerald-400" />
                  <CardDescription className="text-lg text-slate-300">You're all caught up! 🎉</CardDescription>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllRead}
                className="bg-emerald-900/30 hover:bg-emerald-800/40 border-emerald-600/50 text-emerald-300 hover:text-emerald-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 ring-1 ring-emerald-500/20"
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
                className="bg-red-900/30 hover:bg-red-800/40 border-red-600/50 text-red-300 hover:text-red-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 ring-1 ring-red-500/20"
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
          <div className="border-b border-slate-700/50 px-6 pt-6 bg-slate-800/20">
            <div 
              className="mx-auto grid w-full max-w-md grid-cols-3 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 ring-1 ring-white/5 rounded-lg"
              role="tablist"
              aria-label="Notification filters"
            >
              <button
                onClick={() => onTabChange('all')}
                role="tab"
                aria-selected={activeTab === 'all'}
                aria-controls="notifications-panel"
                id="tab-all"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                All
                <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300 border-slate-600" aria-label={`${notifications.length} total notifications`}>
                  {notifications.length}
                </Badge>
              </button>
              <button
                onClick={() => onTabChange('unread')}
                role="tab"
                aria-selected={activeTab === 'unread'}
                aria-controls="notifications-panel"
                id="tab-unread"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'unread'
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Unread
                <Badge variant="secondary" className="ml-2 bg-red-900/50 text-red-300 border-red-700/50" aria-label={`${unreadCount} unread notifications`}>
                  {unreadCount}
                </Badge>
              </button>
              <button
                onClick={() => onTabChange('read')}
                role="tab"
                aria-selected={activeTab === 'read'}
                aria-controls="notifications-panel"
                id="tab-read"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'read'
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Read
                <Badge variant="secondary" className="ml-2 bg-emerald-900/50 text-emerald-300 border-emerald-700/50" aria-label={`${notifications.length - unreadCount} read notifications`}>
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
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                      <Loader2 className="relative h-16 w-16 animate-spin text-blue-400 drop-shadow-lg" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-white font-semibold text-lg">Loading notifications...</p>
                      <p className="text-slate-400">Please wait while we fetch your updates</p>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex h-96 flex-col items-center justify-center gap-6 text-center p-8">
                  <div className="p-6 bg-red-900/30 rounded-2xl ring-1 ring-red-500/20">
                    <Bell className="h-12 w-12 text-red-400" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-red-400 font-semibold text-lg">Failed to load notifications</p>
                    <p className="text-red-300 max-w-md">{error.message}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="bg-red-900/30 hover:bg-red-800/40 border-red-600/50 text-red-300 hover:text-red-200 cursor-pointer ring-1 ring-red-500/20"
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
                <div className="divide-y divide-slate-700/30" role="list" aria-label={`${activeTab} notifications`}>
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
