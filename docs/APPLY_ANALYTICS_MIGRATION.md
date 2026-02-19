# Apply Analytics Migration via Supabase CLI

Since you're logged in with Supabase CLI, you can apply the migration directly:

## Option 1: Push All Pending Migrations (Recommended)

```bash
supabase db push
```

This will apply all migrations in the `supabase/migrations/` folder that haven't been applied yet, including the analytics functions.

## Option 2: Apply Specific Migration File

```bash
supabase db execute --file supabase/migrations/019_analytics_rpc_functions.sql
```

This applies only the analytics migration file.

## Option 3: Link and Push (If not linked yet)

```bash
# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Verify the Migration

After running the migration, verify it worked:

```bash
# Check if functions exist
supabase db execute --query "
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('get_platform_analytics', 'get_revenue_stats');
"

# Test the analytics function
supabase db execute --query "SELECT get_platform_analytics();"

# Test the revenue stats function
supabase db execute --query "SELECT get_revenue_stats('month');"
```

## Expected Output

You should see:

- ✅ Two functions listed (get_platform_analytics, get_revenue_stats)
- ✅ JSON data with your platform metrics
- ✅ JSON data with revenue labels, values, and total

## After Migration

1. **Refresh your analytics page**: http://localhost:3001/admin/analytics
2. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check console**: Should show "Analytics data fetched: {...}" instead of errors

## Troubleshooting

### Error: "relation does not exist"

Some tables might be missing. Check which tables exist:

```bash
supabase db execute --query "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
"
```

### Error: "permission denied"

Grant permissions manually:

```bash
supabase db execute --query "
GRANT EXECUTE ON FUNCTION get_platform_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_stats(TEXT) TO authenticated;
"
```

### Still seeing mock data?

Clear browser cache and check console for specific errors.
