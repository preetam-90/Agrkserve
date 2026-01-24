# 🔧 SIMPLE FIX - Database Setup Issue

## The Problem
You're getting: `ERROR: relation "public.user_profiles" does not exist`

This happens because you already have test users in `auth.users`, and when we create the trigger, it tries to run immediately.

---

## ✅ THE SOLUTION (3 Simple Steps)

### Step 1: Delete Existing Test Users

1. Go to **Supabase Dashboard**
2. Click **Authentication → Users**
3. **Delete ALL test users** (click the trash icon for each user)
4. Confirm deletion

This is safe - you're just cleaning up test accounts.

---

### Step 2: Run Cleanup Script

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste: `supabase/CLEANUP_DATABASE_SAFE.sql`
4. Click **"Run"**
5. Wait for success message

---

### Step 3: Run Complete Setup

1. In SQL Editor, click **"New Query"** again
2. Copy and paste: `supabase/COMPLETE_DATABASE_SETUP.sql`
3. Click **"Run"**
4. Wait 20-30 seconds
5. You should see: **"✅ AGRISERVE DATABASE SETUP COMPLETED SUCCESSFULLY!"**

---

## ✅ Verify Success

Run this in SQL Editor:

```sql
SELECT COUNT(*) FROM public.user_profiles;
```

Should return: `0` (empty table, ready for new signups)

---

## 🎉 You're Done!

Now:
1. Update your `.env.local` with Supabase credentials
2. Run `pnpm dev`
3. Test signup - it should work perfectly!

---

**Why This Works:**
- The trigger on `auth.users` tries to create profiles for existing users
- But `user_profiles` table doesn't exist yet when the trigger is created
- By deleting test users first, there's nothing to trigger when we create the tables
- Fresh signups after setup will work perfectly!