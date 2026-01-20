# Phone Number Mandatory Flow

## Overview
Phone number is now **mandatory** for all users (both email and Google login). Users are required to provide their phone number immediately after account creation or login.

## User Flow

### 1. Sign Up / Login
- User creates account via email/password or Google OAuth
- System checks if user has a phone number

### 2. Phone Setup (Mandatory)
If user doesn't have a phone number:
- **Redirected to `/phone-setup`**
- **Step 1: Phone Number** (Required)
  - User must enter a valid 10-digit Indian phone number
  - Format: +91 XXXXXXXXXX
  - Validation: Must start with 6-9 and be exactly 10 digits
  - **Cannot skip this step**
  
- **Step 2: Additional Details** (Optional)
  - Profile Picture: Upload profile image (optional)
  - Address: Enter location/address (optional)
  - User can skip this step if desired

### 3. Onboarding (Role Selection)
After phone setup:
- User selects their role (Renter/Provider/Labour)
- Completes profile with location and other details
- System marks profile as complete

### 4. Dashboard
- User is redirected to appropriate dashboard based on role
- Provider → `/provider/dashboard`
- Labour → `/labour/dashboard`
- Renter → `/renter/dashboard`

## Middleware Protection

The middleware enforces phone number requirement:
- ✅ Authenticated users **without phone** → redirected to `/phone-setup`
- ✅ Users **with phone but incomplete profile** → redirected to `/onboarding`
- ✅ Users **cannot access protected routes** without completing phone setup
- ✅ **Cannot skip or bypass** phone setup page

## Email Confirmation Issue

### Problem
Users who sign up with email/password get "Invalid credentials" error when trying to login because:
1. Supabase requires email confirmation by default
2. Email confirmation emails are not being sent (SMTP not configured)
3. Account exists but is unconfirmed

### Solution Options

#### Option 1: Disable Email Confirmation (Recommended for Development)

**In Supabase Dashboard:**
1. Go to **Authentication** → **Settings** → **Email Auth**
2. Find "**Enable email confirmations**"
3. **Toggle it OFF**
4. Click **Save**

**SQL Fix for Existing Users:**
```sql
-- Confirm all existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

#### Option 2: Configure SMTP (For Production)

1. **Go to Supabase Dashboard** → **Project Settings** → **Auth**
2. **Enable Custom SMTP**
3. Add your SMTP credentials (Gmail, SendGrid, etc.)
4. Test email sending
5. Keep email confirmation enabled

#### Option 3: Use Supabase's Default Email Service

Supabase provides email service by default, but with rate limits:
- Ensure your email templates are configured
- Check spam folder for confirmation emails
- Rate limit: 3 emails per hour per user

## Testing the Flow

### Test Case 1: New Email Signup
```
1. Go to /login
2. Click "Create Account"
3. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: Test@123
4. Click "Create Account"
5. Should redirect to /phone-setup
6. Enter phone: 9876543210
7. Click "Continue"
8. (Optional) Add profile picture and address
9. Click "Continue" or "Skip for Now"
10. Should redirect to /onboarding
```

### Test Case 2: Google Login (New User)
```
1. Go to /login
2. Click "Continue with Google"
3. Complete Google authentication
4. Should redirect to /phone-setup (if Google doesn't provide phone)
5. Enter phone number
6. Complete additional details or skip
7. Proceed to onboarding
```

### Test Case 3: Existing User Login
```
1. User with confirmed email and phone
2. Should login directly to dashboard
```

### Test Case 4: Middleware Protection
```
1. Try to access /provider/dashboard without phone
2. Should redirect to /phone-setup
3. Cannot bypass by manually changing URL
```

## Important Notes

### Phone Number
- ✅ **Mandatory** - Cannot be skipped
- ✅ Format: Indian phone numbers only (+91)
- ✅ Validation: 10 digits, starts with 6-9
- ✅ Used for: Booking notifications, contact info

### Profile Picture & Address
- ⚠️ **Optional** - Can be skipped
- ⚠️ Can be added later in profile settings
- ⚠️ Recommended for better user experience

### Email Confirmation
- ⚠️ **Current Issue**: Email confirmation enabled but emails not sent
- ⚠️ **Impact**: Users can't login after signup
- ✅ **Fix**: Disable email confirmation or configure SMTP
- ✅ **SQL Fix**: Run SQL query to confirm existing users

## Error Messages

### "Invalid credentials"
**Cause**: Email not confirmed
**Solution**: 
1. Run SQL to confirm the user's email
2. OR disable email confirmation in Supabase

### "Phone number is required"
**Cause**: User trying to access app without phone
**Solution**: User will be redirected to /phone-setup automatically

### "Please enter a valid 10-digit phone number"
**Cause**: Invalid phone format
**Solution**: Enter 10-digit number starting with 6-9

## Files Modified

1. **`/src/app/phone-setup/page.tsx`**
   - Added two-step flow: phone → details
   - Made phone mandatory (cannot skip)
   - Added address and profile picture fields (optional)

2. **`/src/lib/supabase/middleware.ts`**
   - Added phone number check for all authenticated users
   - Automatic redirect to /phone-setup if no phone
   - Prevents bypassing phone setup

3. **`/src/app/login/page.tsx`**
   - Better error handling for email confirmation
   - Clear messages about email confirmation requirement
   - Improved user feedback

4. **`/src/app/auth/callback/route.ts`**
   - Checks for phone number in OAuth callback
   - Redirects to phone setup if needed

## Next Steps

1. **Fix Email Confirmation** (Choose one):
   - Disable email confirmation in Supabase Dashboard
   - Configure SMTP for production
   - Run SQL to confirm existing users

2. **Test the Flow**:
   - Create new account and verify phone setup flow
   - Test Google login
   - Test middleware protection

3. **Production Considerations**:
   - Enable email confirmation with proper SMTP
   - Add phone OTP verification (future enhancement)
   - Add email verification resend option
   - Monitor email delivery rates
