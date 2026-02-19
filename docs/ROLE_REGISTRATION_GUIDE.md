# Role Registration & Multi-Role System - Complete Guide

## Overview

Users can now register for multiple roles (Renter, Provider, Labour) and switch between them seamlessly. Each role unlocks different features and has its own dashboard.

## ✅ Complete Implementation

### 1. Role Registration Page

**Location:** `src/app/settings/roles/page.tsx`

**Features:**

- View all available roles (Renter, Provider, Labour)
- Enable/disable any role with a toggle switch
- See "Available" badge for roles you don't have yet
- See "New!" badge when enabling a role
- Automatic validation (must keep at least one role)
- Setup hints for roles that require configuration

**How to Access:**

- Settings → Manage Roles
- Or direct link: `/settings/roles`

### 2. Role Onboarding Flows

#### Provider Onboarding

**Location:** `src/app/onboarding/provider/page.tsx`

**What It Does:**

- Welcomes new providers
- Shows step-by-step guide
- Links to equipment listing page
- Explains benefits and features
- Can skip and complete later

**Triggered When:**

- User enables Provider role for the first time
- Automatic redirect after saving roles

#### Labour Onboarding

**Location:** `src/app/onboarding/labour/page.tsx`

**What It Does:**

- Complete profile setup form
- Skills selection (10 common agricultural skills)
- Experience years input
- Daily and hourly rate setting
- Bio/description textarea
- Creates labour profile in database

**Triggered When:**

- User enables Labour role for the first time
- Automatic redirect after saving roles

### 3. API Endpoints

#### Role Management API

**Endpoint:** `/api/user/roles`

**POST - Register/Update Roles:**

```typescript
// Request
{
  "roles": ["renter", "provider", "labour"]
}

// Response
{
  "success": true,
  "message": "Roles updated successfully",
  "roles": ["renter", "provider", "labour"]
}
```

**GET - Fetch User Roles:**

```typescript
// Response
{
  "roles": ["renter", "provider"]
}
```

#### Labour Profile API

**Endpoint:** `/api/labour/profile`

**POST - Create/Update Profile:**

```typescript
// Request
{
  "skills": ["Tractor Operator", "Planting"],
  "experience_years": 5,
  "daily_rate": 800,
  "hourly_rate": 100,
  "bio": "Experienced agricultural worker..."
}

// Response
{
  "success": true,
  "message": "Labour profile created successfully"
}
```

### 4. Role Switcher Component

**Location:** `src/components/layout/role-switcher.tsx`

**Features:**

- Shows current active role with icon and color
- Dropdown menu to switch between enabled roles
- "Active" badge on current role
- Quick link to "Manage Roles"
- Only shows if user has 2+ roles

**Placement:**

- Header (next to notifications and messages)

### 5. Role Registration Banner

**Location:** `src/components/layout/role-registration-banner.tsx`

**Features:**

- Shows when user doesn't have all roles
- Dismissible (saves to localStorage)
- Animated entrance
- Shows which roles are available
- Quick "Register Now" button

**Usage:**

```tsx
import { RoleRegistrationBanner } from '@/components/layout/role-registration-banner';

// Add to any page
<RoleRegistrationBanner />;
```

## 🎯 Complete User Flow

### Scenario 1: New User Registration

1. **Sign Up** → User creates account
2. **Auto-Assigned** → Gets "Renter" role by default
3. **Sees Banner** → "Unlock More Features! Register as Provider or Labour"
4. **Clicks Banner** → Redirected to `/settings/roles`
5. **Views Roles** → Sees all 3 roles:
   - ✅ Renter (enabled, active)
   - ⭕ Provider (available)
   - ⭕ Labour (available)
6. **Enables Provider** → Toggles Provider ON
7. **Saves Changes** → Clicks "Save Changes"
8. **Onboarding** → Redirected to `/onboarding/provider`
9. **Setup** → Follows guide to add equipment
10. **Complete** → Can now list equipment and rent as well

### Scenario 2: Existing User Adding Role

1. **Navigate** → Settings → Manage Roles
2. **See Available** → Labour role shows "Available" badge
3. **Enable Labour** → Toggle ON
4. **Save** → Click "Save Changes"
5. **Onboarding** → Redirected to `/onboarding/labour`
6. **Fill Form**:
   - Select skills (e.g., "Tractor Operator", "Planting")
   - Enter experience: 5 years
   - Set daily rate: ₹800
   - Set hourly rate: ₹100 (optional)
   - Write bio
7. **Submit** → Click "Complete Setup"
8. **Profile Created** → Labour profile saved to database
9. **Dashboard** → Redirected to dashboard
10. **Role Switcher** → Now appears in header with 3 roles

### Scenario 3: Switching Between Roles

1. **Click Role Switcher** → In header (shows current role)
2. **See Dropdown** → All enabled roles listed
3. **Select Role** → Click "Provider"
4. **Auto-Redirect** → Goes to `/provider/dashboard`
5. **UI Updates** → Dashboard shows provider-specific content
6. **Switch Again** → Click switcher → Select "Labour"
7. **Redirect** → Goes to `/dashboard` (labour view)

## 🔧 Technical Details

### Database Schema

```sql
-- user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('renter', 'provider', 'labour', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- labour_profiles table (created when user registers as labour)
CREATE TABLE public.labour_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL,
    experience_years INTEGER DEFAULT 0,
    daily_rate DECIMAL(10,2) NOT NULL,
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    availability TEXT DEFAULT 'available',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Role Configuration

```typescript
const roleConfig = {
  renter: {
    label: 'Renter',
    icon: User,
    color: 'text-blue-500',
    dashboard: '/dashboard',
    requiresSetup: false,
  },
  provider: {
    label: 'Equipment Provider',
    icon: Tractor,
    color: 'text-emerald-500',
    dashboard: '/provider/dashboard',
    requiresSetup: true,
    setupMessage: 'You can add your equipment after enabling this role',
  },
  labour: {
    label: 'Agricultural Labour',
    icon: Briefcase,
    color: 'text-amber-500',
    dashboard: '/dashboard',
    requiresSetup: true,
    setupMessage: "You'll need to complete your labour profile after enabling",
  },
};
```

## 📋 Testing Checklist

### Role Registration

- [ ] Navigate to Settings → Manage Roles
- [ ] See all available roles
- [ ] Enable a new role (Provider)
- [ ] Click "Save Changes"
- [ ] Verify redirect to onboarding page
- [ ] Complete or skip onboarding
- [ ] Verify role is now active

### Labour Profile Creation

- [ ] Enable Labour role
- [ ] Redirected to labour onboarding
- [ ] Select multiple skills
- [ ] Enter experience years
- [ ] Set daily rate (required)
- [ ] Set hourly rate (optional)
- [ ] Write bio
- [ ] Submit form
- [ ] Verify profile created in database
- [ ] Check profile appears in labour listings

### Role Switching

- [ ] Enable 2+ roles
- [ ] See role switcher in header
- [ ] Click role switcher
- [ ] See dropdown with all roles
- [ ] Current role has "Active" badge
- [ ] Click different role
- [ ] Verify redirect to correct dashboard
- [ ] Verify UI updates for new role
- [ ] Switch back to original role

### Role Disabling

- [ ] Go to Manage Roles
- [ ] Try to disable last role (should fail)
- [ ] Enable second role
- [ ] Disable first role (should work)
- [ ] If disabling active role, verify redirect
- [ ] Verify role switcher updates

### Banner

- [ ] New user sees banner
- [ ] Banner shows available roles
- [ ] Click "Register Now"
- [ ] Redirected to role management
- [ ] Dismiss banner
- [ ] Refresh page
- [ ] Banner stays dismissed
- [ ] Clear localStorage
- [ ] Banner reappears

## 🚀 Deployment Steps

1. **Run Migration:**

   ```bash
   # Apply migration to ensure all users have roles
   supabase migration up
   ```

2. **Verify Tables:**

   ```sql
   -- Check user_roles table
   SELECT * FROM user_roles LIMIT 10;

   -- Check labour_profiles table
   SELECT * FROM labour_profiles LIMIT 10;
   ```

3. **Test Flow:**
   - Create test user
   - Register for Provider role
   - Complete onboarding
   - Register for Labour role
   - Complete profile
   - Switch between roles

4. **Monitor:**
   - Check API logs for errors
   - Monitor role registration rate
   - Track onboarding completion rate

## 🎨 UI/UX Features

### Visual Indicators

- **Color Coding:**
  - Renter: Blue
  - Provider: Emerald/Green
  - Labour: Amber/Yellow
  - Admin: Red

- **Badges:**
  - "Active" - Current role
  - "Available" - Can be enabled
  - "New!" - Just enabled

- **Icons:**
  - Renter: User icon
  - Provider: Tractor icon
  - Labour: Briefcase icon
  - Admin: Shield icon

### Animations

- Smooth role switcher dropdown
- Banner slide-in animation
- Card hover effects
- Loading states during API calls

### Accessibility

- Keyboard navigation
- ARIA labels
- Focus indicators
- Screen reader support

## 🔒 Security

- All API endpoints verify authentication
- Role validation on server side
- Minimum one role enforced
- Admin role requires special permissions
- Database constraints prevent duplicates

## 📱 Mobile Responsive

- Role switcher adapts to mobile
- Onboarding forms stack on mobile
- Banner dismissible on mobile
- Touch-friendly buttons

## 🐛 Troubleshooting

### Role Switcher Not Showing

- Check if user has 2+ roles
- Verify roles array in auth store
- Check browser console for errors

### Onboarding Not Triggering

- Verify role was newly added (not just re-enabled)
- Check redirect logic in handleSave
- Ensure onboarding pages exist

### Labour Profile Not Creating

- Check API endpoint logs
- Verify labour_profiles table exists
- Check required fields are provided
- Verify user authentication

### Banner Not Dismissing

- Check localStorage permissions
- Verify localStorage key
- Clear browser cache

## 📚 Additional Resources

- [Multi-Role System Documentation](./MULTI_ROLE_SYSTEM.md)
- [Back Button Implementation](./BACK_BUTTON_IMPLEMENTATION.md)
- [API Documentation](./docs/API.md)

## 🎉 Success Metrics

Track these metrics to measure success:

- Role registration rate
- Onboarding completion rate
- Role switching frequency
- Time to complete labour profile
- Provider equipment listing rate
- User retention by role count
