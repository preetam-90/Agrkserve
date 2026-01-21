'use client';

import { useState, useMemo } from 'react';
import { useNotifications, useNotificationStats } from '@/lib/services/notifications';
import { useUser } from '@/lib/supabase/auth-context';
import { NotificationItem } from '@/components/notifications/notification-item';
import { NotificationFilters } from '@/components/notifications/notification-filters';
import type { NotificationFilters as FilterType, NotificationGroup } from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  Loader2,
  ArrowLeft,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useUser();
  const [filters, setFilters] = useState<FilterType>({});
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');

  console.log('[NotificationsPage] authLoading:', authLoading, 'user:', user?.id || 'No user');

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

  const { stats } = useNotificationStats();

  // Filter based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.is_read);
    } else if (activeTab === 'read') {
      return notifications.filter((n) => n.is_read);
    }
    return notifications;
  }, [notifications, activeTab]);

  // Group notifications by date
  const groupedNotifications = useMemo<NotificationGroup[]>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: NotificationGroup[] = [
      { label: 'Today', notifications: [] },
      { label: 'Yesterday', notifications: [] },
      { label: 'This Week', notifications: [] },
      { label: 'Older', notifications: [] },
    ];

    filteredNotifications.forEach((notification) => {
      const createdAt = new Date(notification.created_at);
      const notificationDate = new Date(
        createdAt.getFullYear(),
        createdAt.getMonth(),
        createdAt.getDate()
      );

      if (notificationDate >= today) {
        groups[0].notifications.push(notification);
      } else if (notificationDate >= yesterday) {
        groups[1].notifications.push(notification);
      } else if (notificationDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groups[2].notifications.push(notification);
      } else {
        groups[3].notifications.push(notification);
      }
    });

    return groups.filter((g) => g.notifications.length > 0);
  }, [filteredNotifications]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in to view notifications</h3>
            <p className="text-gray-500 text-center mb-4">
              You need to be logged in to see your notifications.
            </p>
            <Link href="/login">
              <Button>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notifications</h3>
            <p className="text-gray-500 text-center">{error.message || 'Something went wrong'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-6 w-6 text-green-600" />
              Notifications
            </h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              className="hidden sm:flex"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          <Link href="/notifications/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
              <div className="text-sm text-gray-500">Unread</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.read}</div>
              <div className="text-sm text-gray-500">Read</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.highPriority}</div>
              <div className="text-sm text-gray-500">High Priority</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs & Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>

            <NotificationFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500 text-center">
                {activeTab === 'unread'
                  ? "You're all caught up!"
                  : activeTab === 'read'
                  ? 'No read notifications yet'
                  : 'No notifications to show'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groupedNotifications.map((group) => (
                <div key={group.label}>
                  <div className="px-4 py-2 bg-gray-50 sticky top-0">
                    <h3 className="text-sm font-medium text-gray-500">{group.label}</h3>
                  </div>
                  {group.notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              ))}

              {hasMore && (
                <div className="p-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear All Button */}
      {filteredNotifications.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => clearAll()}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all notifications
          </Button>
        </div>
      )}
    </div>
  );
}
