# 🚀 AgriServe - New Supabase Project Setup Guide

This guide will help you set up your new Supabase project from scratch for the AgriServe platform.

## 📋 Prerequisites

- ✅ New Supabase project created
- ✅ `.env.local` file updated with new project credentials
- ✅ Access to Supabase SQL Editor

## 🎯 Quick Setup (5 minutes)

### Step 1: Update Environment Variables

Make sure your `.env.local` file in the `agri-serve-web` directory contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual Supabase project URL and anon key from:
- Supabase Dashboard → **Settings** → **API**

### Step 2: Run Database Setup Script

1. **Open Supabase SQL Editor:**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Copy the Complete Setup Script:**
   - Open the file: `COMPLETE_DATABASE_SETUP.sql`
   - Copy the entire contents (Ctrl+A, Ctrl+C)

3. **Paste and Execute:**
   - Paste the script into the SQL Editor
   - Click **Run** or press `Ctrl+Enter`
   - Wait for execution (should take 10-30 seconds)

4. **Verify Success:**
   - You should see a success message with checkmarks ✅
   - Check for any error messages (there shouldn't be any)

### Step 3: Configure Authentication

1. **Enable Email Authentication:**
   - Supabase Dashboard → **Authentication** → **Providers**
   - Enable **Email** provider
   - Click **Save**

2. **Configure Site URLs:**
   - Go to **Authentication** → **URL Configuration**
   - **Site URL:** `http://localhost:3001`
   - **Redirect URLs:** Add `http://localhost:3001/auth/callback`
   - For production, add your production URLs

3. **Optional - Enable Google OAuth:**
   - Under **Providers** → Enable **Google**
   - Add your Google OAuth Client ID and Secret
   - Follow [Supabase Google Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

### Step 4: Verify Database Setup

1. **Check Tables Created:**
   - Go to **Table Editor** in Supabase Dashboard
   - You should see the following tables:
     - ✅ `user_profiles`
     - ✅ `user_roles`
     - ✅ `equipment`
     - ✅ `bookings`
     - ✅ `reviews`
     - ✅ `messages`
     - ✅ `notifications`
     - ✅ `notification_preferences`
     - ✅ `notification_delivery_log`
     - ✅ `payments`
     - ✅ `labour_profiles`
     - ✅ `labour_bookings`

2. **Check Storage Buckets:**
   - Go to **Storage** in Supabase Dashboard
   - You should see:
     - ✅ `avatars` - for profile pictures
     - ✅ `equipment-images` - for equipment photos
     - ✅ `equipment-videos` - for equipment videos

3. **Check Functions:**
   - Go to **Database** → **Functions**
   - Verify key functions exist:
     - ✅ `handle_new_user()`
     - ✅ `create_notification()`
     - ✅ `mark_notification_read()`
     - ✅ `get_unread_notification_count()`

### Step 5: Test User Creation

1. **Start Development Server:**
   ```bash
   cd agri-serve-web
   pnpm dev
   ```

2. **Test Signup:**
   - Open browser to `http://localhost:3001`
   - Click **Sign Up** or go to `/signup`
   - Create a test account with email and password
   - Should complete without "Database error saving new user"

3. **Verify User Profile:**
   - Go to Supabase Dashboard → **Table Editor** → `user_profiles`
   - Your new user should appear with a profile automatically created
   - Check `auth.users` table - user should be there too

## 🎨 What Was Set Up

### Database Schema

#### Core Features
- **User Management:** Profiles, roles, authentication
- **Equipment Rental:** Listings, bookings, reviews
- **Labour Marketplace:** Labour profiles and bookings
- **Messaging System:** Direct messages between users
- **Notifications:** Real-time notification system with preferences
- **Payments:** Payment tracking and history

#### Advanced Features
- **PostGIS Integration:** Location-based search and distance calculations
- **Real-time Subscriptions:** Live updates for messages, notifications, and bookings
- **Automatic User Profile Creation:** Triggered on signup
- **Row Level Security (RLS):** Secure data access at database level
- **Storage Buckets:** Image and video upload with policies

### Tables Overview

| Table | Description |
|-------|-------------|
| `user_profiles` | User profile information, location, verification status |
| `user_roles` | User role assignments (renter, provider, labour, admin) |
| `equipment` | Equipment listings with location, pricing, images |
| `bookings` | Equipment rental bookings with status tracking |
| `reviews` | Equipment reviews and ratings |
| `payments` | Payment transactions and status |
| `messages` | Direct messages between users |
| `notifications` | User notifications with categories and priorities |
| `notification_preferences` | User notification settings |
| `labour_profiles` | Labour worker profiles with skills and rates |
| `labour_bookings` | Labour hiring bookings |

### Key Features

#### 1. Auto User Profile Creation
When a user signs up, a profile is automatically created with:
- Email from auth
- Name extracted from metadata or email
- Default preferences
- Notification settings

#### 2. Location Services
- Uses PostGIS for geographic calculations
- Automatic location point generation from lat/lng
- Distance-based search capabilities
- Service radius for labour workers

#### 3. Notification System
- Multiple categories (booking, payment, message, etc.)
- Priority levels (low, normal, high, critical)
- User preferences for each category
- Quiet hours support
- Delivery tracking

#### 4. Security
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Public data (equipment listings, profiles) is readable by all
- Secure storage policies for uploads

## 🔧 Troubleshooting

### Issue: Script execution fails

**Solution:**
- Run the script in sections if needed
- Check Supabase logs for specific errors
- Ensure PostGIS extension is enabled (usually default)

### Issue: "Database error saving new user" still appears

**Solution:**
1. Verify `handle_new_user()` trigger was created:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Check if `user_profiles` table exists and has correct structure
3. Re-run Section 7 and 8 of the setup script (Functions and Triggers)

### Issue: Storage uploads fail

**Solution:**
1. Verify buckets were created: **Storage** section in dashboard
2. Check storage policies: **Storage** → Select bucket → **Policies**
3. Re-run Section 11 of the setup script (Storage Buckets)

### Issue: Location features not working

**Solution:**
1. Verify PostGIS extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'postgis';
   ```
2. If not enabled, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

### Issue: Real-time updates not working

**Solution:**
1. Check if realtime is enabled for tables in Supabase Dashboard
2. Go to **Database** → **Replication** 
3. Enable replication for: `notifications`, `messages`, `bookings`

## 📚 API Usage Examples

### Create Notification

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.rpc('create_notification', {
  p_user_id: userId,
  p_title: 'New Booking Request',
  p_message: 'You have a new booking request for your tractor',
  p_category: 'booking',
  p_event_type: 'booking.request',
  p_priority: 'normal',
  p_action_url: '/bookings/123',
  p_action_label: 'View Booking'
});
```

### Get Unread Notification Count

```typescript
const { data: count } = await supabase.rpc('get_unread_notification_count');
console.log(`You have ${count} unread notifications`);
```

### Mark Notification as Read

```typescript
await supabase.rpc('mark_notification_read', {
  p_notification_id: notificationId
});
```

### Search Equipment by Location

```typescript
const { data: equipment } = await supabase
  .from('equipment')
  .select('*')
  .eq('is_available', true)
  .order('created_at', { ascending: false });
```

### Create Equipment Listing

```typescript
const { data, error } = await supabase
  .from('equipment')
  .insert({
    owner_id: userId,
    name: 'John Deere Tractor',
    description: 'Powerful tractor for all farming needs',
    category: 'tractor',
    brand: 'John Deere',
    price_per_day: 2500,
    latitude: 28.6139,
    longitude: 77.2090,
    location_name: 'Delhi',
    images: ['url1', 'url2'],
    features: ['GPS', '4WD', 'Air Conditioned']
  });
```

## 🚀 Next Steps

### For Development:
1. ✅ Test user signup and login
2. ✅ Create test equipment listings
3. ✅ Test booking flow
4. ✅ Test notification system
5. ✅ Test messaging between users

### For Production:
1. Update Site URLs in Authentication settings
2. Configure custom SMTP for emails (optional)
3. Set up production environment variables
4. Enable database backups
5. Configure storage CDN (optional)
6. Set up monitoring and alerts

## 📞 Support

If you encounter any issues:

1. **Check Supabase Logs:**
   - Dashboard → **Logs** → **Database Logs**

2. **Check Browser Console:**
   - Press F12 → Console tab

3. **Verify Environment Variables:**
   ```bash
   cat .env.local
   ```

4. **Test Database Connection:**
   - Try a simple query in SQL Editor:
   ```sql
   SELECT COUNT(*) FROM user_profiles;
   ```

## ✅ Success Checklist

- [ ] Database script executed successfully
- [ ] All 12 tables created
- [ ] 3 storage buckets created
- [ ] Authentication providers configured
- [ ] Site URLs configured
- [ ] Test user signup works
- [ ] User profile auto-created
- [ ] No database errors in console
- [ ] Development server running
- [ ] Ready to develop! 🎉

---

**Congratulations!** Your AgriServe database is now fully set up and ready to use! 🌾🚜

Start building amazing features for farmers! 💚