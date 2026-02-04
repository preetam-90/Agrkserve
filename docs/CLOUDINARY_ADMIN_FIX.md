# Cloudinary Admin Panel Fix

## Problem

The Cloudinary admin panel was showing "Fetch failed: {}" error because the API authentication was failing. The issue was a mismatch between the database schema and the RBAC code:

- **Database had:** `'admin'` role
- **RBAC code expected:** `'super_admin'`, `'moderator'`, or `'support_admin'`

## Solution

### 1. Database Migration

Created migration to extend user_roles table to support granular admin roles:

- File: `supabase/migrations/20260202010000_add_admin_role_types.sql`
- Adds support for: `'super_admin'`, `'moderator'`, `'support_admin'` in addition to existing `'admin'`

### 2. RBAC Utility Update

Updated `src/lib/utils/admin-rbac.ts` to:

- Check for specific admin role types first
- Fall back to generic `'admin'` role for backward compatibility
- Map `'admin'` → `'super_admin'` automatically for permissions

### 3. Grant Admin Access

Created helper script to grant admin access:

- File: `supabase/migrations/GRANT_ADMIN_ACCESS.sql`
- Replace email in script and run in Supabase SQL Editor

## Steps to Fix

1. **Run the migration:**

   ```sql
   -- In Supabase SQL Editor, run:
   -- supabase/migrations/20260202010000_add_admin_role_types.sql
   ```

2. **Grant admin role to your user:**

   ```sql
   -- Edit GRANT_ADMIN_ACCESS.sql with your email
   -- Then run it in Supabase SQL Editor
   ```

3. **Restart dev server** (if running)

4. **Test:** Visit `/admin/media/cloudinary` - should now load without errors

## Technical Details

The fix maintains backward compatibility:

- Existing users with `role='admin'` continue to work (auto-mapped to super_admin)
- New granular roles (`super_admin`, `moderator`, `support_admin`) work as designed
- No data migration needed for existing admin users
