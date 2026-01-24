# Fix: "Failed to create profile" Error

## Problem
When trying to create a labour profile at `/provider/labour/create`, you get the error:
```
Failed to create profile: {}
```

## Root Cause
The labour profile database tables and functions haven't been set up in your Supabase database yet.

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project: `csmylqtojxzmdbkaexqu`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Setup Script
1. Open the file: `agri-serve-web/COMPLETE_LABOUR_SETUP_FIXED.sql`
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for it to complete (should take 5-10 seconds)

**Note:** This script automatically cleans up any existing functions first, so it's safe to run even if you've tried before.

### Step 3: Verify It Worked
You should see success messages in the SQL Editor output:
```
✅ Labour profile setup completed successfully!
Tables: labour_profiles, labour_bookings
Functions: create_labour_profile, update_labour_profile_with_location, search_labour_nearby, count_labour_nearby
```

### Step 4: Test the Feature
1. Go back to your app
2. Navigate to `/provider/labour/create`
3. Fill out the form:
   - Add at least one skill (required)
   - Enter a daily rate (required)
   - Enter your city/town (required)
   - Optionally click the location button to get your coordinates
4. Click **Create Profile**
5. You should see: "Labour profile created successfully!" ✅

## What This Script Does

The `COMPLETE_LABOUR_SETUP_FIXED.sql` script:
1. **Cleans up** any existing labour functions (fixes the "function name not unique" error)
2. Creates the `labour_profiles` table to store worker profiles
3. Creates the `labour_bookings` table to manage bookings
4. Sets up PostGIS geography for location-based searches
5. Creates RPC functions for creating and searching profiles
6. Enables Row Level Security (RLS) for data protection
7. Grants proper permissions to authenticated users

## Common Errors Fixed

### ✅ "function name is not unique"
The new script automatically drops existing functions before creating new ones.

### ✅ "relation labour_profiles does not exist"
The script creates all necessary tables.

### ✅ "permission denied"
The script grants proper permissions to authenticated users.

## Troubleshooting

### Still getting errors?
Check the browser console (F12) for more detailed error messages. The improved error logging will now show:
- The actual error message from Supabase
- Full error details in JSON format

### Error: "permission denied for function create_labour_profile"
- Make sure you're logged in to the app
- The script grants permissions to authenticated users only

### Error: "duplicate key value violates unique constraint"
- You already have a labour profile
- Go to `/provider/labour` to view/edit your existing profile

### Error: "relation labour_profiles does not exist"
- The SQL script didn't run successfully
- Check for error messages in the Supabase SQL Editor
- Try running the script again

## Alternative: Run Individual Migrations

If you prefer to run migrations separately:
1. Run `supabase/migrations/002_labour_profiles.sql` (creates tables)
2. Run `supabase/migrations/003_labour_rpc_functions.sql` (creates functions)

## Need Help?
- Check Supabase logs in your dashboard
- Look at browser console for detailed errors
- Verify your `.env.local` has correct Supabase credentials
