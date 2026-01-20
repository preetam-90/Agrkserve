# 🚀 Quick Start Guide - Authentication System

Get the new authentication system up and running in 5 minutes!

---

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Supabase account and project created
- Git repository cloned

---

## Step 1: Install Dependencies (30 seconds)

```bash
cd agri-serve-web
pnpm install
```

---

## Step 2: Setup Environment (1 minute)

Create `.env.local` file:

```bash
cp .env.example .env.local  # If you have an example file
# OR create new file
```

Add these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from: Supabase Dashboard → Settings → API

---

## Step 3: Run Database Migrations (2 minutes)

Open Supabase Dashboard → SQL Editor

**Copy and run these 3 migrations in order:**

### Migration 1: Base Schema
```bash
# Copy content from:
supabase/migrations/001_initial_schema.sql
```
Paste and run in SQL Editor

### Migration 2: Phone & Last Login
```bash
# Copy content from:
supabase/migrations/007_add_phone_mandatory.sql
```
Paste and run in SQL Editor

### Migration 3: Storage Setup
```bash
# Copy content from:
supabase/migrations/008_setup_storage.sql
```
Paste and run in SQL Editor

✅ **Verify:** Check Tables tab - should see `user_profiles`, `user_roles`, etc.

---

## Step 4: Configure Authentication (1 minute)

### Enable Email Auth
1. Go to: Supabase Dashboard → Authentication → Providers
2. Find "Email"
3. Toggle ON
4. Save

### Add Redirect URLs
1. Go to: Authentication → URL Configuration
2. Add these URLs:
   - `http://localhost:3000/auth/callback`
3. Save

### Optional: Enable Google OAuth
1. Go to: Authentication → Providers
2. Find "Google"
3. Toggle ON
4. Add Client ID and Secret (from Google Cloud Console)
5. Save

---

## Step 5: Start Development Server (30 seconds)

```bash
pnpm dev
```

Server starts at: http://localhost:3000

---

## 🎉 You're Done! Now Test It

### Test Email Signup

1. Open: http://localhost:3000/login
2. Click "Sign Up"
3. Enter:
   - Name: John Doe
   - Email: test@example.com
   - Password: Password123
4. Submit
5. You should be redirected to phone setup ✓

### Test Phone Setup

1. Enter phone: 9876543210
2. Click "Continue"
3. Upload a picture (optional) or skip
4. Should proceed to onboarding ✓

### Test Profile Page

1. Complete onboarding
2. Click avatar → Profile
3. Click "Edit Profile"
4. Update your information
5. Save changes ✓

---

## 🐛 Quick Troubleshooting

### "Supabase connection failed"
- ✅ Check `.env.local` has correct URL and key
- ✅ Restart dev server after adding env vars

### "user_profiles table doesn't exist"
- ✅ Run migrations in Supabase SQL Editor
- ✅ Check Tables tab to verify

### "Redirect loop after login"
- ✅ Complete phone setup
- ✅ Complete onboarding
- ✅ Check profile has `is_profile_complete: true`

### "Profile picture not uploading"
- ✅ Check migration 008 ran successfully
- ✅ Verify `avatars` bucket exists in Storage tab
- ✅ Check file size < 5MB

### "Phone validation failing"
- ✅ Must be 10 digits
- ✅ Must start with 6, 7, 8, or 9
- ✅ Example: 9876543210 ✓

---

## 📁 File Structure

New files added:

```
src/
├── app/
│   ├── phone-setup/
│   │   └── page.tsx          ← Phone number collection
│   └── profile/
│       └── page.tsx           ← Profile view/edit
├── components/
│   ├── phone-modal.tsx        ← Phone modal component
│   └── profile-picture-upload.tsx  ← Picture upload
└── lib/
    ├── services/
    │   └── auth-service.ts    ← Updated with validation
    └── store/
        └── auth-store.ts      ← Added refreshProfile()

supabase/migrations/
├── 007_add_phone_mandatory.sql   ← Phone validation
└── 008_setup_storage.sql         ← Storage buckets
```

---

## 🔗 Important URLs

| Page | URL | Purpose |
|------|-----|---------|
| Login/Signup | `/login` | Authentication |
| Phone Setup | `/phone-setup` | Collect phone number |
| Onboarding | `/onboarding` | Role selection |
| Profile | `/profile` | View/edit profile |
| Dashboard | `/dashboard` or `/provider/dashboard` | Main app |

---

## ✅ What Works Now

- ✅ Email signup with strong password validation
- ✅ Google OAuth authentication
- ✅ Mandatory phone number collection
- ✅ Profile picture upload with preview
- ✅ Complete profile management page
- ✅ Last login tracking
- ✅ Secure password requirements
- ✅ Phone number validation
- ✅ Smart redirects based on profile status

---

## 📚 More Documentation

Need more details? Check these files:

- **AUTH_PROFILE_GUIDE.md** - Complete authentication guide
- **USER_FLOWS.md** - Visual flow diagrams
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment checklist

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Read AUTH_PROFILE_GUIDE.md for detailed docs
3. Check browser console for errors
4. Check Supabase logs in dashboard

---

## 🎯 Next Steps

After setup, you can:

1. **Customize design:**
   - Update colors in Tailwind config
   - Modify component styles

2. **Add features:**
   - Email verification
   - Phone OTP verification
   - Two-factor authentication

3. **Deploy:**
   - Follow DEPLOYMENT_CHECKLIST.md
   - Deploy to Vercel/Netlify
   - Update production env vars

---

## ⚡ Quick Commands

```bash
# Start development
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
```

---

## 💡 Pro Tips

1. **Use the helper script:**
   ```bash
   ./scripts/setup-auth.sh
   ```

2. **Test all flows before deploying:**
   - Email signup → phone → picture → onboarding → dashboard
   - Google signup → phone check → completion
   - Login → proper redirects

3. **Check types:**
   - VS Code should show no TypeScript errors
   - All new types are in `src/lib/types/database.ts`

4. **Monitor storage:**
   - Profile pictures go to `avatars` bucket
   - Check storage usage in Supabase dashboard

---

## 🎊 Success!

If you can:
- ✅ Sign up with email
- ✅ Enter phone number
- ✅ Upload profile picture
- ✅ Complete profile
- ✅ View and edit profile page

**Then everything is working correctly!** 🎉

---

**Setup Time:** ~5 minutes
**Difficulty:** Easy
**Status:** Ready to use ✅

---

*For detailed documentation, see AUTH_PROFILE_GUIDE.md*
