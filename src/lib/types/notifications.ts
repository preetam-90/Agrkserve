// =====================================================
// NOTIFICATION SYSTEM TYPES
// =====================================================

export type NotificationCategory = 
  | 'booking'
  | 'payment'
  | 'message'
  | 'trust'
  | 'security'
  | 'insight'
  | 'system';

export type NotificationPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'critical';

export type NotificationDeliveryChannel = 
  | 'in_app'
  | 'email'
  | 'sms'
  | 'push';

export type NotificationEventType =
  // Booking & Rental
  | 'booking.new'
  | 'booking.accepted'
  | 'booking.rejected'
  | 'booking.cancelled'
  | 'booking.start_reminder'
  | 'booking.end_reminder'
  | 'booking.overdue'
  | 'booking.returned'
  | 'booking.date_change_request'
  
  // Payment
  | 'payment.due'
  | 'payment.received'
  | 'payment.failed'
  | 'payment.refund'
  
  // Messages & Requests
  | 'message.new'
  | 'message.inquiry'
  | 'message.reply'
  
  // Trust & Reputation
  | 'review.new'
  | 'review.reply'
  | 'rating.received'
  | 'report.raised'
  
  // Security
  | 'security.new_login'
  | 'security.new_device'
  | 'security.password_changed'
  | 'security.suspicious_activity'
  
  // Business Insights (Owner-Focused)
  | 'insight.views_milestone'
  | 'insight.demand_high'
  | 'insight.performance_tip'
  | 'insight.listing_conversion'
  
  // System
  | 'system.welcome'
  | 'system.maintenance'
  | 'system.feature_announcement';

export interface Notification {
  id: string;
  user_id: string;
  
  // Content
  title: string;
  message: string;
  category: NotificationCategory;
  event_type: NotificationEventType;
  priority: NotificationPriority;
  
  // Status
  is_read: boolean;
  read_at: string | null;
  
  // Deep Linking
  action_url: string | null;
  action_label: string | null;
  
  // Related Entities
  related_booking_id: string | null;
  related_equipment_id: string | null;
  related_user_id: string | null;
  
  // Metadata
  metadata: Record<string, any>;
  
  // Timestamps
  created_at: string;
  expires_at: string | null;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  
  // Category Toggles
  booking_enabled: boolean;
  payment_enabled: boolean;
  message_enabled: boolean;
  trust_enabled: boolean;
  security_enabled: boolean;
  insight_enabled: boolean;
  system_enabled: boolean;
  
  // Delivery Channels
  in_app_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  
  // Quiet Hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  quiet_hours_timezone: string;
  allow_critical_during_quiet: boolean;
  
  // Frequency
  digest_mode: boolean;
  digest_frequency: 'immediate' | 'hourly' | 'daily';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface NotificationDeliveryLog {
  id: string;
  notification_id: string;
  channel: NotificationDeliveryChannel;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
  error_message: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface CreateNotificationParams {
  user_id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  event_type: NotificationEventType;
  priority?: NotificationPriority;
  action_url?: string;
  action_label?: string;
  related_booking_id?: string;
  related_equipment_id?: string;
  related_user_id?: string;
  metadata?: Record<string, any>;
}

export interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  highPriority: number;
  by_category?: Record<NotificationCategory, number>;
  by_priority?: Record<NotificationPriority, number>;
}

// Notification Templates
export interface NotificationTemplate {
  category: NotificationCategory;
  event_type: NotificationEventType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_label?: string;
  icon?: string;
  color?: string;
}

// Notification Filter Options
export interface NotificationFilters {
  category?: NotificationCategory[];
  priority?: NotificationPriority[];
  is_read?: boolean;
  start_date?: string;
  end_date?: string;
}

// Hook Return Types
export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: Error | null;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}
