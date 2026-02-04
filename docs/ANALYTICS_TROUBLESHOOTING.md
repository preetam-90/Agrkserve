# Analytics Dashboard Troubleshooting

## Current Status
The analytics page is now designed to work with **graceful fallback**:
- ✅ Shows mock data if database functions don't exist
- ✅ Shows real data once migration is applied
- ✅ Detailed error logging in browser console

## How to Check What's Happening

### 1. Open Browser Console
- Press F12 or right-click → Inspect
- Go to Console tab
- Look for messages starting with:
  - `"Analytics data fetched:"` (success)
  - `"RPC Error (get_platform_analytics):"` (database error)
  - `"Failed to fetch analytics. Using mock data."` (fallback mode)

### 2. Check the Error Details
The console will show you exactly what's wrong:

**Common Errors:**

#### Error: "function get_platform_analytics() does not exist"
**Solution:** Run the migration in Supabase SQL Editor
- See: `ANALYTICS_MIGRATION_GUIDE.md`

#### Error: "permission denied for function get_platform_analytics"
**Solution:** Your user doesn't have admin role
```sql
-- Check your roles
SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';

-- Add admin role if missing
INSERT INTO user_roles (user_id, role, is_active)
VALUES ('YOUR_USER_ID', 'admin', true);
```

#### Error: "column does not exist" or "relation does not exist"
**Solution:** Your database schema is incomplete
- Check that all tables exist: `user_profiles`, `user_roles`, `equipment`, `bookings`, `disputes`
- Run earlier migrations if needed

#### Error: "syntax error at or near..."
**Solution:** The migration SQL has syntax errors
- Make sure you copied the ENTIRE migration file
- Check that `$$` delimiters are intact (not just `$`)
- Re-run the migration from `supabase/migrations/019_analytics_rpc_functions.sql`

## Testing the Functions Manually

### Test in Supabase SQL Editor

```sql
-- Test 1: Check if functions exist
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_name IN ('get_platform_analytics', 'get_revenue_stats');

-- Expected: 2 rows showing both functions

-- Test 2: Run analytics function
SELECT get_platform_analytics();

-- Expected: JSON object with all metrics

-- Test 3: Run revenue stats function
SELECT get_revenue_stats('week');
SELECT get_revenue_stats('month');
SELECT get_revenue_stats('year');

-- Expected: JSON object with labels, values, and total
```

### Test from Browser Console

```javascript
// Open browser console on analytics page and run:

// Test analytics fetch
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);

const { data, error } = await supabase.rpc('get_platform_analytics');
console.log('Data:', data);
console.log('Error:', error);
```

## Current Behavior

### Before Migration Applied
- Page loads successfully
- Shows mock data:
  - Total Users: 3,240
  - Total Revenue: ₹12,45,000
  - Total Bookings: 1,482
  - etc.
- Console shows: "Failed to fetch analytics. Using mock data."
- **This is expected and OK!** The page is functional.

### After Migration Applied
- Page loads successfully
- Shows REAL data from your database
- Console shows: "Analytics data fetched: {...}"
- Charts display actual revenue trends
- All metrics are live

## Quick Fixes

### Fix 1: Clear Browser Cache
Sometimes old data gets cached:
```
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear cache: Settings → Privacy → Clear browsing data
```

### Fix 2: Re-run Migration
If you're not sure if it ran correctly:
```sql
-- Drop and recreate
DROP FUNCTION IF EXISTS get_platform_analytics();
DROP FUNCTION IF EXISTS get_revenue_stats(TEXT);

-- Then paste the full migration from:
-- supabase/migrations/019_analytics_rpc_functions.sql
```

### Fix 3: Check Supabase Connection
Make sure your `.env` file has correct values:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Still Not Working?

1. **Check browser console** for the exact error message
2. **Check Supabase logs** in your dashboard
3. **Verify your user has admin role** in the database
4. **Make sure all tables exist** (user_profiles, bookings, equipment, etc.)
5. **Try the manual SQL tests** above to isolate the issue

## Contact Points

If you're still stuck, provide:
- The exact error message from browser console
- The result of running the SQL tests above
- Your Supabase project version
- Whether you're using local Supabase or cloud
