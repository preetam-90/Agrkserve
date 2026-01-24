# Troubleshooting: "Database error saving new user"

## 🔴 Error Details

**Error Type:** `AuthApiError`  
**Error Message:** "Database error saving new user"  
**Location:** `src/lib/services/auth-service.ts:42:29`

## 🎯 Root Cause

This error occurs when Supabase Auth successfully creates a user in the `auth.users` table, but a database trigger that should automatically create a corresponding profile in `user_profiles` table either:

1. **Doesn't exist**
2. **Is misconfigured**
3. **Lacks proper permissions**
4. **Encounters a database constraint violation**

## ✅ Quick Fix (Recommended)

### Step 1: Run the Fix SQL Script

1. Go to your **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Copy the content from `QUICK_FIX_SIGNUP.sql` in this directory
5. Paste it into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`
7. You should see a success message: ✅ SUCCESS!

### Step 2: Test the Fix

1. Go to your application's signup page
2. Try creating a new account with:
   - Email: `test@example.com`
   - Password: `TestPass123` (must meet requirements)
   - Name: `Test User`
3. If successful, you should be redirected to phone setup or onboarding

---

## 🔍 Detailed Troubleshooting

### Verify the Trigger Exists

Run this in Supabase SQL Editor:

```sql
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';
```

**Expected Result:** One row showing the trigger details  
**If empty:** The trigger doesn't exist - run `QUICK_FIX_SIGNUP.sql`

### Verify the Function Exists

```sql
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';
```

**Expected Result:** One row with `security_type = 'DEFINER'`  
**If empty:** The function doesn't exist - run `QUICK_FIX_SIGNUP.sql`

### Verify user_profiles Table Structure

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
```

**Expected columns:**
- `id` (uuid, NOT NULL)
- `email` (text, nullable)
- `name` (text, nullable)
- `phone` (text, nullable)
- `profile_image` (text, nullable)
- `is_profile_complete` (boolean, default false)
- `preferred_language` (text, default 'en')
- `is_verified` (boolean, default false)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**If different:** Your table structure doesn't match - you may need to run the initial schema migration

### Test Manual Profile Creation

```sql
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.user_profiles (
        id, email, name, is_profile_complete, 
        preferred_language, is_verified, created_at, updated_at
    )
    VALUES (
        test_id, 'manual-test@example.com', 'Manual Test', 
        FALSE, 'en', FALSE, NOW(), NOW()
    );
    
    RAISE NOTICE 'Manual insert successful for ID: %', test_id;
    DELETE FROM public.user_profiles WHERE id = test_id;
    RAISE NOTICE 'Test data cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Manual insert failed: %', SQLERRM;
END $$;
```

**Expected:** "Manual insert successful"  
**If failed:** Check the error message for clues (permissions, constraints, etc.)

---

## 🛠️ Common Issues & Solutions

### Issue 1: Permission Denied

**Error:** `permission denied for table user_profiles`

**Solution:**
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO anon, authenticated, service_role;
GRANT ALL ON public.user_roles TO anon, authenticated, service_role;
```

### Issue 2: Table Doesn't Exist

**Error:** `relation "public.user_profiles" does not exist`

**Solution:** Run the initial schema migration:
```bash
# In your terminal
cd agri-serve-web
cat supabase/migrations/001_initial_schema.sql
```
Copy the output and run it in Supabase SQL Editor.

### Issue 3: RLS Policy Blocking Insert

**Error:** `new row violates row-level security policy`

**Solution:** Temporarily disable RLS to test:
```sql
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
-- Test signup
-- Then re-enable:
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

Or ensure the INSERT policy allows the operation:
```sql
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
```

### Issue 4: Email Confirmation Required

**Symptom:** User is created but you get an error about email confirmation

**This is NOT an error!** Supabase requires email confirmation by default.

**Solutions:**
1. **For Development:** Disable email confirmation in Supabase Dashboard:
   - Go to Authentication → Settings
   - Uncheck "Enable email confirmations"
   
2. **For Production:** Keep it enabled and inform users to check their email

### Issue 5: Password Too Weak

**Error:** `Password must be at least 8 characters long` (or similar)

**Solution:** Ensure password meets requirements:
- ✅ At least 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter  
- ✅ At least one number

---

## 🔐 Security Checklist

- [ ] Trigger function uses `SECURITY DEFINER` (runs with creator's permissions)
- [ ] Trigger function sets `search_path = public` (prevents SQL injection)
- [ ] RLS policies allow authenticated users to insert their own profile
- [ ] Service role has full access to user_profiles table
- [ ] Error handling doesn't prevent user creation (graceful degradation)

---

## 📊 Monitoring & Debugging

### Enable Detailed Logging

In your `auth-service.ts`, add more detailed error logging:

```typescript
async signUpWithEmail(email: string, password: string, name?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      console.error('Signup error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Full signup error:', err);
    throw err;
  }
}
```

### Check Supabase Logs

1. Go to Supabase Dashboard → Logs
2. Select "Database" logs
3. Look for errors related to `handle_new_user` or `user_profiles`

---

## 🚀 After Fixing

### Clean Up Test Accounts

If you created test accounts during debugging:

```sql
-- View test accounts
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE 'test%@example.com';

-- Delete specific test account (replace with actual ID)
DELETE FROM auth.users WHERE id = 'your-test-uuid-here';
```

### Verify Everything Works

1. ✅ New users can sign up
2. ✅ User profile is created automatically
3. ✅ Users can log in after signup
4. ✅ No errors in browser console
5. ✅ No errors in Supabase logs

---

## 📞 Still Having Issues?

If you've tried all the above and still experiencing issues:

1. **Check Supabase Status:** https://status.supabase.com
2. **Review Supabase Docs:** https://supabase.com/docs/guides/auth
3. **Check Database Logs:** Look for specific constraint violations or permission errors
4. **Export Schema:** 
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%user%';
   SELECT * FROM pg_proc WHERE proname LIKE '%user%';
   ```
5. **Create Minimal Reproduction:** Try with a fresh Supabase project to isolate the issue

---

## 📝 Prevention Tips

To avoid this issue in future projects:

1. **Always run migrations in order** - Don't skip migration files
2. **Test auth flows in development** before deploying to production
3. **Use Supabase CLI** for local development with migrations
4. **Version control your migrations** - Keep them in git
5. **Document custom triggers** - Add comments explaining what they do

---

## 📚 Related Files

- `QUICK_FIX_SIGNUP.sql` - Quick fix script (run this first!)
- `FIX_SIGNUP_ERROR_CORRECTED.sql` - Alternative fix with checks
- `supabase/migrations/013_add_handle_new_user_trigger_COMPLETE.sql` - Complete migration
- `src/lib/services/auth-service.ts` - Auth service implementation
- `src/app/login/page.tsx` - Login/signup page

---

**Last Updated:** 2024  
**Tested with:** Next.js 16.1.3, Supabase Auth