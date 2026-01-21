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

// Helpers
export {
  notifyNewBookingRequest,
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyBookingCancelled,
  notifyBookingStartReminder,
  notifyBookingEndReminder,
  notifyBookingOverdue,
  notifyPaymentDue,
  notifyPaymentReceived,
  notifyNewMessage,
  notifyEquipmentInquiry,
  notifyNewReview,
  notifyNewLogin,
  notifyViewsMilestone,
  notifyHighDemand,
  notifyWelcome,
} from './helpers';

// Config
export {
  NOTIFICATION_ICONS,
  EVENT_ICONS,
  NOTIFICATION_COLORS,
  CATEGORY_COLORS,
  NOTIFICATION_TEMPLATES,
  PREFERENCE_LABELS,
  buildNotificationMessage,
} from './config';
