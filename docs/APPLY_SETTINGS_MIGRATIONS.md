# Apply Settings Migrations

## Quick Setup Guide

You need to apply the database migrations to create the required tables. Follow these steps:

## Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Run Migration 023**
   - Open file: `supabase/migrations/023_admin_settings_tables.sql`
   - Copy the ENTIRE contents
   - Paste into SQL Editor
   - Click "Run" button

4. **Copy and Run Migration 024**
   - Open file: `supabase/migrations/024_public_settings_access.sql`
   - Copy the ENTIRE contents
   - Paste into SQL Editor
   - Click "Run" button

5. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - You should see these new tables:
     - `system_settings`
     - `maintenance_mode`
     - `user_sessions`
     - `system_health_logs`

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project root
cd /path/to/your/project

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Option 3: Manual SQL Execution

If you prefer to run SQL manually, here's the complete SQL to execute:

### Step 1: Create Tables and Functions

```sql
-- Copy the ENTIRE content from:
-- supabase/migrations/023_admin_settings_tables.sql
-- and run it in your Supabase SQL Editor
```

### Step 2: Enable Public Access

```sql
-- Copy the ENTIRE content from:
-- supabase/migrations/024_public_settings_access.sql
-- and run it in your Supabase SQL Editor
```

## Verification

After running the migrations, verify everything is set up correctly:

### 1. Check Tables Exist

Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('system_settings', 'maintenance_mode', 'user_sessions', 'system_health_logs');
```

You should see 4 rows returned.

### 2. Check Default Settings

Run this query:
```sql
SELECT * FROM system_settings;
```

You should see default settings like:
- platform_name
- platform_version
- support_email
- support_phone
- business_address
- social_links

### 3. Test Public Access

Run this query (should work without admin role):
```sql
SELECT * FROM system_settings WHERE category IN ('general', 'contact');
```

## Troubleshooting

### Error: "relation already exists"
This means the table is already created. You can skip that migration or drop the table first:
```sql
DROP TABLE IF EXISTS system_settings CASCADE;
-- Then run the migration again
```

### Error: "permission denied"
Make sure you're running the SQL as a superuser or service_role in Supabase.

### Error: "function does not exist"
Make sure you ran migration 023 completely. The RPC functions are defined there.

## What Gets Created

### Tables:
1. **system_settings** - Stores all system configuration
2. **maintenance_mode** - Manages maintenance mode settings
3. **user_sessions** - Tracks active user sessions
4. **system_health_logs** - Logs system health metrics

### RPC Functions:
- `get_system_settings()` - Fetch settings
- `update_system_setting()` - Update a setting
- `get_maintenance_mode()` - Get maintenance status
- `update_maintenance_mode()` - Update maintenance
- `get_active_sessions()` - List active sessions
- `revoke_session()` - Revoke a session
- `force_logout_all_users()` - Logout all users
- `log_system_health()` - Log health metrics
- `get_system_health_metrics()` - Get health data

### RLS Policies:
- Public read access for contact/general settings
- Admin-only write access
- Users can view their own sessions

## After Migration

Once migrations are applied:

1. **Restart your dev server** (if running)
   ```bash
   npm run dev
   ```

2. **Test the admin settings page**
   ```
   http://localhost:3001/admin/settings
   ```

3. **Update contact information**
   - Go to Settings → General tab
   - Click Edit
   - Change email, phone, address
   - Click Save

4. **Verify changes appear**
   - Check footer on homepage
   - Check contact page
   - Should show your updated information

## Need Help?

If you encounter any issues:

1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify you're logged in as admin
4. Make sure migrations ran completely without errors

## Quick Test Query

Run this to test everything is working:

```sql
-- Insert a test setting
INSERT INTO system_settings (key, value, category)
VALUES ('test_setting', '"test_value"', 'general')
ON CONFLICT (key) DO UPDATE SET value = '"test_value"';

-- Read it back
SELECT * FROM system_settings WHERE key = 'test_setting';

-- Clean up
DELETE FROM system_settings WHERE key = 'test_setting';
```

If this works, your setup is complete! ✅
