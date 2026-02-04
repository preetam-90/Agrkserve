# Fix Audit Logs Admin Access

## Problem
The admin logs page at `/admin/logs` shows no data because the `audit_logs` table has RLS policies that only allow users to view their own logs. Admins need permission to view ALL logs.

## Solution
Apply the migration that adds admin access policies to the `audit_logs` table.

## Steps to Fix

### Option 1: Apply via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/021_fix_audit_logs_admin_access.sql`
4. Click **Run**

### Option 2: Apply via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## What This Migration Does

1. **Drops the restrictive policy** that only allowed users to view their own logs
2. **Adds admin policy** that allows users with admin roles to view ALL logs:
   - `admin`
   - `super_admin`
   - `moderator`
   - `support_admin`
3. **Re-adds user policy** so regular users can still view their own logs
4. **Updates insert policy** to allow authenticated users to create audit logs

## Verify the Fix

After applying the migration:

1. Make sure you have an admin role assigned:
   ```sql
   -- Check your roles
   SELECT * FROM user_roles WHERE user_id = auth.uid();
   ```

2. If you don't have an admin role, add it:
   ```sql
   -- Replace 'your-email@example.com' with your actual email
   INSERT INTO public.user_roles (user_id, role, is_active)
   SELECT id, 'admin', true
   FROM auth.users
   WHERE email = 'your-email@example.com'
   ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;
   ```

3. Refresh the admin logs page at `http://localhost:3001/admin/logs`

## Additional: Seed Some Test Data

If the table is empty, you can add some test audit logs:

```sql
-- Insert test audit logs
INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
VALUES
    (auth.uid(), 'CREATE', 'equipment', uuid_generate_v4(), '{"name": "Test Tractor"}'),
    (auth.uid(), 'UPDATE', 'user_profile', auth.uid(), '{"field": "name", "old": "John", "new": "John Doe"}'),
    (auth.uid(), 'DELETE', 'booking', uuid_generate_v4(), '{"reason": "cancelled by user"}');
```

## Troubleshooting

### Still no data showing?

1. **Check if you're logged in as admin:**
   ```sql
   SELECT ur.role, ur.is_active
   FROM user_roles ur
   WHERE ur.user_id = auth.uid();
   ```

2. **Check if audit_logs table has data:**
   ```sql
   SELECT COUNT(*) FROM audit_logs;
   ```

3. **Check browser console** for any error messages

4. **Verify RLS policies are applied:**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE tablename = 'audit_logs';
   ```
