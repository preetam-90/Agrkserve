# Database Setup Guide - Fix "Database error saving new user"

This guide will help you fix the authentication error by setting up your Supabase database correctly.

## 🚨 Current Issue

**Error:** "Database error saving new user"
**Cause:** Missing database tables or incorrect Supabase configuration

## 🔧 Solution Steps

### Step 1: Set Up Environment Variables

1. **Get your Supabase credentials:**
   - Go to [supabase.com](https://supabase.com) and sign in
   - Go to your project dashboard
   - Navigate to **Settings → API**
   - Copy your Project URL and anon/public key

2. **Create `.env.local` file in the root directory:**

   ```bash
   # agro/agri-serve-web/.env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Restart your development server:**
   ```bash
   # Stop current server (Ctrl+C)
   pnpm dev
   ```

### Step 2: Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. **Go to SQL Editor:**
   - In your Supabase dashboard → **SQL Editor**

2. **Run migrations in this exact order:**

   **First - Run `001_initial_schema.sql`:**
   - Copy content from `supabase/migrations/001_initial_schema.sql`
   - Paste in SQL Editor and click "Run"

   **Second - Run `013_add_handle_new_user_trigger_COMPLETE.sql`:**
   - Copy content from `supabase/migrations/013_add_handle_new_user_trigger_COMPLETE.sql`
   - Paste in SQL Editor and click "Run"

   **Third - Run `008_setup_storage.sql`:**
   - Copy content from `supabase/migrations/008_setup_storage.sql`
   - Paste in SQL Editor and click "Run"

**Option B: Using Supabase CLI**

If you have Supabase CLI installed:

```bash
# Navigate to project directory
cd agro/agri-serve-web

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Step 3: Configure Authentication

1. **Enable Email Authentication:**
   - Supabase Dashboard → **Authentication → Settings**
   - Under "Auth Providers" → Enable **Email**

2. **Add Site URL:**
   - In Authentication Settings
   - **Site URL:** `http://localhost:3001`
   - **Redirect URLs:** `http://localhost:3001/auth/callback`

3. **Optional - Enable Google OAuth:**
   - Under "Auth Providers" → Enable **Google**
   - Add your Google OAuth credentials

### Step 4: Verify Setup

1. **Check Tables Created:**
   - Supabase Dashboard → **Table Editor**
   - You should see these tables:
     - `user_profiles`
     - `user_roles`
     - `equipment`
     - `bookings`
     - `reviews`
     - `messages`
     - `notifications`
     - `payments`

2. **Test User Creation:**
   - Go to `http://localhost:3001/login`
   - Click "Sign Up"
   - Try creating a new account
   - Should work without database errors

## 🔍 Troubleshooting

### "Still getting database errors"

- Check your `.env.local` file exists and has correct values
- Verify Supabase project URL and key are correct
- Make sure you ran the migrations in the correct order

### "Tables don't exist"

- Re-run `001_initial_schema.sql` in SQL Editor
- Check for any error messages in the SQL Editor

### "Trigger errors"

- Re-run `013_add_handle_new_user_trigger_COMPLETE.sql`
- This creates the function that handles new user signups

### "Storage errors"

- Run `008_setup_storage.sql` to create storage buckets
- Check Authentication → Settings → Site URL is correct

## ✅ Expected Result

After completing these steps:

- New user signup should work without errors
- User profiles will be automatically created
- Authentication flow will work properly
- You can proceed with testing the application

## 🆘 If Still Having Issues

1. **Check browser console** for specific error messages
2. **Check Supabase logs** in Dashboard → Logs
3. **Verify environment variables** are loaded (restart dev server)
4. **Check Network tab** in browser DevTools for API calls

## 📝 Quick Commands Reference

```bash
# Restart development server
pnpm dev

# Check if environment variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL

# Test database connection (if using CLI)
supabase db ping
```

---

**Status:** Run these steps to fix the authentication error
**Priority:** High - Required for user signup/login
**Time:** ~10-15 minutes
