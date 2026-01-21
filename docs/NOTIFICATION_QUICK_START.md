# 🚀 Notification System - Quick Setup Guide

## Step 1: Apply Database Migration

From your project root (`agri-serve-web`), run:

```bash
# Make sure you're in the correct directory
cd /home/pk/Desktop/agro/agri-serve-web

# If using Supabase CLI locally
supabase db reset  # This will reset and apply all migrations

# OR apply just the notification migration
supabase migration up

# OR if you prefer to run manually
supabase db execute -f supabase/migrations/011_notification_system.sql
```

### If you get errors:

1. **"Type already exists"** - This is handled by the migration, you can ignore this
2. **"Column does not exist"** - Run the migration again, it should be idempotent now
3. **Permission errors** - Make sure you're connected to the right Supabase project

## Step 2: Verify Migration

```bash
# Check if tables were created
supabase db execute --query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'notification%';"

# Should show:
# - notifications
# - notification_preferences  
# - notification_delivery_log
```

## Step 3: Add NotificationBell to Your Layout

Edit your main layout file (e.g., `src/app/layout.tsx` or `src/components/layout/header.tsx`):

```tsx
import { NotificationBell } from '@/components/notifications';
import { AuthProvider } from '@/lib/supabase/auth-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <header className="flex items-center justify-between p-4">
            <nav>
              {/* Your existing nav items */}
            </nav>
            
            {/* Add the notification bell */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              {/* Your other header items (profile, etc.) */}
            </div>
          </header>
          
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Step 4: Test the System

### Create a Test Notification

You can test the system by running this SQL in Supabase SQL Editor:

```sql
-- Replace 'YOUR_USER_ID' with your actual user ID
SELECT create_notification(
  'YOUR_USER_ID'::uuid,
  'Test Notification',
  'This is a test notification to verify the system works!',
  'system',
  'system.welcome',
  'normal',
  '/dashboard',
  'Go to Dashboard',
  NULL,
  NULL,
  NULL,
  '{}'::jsonb
);
```

### Or use the helper function in your code:

```tsx
import { notificationService } from '@/lib/services/notifications';

// Get your user ID (you'll need to be authenticated)
const { data: { user } } = await supabase.auth.getUser();

// Create a test notification
await notificationService.createNotification({
  user_id: user.id,
  title: 'Test Notification',
  message: 'This is a test!',
  category: 'system',
  event_type: 'system.welcome',
  priority: 'normal',
  action_url: '/dashboard',
  action_label: 'View Dashboard',
});
```

## Step 5: Integration Examples

### When a booking is created:

```tsx
import { notifyNewBookingRequest } from '@/lib/services/notifications';

async function createBooking(data) {
  // ... your booking creation logic
  
  await notifyNewBookingRequest({
    ownerId: equipment.owner_id,
    renterName: currentUser.name,
    equipmentName: equipment.name,
    equipmentId: equipment.id,
    bookingId: newBooking.id,
    startDate: data.startDate,
    endDate: data.endDate,
  });
}
```

### When a booking is accepted:

```tsx
import { notifyBookingAccepted } from '@/lib/services/notifications';

async function acceptBooking(bookingId) {
  // ... update booking status
  
  await notifyBookingAccepted({
    renterId: booking.renter_id,
    equipmentName: booking.equipment.name,
    equipmentId: booking.equipment_id,
    bookingId: booking.id,
    startDate: booking.start_date,
  });
}
```

## Troubleshooting

### Migration fails with "column does not exist"

The migration file has been updated to handle this. Re-run:

```bash
supabase db reset
```

### Notifications not appearing in UI

1. Check if user is authenticated
2. Open browser console for errors
3. Verify RLS policies are working:

```sql
-- Test RLS
SELECT * FROM notifications WHERE user_id = auth.uid();
```

### Real-time not working

1. Check Supabase project settings → API → Realtime is enabled
2. Verify tables are added to realtime publication (migration handles this)
3. Check browser Network tab for WebSocket connection

### Can't see notification bell

Make sure you wrapped your app with `AuthProvider`:

```tsx
import { AuthProvider } from '@/lib/supabase/auth-context';

<AuthProvider>
  {/* Your app */}
</AuthProvider>
```

## Next Steps

1. ✅ Migration applied
2. ✅ Bell icon in header
3. ✅ Test notification created
4. 📝 Integrate into your booking flow (see `docs/NOTIFICATION_INTEGRATION_EXAMPLES.ts`)
5. 📝 Set up scheduled reminders (cron jobs)
6. 📝 Configure email delivery (optional)

## Documentation

- Full documentation: `docs/NOTIFICATION_SYSTEM.md`
- Integration examples: `docs/NOTIFICATION_INTEGRATION_EXAMPLES.ts`
- Database schema: `supabase/migrations/011_notification_system.sql`

## Need Help?

Check the browser console for detailed error messages and refer to the full documentation.
