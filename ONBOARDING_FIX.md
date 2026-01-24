# 🔧 ONBOARDING FIX - Duplicate Role Error

## Problem
When completing the onboarding setup, users were getting this error:
```
duplicate key value violates unique constraint "user_roles_user_id_role_key"
```

## Root Cause
The `upsertProfile` function was trying to insert roles into the `user_roles` table, but if a role already existed (from a previous attempt or automatic trigger), the insert would fail because of the UNIQUE constraint on `(user_id, role)`.

## Solution Applied

### Changed in `src/lib/services/auth-service.ts`

**1. Updated `addUserRole` function to handle duplicates gracefully:**

```typescript
async addUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    const { error } = await supabase.from('user_roles').insert({
      user_id: userId,
      role: role,
      is_active: true,
    });

    if (error) {
      // Ignore duplicate key errors (role already exists)
      if (error.code === '23505') {
        console.log(`Role ${role} already exists for user ${userId}`);
        return; // ✅ Silently ignore - role already exists
      }
      if (error.code === '42P01') {
        console.warn('user_roles table does not exist yet');
        return;
      }
      throw error;
    }
  } catch (error: unknown) {
    const pgError = error as PostgresError;
    // Ignore duplicate key errors
    if (pgError.code === '23505') {
      console.log(`Role ${role} already exists for user ${userId}`);
      return; // ✅ Silently ignore
    }
    if (pgError.code === '42P01') {
      console.warn('user_roles table does not exist yet');
      return;
    }
    throw error;
  }
}
```

**Key Changes:**
- ✅ Error code `23505` (unique constraint violation) is now caught and ignored
- ✅ Changed from `upsert` to `insert` for clarity
- ✅ Returns silently when role already exists instead of throwing error

**2. Updated `upsertProfile` to call `addUserRole` for each role:**

```typescript
async upsertProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // First, upsert the profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        console.warn('user_profiles table does not exist yet');
        return null;
      }
      throw error;
    }

    // If roles are provided, add them to user_roles table
    if (profile.roles && Array.isArray(profile.roles)) {
      for (const role of profile.roles) {
        await this.addUserRole(userId, role as UserRole); // ✅ Won't fail on duplicates
      }
    }

    return data;
  } catch (error: unknown) {
    const pgError = error as PostgresError;
    if (pgError.code === '42P01') {
      console.warn('user_profiles table does not exist yet');
      return null;
    }
    throw error;
  }
}
```

## PostgreSQL Error Codes Handled

| Code | Meaning | How We Handle |
|------|---------|---------------|
| `23505` | Unique constraint violation | ✅ Ignore - role already exists |
| `42P01` | Table does not exist | ⚠️ Warn and return null |
| Others | Various errors | ❌ Throw error to user |

## Testing

### Before Fix
```
❌ Error: duplicate key value violates unique constraint
```

### After Fix
```
✅ Profile created successfully!
✅ Redirects to appropriate dashboard
```

## What Happens Now

1. User completes onboarding
2. System tries to insert role into `user_roles` table
3. If role already exists:
   - **Before:** ❌ Error thrown, onboarding fails
   - **After:** ✅ Silently ignored, onboarding succeeds
4. User gets redirected to dashboard

## Database Schema Reference

```sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('renter', 'provider', 'labour', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role) -- ⚠️ This constraint was causing the issue
);
```

## Additional Notes

- The `user_profiles` table has a `roles` TEXT[] field for quick access
- The `user_roles` table is the source of truth for role management
- Both tables stay in sync
- RLS policies on `user_roles` allow users to manage their own roles

## Related Files

- `src/lib/services/auth-service.ts` - Main auth service with the fix
- `src/app/onboarding/page.tsx` - Onboarding UI that calls upsertProfile
- `supabase/migrations/001_initial_schema.sql` - Database schema

## Prevention

To prevent this in the future:
1. Always use the `addUserRole` function instead of direct inserts
2. Function now handles duplicates gracefully
3. Test onboarding with multiple attempts to ensure idempotency

---

**Status:** ✅ Fixed
**Date:** January 2026
**Impact:** All users can now complete onboarding successfully, even if they retry