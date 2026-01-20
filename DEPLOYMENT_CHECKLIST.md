# 🚀 Deployment Checklist - Authentication System

## Pre-Deployment Checklist

### ✅ Database Setup

- [ ] **Run Migration 001_initial_schema.sql**
  - Location: `supabase/migrations/001_initial_schema.sql`
  - Creates: `user_profiles`, `user_roles`, `equipment`, `bookings`, etc.
  
- [ ] **Run Migration 007_add_phone_mandatory.sql**
  - Location: `supabase/migrations/007_add_phone_mandatory.sql`
  - Adds: Phone validation trigger, `last_login` field, `update_last_login` function
  
- [ ] **Run Migration 008_setup_storage.sql**
  - Location: `supabase/migrations/008_setup_storage.sql`
  - Creates: Storage buckets (`avatars`, `equipment-images`) and policies

- [ ] **Verify Tables Created**
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```
  Expected: `user_profiles`, `user_roles`, `equipment`, `bookings`, etc.

- [ ] **Verify Triggers Active**
  ```sql
  SELECT trigger_name, event_object_table 
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public';
  ```
  Expected: `enforce_phone_on_complete`, `update_user_profiles_updated_at`, etc.

---

### ✅ Supabase Authentication

- [ ] **Enable Email Provider**
  - Dashboard → Authentication → Providers
  - Enable "Email"
  - Configure email templates (optional)

- [ ] **Enable Google OAuth (Optional)**
  - Dashboard → Authentication → Providers
  - Enable "Google"
  - Add Client ID and Secret
  - Configure authorized domains

- [ ] **Set Redirect URLs**
  - Development: `http://localhost:3000/auth/callback`
  - Production: `https://yourdomain.com/auth/callback`
  - Add both to allowed redirect URLs

- [ ] **Configure Email Templates**
  - Confirmation email
  - Password reset email
  - Magic link email (if using)

- [ ] **Set Site URL**
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

---

### ✅ Supabase Storage

- [ ] **Verify Avatars Bucket**
  - Dashboard → Storage
  - Bucket: `avatars`
  - Public: ✓ Yes
  - File size limit: 5MB
  - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

- [ ] **Verify Equipment-Images Bucket**
  - Dashboard → Storage
  - Bucket: `equipment-images`
  - Public: ✓ Yes
  - File size limit: 10MB
  - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

- [ ] **Test Storage Policies**
  - Upload test avatar (as authenticated user)
  - View test avatar (as public user)
  - Update test avatar (as owner)
  - Delete test avatar (as owner)

---

### ✅ Environment Variables

- [ ] **Development (.env.local)**
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  ```

- [ ] **Production (Deployment Platform)**
  - Vercel/Netlify/etc environment variables set
  - Same variables as development
  - Ensure URL points to production Supabase project

- [ ] **Verify Environment Loading**
  ```bash
  pnpm dev
  # Check console for Supabase connection
  ```

---

### ✅ Code Quality

- [ ] **TypeScript Compilation**
  ```bash
  pnpm build
  ```
  Should complete with no errors

- [ ] **Linting**
  ```bash
  pnpm lint
  ```
  Should pass with no critical errors

- [ ] **Type Checking**
  - No TypeScript errors in VS Code
  - All imports resolved
  - All types defined

---

### ✅ Testing - Email Signup Flow

- [ ] **Navigate to /login**
- [ ] **Click "Sign Up"**
- [ ] **Enter invalid password** (too short, no uppercase, etc.)
  - ✓ Should show appropriate error
- [ ] **Enter valid credentials**
  - Name: Test User
  - Email: test@example.com
  - Password: Password123
- [ ] **Submit form**
  - ✓ Should redirect to /phone-setup
- [ ] **Try to skip phone** (close modal/go back)
  - ✓ Should be redirected back to phone-setup
- [ ] **Enter invalid phone** (9 digits, starts with 5, etc.)
  - ✓ Should show validation error
- [ ] **Enter valid phone** (10 digits, starts with 6-9)
  - ✓ Should accept and continue
- [ ] **Upload profile picture** (optional)
  - ✓ Should show preview
  - ✓ Should save to storage
- [ ] **Skip profile picture**
  - ✓ Should allow skip
- [ ] **Complete onboarding**
  - ✓ Should redirect to dashboard

---

### ✅ Testing - Google OAuth Flow

- [ ] **Navigate to /login**
- [ ] **Click "Continue with Google"**
- [ ] **Authenticate with Google**
  - ✓ Should open Google popup
  - ✓ Should authenticate successfully
- [ ] **Check phone number**
  - If Google provides phone:
    - ✓ Should save automatically
    - ✓ Should skip phone-setup
  - If no phone from Google:
    - ✓ Should redirect to /phone-setup
    - ✓ Should collect phone number
- [ ] **Check profile completion**
  - If incomplete:
    - ✓ Should redirect to /onboarding
  - If complete:
    - ✓ Should redirect to dashboard

---

### ✅ Testing - Login Flow

- [ ] **Navigate to /login**
- [ ] **Enter credentials** (existing user)
- [ ] **Submit form**
- [ ] **Check redirects**
  - No phone: → /phone-setup
  - Phone but incomplete: → /onboarding
  - Complete profile: → dashboard
- [ ] **Verify last_login updated**
  - Check database: `SELECT last_login FROM user_profiles WHERE id = 'user_id'`
  - Should be recent timestamp

---

### ✅ Testing - Profile Page

- [ ] **Navigate to /profile**
  - From header dropdown
  - Or directly: http://localhost:3000/profile
- [ ] **View Mode**
  - ✓ Shows name, email, phone
  - ✓ Shows profile picture (if set)
  - ✓ Shows address, PIN code
  - ✓ Shows member since date
  - ✓ Shows last login (if available)
  - ✓ Shows role badges
- [ ] **Click "Edit Profile"**
- [ ] **Edit Mode**
  - ✓ All fields editable
  - ✓ Can upload new profile picture
  - ✓ Can remove profile picture
  - ✓ Phone number validates
  - ✓ PIN code validates
- [ ] **Click "Save Changes"**
  - ✓ Saves to database
  - ✓ Updates UI
  - ✓ Shows success message
- [ ] **Click "Cancel"**
  - ✓ Reverts changes
  - ✓ Returns to view mode

---

### ✅ Testing - Profile Picture Upload

- [ ] **Navigate to /profile or /phone-setup**
- [ ] **Click "Upload Photo"**
- [ ] **Select invalid file** (too large, wrong type)
  - ✓ Should show error
- [ ] **Select valid image** (JPG/PNG, < 5MB)
  - ✓ Should show preview
  - ✓ Should upload to storage
  - ✓ Should save URL to profile
- [ ] **Verify image loads** (refresh page)
  - ✓ Should display saved image
- [ ] **Change picture**
  - ✓ Should replace old image
  - ✓ Should update in all places
- [ ] **Remove picture**
  - ✓ Should clear profile_image field
  - ✓ Should show default avatar

---

### ✅ Testing - Validation

#### Password Validation
- [ ] Test: "pass" → ❌ Too short
- [ ] Test: "password" → ❌ No uppercase, no number
- [ ] Test: "PASSWORD" → ❌ No lowercase, no number
- [ ] Test: "Password" → ❌ No number
- [ ] Test: "password1" → ❌ No uppercase
- [ ] Test: "Password123" → ✅ Valid

#### Phone Validation
- [ ] Test: "123456789" → ❌ Only 9 digits
- [ ] Test: "12345678901" → ❌ 11 digits
- [ ] Test: "5123456789" → ❌ Starts with 5
- [ ] Test: "9876543210" → ✅ Valid
- [ ] Test: "8123456789" → ✅ Valid
- [ ] Test: "7987654321" → ✅ Valid
- [ ] Test: "6111111111" → ✅ Valid

---

### ✅ Testing - Navigation & Redirects

- [ ] **Unauthenticated User**
  - Try to access /profile → ❌ Redirected to /login
  - Try to access /dashboard → ❌ Redirected to /login
  - Try to access /provider/dashboard → ❌ Redirected to /login

- [ ] **Authenticated User (No Phone)**
  - Login → ✓ Redirected to /phone-setup
  - Try to access /dashboard → ✓ Redirected to /phone-setup
  - Complete phone setup → ✓ Continues to onboarding

- [ ] **Authenticated User (Phone, Incomplete)**
  - Login → ✓ Redirected to /onboarding
  - Try to skip onboarding → ✓ Blocked
  - Complete onboarding → ✓ Goes to dashboard

- [ ] **Authenticated User (Complete)**
  - Login → ✓ Redirected to dashboard
  - Can access all features → ✓ Yes
  - Profile shows all data → ✓ Yes

---

### ✅ Security Testing

- [ ] **SQL Injection**
  - Try malicious input in forms
  - ✓ Should be sanitized by Supabase

- [ ] **XSS (Cross-Site Scripting)**
  - Try `<script>alert('xss')</script>` in name/bio
  - ✓ Should be escaped in display

- [ ] **File Upload**
  - Try uploading non-image file
  - ✓ Should be rejected
  - Try uploading > 5MB file
  - ✓ Should be rejected

- [ ] **Authorization**
  - Try accessing another user's profile data
  - ✓ Should be blocked by RLS
  - Try modifying another user's data
  - ✓ Should be blocked by RLS

- [ ] **Session Management**
  - Logout and try to access protected route
  - ✓ Should redirect to login
  - Verify session expires correctly
  - ✓ Should require re-login

---

### ✅ Performance Testing

- [ ] **Page Load Times**
  - /login: < 2s
  - /profile: < 2s
  - /phone-setup: < 2s

- [ ] **Image Upload**
  - Small image (< 1MB): < 3s
  - Large image (5MB): < 10s

- [ ] **Database Queries**
  - Profile fetch: < 500ms
  - Profile update: < 1s

---

### ✅ Mobile Responsiveness

- [ ] **Test on Mobile Devices**
  - iPhone: Safari
  - Android: Chrome
  - Tablet: iPad

- [ ] **Key Pages**
  - [ ] /login - ✓ Responsive
  - [ ] /phone-setup - ✓ Responsive
  - [ ] /profile - ✓ Responsive
  - [ ] /onboarding - ✓ Responsive

- [ ] **Profile Picture Upload**
  - ✓ Works on mobile
  - ✓ Can take photo from camera
  - ✓ Can select from gallery

---

### ✅ Browser Compatibility

- [ ] **Chrome** (Latest)
- [ ] **Firefox** (Latest)
- [ ] **Safari** (Latest)
- [ ] **Edge** (Latest)

---

### ✅ Error Handling

- [ ] **Network Errors**
  - Disconnect internet during upload
  - ✓ Should show error message

- [ ] **Server Errors**
  - Supabase down/unavailable
  - ✓ Should show error message

- [ ] **Validation Errors**
  - Invalid input
  - ✓ Shows clear error messages

- [ ] **Auth Errors**
  - Wrong password
  - ✓ Shows "Invalid credentials"
  - Email already exists
  - ✓ Shows "Email already in use"

---

### ✅ User Experience

- [ ] **Loading States**
  - ✓ Spinners shown during operations
  - ✓ Buttons disabled during submit
  - ✓ No double-submit possible

- [ ] **Success Messages**
  - ✓ Toast notifications work
  - ✓ Success states clear

- [ ] **Error Messages**
  - ✓ Errors are user-friendly
  - ✓ Errors suggest solutions

- [ ] **Transitions**
  - ✓ Smooth page transitions
  - ✓ No jarring reloads

---

### ✅ Documentation

- [ ] **README Updated**
  - Setup instructions
  - Environment variables
  - Getting started

- [ ] **AUTH_PROFILE_GUIDE.md**
  - Complete guide available
  - All features documented

- [ ] **USER_FLOWS.md**
  - Visual flows created
  - All scenarios covered

- [ ] **IMPLEMENTATION_SUMMARY.md**
  - Summary available
  - All changes listed

---

### ✅ Production Deployment

- [ ] **Environment Variables Set**
  - Production Supabase URL
  - Production Supabase Anon Key
  - All other required vars

- [ ] **Build Successful**
  ```bash
  pnpm build
  ```
  - No errors
  - No warnings (critical)

- [ ] **Deploy to Platform**
  - Vercel/Netlify/etc
  - Build succeeds
  - Site loads

- [ ] **Post-Deployment Tests**
  - Signup flow works
  - Login flow works
  - Google OAuth works
  - Profile updates work
  - Images upload correctly

- [ ] **Monitor Errors**
  - Check error logs
  - Set up error tracking (Sentry, etc)
  - Monitor user reports

---

## 🚨 Critical Issues Checklist

Before going live, ensure these MUST work:

- [ ] ✅ Users can sign up
- [ ] ✅ Users can log in
- [ ] ✅ Phone number is collected
- [ ] ✅ Profile can be completed
- [ ] ✅ Profile can be edited
- [ ] ✅ Images upload successfully
- [ ] ✅ No redirect loops
- [ ] ✅ Security policies enforced

---

## 📊 Success Metrics

After deployment, track:

- [ ] Signup completion rate
- [ ] Phone number collection rate
- [ ] Profile completion rate
- [ ] Average time to complete signup
- [ ] Error rates by flow
- [ ] Most common errors
- [ ] User drop-off points

---

## 🆘 Rollback Plan

If critical issues found:

1. **Immediate Actions**
   - [ ] Take screenshot of error
   - [ ] Check error logs
   - [ ] Note which flow is broken

2. **Quick Fixes**
   - [ ] Disable problematic feature (if possible)
   - [ ] Add temporary workaround
   - [ ] Fix and redeploy

3. **Full Rollback**
   - [ ] Revert to previous deployment
   - [ ] Run old migrations (if DB changed)
   - [ ] Test old version works
   - [ ] Fix issues in development
   - [ ] Redeploy when ready

---

## ✅ Final Sign-Off

Deployment ready when:

- [ ] All critical tests pass
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Documentation complete
- [ ] Team reviewed
- [ ] Stakeholder approved

---

**Date:** ___________
**Deployed By:** ___________
**Version:** 1.0.0

---

## 📞 Support Contacts

- **Technical Issues:** [Your Email/Slack]
- **Supabase Support:** support@supabase.com
- **Emergency:** [Emergency Contact]

---

*Use this checklist to ensure a smooth deployment of the authentication system.*
