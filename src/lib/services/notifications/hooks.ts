'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from './notification-service';
import type {
  Notification,
  NotificationPreferences,
  NotificationFilters,
  NotificationStats,
  UseNotificationsReturn,
  UseNotificationPreferencesReturn,
} from '@/lib/types/notifications';
import { useUser } from '@/lib/supabase/auth-context';

// =====================================================
// USE NOTIFICATIONS HOOK
// =====================================================
export function useNotifications(filters?: NotificationFilters): UseNotificationsReturn {
  const { user, loading: authLoading } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const limit = 20;

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (reset = false) => {
      if (!user) {
        setLoading(false);
        setNotifications([]);
        setHasMore(false);
        return;
      }

      try {
        setLoading(true);
        const currentOffset = reset ? 0 : offset;

        const { notifications: newNotifications, total } =
          await notificationService.getNotifications(user.id, {
            limit,
            offset: currentOffset,
            filters,
          });

        if (reset) {
          setNotifications(newNotifications);
          setOffset(limit);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
          setOffset((prev) => prev + limit);
        }

        setHasMore(currentOffset + newNotifications.length < total);
        setError(null);
      } catch (err) {
        // Don't show error if table doesn't exist yet
        const errorMsg = (err as Error)?.message || '';
        if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
          setNotifications([]);
          setHasMore(false);
          setError(null);
        } else {
          setError(err as Error);
        }
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [user, offset, filters]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      // Silently fail if table doesn't exist
      console.error('Error fetching unread count:', err);
      setUnreadCount(0);
    }
  }, [user]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
      throw err;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);

      // Update local state
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id);
        if (notification && !notification.is_read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!user) return;

    try {
      await notificationService.clearAll(user.id);

      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      throw err;
    }
  }, [user]);

  // Load more
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchNotifications(false);
  }, [hasMore, loading, fetchNotifications]);

  // Initial load - wait for auth to be ready
  useEffect(() => {
    // Don't fetch until auth is resolved
    if (authLoading) return;

    if (user) {
      fetchNotifications(true);
      fetchUnreadCount();
    } else {
      // No user logged in - stop loading
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
    }
     
  }, [user, authLoading, filters]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotification) => {
      // Add to beginning of list
      setNotifications((prev) => [newNotification, ...prev]);

      // Update unread count if not read
      if (!newNotification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return {
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
  };
}

// =====================================================
// USE NOTIFICATION PREFERENCES HOOK
// =====================================================
export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const { user, loading: authLoading } = useUser();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const prefs = await notificationService.getPreferences(user.id);
      setPreferences(prefs);
      setError(null);
    } catch (err) {
      // Silently handle missing table
      const errorMsg = (err as Error)?.message || '';
      if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
        setPreferences(null);
        setError(null);
      } else {
        setError(err as Error);
      }
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      if (!user) return;

      try {
        const updated = await notificationService.updatePreferences(user.id, updates);
        setPreferences(updated);
      } catch (err) {
        console.error('Error updating preferences:', err);
        throw err;
      }
    },
    [user]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    if (!user) return;

    try {
      const defaults = await notificationService.createDefaultPreferences(user.id);
      setPreferences(defaults);
    } catch (err) {
      console.error('Error resetting preferences:', err);
      throw err;
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      fetchPreferences();
    } else {
      setLoading(false);
      setPreferences(null);
    }
  }, [user, authLoading, fetchPreferences]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToPreferences(user.id, (newPreferences) => {
      setPreferences(newPreferences);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetToDefaults,
  };
}

// =====================================================
// USE NOTIFICATION STATS HOOK
// =====================================================
export function useNotificationStats() {
  const { user, loading: authLoading } = useUser();
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedStats = await notificationService.getStats(user.id);
      setStats(fetchedStats);
      setError(null);
    } catch (err) {
      // Silently handle missing table
      const errorMsg = (err as Error)?.message || '';
      if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
        setStats({ total: 0, unread: 0, read: 0, highPriority: 0 });
        setError(null);
      } else {
        setError(err as Error);
      }
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      fetchStats();
    } else {
      setLoading(false);
      setStats(null);
    }
  }, [user, authLoading, fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// =====================================================
// USE SINGLE NOTIFICATION HOOK
// =====================================================
export function useNotification(id: string | null) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setNotification(null);
      setLoading(false);
      return;
    }

    const fetchNotification = async () => {
      try {
        setLoading(true);
        // This would need to be implemented in the service
        // For now, we'll use the client directly
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        setNotification(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching notification:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id]);

  return { notification, loading, error };
}
