// =====================================================
// NOTIFICATION SYSTEM - MAIN EXPORT
// =====================================================

// Types
export type {
  Notification,
  NotificationPreferences,
  NotificationCategory,
  NotificationPriority,
  NotificationEventType,
  NotificationDeliveryChannel,
  CreateNotificationParams,
  NotificationGroup,
  NotificationStats,
  NotificationFilters,
  UseNotificationsReturn,
  UseNotificationPreferencesReturn,
} from '@/lib/types/notifications';

// Service
export { notificationService, NotificationService } from './notification-service';

// Hooks
export {
  useNotifications,
  useNotificationPreferences,
  useNotificationStats,
  useNotification,
} from './hooks';
