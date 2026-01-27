# Labour Profile Setup Guide

## Issue
You're getting "Failed to create profile: {}" when trying to create a labour profile.

## Root Cause
The labour profile database tables and RPC functions haven't been set up in your Supabase database yet.

## Solution

### Option 1: Run Individual Migrations (Recommended)

Go to your Supabase SQL Editor and run these migrations in order:

1. **Create Labour Tables** - Run `supabase/migrations/002_labour_profiles.sql`
   - Creates `labour_profiles` table
   - Creates `labour_bookings` table
   - Sets up RLS policies

2. **Create Labour RPC Functions** - Run `supabase/migrations/003_labour_rpc_functions.sql`
   - Creates `create_labour_profile()` function
   - Creates `update_labour_profile_with_location()` function
   - Creates `search_labour_nearby()` function
   - Creates `count_labour_nearby()` function

### Option 2: Run Complete Setup (All-in-One)

Run `supabase/migrations/COMPLETE_LABOUR_SETUP.sql` which includes everything.

## Steps to Apply Migrations

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the content from the migration file
6. Paste it into the editor
7. Click **Run** (or press Ctrl+Enter)

## Verify Setup

After running the migrations, verify they worked:

```sql
-- Check if labour_profiles table exists
SELECT * FROM labour_profiles LIMIT 1;

-- Check if create_labour_profile function exists
SELECT proname FROM pg_proc WHERE proname = 'create_labour_profile';
```

## Test the Feature

1. Restart your dev server
2. Go to `/provider/labour/create`
3. Fill out the form
4. Click "Create Profile"
5. You should see "Labour profile created successfully!"

## Troubleshooting

### Error: "relation labour_profiles does not exist"
- Run migration 002_labour_profiles.sql

### Error: "function create_labour_profile does not exist"
- Run migration 003_labour_rpc_functions.sql

### Error: "permission denied"
- Make sure you're logged in as an authenticated user
- Check that RLS policies are set up correctly

### Still having issues?
- Check the browser console for detailed error messages
- Check Supabase logs in the dashboard
- Verify your .env.local has correct Supabase credentials
