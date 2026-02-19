import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/lib/types';

const supabase = createClient();

export const notificationService = {
  // Get user notifications
  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Notification[]; count: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
    };
  },

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  // Delete notification
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id);

    if (error) throw error;
  },

  // Delete all read notifications
  async deleteAllRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true);

    if (error) throw error;
  },

  // Create notification (usually called from server/trigger)
  async create(notification: {
    user_id: string;
    title: string;
    body: string;
    type: 'booking' | 'payment' | 'message' | 'review' | 'system' | 'admin';
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to new notifications
  subscribeToNotifications(userId: string, onNotification: (notification: Notification) => void) {
    return supabase
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
          onNotification(payload.new as Notification);
        }
      )
      .subscribe();
  },

  // Unsubscribe from notifications
  unsubscribeFromNotifications(userId: string) {
    return supabase.channel(`notifications:${userId}`).unsubscribe();
  },
};
