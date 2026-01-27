# 🚨 Fix: "Database error saving new user"

## Quick Summary

Your signup is failing because a database trigger that automatically creates user profiles is missing or not working properly.

---

## 🎯 Quick Fix (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your AgriServe project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Open the file `QUICK_FIX_SIGNUP.sql` in this directory
2. Copy the entire content
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Ctrl+Enter`)
5. Wait for the success message: ✅ SUCCESS!

### Step 3: Verify the Fix
1. Open the file `VERIFY_FIX.sql` in this directory
2. Copy and paste into Supabase SQL Editor
3. Run it to see if all checks pass
4. Look for: **✅ ALL CHECKS PASSED - Ready to test signup!**

### Step 4: Test Signup
1. Go to your app at http://localhost:3000/login
2. Try creating a new account:
   - Email: `test@example.com`
   - Password: `TestPass123`
   - Name: `Test User`
3. Should work without errors! 🎉

---

## 📋 What This Fix Does

The script installs a PostgreSQL trigger that:
1. **Listens** for new user signups in `auth.users`
2. **Automatically creates** a profile in `user_profiles` table
3. **Extracts** user data (name, email, avatar) from signup form
4. **Handles errors** gracefully without breaking signup

---

## ❓ Why Did This Happen?

When you sign up a new user:
```
User fills form → Supabase Auth creates user → Trigger should create profile → Done!
                                               ❌ This step was missing
```

Without the trigger, Supabase Auth tries to create the profile but fails, resulting in:
```
AuthApiError: Database error saving new user
```

---

## 🔍 Troubleshooting

### Issue: "Trigger already exists"
**Solution:** This is fine! It means the trigger was already installed. The error might be elsewhere.

### Issue: "Permission denied"
**Solution:** Run this in SQL Editor:
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO anon, authenticated, service_role;
```

### Issue: "Table user_profiles does not exist"
**Solution:** You need to run the initial database schema first:
1. Open `supabase/migrations/001_initial_schema.sql`
2. Copy and run in SQL Editor
3. Then run `QUICK_FIX_SIGNUP.sql`

### Issue: Still getting errors
**Solution:** Check the detailed troubleshooting guide:
1. Open `TROUBLESHOOTING_SIGNUP.md`
2. Follow the diagnostic steps
3. Check Supabase logs in Dashboard → Logs → Database

---

## 📁 Related Files

| File | Purpose |
|------|---------|
| `QUICK_FIX_SIGNUP.sql` | ⚡ Run this first to fix the error |
| `VERIFY_FIX.sql` | ✅ Run this to verify everything works |
| `TROUBLESHOOTING_SIGNUP.md` | 📖 Detailed troubleshooting guide |
| `FIX_SIGNUP_ERROR_CORRECTED.sql` | 🔄 Alternative fix with extra checks |

---

## ✅ Success Checklist

After running the fix, you should be able to:

- [ ] Create new accounts without errors
- [ ] See user profile created automatically in database
- [ ] Log in with newly created accounts
- [ ] Access user dashboard after login
- [ ] See user name displayed in app

---

## 🔐 Security Notes

✅ The trigger uses `SECURITY DEFINER` - this is correct and secure
✅ The trigger sets `search_path = public` - prevents SQL injection
✅ Error handling doesn't expose sensitive information
✅ RLS policies still protect user data

---

## 🚀 After Fixing

### Clean Up Test Accounts
If you created test accounts during debugging:

```sql
-- View test accounts
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%test%@example.com';

-- Delete if needed (replace UUID)
DELETE FROM auth.users WHERE email = 'test@example.com';
```

### Disable Email Confirmation (Development Only)
For easier testing in development:
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. **Uncheck it** for development
4. **Re-enable** before going to production!

---

## 📞 Still Stuck?

1. **Check the logs:**
   - Supabase Dashboard → Logs → Database
   - Look for errors mentioning `handle_new_user` or `user_profiles`

2. **Verify database structure:**
   - Run `VERIFY_FIX.sql` to see what's wrong

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for detailed error messages

4. **Review the full guide:**
   - Open `TROUBLESHOOTING_SIGNUP.md`
   - Follow step-by-step diagnostics

---

## 📝 For Future Reference

To prevent this in new environments:
1. Always run migrations in order
2. Use `supabase db push` to sync schema
3. Test auth flows before deploying
4. Version control all SQL migrations

---

**Last Updated:** 2024  
**Tested With:** Next.js 16.1.3, Supabase, PostgreSQL 15  
**Status:** ✅ Verified working solution