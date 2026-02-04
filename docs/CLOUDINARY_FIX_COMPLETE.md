# Cloudinary Admin Panel - Complete Fix Guide

## Issue Summary

Admin panel at `/admin/media/cloudinary` shows nothing, with error: `Fetch failed: {}`

## Root Causes Identified

### 1. **Missing Database Table** ⚠️ PRIMARY ISSUE

The `media_audit_logs` table doesn't exist in your Supabase database, causing the API to hang when trying to create audit logs.

### 2. **Admin Role Mismatch** (Fixed)

Database had only `'admin'` role, RBAC code expected specific admin types. ✅ Fixed by updating RBAC to support both.

### 3. **Missing Admin Role Assignment**

Your user needs an admin role in the `user_roles` table to access the panel.

## Complete Fix (3 Steps)

### Step 1: Run Database Migrations

Open your **Supabase SQL Editor** and run these migrations in order:

#### A. Add Admin Role Types

```sql
-- File: supabase/migrations/20260202010000_add_admin_role_types.sql

ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check
CHECK (role IN ('renter', 'provider', 'labour', 'admin', 'super_admin', 'moderator', 'support_admin'));

CREATE INDEX IF NOT EXISTS idx_user_roles_admin
ON public.user_roles(user_id, role)
WHERE role IN ('admin', 'super_admin', 'moderator', 'support_admin');
```

#### B. Create Media Audit Logs Table

```sql
-- File: supabase/migrations/20260202000000_create_media_audit_logs.sql

CREATE TABLE IF NOT EXISTS media_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_email TEXT,
    admin_role TEXT NOT NULL CHECK (admin_role IN ('super_admin', 'moderator', 'support_admin')),
    action TEXT NOT NULL CHECK (action IN (
        'view', 'delete', 'bulk_delete', 'rename', 'replace',
        'flag', 'unflag', 'disable', 'enable', 'add_moderation_note', 'view_analytics'
    )),
    public_id TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'raw')),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_audit_logs_admin_id ON media_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_media_audit_logs_public_id ON media_audit_logs(public_id);
CREATE INDEX IF NOT EXISTS idx_media_audit_logs_action ON media_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_media_audit_logs_created_at ON media_audit_logs(created_at DESC);

ALTER TABLE media_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON media_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'moderator', 'support_admin', 'admin')
            AND is_active = true
        )
    );

CREATE POLICY "System can insert audit logs" ON media_audit_logs
    FOR INSERT
    WITH CHECK (true);
```

### Step 2: Grant Admin Access

Replace `your-email@example.com` with your actual email:

```sql
-- Grant super_admin role to your user
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'super_admin', true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role)
DO UPDATE SET is_active = true;

-- Verify it was set
SELECT
  u.email,
  ur.role,
  ur.is_active,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com'
  AND ur.role IN ('admin', 'super_admin');
```

### Step 3: Restart & Test

1. **Restart your dev server:**

   ```bash
   # Stop any running dev servers
   # Then start fresh
   npm run dev
   ```

2. **Clear browser cache** (optional but recommended):
   - Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

3. **Test the admin panel:**
   - Navigate to: `http://localhost:3002/admin/media/cloudinary`
   - You should now see your Cloudinary assets (99 assets found!)

## Verification

### Check API Response

```bash
curl http://localhost:3002/api/admin/cloudinary/assets
```

Should return JSON with `success: true` and list of assets.

### Check Browser Console

Should see:

```
Fetching Cloudinary assets from: /api/admin/cloudinary/assets?...
Response status: 200
```

## Cloudinary Assets Found

✅ Your Cloudinary has **99 assets** including:

- Equipment images in `agri-serve/equipment/`
- Sample media
- Various other folders

## Files Modified

1. `src/lib/utils/admin-rbac.ts` - Updated to support both `'admin'` and specific admin roles
2. `src/app/api/admin/cloudinary/assets/route.ts` - Made audit logging non-blocking
3. Created migrations for database schema updates

## Troubleshooting

### Still showing nothing?

1. Check browser console for errors
2. Verify you're logged in with the admin email
3. Check Network tab - does the API call return 200 or 401/403?
4. Verify the migrations ran successfully in Supabase

### API returns 401 Unauthorized?

- Run the "Grant Admin Access" SQL again
- Make sure you're logged in with the correct email
- Check `user_roles` table to verify the role exists

### API times out?

- Check if `media_audit_logs` table exists
- The audit logging should now be non-blocking, but verify table creation

## Architecture Notes

- **Media Storage:** Cloudinary (files, images, videos)
- **Authentication:** Supabase (users, roles, permissions)
- **Audit Logs:** Supabase (tracks admin actions)
- **Admin Panel:** Next.js frontend → API routes → Cloudinary SDK

The admin panel authenticates via Supabase, then fetches media from Cloudinary.
