'use client';

import { useState } from 'react';
import { useNotifications, useNotificationStats } from '@/lib/services/notifications';
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
  Filter,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function NotificationsPage() {
  const [filters, setFilters] = useState<FilterType>({});
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');

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

  // Group notifications
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

    filteredNotifications.forEach((notification) => {
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
  }, [filteredNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        'Are you sure you want to clear all notifications? This cannot be undone.'
      )
    ) {
      try {
        await clearAll();
      } catch (err) {
        console.error('Failed to clear notifications:', err);
      }
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Stay updated with all your activities and messages
            </p>
          </div>

          <Link href="/dashboard/notifications/preferences">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Notifications</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Unread</CardDescription>
                <CardTitle className="text-3xl text-blue-600">
                  {stats.unread}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Read Rate</CardDescription>
                <CardTitle className="text-3xl">
                  {stats.total > 0
                    ? Math.round(((stats.total - stats.unread) / stats.total) * 100)
                    : 0}
                  %
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : "You're all caught up!"}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}

                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read ({notifications.length - unreadCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {/* Filters */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <NotificationFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                </div>

                <Separator />

                {/* Notifications List */}
                {loading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-2 text-center">
                    <p className="text-sm text-destructive">
                      Failed to load notifications
                    </p>
                    <p className="text-xs text-muted-foreground">{error.message}</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-2">
                    <Bell className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No notifications
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeTab === 'unread'
                        ? "You've read all your notifications! 🎉"
                        : activeTab === 'read'
                        ? 'No read notifications yet'
                        : "You're all caught up! 🎉"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedNotifications.map((group, groupIndex) => (
                      <div key={group.label} className="space-y-2">
                        {/* Group Label */}
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {group.label}
                        </h3>

                        {/* Notifications */}
                        <div className="space-y-2">
                          {group.notifications.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkRead={markAsRead}
                              onDelete={deleteNotification}
                            />
                          ))}
                        </div>

                        {groupIndex < groupedNotifications.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}

                    {/* Load More */}
                    {hasMore && (
                      <div className="flex justify-center pt-4">
                        <Button
                          variant="outline"
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
