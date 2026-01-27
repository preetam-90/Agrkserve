# 🚀 NEW SUPABASE DATABASE SETUP GUIDE

Complete guide to set up your AgriServe database on a new Supabase project.

---

## 📋 Prerequisites

- ✅ A new Supabase project created at [supabase.com](https://supabase.com)
- ✅ Project URL and Anon Key (from Project Settings → API)
- ✅ Access to SQL Editor in Supabase Dashboard

---

## ⚡ QUICK SETUP (5 Minutes)

### Step 1: Run the Complete SQL Script

1. **Open your Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Select your new project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute the SQL**
   - Open the file: `supabase/COMPLETE_DATABASE_SETUP.sql`
   - Copy **ALL** the content (Ctrl+A, Ctrl+C)
   - Paste it into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Wait for Completion**
   - The script will take 10-30 seconds to execute
   - You should see a success message with a completion notice

---

## 🔧 Step 2: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication → Providers**
2. Find **Email** provider
3. Enable it
4. **Confirm emails**: Choose "Disabled" for development (optional)
5. Save changes

### Enable Google OAuth (Optional)

1. In **Authentication → Providers**
2. Find **Google** provider
3. Enable it
4. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Save changes

### Set Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Add your Site URL:
   ```
   http://localhost:3000
   ```
3. Add Redirect URLs:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```
4. For production, add your live URLs too

---

## 📡 Step 3: Enable Realtime

1. Go to **Database → Replication**
2. Enable Realtime for these tables:
   - ✅ `bookings`
   - ✅ `equipment`
   - ✅ `messages`
   - ✅ `notifications`
   - ✅ `notification_preferences`

---

## 🗄️ Step 4: Verify Storage Buckets

1. Go to **Storage**
2. Verify these buckets exist:
   - ✅ `avatars` (10MB limit, public)
   - ✅ `equipment-images` (10MB limit, public)
   - ✅ `equipment-videos` (20MB limit, public)

If they don't exist, the SQL script should have created them. If you see errors, create them manually:

**Create Avatars Bucket:**
- Name: `avatars`
- Public: ✅ Yes
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg, image/jpg, image/png, image/gif, image/webp`

**Create Equipment Images Bucket:**
- Name: `equipment-images`
- Public: ✅ Yes
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg, image/jpg, image/png, image/gif, image/webp`

**Create Equipment Videos Bucket:**
- Name: `equipment-videos`
- Public: ✅ Yes
- File size limit: 20 MB
- Allowed MIME types: `video/mp4, video/quicktime, video/x-msvideo, video/webm`

---

## 🔐 Step 5: Update Environment Variables

1. Copy `.env.example` to `.env.local` (if you haven't already)
2. Get your Supabase credentials:
   - Go to **Project Settings → API**
   - Copy **Project URL**
   - Copy **anon/public key**

3. Update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## ✅ Step 6: Verify Database Setup

Run this query in SQL Editor to verify everything is set up:

```sql
-- Check if all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('user_profiles', 'equipment', 'bookings', 'reviews', 
                            'payments', 'messages', 'notifications', 'user_roles',
                            'labour_profiles', 'labour_bookings', 'audit_logs',
                            'notification_preferences', 'notification_delivery_log')
        THEN '✅'
        ELSE '❌'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected: You should see ✅ for all core tables.

---

## 🧪 Step 7: Test Your Setup

1. **Start your development server:**
   ```bash
   cd agri-serve-web
   pnpm install
   pnpm dev
   ```

2. **Open the app:**
   ```
   http://localhost:3000
   ```

3. **Test user signup:**
   - Click "Sign Up"
   - Create an account with email/password
   - Check if user profile is created automatically

4. **Verify in Supabase:**
   - Go to **Authentication → Users** - should see your new user
   - Go to **Database → Table Editor → user_profiles** - should see profile entry

---

## 📊 What Was Created?

### Tables (13)
1. **user_profiles** - User information and settings
2. **user_roles** - User role assignments
3. **equipment** - Equipment listings
4. **bookings** - Equipment rental bookings
5. **reviews** - User reviews for equipment
6. **payments** - Payment records (Razorpay integration)
7. **messages** - User-to-user messaging
8. **notifications** - In-app notifications
9. **notification_preferences** - User notification settings
10. **notification_delivery_log** - Notification delivery tracking
11. **labour_profiles** - Agricultural labour profiles
12. **labour_bookings** - Labour hiring bookings
13. **audit_logs** - System audit trail

### Features
- ✅ **PostGIS** for geospatial queries (location-based search)
- ✅ **Row Level Security (RLS)** on all tables
- ✅ **Automatic triggers** for:
  - Creating user profiles on signup
  - Updating timestamps
  - Calculating locations from lat/lng
  - Phone number validation
- ✅ **Real-time subscriptions** for live updates
- ✅ **Storage buckets** for images and videos
- ✅ **Notification system** with preferences
- ✅ **Labour search functions** with geospatial queries

### Indexes (50+)
Optimized indexes for:
- Location-based queries (GIST indexes)
- User lookups
- Equipment searches
- Booking queries
- Message retrieval
- Notification filtering

---

## 🔍 Troubleshooting

### Issue: "Database error saving new user"

**Solution:**
The `handle_new_user()` trigger should be created. Verify with:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

If missing, re-run the COMPLETE_DATABASE_SETUP.sql script.

---

### Issue: "Table does not exist"

**Solution:**
Check if all tables were created:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

If tables are missing, re-run the SQL script.

---

### Issue: "Permission denied for table"

**Solution:**
RLS policies might be too restrictive. Check policies:
```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

Or temporarily disable RLS for testing (NOT for production):
```sql
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
```

---

### Issue: "Storage bucket not found"

**Solution:**
Create buckets manually in Supabase Dashboard → Storage:
1. Click "New Bucket"
2. Name: `avatars` (or `equipment-images`, `equipment-videos`)
3. Set as Public
4. Add file size limits and MIME types

---

### Issue: "Realtime not working"

**Solution:**
1. Enable Realtime in Dashboard → Database → Replication
2. Toggle on for: `bookings`, `equipment`, `messages`, `notifications`
3. Restart your app

---

## 📚 Database Schema Overview

```
auth.users (Supabase built-in)
    ↓
user_profiles (1:1) - Basic profile info
    ↓
user_roles (1:N) - Multiple roles per user
    ↓
equipment (1:N) - User owns equipment
    ↓
bookings (1:N) - Equipment bookings
    ↓
reviews (1:1) - Review per booking
    ↓
payments (1:N) - Payment records

labour_profiles (1:1) - Labour worker profile
    ↓
labour_bookings (1:N) - Labour hirings

notifications (1:N) - User notifications
    ↓
notification_preferences (1:1) - User settings
```

---

## 🎯 Next Steps

1. **✅ Database Setup** - DONE (you're here!)
2. **Configure App** - Update `.env.local` with Supabase credentials
3. **Test Authentication** - Sign up a test user
4. **Add Sample Data** - Create test equipment listings
5. **Test Features** - Try booking, messaging, notifications
6. **Deploy** - Push to production when ready

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **AgriServe Docs**: Check `/docs` folder
- **Issues**: Create an issue on GitHub
- **SQL Reference**: Check individual migration files in `/supabase/migrations/`

---

## 🎉 Success Checklist

Before moving forward, verify:

- [ ] SQL script executed without errors
- [ ] All 13 tables created
- [ ] RLS enabled on all tables
- [ ] Email authentication enabled
- [ ] Realtime enabled for key tables
- [ ] Storage buckets created (avatars, equipment-images, equipment-videos)
- [ ] `.env.local` updated with Supabase credentials
- [ ] Test user signup works
- [ ] User profile automatically created on signup

**If all checked, you're ready to go! 🚀**

---

## 📝 Migration History Reference

If you need to understand what each migration does, here's the order:

1. `001_initial_schema.sql` - Core tables (users, equipment, bookings)
2. `002_labour_profiles.sql` - Labour marketplace tables
3. `003_labour_rpc_functions.sql` - Geospatial search functions
4. `004_audit_logs.sql` - Audit logging system
5. `005_payment_fields.sql` - Razorpay payment integration
6. `006_enable_realtime.sql` - Real-time subscriptions
7. `007_add_phone_mandatory.sql` - Phone validation
8. `008_setup_storage.sql` - Image storage buckets
9. `009_setup_video_storage.sql` - Video storage bucket
10. `010_add_equipment_video_url.sql` - Video field for equipment
11. `011_notification_system.sql` - Complete notification system
12. `013_add_handle_new_user_trigger_COMPLETE.sql` - Auto user profile creation

**The COMPLETE_DATABASE_SETUP.sql file includes ALL of these in the correct order.**

---

**Last Updated**: January 2026
**Database Version**: 1.0.0
**Compatible With**: AgriServe Web App v1.0.0

---

## 🔒 Security Notes

- ✅ All tables have Row Level Security (RLS) enabled
- ✅ Users can only access their own data
- ✅ Storage policies enforce access control
- ✅ Functions use SECURITY DEFINER where needed
- ✅ Passwords are never stored in database (handled by Supabase Auth)
- ✅ API keys should never be committed to git
- ✅ Use environment variables for all sensitive data

---

**Happy Coding! 🌾**