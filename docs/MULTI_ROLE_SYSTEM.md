# Multi-Role System Implementation

## Overview

Implemented a comprehensive multi-role system that allows users to enable multiple roles (Renter, Provider, Labour, Admin) and dynamically switch between them with appropriate dashboard changes.

## Features

### 1. Multiple Role Support

- Users can enable/disable multiple roles from their account
- Each role provides access to different features and dashboards
- Minimum one role must be active at all times

### 2. Role Switcher Component

**Location:** `src/components/layout/role-switcher.tsx`

A prominent role switcher in the header that allows users to:

- View their current active role
- Switch between enabled roles instantly
- Navigate to role-specific dashboards
- Access role management settings

**Variants:**

- Single role: Shows as a badge (no switching needed)
- Multiple roles: Shows as a dropdown menu with all enabled roles

### 3. Role Management Page

**Location:** `src/app/settings/roles/page.tsx`

A dedicated settings page where users can:

- Enable/disable roles
- View role descriptions and features
- See which role is currently active
- Save changes with validation

**Role Options:**

- **Renter**: Rent equipment and hire labour
- **Provider**: List equipment for rent
- **Labour**: Offer agricultural services
- **Admin**: Platform management (restricted)

### 4. API Endpoint

**Location:** `src/app/api/user/roles/route.ts`

RESTful API for role management:

- `GET /api/user/roles` - Fetch user's active roles
- `POST /api/user/roles` - Update user's roles

**Features:**

- Role validation
- Automatic activation/deactivation
- Prevents removing all roles
- Secure authentication check

### 5. Dynamic Dashboard Routing

**Updated:** `src/app/dashboard/page.tsx`

Dashboard automatically redirects based on active role:

- **Renter/Labour** → `/dashboard` (RenterDashboardView or LabourDashboardView)
- **Provider** → `/provider/dashboard` (ProviderDashboardView)
- **Admin** → `/admin` (Admin panel)

## Database Schema

### user_roles Table

```sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('renter', 'provider', 'labour', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);
```

## User Flow

### Enabling a New Role

1. User navigates to Settings → Manage Roles
2. Toggles desired role(s) on
3. Clicks "Save Changes"
4. API validates and updates database
5. Auth store refreshes roles
6. Role switcher appears in header (if multiple roles)

### Switching Roles

1. User clicks role switcher in header
2. Dropdown shows all enabled roles
3. User selects desired role
4. Active role updates in store
5. User is redirected to appropriate dashboard
6. UI updates to reflect new role context

### Disabling a Role

1. User navigates to Settings → Manage Roles
2. Toggles role off (must keep at least one)
3. Clicks "Save Changes"
4. If current active role was disabled, redirects to dashboard
5. Role switcher updates to show remaining roles

## Role Configuration

Each role has specific configuration:

```typescript
const roleConfig = {
  renter: {
    label: 'Renter',
    icon: User,
    color: 'text-blue-500',
    dashboard: '/dashboard',
    features: [
      'Browse and rent equipment',
      'Hire skilled labour',
      'Manage bookings',
      'Rate and review services',
    ],
  },
  provider: {
    label: 'Equipment Provider',
    icon: Tractor,
    color: 'text-emerald-500',
    dashboard: '/provider/dashboard',
    features: [
      'List unlimited equipment',
      'Set your own prices',
      'Manage availability',
      'Track earnings',
    ],
  },
  labour: {
    label: 'Agricultural Labour',
    icon: Briefcase,
    color: 'text-amber-500',
    dashboard: '/dashboard',
    features: ['Create your profile', 'List your skills', 'Set your rates', 'Get hired directly'],
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-red-500',
    dashboard: '/admin',
    features: ['Manage users', 'Monitor platform', 'Handle disputes', 'View analytics'],
  },
};
```

## Components Updated

1. **Header** (`src/components/layout/header.tsx`)
   - Added RoleSwitcher component
   - Maintains existing role dropdown in user menu

2. **Auth Store** (`src/lib/store/auth-store.ts`)
   - Already had role management
   - `switchRole()` function for changing active role
   - `fetchRoles()` to refresh from database

3. **Dashboard** (`src/app/dashboard/page.tsx`)
   - Dynamic routing based on active role
   - Renders appropriate dashboard view

## UI/UX Features

### Visual Indicators

- Color-coded roles (blue, emerald, amber, red)
- Icons for each role type
- "Active" badge on current role
- Role count badge when multiple roles enabled

### Accessibility

- Keyboard navigation support
- ARIA labels on all interactive elements
- Clear visual feedback on hover/focus
- Disabled state for single-role users

### Animations

- Smooth transitions between roles
- Dropdown animations
- Loading states during API calls
- Success/error toast notifications

## Security Considerations

1. **Authentication**: All API endpoints verify user authentication
2. **Validation**: Role names validated against allowed list
3. **Minimum Role**: Users must have at least one active role
4. **Admin Protection**: Admin role requires special permissions
5. **Database Constraints**: UNIQUE constraint prevents duplicate roles

## Testing Checklist

- [ ] Enable multiple roles
- [ ] Switch between roles
- [ ] Verify dashboard changes
- [ ] Disable a role (not current active)
- [ ] Disable current active role (should redirect)
- [ ] Try to disable all roles (should fail)
- [ ] Check role persistence after logout/login
- [ ] Test with single role (no switcher shown)
- [ ] Test role switcher in mobile view
- [ ] Verify API error handling

## Future Enhancements

1. **Role Permissions**: Fine-grained permissions per role
2. **Role History**: Track role switches and usage
3. **Role Analytics**: Show which role is used most
4. **Role Onboarding**: Guide users through role-specific features
5. **Role Badges**: Display role achievements/milestones
6. **Role Recommendations**: Suggest roles based on user activity

## Migration Guide

If users already exist in the database:

```sql
-- Ensure all existing users have at least the renter role
INSERT INTO user_roles (user_id, role, is_active)
SELECT id, 'renter', true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles WHERE is_active = true)
ON CONFLICT (user_id, role) DO NOTHING;
```

## Troubleshooting

### Role Switcher Not Showing

- Check if user has multiple roles enabled
- Verify `roles` array in auth store
- Check browser console for errors

### Dashboard Not Changing

- Verify `activeRole` is updating in store
- Check routing logic in dashboard page
- Ensure role-specific dashboard pages exist

### API Errors

- Check Supabase connection
- Verify user_roles table exists
- Check RLS policies on user_roles table
- Ensure user is authenticated

## Support

For issues or questions:

1. Check browser console for errors
2. Verify database schema matches documentation
3. Test API endpoints directly
4. Review auth store state in Redux DevTools
