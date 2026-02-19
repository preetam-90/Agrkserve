# Role Registration - All Access Points

## 🎯 Where to Register for New Roles

I've added **multiple easy ways** for users to find and register for new roles:

### 1. ⭐ User Dropdown Menu (PRIMARY - Most Visible)

**Location:** Header → Profile Picture → Dropdown Menu

**What I Added:**

- **"Manage Roles"** menu item
- Highlighted with **green background** and border
- Shows **"NEW"** badge if user has less than 3 roles
- Uses Tractor icon 🚜
- Positioned prominently after Profile, before Settings

**Code:** `src/components/layout/header.tsx` (line ~455)

**User Flow:**

```
Click Profile Picture → See "Manage Roles" (green) → Click → Role Management Page
```

---

### 2. 📋 Settings Page - Roles Tab

**Location:** Settings → Roles Tab

**What I Added:**

- New **"Roles"** tab in settings (4 tabs now instead of 3)
- Tab shows Shield icon 🛡️
- Content explains role system
- Big **"Go to Role Management"** button
- Shows preview of all 3 available roles

**Code:** `src/app/settings/page.tsx`

**User Flow:**

```
Settings → Roles Tab → Click "Go to Role Management" → Role Management Page
```

---

### 3. 🎯 Direct Page

**Location:** `/settings/roles`

**What's There:**

- Full role management interface
- Toggle switches for each role
- "Available" badges for new roles
- "New!" badges when enabling
- Save/Cancel buttons
- Automatic onboarding redirect

**Code:** `src/app/settings/roles/page.tsx`

---

### 4. 🔄 Role Switcher (For Existing Multi-Role Users)

**Location:** Header (next to notifications)

**What It Does:**

- Shows current active role
- Dropdown to switch roles
- Link to "Manage Roles" at bottom of dropdown

**Code:** `src/components/layout/role-switcher.tsx`

---

### 5. 📢 Registration Banner (Optional)

**Location:** Can be added to any page

**What It Does:**

- Shows when user doesn't have all roles
- Dismissible (saves to localStorage)
- "Register Now" button
- Shows which roles are available

**Code:** `src/components/layout/role-registration-banner.tsx`

**To Use:** Import and add `<RoleRegistrationBanner />` to any page

---

### 6. 📊 Dashboard Quick Guide (Optional)

**Location:** Can be added to dashboard

**What It Does:**

- Shows if user has multiple roles (how to switch)
- Shows available roles (how to register)
- Dismissible card
- Links to role management

**Code:** `src/components/dashboard/role-quick-guide.tsx`

**To Use:** Import and add `<RoleQuickGuide />` to dashboard

---

## 🎨 Visual Hierarchy

### Most Prominent (Users will see first):

1. ⭐ **User Menu "Manage Roles"** - Green highlighted, always visible when logged in
2. 📋 **Settings Roles Tab** - Dedicated tab in settings
3. 🔄 **Role Switcher** - Appears when user has 2+ roles

### Secondary (Optional enhancements):

4. 📢 **Banner** - Can be added to pages
5. 📊 **Dashboard Guide** - Can be added to dashboard

---

## 📱 Mobile Responsive

All access points work on mobile:

- User menu dropdown adapts
- Settings tabs stack
- Role management page is mobile-friendly
- Buttons are touch-friendly

---

## 🎯 User Journey

### New User (First Time):

1. Signs up → Gets "Renter" role automatically
2. Sees user menu → **"Manage Roles"** is highlighted in green
3. Clicks it → Goes to role management
4. Sees Provider and Labour with "Available" badges
5. Toggles one ON → Saves
6. Redirected to onboarding
7. Completes setup → Done!

### Existing User (Adding Role):

1. Clicks profile picture
2. Sees **"Manage Roles"** (green, with "NEW" badge)
3. Clicks it
4. Toggles new role ON
5. Saves → Onboarding → Done!

---

## ✅ What Makes It Easy to Find

1. **Green Highlighting** - "Manage Roles" stands out in the menu
2. **"NEW" Badge** - Draws attention if user has < 3 roles
3. **Icon** - Tractor icon 🚜 is recognizable
4. **Position** - Right after Profile, before Settings
5. **Multiple Paths** - User menu, Settings tab, direct URL
6. **Persistent** - Always in the header when logged in

---

## 🔧 Technical Implementation

### Files Modified:

1. `src/components/layout/header.tsx` - Added "Manage Roles" to user menu
2. `src/app/settings/page.tsx` - Added Roles tab

### Files Created:

1. `src/app/settings/roles/page.tsx` - Role management page
2. `src/components/layout/role-switcher.tsx` - Role switcher component
3. `src/components/layout/role-registration-banner.tsx` - Optional banner
4. `src/components/dashboard/role-quick-guide.tsx` - Optional guide
5. `src/app/onboarding/provider/page.tsx` - Provider onboarding
6. `src/app/onboarding/labour/page.tsx` - Labour onboarding
7. `src/app/api/user/roles/route.ts` - Role management API
8. `src/app/api/labour/profile/route.ts` - Labour profile API

---

## 🎉 Result

Users can now easily find role registration through:

- ✅ **Prominent menu item** (green, highlighted)
- ✅ **Settings tab** (dedicated section)
- ✅ **Direct URL** (/settings/roles)
- ✅ **Role switcher** (for multi-role users)
- ✅ **Optional banner** (can be added anywhere)
- ✅ **Optional guide** (can be added to dashboard)

**Primary Path:** Profile Picture → **Manage Roles** (green) → Toggle Role → Save → Done! 🚀
