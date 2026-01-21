# 🔔 Notification System Documentation

## Overview

A comprehensive, real-time notification system for the AgriServe platform with support for:
- ✅ Real-time notifications via Supabase Realtime
- ✅ User-controlled preferences with quiet hours
- ✅ Category-based filtering (Bookings, Payments, Messages, etc.)
- ✅ Priority levels (Low, Normal, High, Critical)
- ✅ Deep linking to relevant pages
- ✅ Notification history with grouping
- ✅ Multi-channel support (In-app, Email, SMS, Push - future)

---

## 📂 File Structure

```
src/
├── lib/
│   ├── types/
│   │   └── notifications.ts              # TypeScript types
│   ├── services/
│   │   └── notifications/
│   │       ├── index.ts                  # Main exports
│   │       ├── notification-service.ts   # Core service
│   │       ├── hooks.ts                  # React hooks
│   │       ├── config.ts                 # Templates & config
│   │       └── helpers.ts                # Helper functions
│   └── supabase/
│       └── auth-context.tsx              # Auth context
├── components/
│   └── notifications/
│       ├── index.ts                      # Component exports
│       ├── notification-bell.tsx         # Bell icon with badge
│       ├── notification-panel.tsx        # Dropdown panel
│       ├── notification-item.tsx         # Single notification
│       ├── notification-filters.tsx      # Filter UI
│       └── notification-preferences-page.tsx  # Settings page
└── app/
    └── dashboard/
        └── notifications/
            ├── page.tsx                  # Full notifications page
            └── preferences/
                └── page.tsx              # Preferences route

supabase/
└── migrations/
    └── 011_notification_system.sql       # Database schema
```

---

## 🚀 Quick Start

### 1. Run Database Migration

```bash
# Apply the notification system migration
supabase db push

# Or if using migration files
supabase migration up
```

### 2. Add Notification Bell to Layout

```tsx
// src/app/layout.tsx or your header component
import { NotificationBell } from '@/components/notifications';
import { AuthProvider } from '@/lib/supabase/auth-context';

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <header>
        {/* Your other header items */}
        <NotificationBell />
      </header>
      {children}
    </AuthProvider>
  );
}
```

### 3. Create Your First Notification

```tsx
import { notifyNewBookingRequest } from '@/lib/services/notifications';

// When a booking is created
await notifyNewBookingRequest({
  ownerId: 'user-uuid',
  renterName: 'John Doe',
  equipmentName: 'Tractor X200',
  equipmentId: 'equipment-uuid',
  bookingId: 'booking-uuid',
  startDate: '2026-02-01',
  endDate: '2026-02-05',
});
```

---

## 📋 Notification Categories

### 1. **Booking & Rental** 🚜
- New booking request
- Booking accepted/rejected
- Booking cancelled
- Start/end reminders
- Overdue alerts

### 2. **Payment** 💳
- Payment due
- Payment received
- Payment failed
- Refund processed

### 3. **Messages** 💬
- New message
- Equipment inquiry
- Reply received

### 4. **Trust & Reputation** ⭐
- New review/rating
- Review reply
- Report raised

### 5. **Security** 🔐
- New login detected
- New device login
- Password changed

### 6. **Business Insights** 📊
- View milestones
- High demand alerts
- Performance tips

### 7. **System** 🔧
- Welcome message
- Maintenance notices
- Feature announcements

---

## 🎯 Usage Examples

### Using Helper Functions (Recommended)

```tsx
import {
  notifyNewBookingRequest,
  notifyBookingAccepted,
  notifyPaymentReceived,
  notifyNewMessage,
  notifyNewReview,
} from '@/lib/services/notifications';

// Booking accepted
await notifyBookingAccepted({
  renterId: 'user-uuid',
  equipmentName: 'Tractor X200',
  equipmentId: 'equipment-uuid',
  bookingId: 'booking-uuid',
  startDate: 'tomorrow',
});

// Payment received
await notifyPaymentReceived({
  ownerId: 'owner-uuid',
  amount: '$500',
  equipmentName: 'Tractor X200',
  equipmentId: 'equipment-uuid',
  bookingId: 'booking-uuid',
});

// New message
await notifyNewMessage({
  recipientId: 'recipient-uuid',
  senderName: 'John Doe',
  senderId: 'sender-uuid',
  conversationId: 'conversation-uuid',
});
```

### Using Service Directly

```tsx
import { notificationService } from '@/lib/services/notifications';

await notificationService.createNotification({
  user_id: 'user-uuid',
  title: 'Custom Notification',
  message: 'This is a custom notification',
  category: 'system',
  event_type: 'system.feature_announcement',
  priority: 'normal',
  action_url: '/dashboard',
  action_label: 'View Details',
});
```

### Using React Hooks

```tsx
'use client';

import { useNotifications, useNotificationPreferences } from '@/lib/services/notifications';

export function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const { preferences, updatePreferences } = useNotificationPreferences();

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map((notification) => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          {notification.title}
        </div>
      ))}
    </div>
  );
}
```

---

## ⚙️ User Preferences

Users can control notifications via `/dashboard/notifications/preferences`:

### Category Toggles
- Enable/disable each notification category
- Booking, Payment, Message, Trust, Security, Insight, System

### Delivery Channels
- ✅ In-app notifications (always available)
- ✅ Email notifications
- 🔜 SMS notifications (coming soon)
- 🔜 Push notifications (coming soon)

### Quiet Hours (Do Not Disturb)
- Set start/end time
- Critical notifications bypass DND
- Timezone support

### Digest Mode
- Bundle notifications together
- Frequency: Immediate, Hourly, Daily

---

## 🔔 Components

### NotificationBell

```tsx
import { NotificationBell } from '@/components/notifications';

<NotificationBell 
  variant="ghost"  // 'default' | 'ghost' | 'outline'
  size="icon"      // 'default' | 'sm' | 'lg' | 'icon'
  showLabel={false}
/>
```

### NotificationPanel

```tsx
import { NotificationPanel } from '@/components/notifications';

<NotificationPanel onClose={() => setOpen(false)} />
```

### Full Page

```tsx
// Navigate to /dashboard/notifications
// Or use the component directly
import NotificationsPage from '@/app/dashboard/notifications/page';
```

---

## 🔄 Real-time Updates

Notifications automatically update in real-time via Supabase Realtime:

```tsx
// Already handled in hooks, but if you need manual subscription:
import { notificationService } from '@/lib/services/notifications';

const unsubscribe = notificationService.subscribeToNotifications(
  userId,
  (newNotification) => {
    console.log('New notification:', newNotification);
  }
);

// Clean up
unsubscribe();
```

---

## 🎨 Customization

### Custom Notification Template

```tsx
// Add to src/lib/services/notifications/config.ts
export const NOTIFICATION_TEMPLATES = {
  // ... existing templates
  'custom.event': {
    category: 'system',
    event_type: 'custom.event',
    priority: 'normal',
    action_label: 'View',
    icon: 'Bell',
    color: 'blue',
  },
};

// Add message builder
export const buildNotificationMessage = (eventType, context) => {
  const templates = {
    // ... existing templates
    'custom.event': (ctx) => ({
      title: 'Custom Event',
      message: `Something happened: ${ctx.detail}`,
    }),
  };
  // ...
};
```

### Custom Styling

```tsx
// Override in your component
<NotificationBell className="custom-bell-styles" />

// Or modify src/components/notifications/notification-bell.tsx
```

---

## 📊 Database Schema

### Tables

1. **notifications** - Store all notifications
2. **notification_preferences** - User preferences
3. **notification_delivery_log** - Delivery tracking (optional)

### Functions

- `create_notification()` - Create with preference check
- `mark_notification_read()` - Mark single as read
- `mark_all_notifications_read()` - Bulk mark as read
- `get_unread_notification_count()` - Get unread count
- `cleanup_old_notifications()` - Cleanup old read notifications

### RLS Policies

All tables have Row Level Security enabled:
- Users can only view/update their own notifications
- Service role can create notifications for any user

---

## 🔧 Integration Guide

### 1. Booking Flow

```tsx
// When booking is created
import { notifyNewBookingRequest } from '@/lib/services/notifications';

async function createBooking(data) {
  const booking = await db.bookings.create(data);
  
  // Notify equipment owner
  await notifyNewBookingRequest({
    ownerId: data.ownerId,
    renterName: data.renterName,
    equipmentName: data.equipmentName,
    equipmentId: data.equipmentId,
    bookingId: booking.id,
    startDate: data.startDate,
    endDate: data.endDate,
  });
  
  return booking;
}
```

### 2. Payment Flow

```tsx
// When payment is received
import { notifyPaymentReceived } from '@/lib/services/notifications';

async function processPayment(paymentData) {
  await processStripePayment(paymentData);
  
  // Notify equipment owner
  await notifyPaymentReceived({
    ownerId: paymentData.ownerId,
    amount: formatCurrency(paymentData.amount),
    equipmentName: paymentData.equipmentName,
    equipmentId: paymentData.equipmentId,
    bookingId: paymentData.bookingId,
  });
}
```

### 3. Message Flow

```tsx
// When message is sent
import { notifyNewMessage } from '@/lib/services/notifications';

async function sendMessage(messageData) {
  await db.messages.create(messageData);
  
  // Notify recipient
  await notifyNewMessage({
    recipientId: messageData.recipientId,
    senderName: messageData.senderName,
    senderId: messageData.senderId,
    conversationId: messageData.conversationId,
  });
}
```

---

## 🧪 Testing

### Test Notification Creation

```tsx
// Create test notification
import { notificationService } from '@/lib/services/notifications';

await notificationService.createNotification({
  user_id: 'your-user-id',
  title: 'Test Notification',
  message: 'This is a test',
  category: 'system',
  event_type: 'system.welcome',
  priority: 'normal',
  action_url: '/dashboard',
});
```

### Test Real-time Updates

1. Open notification bell in browser
2. Create notification via API/database
3. See it appear in real-time

---

## 📱 Future Enhancements

- [ ] Email delivery integration
- [ ] SMS/WhatsApp notifications
- [ ] Push notifications (Web & Mobile)
- [ ] Notification sounds
- [ ] Rich media in notifications (images, videos)
- [ ] Notification reactions (like, acknowledge)
- [ ] Notification forwarding
- [ ] Smart notification batching
- [ ] AI-powered notification summaries

---

## 🐛 Troubleshooting

### Notifications not appearing?

1. Check user preferences: `/dashboard/notifications/preferences`
2. Verify realtime is enabled: `supabase/migrations/011_notification_system.sql`
3. Check browser console for errors
4. Verify user is authenticated

### Real-time not working?

1. Ensure Supabase realtime is enabled for your project
2. Check that tables are added to `supabase_realtime` publication
3. Verify WebSocket connection in browser Network tab

### Unread count not updating?

1. Check RLS policies on `notifications` table
2. Verify `mark_notification_read()` function permissions
3. Check browser console for errors

---

## 📚 API Reference

### NotificationService

```tsx
class NotificationService {
  // Get notifications with pagination & filters
  getNotifications(userId, { limit, offset, filters }): Promise<{notifications, total}>
  
  // Get unread count
  getUnreadCount(userId): Promise<number>
  
  // Create notification
  createNotification(params): Promise<Notification>
  
  // Mark as read
  markAsRead(notificationId): Promise<void>
  markAllAsRead(userId): Promise<number>
  
  // Delete
  deleteNotification(notificationId): Promise<void>
  clearAll(userId): Promise<void>
  
  // Preferences
  getPreferences(userId): Promise<NotificationPreferences>
  updatePreferences(userId, updates): Promise<NotificationPreferences>
  
  // Real-time
  subscribeToNotifications(userId, callback): Unsubscribe
  subscribeToPreferences(userId, callback): Unsubscribe
}
```

---

## 🤝 Contributing

To add a new notification type:

1. Add event type to `NotificationEventType` in `types/notifications.ts`
2. Add template to `NOTIFICATION_TEMPLATES` in `config.ts`
3. Add message builder to `buildNotificationMessage` in `config.ts`
4. Create helper function in `helpers.ts`
5. Update this README

---

## 📄 License

Part of the AgriServe platform. All rights reserved.

---

## 💡 Support

For questions or issues:
- Check this README
- Review code comments
- Check browser console for errors
- Review Supabase logs
