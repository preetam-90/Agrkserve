import { 
  NotificationCategory, 
  NotificationEventType, 
  NotificationPriority,
  NotificationTemplate,
  NotificationPreferences
} from '@/lib/types/notifications';
import {
  Bell,
  Calendar,
  CreditCard,
  MessageSquare,
  Star,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  Info,
  type LucideIcon
} from 'lucide-react';

// =====================================================
// NOTIFICATION ICONS MAPPING
// =====================================================
export const NOTIFICATION_ICONS: Record<NotificationCategory, LucideIcon> = {
  booking: Calendar,
  payment: CreditCard,
  message: MessageSquare,
  trust: Star,
  security: Shield,
  insight: TrendingUp,
  system: Bell,
};

export const EVENT_ICONS: Record<string, LucideIcon> = {
  // Booking
  'booking.new': Calendar,
  'booking.accepted': CheckCircle,
  'booking.rejected': XCircle,
  'booking.cancelled': XCircle,
  'booking.start_reminder': Clock,
  'booking.end_reminder': Clock,
  'booking.overdue': AlertTriangle,
  'booking.returned': CheckCircle,
  
  // Payment
  'payment.due': CreditCard,
  'payment.received': CheckCircle,
  'payment.failed': AlertTriangle,
  
  // Messages
  'message.new': MessageSquare,
  'message.inquiry': MessageSquare,
  'message.reply': MessageSquare,
  
  // Trust
  'review.new': Star,
  'review.reply': Star,
  'rating.received': Star,
  
  // Security
  'security.new_login': Shield,
  'security.new_device': Shield,
  'security.password_changed': CheckCircle,
  
  // Insights
  'insight.views_milestone': TrendingUp,
  'insight.demand_high': TrendingUp,
  
  // System
  'system.welcome': Bell,
  'system.maintenance': Info,
};

// =====================================================
// NOTIFICATION COLOR SCHEMES
// =====================================================
export const NOTIFICATION_COLORS: Record<NotificationPriority, { bg: string; text: string; border: string }> = {
  low: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  normal: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  high: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

export const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  booking: 'text-blue-600',
  payment: 'text-green-600',
  message: 'text-purple-600',
  trust: 'text-yellow-600',
  security: 'text-red-600',
  insight: 'text-indigo-600',
  system: 'text-gray-600',
};

// =====================================================
// NOTIFICATION TEMPLATES
// =====================================================
export const NOTIFICATION_TEMPLATES: Record<NotificationEventType, Omit<NotificationTemplate, 'title' | 'message'>> = {
  // Booking Events
  'booking.new': {
    category: 'booking',
    event_type: 'booking.new',
    priority: 'high',
    action_label: 'View Booking',
    icon: 'Calendar',
    color: 'blue',
  },
  'booking.accepted': {
    category: 'booking',
    event_type: 'booking.accepted',
    priority: 'high',
    action_label: 'View Details',
    icon: 'CheckCircle',
    color: 'green',
  },
  'booking.rejected': {
    category: 'booking',
    event_type: 'booking.rejected',
    priority: 'normal',
    action_label: 'View Details',
    icon: 'XCircle',
    color: 'red',
  },
  'booking.cancelled': {
    category: 'booking',
    event_type: 'booking.cancelled',
    priority: 'high',
    action_label: 'View Details',
    icon: 'XCircle',
    color: 'orange',
  },
  'booking.start_reminder': {
    category: 'booking',
    event_type: 'booking.start_reminder',
    priority: 'normal',
    action_label: 'View Booking',
    icon: 'Clock',
    color: 'blue',
  },
  'booking.end_reminder': {
    category: 'booking',
    event_type: 'booking.end_reminder',
    priority: 'normal',
    action_label: 'Extend or Return',
    icon: 'Clock',
    color: 'orange',
  },
  'booking.overdue': {
    category: 'booking',
    event_type: 'booking.overdue',
    priority: 'critical',
    action_label: 'Take Action',
    icon: 'AlertTriangle',
    color: 'red',
  },
  'booking.returned': {
    category: 'booking',
    event_type: 'booking.returned',
    priority: 'normal',
    action_label: 'View Details',
    icon: 'CheckCircle',
    color: 'green',
  },
  'booking.date_change_request': {
    category: 'booking',
    event_type: 'booking.date_change_request',
    priority: 'high',
    action_label: 'Review Request',
    icon: 'Calendar',
    color: 'orange',
  },

  // Payment Events
  'payment.due': {
    category: 'payment',
    event_type: 'payment.due',
    priority: 'high',
    action_label: 'Pay Now',
    icon: 'CreditCard',
    color: 'orange',
  },
  'payment.received': {
    category: 'payment',
    event_type: 'payment.received',
    priority: 'normal',
    action_label: 'View Receipt',
    icon: 'CheckCircle',
    color: 'green',
  },
  'payment.failed': {
    category: 'payment',
    event_type: 'payment.failed',
    priority: 'critical',
    action_label: 'Retry Payment',
    icon: 'AlertTriangle',
    color: 'red',
  },
  'payment.refund': {
    category: 'payment',
    event_type: 'payment.refund',
    priority: 'normal',
    action_label: 'View Details',
    icon: 'CheckCircle',
    color: 'green',
  },

  // Message Events
  'message.new': {
    category: 'message',
    event_type: 'message.new',
    priority: 'normal',
    action_label: 'Reply',
    icon: 'MessageSquare',
    color: 'purple',
  },
  'message.inquiry': {
    category: 'message',
    event_type: 'message.inquiry',
    priority: 'high',
    action_label: 'Respond',
    icon: 'MessageSquare',
    color: 'purple',
  },
  'message.reply': {
    category: 'message',
    event_type: 'message.reply',
    priority: 'normal',
    action_label: 'View Message',
    icon: 'MessageSquare',
    color: 'purple',
  },

  // Trust & Reputation Events
  'review.new': {
    category: 'trust',
    event_type: 'review.new',
    priority: 'normal',
    action_label: 'View Review',
    icon: 'Star',
    color: 'yellow',
  },
  'review.reply': {
    category: 'trust',
    event_type: 'review.reply',
    priority: 'normal',
    action_label: 'View Reply',
    icon: 'Star',
    color: 'yellow',
  },
  'rating.received': {
    category: 'trust',
    event_type: 'rating.received',
    priority: 'normal',
    action_label: 'View Rating',
    icon: 'Star',
    color: 'yellow',
  },
  'report.raised': {
    category: 'trust',
    event_type: 'report.raised',
    priority: 'high',
    action_label: 'View Report',
    icon: 'AlertTriangle',
    color: 'red',
  },

  // Security Events
  'security.new_login': {
    category: 'security',
    event_type: 'security.new_login',
    priority: 'normal',
    action_label: 'Review Activity',
    icon: 'Shield',
    color: 'blue',
  },
  'security.new_device': {
    category: 'security',
    event_type: 'security.new_device',
    priority: 'high',
    action_label: 'Review Device',
    icon: 'Shield',
    color: 'orange',
  },
  'security.password_changed': {
    category: 'security',
    event_type: 'security.password_changed',
    priority: 'high',
    action_label: 'Review Change',
    icon: 'Shield',
    color: 'green',
  },
  'security.suspicious_activity': {
    category: 'security',
    event_type: 'security.suspicious_activity',
    priority: 'critical',
    action_label: 'Secure Account',
    icon: 'AlertTriangle',
    color: 'red',
  },

  // Business Insights Events
  'insight.views_milestone': {
    category: 'insight',
    event_type: 'insight.views_milestone',
    priority: 'low',
    action_label: 'View Stats',
    icon: 'TrendingUp',
    color: 'indigo',
  },
  'insight.demand_high': {
    category: 'insight',
    event_type: 'insight.demand_high',
    priority: 'normal',
    action_label: 'Optimize Pricing',
    icon: 'TrendingUp',
    color: 'green',
  },
  'insight.performance_tip': {
    category: 'insight',
    event_type: 'insight.performance_tip',
    priority: 'low',
    action_label: 'Learn More',
    icon: 'TrendingUp',
    color: 'indigo',
  },
  'insight.listing_conversion': {
    category: 'insight',
    event_type: 'insight.listing_conversion',
    priority: 'low',
    action_label: 'View Analytics',
    icon: 'TrendingUp',
    color: 'green',
  },

  // System Events
  'system.welcome': {
    category: 'system',
    event_type: 'system.welcome',
    priority: 'normal',
    action_label: 'Get Started',
    icon: 'Bell',
    color: 'blue',
  },
  'system.maintenance': {
    category: 'system',
    event_type: 'system.maintenance',
    priority: 'normal',
    action_label: 'Learn More',
    icon: 'Info',
    color: 'gray',
  },
  'system.feature_announcement': {
    category: 'system',
    event_type: 'system.feature_announcement',
    priority: 'low',
    action_label: 'Check it Out',
    icon: 'Bell',
    color: 'blue',
  },
};

// =====================================================
// NOTIFICATION MESSAGE BUILDERS
// =====================================================
export const buildNotificationMessage = (
  eventType: NotificationEventType,
  context: Record<string, any>
): { title: string; message: string } => {
  const templates: Record<NotificationEventType, (ctx: Record<string, any>) => { title: string; message: string }> = {
    // Booking
    'booking.new': (ctx) => ({
      title: 'New Booking Request',
      message: `${ctx.renterName} wants to rent your ${ctx.equipmentName} from ${ctx.startDate} to ${ctx.endDate}.`,
    }),
    'booking.accepted': (ctx) => ({
      title: 'Booking Accepted! 🎉',
      message: `Your booking for ${ctx.equipmentName} has been confirmed. Pick up on ${ctx.startDate}.`,
    }),
    'booking.rejected': (ctx) => ({
      title: 'Booking Request Declined',
      message: `Unfortunately, your request for ${ctx.equipmentName} was declined. Browse other options.`,
    }),
    'booking.cancelled': (ctx) => ({
      title: 'Booking Cancelled',
      message: `The booking for ${ctx.equipmentName} has been cancelled by ${ctx.cancelledBy}.`,
    }),
    'booking.start_reminder': (ctx) => ({
      title: 'Booking Starts Soon',
      message: `Your rental of ${ctx.equipmentName} starts ${ctx.timeUntil}. Get ready for pickup!`,
    }),
    'booking.end_reminder': (ctx) => ({
      title: 'Return Reminder',
      message: `Your rental of ${ctx.equipmentName} ends ${ctx.timeUntil}. Please return on time.`,
    }),
    'booking.overdue': (ctx) => ({
      title: '⚠️ Equipment Overdue',
      message: `${ctx.equipmentName} is overdue! Please return immediately or contact the owner.`,
    }),
    'booking.returned': (ctx) => ({
      title: 'Equipment Returned',
      message: `${ctx.renterName} has returned your ${ctx.equipmentName}. Please confirm condition.`,
    }),
    'booking.date_change_request': (ctx) => ({
      title: 'Date Change Requested',
      message: `${ctx.renterName} wants to change dates for ${ctx.equipmentName} booking.`,
    }),

    // Payment
    'payment.due': (ctx) => ({
      title: 'Payment Due',
      message: `Payment of ${ctx.amount} is due for ${ctx.equipmentName} rental.`,
    }),
    'payment.received': (ctx) => ({
      title: 'Payment Received',
      message: `You received ${ctx.amount} for ${ctx.equipmentName} rental.`,
    }),
    'payment.failed': (ctx) => ({
      title: 'Payment Failed',
      message: `Payment of ${ctx.amount} failed. Please update your payment method.`,
    }),
    'payment.refund': (ctx) => ({
      title: 'Refund Processed',
      message: `You've been refunded ${ctx.amount} for ${ctx.equipmentName}.`,
    }),

    // Messages
    'message.new': (ctx) => ({
      title: 'New Message',
      message: `${ctx.senderName} sent you a message.`,
    }),
    'message.inquiry': (ctx) => ({
      title: 'New Inquiry',
      message: `${ctx.senderName} asked about your ${ctx.equipmentName}.`,
    }),
    'message.reply': (ctx) => ({
      title: 'New Reply',
      message: `${ctx.senderName} replied to your message.`,
    }),

    // Trust
    'review.new': (ctx) => ({
      title: 'New Review',
      message: `${ctx.reviewerName} left a ${ctx.rating}-star review for ${ctx.equipmentName}.`,
    }),
    'review.reply': (ctx) => ({
      title: 'Review Reply',
      message: `${ctx.ownerName} replied to your review.`,
    }),
    'rating.received': (ctx) => ({
      title: 'New Rating',
      message: `You received a ${ctx.rating}-star rating from ${ctx.renterName}.`,
    }),
    'report.raised': (ctx) => ({
      title: 'Report Received',
      message: `A report has been raised on ${ctx.equipmentName}. We're reviewing it.`,
    }),

    // Security
    'security.new_login': (ctx) => ({
      title: 'New Login Detected',
      message: `New login from ${ctx.location} on ${ctx.device}.`,
    }),
    'security.new_device': (ctx) => ({
      title: 'New Device Login',
      message: `Your account was accessed from a new ${ctx.deviceType}. Was this you?`,
    }),
    'security.password_changed': (ctx) => ({
      title: 'Password Changed',
      message: `Your password was successfully changed on ${ctx.timestamp}.`,
    }),
    'security.suspicious_activity': (ctx) => ({
      title: '⚠️ Suspicious Activity',
      message: `Unusual activity detected on your account. Please review immediately.`,
    }),

    // Insights
    'insight.views_milestone': (ctx) => ({
      title: '🎯 Milestone Reached!',
      message: `Your ${ctx.equipmentName} got ${ctx.viewCount} views this week!`,
    }),
    'insight.demand_high': (ctx) => ({
      title: '📈 High Demand Alert',
      message: `${ctx.equipmentName} is trending! Consider updating availability or price.`,
    }),
    'insight.performance_tip': (ctx) => ({
      title: '💡 Performance Tip',
      message: ctx.tip || 'Add more photos to increase your booking rate by 40%.',
    }),
    'insight.listing_conversion': (ctx) => ({
      title: '🌟 Great Performance',
      message: `Your ${ctx.equipmentName} converts ${ctx.percentage}% better than average!`,
    }),

    // System
    'system.welcome': (ctx) => ({
      title: 'Welcome to AgriServe! 🌾',
      message: 'Start by listing your equipment or browsing available rentals.',
    }),
    'system.maintenance': (ctx) => ({
      title: 'Scheduled Maintenance',
      message: `The platform will be under maintenance on ${ctx.scheduledTime}.`,
    }),
    'system.feature_announcement': (ctx) => ({
      title: '🎉 New Feature',
      message: ctx.description || 'Check out our latest features!',
    }),
  };

  const builder = templates[eventType];
  return builder ? builder(context) : { title: 'Notification', message: 'You have a new notification.' };
};

// =====================================================
// PREFERENCE LABELS
// =====================================================
export const PREFERENCE_LABELS: Record<keyof Pick<NotificationPreferences, 'booking_enabled' | 'payment_enabled' | 'message_enabled' | 'trust_enabled' | 'security_enabled' | 'insight_enabled' | 'system_enabled'>, { label: string; description: string }> = {
  booking_enabled: {
    label: 'Bookings & Rentals',
    description: 'Get notified about booking requests, confirmations, and reminders',
  },
  payment_enabled: {
    label: 'Payments',
    description: 'Receive payment confirmations, due dates, and transaction updates',
  },
  message_enabled: {
    label: 'Messages & Inquiries',
    description: 'Stay updated on new messages and equipment inquiries',
  },
  trust_enabled: {
    label: 'Reviews & Ratings',
    description: 'Know when you receive reviews, ratings, or reports',
  },
  security_enabled: {
    label: 'Security Alerts',
    description: 'Get notified about account security and login activity',
  },
  insight_enabled: {
    label: 'Business Insights',
    description: 'Receive performance tips and demand analytics for your equipment',
  },
  system_enabled: {
    label: 'System Updates',
    description: 'Platform announcements, maintenance, and new features',
  },
};
