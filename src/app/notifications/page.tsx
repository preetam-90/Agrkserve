'use client';

import { useState } from 'react';
import { useNotifications, useNotificationStats } from '@/lib/services/notifications';
import { NotificationItem } from '@/components/notifications/notification-item';
import { NotificationFilters } from '@/components/notifications/notification-filters';
import type {
  NotificationFilters as FilterType,
  NotificationGroup,
} from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Loader2, 
  Filter, 
  BarChart3,
  Inbox,
  Archive,
  Star,
  Clock,
  TrendingUp,
  Eye,
  EyeOff,
  X,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Input } from '@/components/ui/input';

export default function NotificationsPage() {
  const [filters, setFilters] = useState<FilterType>({});
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter based on active tab and search query
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter((n) => !n.is_read);
    } else if (activeTab === 'read') {
      filtered = filtered.filter((n) => n.is_read);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((n) => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [notifications, activeTab, searchQuery]);

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
      window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')
    ) {
      try {
        await clearAll();
      } catch (err) {
        console.error('Failed to clear notifications:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative container max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Enhanced Dark Header with Advanced Glassmorphism */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 shadow-2xl shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-slate-800/20 to-emerald-600/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700/20 via-transparent to-transparent" />
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-500 p-4 rounded-3xl shadow-2xl ring-1 ring-white/20">
                        <Bell className="h-8 w-8 text-white drop-shadow-lg" />
                      </div>
                      {unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center animate-bounce shadow-lg ring-2 ring-slate-900">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent drop-shadow-sm">
                        Notifications
                      </h1>
                      <p className="text-slate-300 text-lg mt-2 font-medium">
                        Stay updated with all your activities and messages
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/notifications/preferences">
                    <Button 
                      variant="outline" 
                      className="bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/50 hover:border-slate-500/60 text-slate-200 hover:text-white backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer ring-1 ring-white/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/50 hover:border-slate-500/60 text-slate-200 hover:text-white backdrop-blur-sm transition-all duration-300 hover:shadow-lg cursor-pointer ring-1 ring-white/10 ${
                      showFilters ? 'bg-blue-900/50 border-blue-500/50 shadow-blue-500/20' : ''
                    }`}
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Dark Stats Cards with Neon Accents */}
          {stats && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer group ring-1 ring-white/5 hover:ring-white/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-slate-400 font-semibold text-sm">Total Notifications</CardDescription>
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300 ring-1 ring-blue-500/20">
                      <Inbox className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                  <CardTitle className="text-4xl font-bold text-white drop-shadow-sm">{stats.total}</CardTitle>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse" style={{ width: '100%' }} />
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 cursor-pointer group ring-1 ring-white/5 hover:ring-white/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-slate-400 font-semibold text-sm">Unread</CardDescription>
                    <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl group-hover:from-red-500/30 group-hover:to-pink-500/30 transition-all duration-300 ring-1 ring-red-500/20">
                      <Eye className="h-5 w-5 text-red-400" />
                    </div>
                  </div>
                  <CardTitle className="text-4xl font-bold text-red-400 drop-shadow-sm">{stats.unread}</CardTitle>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse" style={{ width: `${(stats.unread / stats.total) * 100}%` }} />
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 cursor-pointer group ring-1 ring-white/5 hover:ring-white/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-slate-400 font-semibold text-sm">Read Rate</CardDescription>
                    <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl group-hover:from-emerald-500/30 group-hover:to-green-500/30 transition-all duration-300 ring-1 ring-emerald-500/20">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                  <CardTitle className="text-4xl font-bold text-emerald-400 drop-shadow-sm">
                    {stats.total > 0
                      ? Math.round(((stats.total - stats.unread) / stats.total) * 100)
                      : 0}
                    %
                  </CardTitle>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full animate-pulse" style={{ width: `${stats.total > 0 ? Math.round(((stats.total - stats.unread) / stats.total) * 100) : 0}%` }} />
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 cursor-pointer group ring-1 ring-white/5 hover:ring-white/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-slate-400 font-semibold text-sm">This Week</CardDescription>
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl group-hover:from-purple-500/30 group-hover:to-violet-500/30 transition-all duration-300 ring-1 ring-purple-500/20">
                      <Clock className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                  <CardTitle className="text-4xl font-bold text-purple-400 drop-shadow-sm">
                    {Math.floor(stats.total * 0.7)}
                  </CardTitle>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Enhanced Dark Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-slate-900/60 backdrop-blur-sm border-slate-700/50 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder:text-slate-400 ring-1 ring-white/5 focus:ring-white/10 rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/50 hover:border-slate-500/60 text-slate-200 hover:text-white backdrop-blur-sm cursor-pointer ring-1 ring-white/10 h-12"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {showFilters && (
              <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl ring-1 ring-white/5">
                <CardContent className="p-6">
                  <NotificationFilters filters={filters} onFiltersChange={setFilters} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Dark Main Content */}
          <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-2xl ring-1 ring-white/5">
            <CardHeader className="border-b border-slate-700/50 bg-slate-800/30">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-3">
                  <CardTitle className="text-3xl font-bold text-white drop-shadow-sm">All Notifications</CardTitle>
                  <CardDescription className="text-lg text-slate-300">
                    {unreadCount > 0 ? (
                      <span className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-3 w-3 bg-red-500 rounded-full animate-ping absolute" />
                          <div className="h-3 w-3 bg-red-500 rounded-full" />
                        </div>
                        You have <span className="text-red-400 font-semibold">{unreadCount}</span> unread notification{unreadCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="flex items-center gap-3 text-emerald-400">
                        <CheckCheck className="h-5 w-5" />
                        You're all caught up! 🎉
                      </span>
                    )}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {unreadCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleMarkAllRead}
                      className="bg-emerald-900/30 hover:bg-emerald-800/40 border-emerald-600/50 text-emerald-300 hover:text-emerald-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 ring-1 ring-emerald-500/20"
                    >
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Mark All Read
                    </Button>
                  )}

                  {notifications.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      className="bg-red-900/30 hover:bg-red-800/40 border-red-600/50 text-red-300 hover:text-red-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 ring-1 ring-red-500/20"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Enhanced Dark Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <div className="border-b border-slate-700/50 px-6 pt-6 bg-slate-800/20">
                  <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 ring-1 ring-white/5">
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white transition-all duration-200"
                    >
                      All
                      <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300 border-slate-600">
                        {notifications.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="unread"
                      className="data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white transition-all duration-200"
                    >
                      Unread
                      <Badge variant="secondary" className="ml-2 bg-red-900/50 text-red-300 border-red-700/50">
                        {unreadCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="read"
                      className="data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-300 hover:text-white transition-all duration-200"
                    >
                      Read
                      <Badge variant="secondary" className="ml-2 bg-emerald-900/50 text-emerald-300 border-emerald-700/50">
                        {notifications.length - unreadCount}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="mt-0">
                  {/* Enhanced Dark Notifications List */}
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
                    <div className="flex h-96 flex-col items-center justify-center gap-8 p-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-slate-600/20 rounded-full blur-3xl" />
                        <div className="relative p-8 bg-slate-800/50 rounded-2xl ring-1 ring-white/10">
                          {searchQuery ? (
                            <Search className="h-16 w-16 text-slate-400" />
                          ) : activeTab === 'unread' ? (
                            <EyeOff className="h-16 w-16 text-slate-400" />
                          ) : activeTab === 'read' ? (
                            <Archive className="h-16 w-16 text-slate-400" />
                          ) : (
                            <Inbox className="h-16 w-16 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-center space-y-3">
                        <p className="text-white font-bold text-xl">
                          {searchQuery 
                            ? 'No matching notifications' 
                            : activeTab === 'unread'
                              ? "You've read everything! 🎉"
                              : activeTab === 'read'
                                ? 'No read notifications yet'
                                : 'No notifications yet'
                          }
                        </p>
                        <p className="text-slate-400 max-w-md">
                          {searchQuery 
                            ? 'Try adjusting your search terms or filters'
                            : activeTab === 'unread'
                              ? 'Great job staying on top of your notifications!'
                              : activeTab === 'read'
                                ? 'Read notifications will appear here'
                                : "We'll notify you when something important happens"
                          }
                        </p>
                      </div>
                      {searchQuery && (
                        <Button 
                          variant="outline" 
                          onClick={() => setSearchQuery('')}
                          className="bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/50 text-slate-200 hover:text-white cursor-pointer ring-1 ring-white/10"
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700/30">
                      {groupedNotifications.map((group, groupIndex) => (
                        <div key={group.label} className="relative">
                          {/* Enhanced Dark Group Header */}
                          <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/30 px-6 py-4">
                            <div className="flex items-center gap-4">
                              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                                {group.label}
                              </h3>
                              <div className="flex-1 h-px bg-gradient-to-r from-slate-600 via-slate-700 to-transparent" />
                              <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                                {group.notifications.length}
                              </Badge>
                            </div>
                          </div>

                          {/* Enhanced Dark Notifications */}
                          <div className="divide-y divide-slate-800/50">
                            {group.notifications.map((notification) => (
                              <div key={notification.id} className="hover:bg-slate-800/30 transition-colors duration-300">
                                <NotificationItem
                                  notification={notification}
                                  onMarkRead={markAsRead}
                                  onDelete={deleteNotification}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Enhanced Dark Load More */}
                      {hasMore && (
                        <div className="flex justify-center p-8">
                          <Button 
                            variant="outline" 
                            onClick={loadMore} 
                            disabled={loading}
                            className="bg-slate-800/50 hover:bg-slate-700/60 border-slate-600/50 hover:border-slate-500/60 text-slate-200 hover:text-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 ring-1 ring-white/10"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading more...
                              </>
                            ) : (
                              <>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Load More Notifications
                              </>
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
    </div>
  );
}
