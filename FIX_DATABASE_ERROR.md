# 🔧 FIX: Database Error - relation "public.user_profiles" does not exist

## ❌ The Problem

You got this error when running the complete database setup:
```
ERROR: 42P01: relation "public.user_profiles" does not exist
```

This happens because the triggers tried to reference tables before they were created.

---

## ✅ The Solution (2 Steps)

### Step 1: Clean Up the Failed Setup

1. Open Supabase Dashboard → SQL Editor
2. Copy ALL content from: `supabase/CLEANUP_DATABASE.sql`
3. Paste into SQL Editor
4. Click "Run" (Ctrl+Enter)
5. Wait for "✅ DATABASE CLEANUP COMPLETED!" message

### Step 2: Run the Fixed Setup Script

1. Stay in SQL Editor (or click "New Query")
2. Copy ALL content from: `supabase/COMPLETE_DATABASE_SETUP.sql`
3. Paste into SQL Editor
4. Click "Run" (Ctrl+Enter)
5. Wait 10-30 seconds
6. Look for "✅ AGRISERVE DATABASE SETUP COMPLETED SUCCESSFULLY!" message

---

## ✅ Verify It Worked

Run this quick check in SQL Editor:

```sql
-- Should return 13 rows (all your tables)
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected result: `table_count = 13`

---

## 🎯 What Was Fixed?

The updated script now creates things in this order:
1. ✅ Create all tables FIRST
2. ✅ Create all functions
3. ✅ Create triggers for regular tables
4. ✅ Create triggers for auth.users (LAST - after user_profiles exists)

This ensures `public.user_profiles` exists before any trigger tries to use it.

---

## 🚨 If You Still Get Errors

### Error: "function already exists"
**Solution:** Run CLEANUP_DATABASE.sql first to remove everything

### Error: "permission denied"
**Solution:** Make sure you're using the Supabase SQL Editor (not a direct PostgreSQL client)

### Error: "storage.buckets does not exist"
**Solution:** Comment out the storage bucket creation section (lines with `INSERT INTO storage.buckets`)

### Error: "auth.users does not exist"
**Solution:** You might be on the wrong database - check your project in Supabase Dashboard

---

## 📋 After Success Checklist

Once you see the success message:

- [ ] Go to **Database → Tables** - verify you see 13 tables
- [ ] Go to **Authentication → Providers** - enable Email authentication
- [ ] Go to **Storage** - verify 3 buckets exist (avatars, equipment-images, equipment-videos)
- [ ] Update `.env.local` with your Supabase URL and Anon Key
- [ ] Run `pnpm dev` and test signup

---

## 🎉 You're Done!

After following these steps, your database should be fully set up and ready to use.

Next: Follow the instructions in `NEW_SUPABASE_DATABASE_SETUP.md` for authentication and realtime configuration.

---

**Quick Command Reference:**

```bash
# 1. Clean up (in Supabase SQL Editor)
Run: supabase/CLEANUP_DATABASE.sql

# 2. Setup (in Supabase SQL Editor)  
Run: supabase/COMPLETE_DATABASE_SETUP.sql

# 3. Start your app
cd agri-serve-web
pnpm install
pnpm dev
```

---

**Need more help?** Check `NEW_SUPABASE_DATABASE_SETUP.md` for detailed setup instructions.