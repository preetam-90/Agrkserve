import { createClient } from '@/lib/supabase/client';
import type {
  Notification,
  NotificationPreferences,
  CreateNotificationParams,
  NotificationEventType,
  NotificationFilters,
  NotificationStats,
  NotificationCategory,
  NotificationPriority,
} from '@/lib/types/notifications';

// =====================================================
// NOTIFICATION SERVICE
// =====================================================
export class NotificationService {
  private static instance: NotificationService;
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================
  async getNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      filters?: NotificationFilters;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { limit = 20, offset = 0, filters = {} } = options;

    let query = this.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }

    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    // Exclude expired notifications
    query = query.or('expires_at.is.null,expires_at.gt.now()');

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return {
      notifications: data || [],
      total: count || 0,
    };
  }

  // =====================================================
  // GET UNREAD COUNT
  // =====================================================
  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('get_unread_notification_count');

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return data || 0;
  }

  // =====================================================
  // GET NOTIFICATION STATS
  // =====================================================
  async getStats(userId: string): Promise<NotificationStats> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('category, priority, is_read')
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }

    const typedData = data as
      | { category: NotificationCategory; priority: NotificationPriority; is_read: boolean }[]
      | null;

    const stats: NotificationStats = {
      total: typedData?.length || 0,
      unread: typedData?.filter((n) => !n.is_read).length || 0,
      read: typedData?.filter((n) => n.is_read).length || 0,
      highPriority:
        typedData?.filter((n) => n.priority === 'high' || n.priority === 'critical').length || 0,
      by_category: {
        booking: 0,
        payment: 0,
        message: 0,
        trust: 0,
        security: 0,
        insight: 0,
        system: 0,
        promotion: 0,
        reward: 0,
        achievement: 0,
        alert: 0,
        update: 0,
        profile: 0,
        equipment: 0,
        invoice: 0,
        event: 0,
        social: 0,
        trending: 0,
        launch: 0,
        goal: 0,
        tip: 0,
        global: 0,
        privacy: 0,
        access: 0,
        labor: 0,
        harvest: 0,
        maintenance: 0,
        delivery: 0,
        field: 0,
        storage: 0,
        weather: 0,
        review: 0,
      },
      by_priority: {
        low: 0,
        normal: 0,
        high: 0,
        critical: 0,
      },
    };

    typedData?.forEach((notification) => {
      if (stats.by_category && stats.by_priority) {
        stats.by_category[notification.category]++;
        stats.by_priority[notification.priority]++;
      }
    });

    return stats;
  }

  // =====================================================
  // CREATE NOTIFICATION
  // =====================================================
  async createNotification(
    params: CreateNotificationParams & { context?: Record<string, any> }
  ): Promise<Notification | null> {
    const { context = {}, ...baseParams } = params;

    // Build message if not provided
    const title = baseParams.title;
    const message = baseParams.message;

    // Note: Context-based message building removed as config file was deleted
    // If title/message are not provided, they will use defaults from the database

    // Call the database function that respects user preferences
    const { data, error } = await this.supabase.rpc('create_notification', {
      p_user_id: baseParams.user_id,
      p_title: title,
      p_message: message,
      p_category: baseParams.category,
      p_event_type: baseParams.event_type,
      p_priority: baseParams.priority || 'normal',
      p_action_url: baseParams.action_url || null,
      p_action_label: baseParams.action_label || null,
      p_related_booking_id: baseParams.related_booking_id || null,
      p_related_equipment_id: baseParams.related_equipment_id || null,
      p_related_user_id: baseParams.related_user_id || null,
      p_metadata: baseParams.metadata || {},
    });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    if (!data) {
      // Notification was not created due to user preferences
      return null;
    }

    // Fetch the created notification
    const { data: notification, error: fetchError } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      console.error('Error fetching created notification:', fetchError);
      throw fetchError;
    }

    return notification;
  }

  // =====================================================
  // BULK CREATE NOTIFICATIONS
  // =====================================================
  async createBulkNotifications(
    userIds: string[],
    params: Omit<CreateNotificationParams, 'user_id'> & { context?: Record<string, any> }
  ): Promise<void> {
    const promises = userIds.map((userId) =>
      this.createNotification({ ...params, user_id: userId })
    );

    await Promise.allSettled(promises);
  }

  // =====================================================
  // MARK AS READ
  // =====================================================
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
    });

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // =====================================================
  // MARK ALL AS READ
  // =====================================================
  async markAllAsRead(userId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('mark_all_notifications_read');

    if (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }

    return data || 0;
  }

  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await this.supabase.from('notifications').delete().eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // =====================================================
  // CLEAR ALL NOTIFICATIONS
  // =====================================================
  async clearAll(userId: string): Promise<void> {
    const { error } = await this.supabase.from('notifications').delete().eq('user_id', userId);

    if (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }

  // =====================================================
  // GET PREFERENCES
  // =====================================================
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, create default
        return this.createDefaultPreferences(userId);
      }
      console.error('Error fetching preferences:', error);
      throw error;
    }

    return data;
  }

  // =====================================================
  // CREATE DEFAULT PREFERENCES
  // =====================================================
  async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error creating preferences:', error);
      throw error;
    }

    return data;
  }

  // =====================================================
  // UPDATE PREFERENCES
  // =====================================================
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }

    return data;
  }

  // =====================================================
  // SUBSCRIBE TO NOTIFICATIONS (Real-time)
  // =====================================================
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  // =====================================================
  // SUBSCRIBE TO PREFERENCE CHANGES (Real-time)
  // =====================================================
  subscribeToPreferences(userId: string, callback: (preferences: NotificationPreferences) => void) {
    const channel = this.supabase
      .channel(`preferences:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notification_preferences',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as NotificationPreferences);
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  // =====================================================
  // CLEANUP OLD NOTIFICATIONS
  // =====================================================
  async cleanup(daysToKeep: number = 90): Promise<number> {
    const { data, error } = await this.supabase.rpc('cleanup_old_notifications', {
      days_to_keep: daysToKeep,
    });

    if (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }

    return data || 0;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
