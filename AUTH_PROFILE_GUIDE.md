# Authentication & Profile System Guide

## Overview

The AgriServe platform now has a complete authentication and profile management system with the following features:

- **Email/Password Authentication** with strong password validation
- **Google OAuth Authentication** with automatic profile creation
- **Mandatory Phone Number Collection** for all users
- **Profile Picture Upload & Management**
- **Complete Profile Page** with editable information
- **Secure Password Requirements**

---

## Features

### 1. Sign Up & Login

#### Email Sign Up
- Users can sign up with email and password
- **Password Requirements:**
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
- After signup, users are redirected to phone setup

#### Google Sign In
- One-click authentication with Google
- Automatically extracts profile information (name, email, picture)
- If Google provides phone number, it's saved automatically
- If no phone number from Google, user is prompted to enter it

#### Email Sign In
- Standard email/password authentication
- Checks if phone number is set
- Redirects to appropriate page based on profile completion status

### 2. Phone Number Collection

**Mandatory for all users** - cannot skip this step

#### Features:
- Validates Indian phone numbers (10 digits, starts with 6-9)
- Auto-formats with +91 country code
- Clear error messages for invalid numbers
- Used for booking notifications and communication

#### Flow:
1. After email signup → Phone Setup
2. After Google signin (if no phone) → Phone Setup
3. After phone entry → Profile Picture (optional)
4. After picture or skip → Onboarding or Dashboard

### 3. Profile Picture Upload

#### Features:
- Upload during initial setup (optional)
- Change anytime from profile page
- Real-time preview before saving
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- Stored in Supabase Storage (avatars bucket)

### 4. Profile Page (`/profile`)

Comprehensive profile management page with:

#### View Mode:
- Profile picture display
- Contact information (name, email, phone)
- Location (address, PIN code)
- Account activity (member since, last login)
- Role badges (Renter, Provider, Labour)
- Verification badge (if verified)

#### Edit Mode:
- Update profile picture
- Change display name
- Update phone number (with validation)
- Edit bio
- Update address and PIN code
- Save/Cancel actions

#### Quick Actions:
- Go to Dashboard
- Change Password
- View account information

---

## User Flows

### New User - Email Signup
```
1. Visit /login
2. Click "Sign Up"
3. Enter name, email, password
4. Submit form
   → Redirected to /phone-setup
5. Enter phone number (mandatory)
6. Click "Continue"
   → Redirected to profile picture page
7. Upload picture (optional) or skip
   → Redirected to /onboarding
8. Select role and complete profile
   → Redirected to appropriate dashboard
```

### New User - Google Signup
```
1. Visit /login
2. Click "Continue with Google"
3. Authenticate with Google
   → System checks for phone number
4a. If phone from Google:
    → Check profile completion
    → Go to onboarding or dashboard
4b. If no phone:
    → Redirected to /phone-setup
    → Enter phone number
    → Upload picture (optional)
    → Go to onboarding
```

### Existing User - Login
```
1. Visit /login
2. Enter email and password
3. Submit form
   → System checks phone and profile
4a. No phone:
    → Redirected to /phone-setup
4b. Profile incomplete:
    → Redirected to /onboarding
4c. Profile complete:
    → Redirected to appropriate dashboard
```

### Update Profile
```
1. Click profile avatar in header
2. Select "Profile" from dropdown
   → Navigate to /profile
3. Click "Edit Profile"
4. Update information
5. Click "Save Changes"
   → Profile updated
```

---

## API Endpoints & Services

### Auth Service (`src/lib/services/auth-service.ts`)

#### Methods:

**signInWithEmail(email, password)**
- Sign in with email/password
- Returns user data and session

**signUpWithEmail(email, password, name?)**
- Create new account
- Validates password strength
- Returns user data

**signInWithGoogle()**
- OAuth with Google
- Redirects to Google auth
- Returns to /auth/callback

**getProfile(userId)**
- Fetch user profile from database
- Returns UserProfile object

**upsertProfile(userId, profileData)**
- Create or update user profile
- Validates phone number
- Returns updated profile

**updateLastLogin(userId)**
- Updates last_login timestamp
- Called on successful authentication

### Auth Store (`src/lib/store/auth-store.ts`)

Global state management for authentication:

```typescript
{
  user: User | null,
  profile: UserProfile | null,
  roles: UserRole[],
  activeRole: UserRole | null,
  isLoading: boolean,
  isInitialized: boolean
}
```

**Methods:**
- `initialize()` - Load user and profile on app start
- `refreshProfile()` - Reload profile data
- `switchRole(role)` - Change active role
- `signOut()` - Logout and clear state

---

## Database Schema

### user_profiles Table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  phone TEXT,                    -- Mandatory for profile completion
  name TEXT,
  email TEXT,
  profile_image TEXT,            -- URL to profile picture
  bio TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(Point, 4326),
  roles TEXT[],
  is_profile_complete BOOLEAN,
  preferred_language TEXT,
  is_verified BOOLEAN,
  last_login TIMESTAMPTZ,        -- New: tracks last login
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Storage Buckets

**avatars** - Profile pictures
- Max size: 5MB
- Public access for viewing
- Authenticated users can upload/update their own

**equipment-images** - Equipment photos
- Max size: 10MB
- Public access for viewing
- Authenticated users can upload/manage

---

## Security Features

### Password Validation
- Minimum 8 characters
- Uppercase + lowercase + numbers required
- Client and server-side validation

### Phone Number Validation
- Indian mobile format (10 digits)
- Must start with 6, 7, 8, or 9
- Validated on both client and server

### Profile Picture Upload
- File type validation (images only)
- Size limit enforcement (5MB)
- Secure storage in Supabase
- Automatic URL generation

### Database Security
- Row Level Security (RLS) enabled
- Users can only edit their own profile
- Phone number required before profile completion
- Protected API endpoints

---

## Components

### PhoneModal
**Location:** `src/components/phone-modal.tsx`

Reusable modal for phone number collection:
```tsx
<PhoneModal
  isOpen={showModal}
  onClose={handleClose}
  onSubmit={handlePhoneSubmit}
  isLoading={loading}
/>
```

### ProfilePictureUpload
**Location:** `src/components/profile-picture-upload.tsx`

Upload and preview profile pictures:
```tsx
<ProfilePictureUpload
  currentImage={imageUrl}
  onUpload={handleUpload}
  userId={user.id}
  size="lg"
/>
```

---

## Pages

### `/login`
Email/password and Google authentication

### `/phone-setup`
Mandatory phone number collection + optional picture upload

### `/onboarding`
Role selection and profile completion

### `/profile`
View and edit complete user profile

### `/auth/callback`
OAuth callback handler - processes Google auth and redirects appropriately

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Migration Guide

### Run These Migrations in Order:

1. `001_initial_schema.sql` - Base tables
2. `007_add_phone_mandatory.sql` - Phone validation & last_login
3. `008_setup_storage.sql` - Storage buckets & policies

### In Supabase Dashboard:

1. **Authentication Settings:**
   - Enable Email authentication
   - Enable Google OAuth provider
   - Add redirect URLs: `http://localhost:3000/auth/callback`

2. **Storage:**
   - Verify `avatars` bucket is created
   - Verify `equipment-images` bucket is created
   - Check policies are applied

3. **Database:**
   - Run migrations in SQL editor
   - Verify triggers are active
   - Check RLS policies

---

## Testing Checklist

### Email Signup Flow
- [ ] Can create account with valid email/password
- [ ] Password validation works (uppercase, lowercase, number, length)
- [ ] Redirected to phone setup after signup
- [ ] Phone number validation works
- [ ] Profile picture upload works
- [ ] Can skip profile picture
- [ ] Redirected to onboarding after phone setup
- [ ] Can complete profile and reach dashboard

### Google Signup Flow
- [ ] Google OAuth popup opens
- [ ] Can authenticate with Google
- [ ] Profile auto-filled with Google data
- [ ] If no phone from Google, prompted to enter
- [ ] Profile picture from Google saved
- [ ] Redirected appropriately based on profile status

### Login Flow
- [ ] Can login with email/password
- [ ] Redirected to phone setup if missing
- [ ] Redirected to onboarding if incomplete
- [ ] Redirected to dashboard if complete
- [ ] Last login timestamp updated

### Profile Page
- [ ] Can view all profile information
- [ ] Edit mode activates correctly
- [ ] Can update name, email, phone
- [ ] Can upload new profile picture
- [ ] Can update address and PIN code
- [ ] Changes save successfully
- [ ] Cancel button restores original values

---

## Troubleshooting

### "Phone number is required" error
- Ensure user has completed phone setup
- Check `user_profiles.phone` field in database
- Verify phone validation trigger is active

### Profile picture not uploading
- Check Supabase storage bucket exists
- Verify storage policies are set
- Ensure file size < 5MB
- Check file type is supported

### Redirect loop after login
- Check profile completion status
- Verify onboarding redirect logic
- Ensure roles are set correctly

### Google OAuth not working
- Verify Google OAuth is enabled in Supabase
- Check redirect URLs are configured
- Ensure environment variables are set

---

## Future Enhancements

- [ ] Phone number OTP verification
- [ ] Email verification flow
- [ ] Two-factor authentication
- [ ] Social profile links
- [ ] Account deletion feature
- [ ] Export user data
- [ ] Activity log/history
- [ ] Password strength meter
- [ ] Profile completion percentage

---

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Check Supabase dashboard for database errors
4. Verify migrations are applied correctly

---

**Last Updated:** January 2026
**Version:** 1.0.0
