# 🚀 AgriServe Database Setup - START HERE

## ✅ What You Need

1. ✅ New Supabase project created
2. ✅ `.env.local` file updated with new credentials

## 📝 ONE FILE TO RUN

Run **ONLY** this file in your Supabase SQL Editor:

### `FRESH_DATABASE_SETUP.sql`

## 🎯 Instructions

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com
2. Open your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy & Paste
1. Open the file: `FRESH_DATABASE_SETUP.sql`
2. Copy **ALL** the contents (Ctrl+A, then Ctrl+C)
3. Paste into Supabase SQL Editor

### Step 3: Run It
1. Click the **RUN** button (or press Ctrl+Enter)
2. Wait 10-30 seconds
3. Look for the success message with checkmarks ✅

### Step 4: Configure Auth
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL**: `http://localhost:3001`
5. Add **Redirect URL**: `http://localhost:3001/auth/callback`

### Step 5: Test It
```bash
cd agri-serve-web
pnpm dev
```

Then go to `http://localhost:3001` and try signing up!

## ❌ Common Issues

### Error: "relation does not exist"
- You might be running the wrong file
- Make sure you're running `FRESH_DATABASE_SETUP.sql` (not `COMPLETE_DATABASE_SETUP.sql`)

### Error: "already exists"
- Your database already has some tables
- Use `COMPLETE_DATABASE_SETUP.sql` instead (it will clean up first)

### Error: "permission denied"
- Make sure you're logged in to Supabase
- Make sure you're in the correct project

## 🎉 Success Looks Like

You should see:
```
✅ AGRISERVE DATABASE SETUP COMPLETE!

Tables created:
  ✓ user_profiles
  ✓ user_roles
  ✓ equipment
  ... and more

Storage buckets created:
  ✓ avatars
  ✓ equipment-images
  ✓ equipment-videos
```

## 📚 Reference Files

- `FRESH_DATABASE_SETUP.sql` - **Run this for NEW database**
- `COMPLETE_DATABASE_SETUP.sql` - Run this if you need to reset/cleanup
- `NEW_SUPABASE_SETUP_GUIDE.md` - Detailed guide with troubleshooting
- `QUICK_REFERENCE.sql` - Useful queries (NOT for setup)

## 🆘 Need Help?

Check the detailed guide: `NEW_SUPABASE_SETUP_GUIDE.md`

---

**That's it! You're ready to go! 🌾🚜**