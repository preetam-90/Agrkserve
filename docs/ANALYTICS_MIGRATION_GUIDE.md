# Analytics Dashboard Migration Guide

## Issue
The analytics dashboard shows: **"column 'status' does not exist"**

This is because the SQL migration was using incorrect column names for your database schema.

## Solution - FIXED MIGRATION

### Step 1: Drop Old Functions

Run this in Supabase SQL Editor first:

```sql
DROP FUNCTION IF EXISTS get_platform_analytics();
DROP FUNCTION IF EXISTS get_revenue_stats(TEXT);
```

### Step 2: Run the FIXED Migration

The migration has been updated to use the correct column names:
- `equipment.is_available` instead of `equipment.status`
- Handles missing `disputes` table gracefully

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/_/sql

2. **Copy the FIXED Migration SQL**
   - Open: `supabase/migrations/019_analytics_rpc_functions.sql`
   - Copy ALL contents

3. **Run the Migration**
   - Paste into SQL Editor
   - Click "Run"
   - Wait for "Success" message

### Step 3: Verify It Works

Run this test query:
```sql
-- Test analytics function
SELECT get_platform_analytics();

-- Test revenue stats
SELECT get_revenue_stats('month');
```

Both should return JSON data without errors.

### Step 4: Refresh Your Page

- Go to: http://localhost:3001/admin/analytics
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- You should now see REAL data from your database!

## What This Migration Does

Creates two PostgreSQL functions:

### 1. `get_platform_analytics()`
Returns comprehensive platform statistics:
- Total users, farmers, providers, labour
- Total equipment and bookings
- Completed bookings and revenue
- Active disputes

### 2. `get_revenue_stats(p_period TEXT)`
Returns revenue data for charts:
- **'week'**: Last 7 days (daily breakdown)
- **'month'**: Last 4 weeks (weekly breakdown)
- **'year'**: Last 12 months (monthly breakdown)

## Current Behavior

**Before Migration:**
- Analytics page shows mock/fallback data
- Console shows "Failed to fetch analytics" error

**After Migration:**
- Analytics page displays real data from your database
- Charts show actual revenue trends
- All metrics are live and accurate

## Fallback Data

The page is designed to work even without the migration by showing mock data:
- Total Users: 3,240
- Total Revenue: ₹12,45,000
- Total Bookings: 1,482
- And more...

This ensures the UI is always functional while you set up the database functions.

## Troubleshooting

### Error: "function get_platform_analytics() does not exist"
- The migration hasn't been applied yet
- Follow Option 1 above to apply it manually

### Error: "permission denied for function"
- Make sure you're logged in as an admin user
- Check that your user has the 'admin' role in the `user_roles` table

### Still seeing mock data after migration
- Clear your browser cache
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for any errors

## Need Help?

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your database connection in `.env`
3. Ensure your user has admin privileges
4. Check Supabase logs for any database errors
