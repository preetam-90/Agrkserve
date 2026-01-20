# Realtime Subscription Fix Guide

## Problem
You're seeing "❌ Channel error in subscription" in the browser console when visiting `/provider/bookings`.

## Root Cause
Supabase Realtime is not enabled for the `bookings` table in your Supabase Dashboard.

## Solution - Step by Step

### Step 1: Enable Realtime in Supabase Dashboard

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Replication Settings**
   - Click on **Database** in the left sidebar
   - Click on **Replication**
   - Scroll down to the **Tables** section

3. **Enable Realtime for Bookings Table**
   - Find the `bookings` table in the list
   - Toggle the switch to **ON** (☑️)
   - Also enable for these tables:
     - `equipment`
     - `messages`
     - `notifications`
     - `user_profiles`

4. **Save Changes**
   - Click **Save** at the bottom of the page

### Step 2: Run SQL Migration (If Not Already Done)

1. **Open SQL Editor**
   - In Supabase Dashboard, click **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Run These Commands:**

```sql
-- Enable replica identity for bookings table
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- Enable realtime publication for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Enable for other tables
ALTER TABLE public.equipment REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
```

3. **Click "Run"** (or press Ctrl+Enter)

### Step 3: Verify Setup

1. **Run the Check Script**
   ```bash
   cd /home/pk/Desktop/agro/agri-serve-web
   bash scripts/check-realtime-setup.sh
   ```

2. **Check Browser Console**
   - Open your app at `http://localhost:3000/provider/bookings`
   - Press F12 to open Developer Tools
   - Go to Console tab
   - You should see:
     ```
     ✅ Successfully subscribed to booking changes
     ```

### Step 4: Test Realtime

1. **Open Two Browser Windows**
   - **Window 1 (Provider):** `http://localhost:3000/provider/bookings`
   - **Window 2 (Renter):** `http://localhost:3000/renter/equipment`

2. **Create a New Booking**
   - In Window 2, click on any equipment
   - Click "Book Now"
   - Fill the form and submit

3. **Check Window 1**
   - You should see a notification: "New booking request received!"
   - The new booking should appear without refreshing the page
   - Check console for logs

## Troubleshooting

### If You Still See "Channel Error"

**Option 1: Check Supabase Project Status**
```bash
# Your Supabase URL should look like:
# https://your-project-ref.supabase.co

# Check if project is active
curl -I https://your-project-ref.supabase.co
```

**Option 2: Verify Environment Variables**
Check your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Option 3: Restart Development Server**
```bash
# Stop the server (Ctrl+C)
# Then restart
pnpm dev
```

**Option 4: Clear Browser Cache**
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Reload the page

### If You See "Subscription Timed Out"

1. **Check Internet Connection**
   - Ensure you're connected to the internet
   - Try pinging Supabase: `ping your-project-ref.supabase.co`

2. **Verify Supabase Project**
   - Go to Supabase Dashboard
   - Check if your project is running
   - Look for any error messages

3. **Check Firewall/VPN**
   - Some networks block WebSocket connections
   - Try disabling VPN if you're using one

### If Realtime Works But No Updates

1. **Check Table Permissions**
   - Go to Supabase Dashboard → Authentication → Policies
   - Ensure you have SELECT policies for authenticated users

2. **Verify Data Exists**
   - Check if bookings exist in the database
   - Run: `SELECT * FROM bookings;` in SQL Editor

3. **Check Equipment Owner**
   - Make sure the provider has equipment listed
   - Run: `SELECT * FROM equipment WHERE owner_id = 'your-user-id';`

## Common Issues

### Issue 1: "Realtime not enabled for table"
**Solution:** Enable it in Database → Replication → Toggle switch

### Issue 2: "Channel name already exists"
**Solution:** The code now handles this by removing old channels first

### Issue 3: "Permission denied"
**Solution:** Check Supabase policies and ensure user is authenticated

### Issue 4: "Connection timeout"
**Solution:** Check internet connection and Supabase project status

## Quick Test Commands

### Check Supabase Connection
```bash
# Test if Supabase is reachable
curl -s https://your-project-ref.supabase.co | head -n 5
```

### Check Database Tables
```sql
-- In Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check Realtime Status
```sql
-- In Supabase SQL Editor
SELECT 
    schemaname,
    tablename,
    row_security
FROM pg_tables 
WHERE schemaname = 'public';
```

## Expected Console Output (Success)

```
Setting up real-time subscription for user: abc123...
Monitoring equipment IDs: [1, 2, 3]
Subscription status: SUBSCRIBED
✅ Successfully subscribed to booking changes
```

## Expected Console Output (Error)

```
Setting up real-time subscription for user: abc123...
Monitoring equipment IDs: [1, 2, 3]
Subscription status: CHANNEL_ERROR
❌ Channel error in subscription
💡 Please enable Realtime in Supabase Dashboard:
   Database → Replication → Enable realtime for "bookings" table
```

## Additional Resources

- **Supabase Realtime Docs:** https://supabase.com/docs/guides/realtime
- **Realtime Quickstart:** https://supabase.com/docs/guides/realtime/quickstart
- **Troubleshooting:** https://supabase.com/docs/guides/troubleshooting

## Summary

The "Channel error in subscription" is a common issue when:
1. Realtime is not enabled in Supabase Dashboard
2. The table doesn't have replica identity set
3. Network/firewall blocks WebSocket connections

**Most likely fix:** Enable realtime for the `bookings` table in Supabase Dashboard → Database → Replication.

Once enabled, the subscription should connect successfully and you'll see "✅ Successfully subscribed to booking changes" in the console.
