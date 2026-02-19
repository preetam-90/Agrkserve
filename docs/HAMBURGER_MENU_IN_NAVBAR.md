# Hamburger Menu Moved to Navbar

## Changes Made

Successfully moved the three-line hamburger menu button from below the navbar into the navbar itself, positioned next to the tractor logo. Also removed the duplicate mobile toggle button that was appearing below the navbar.

### Files Modified

1. **src/components/layout/header.tsx**
   - Added `useAppStore` import to access sidebar state
   - Added hamburger menu button in the navbar, left side next to the logo
   - Wrapped logo and hamburger in a flex container for proper alignment
   - Button only shows when user is logged in
   - Includes hover effects and animations consistent with the design system

2. **src/components/layout/sidebar-redesigned.tsx**
   - Removed the floating mobile toggle button that appeared below the navbar
   - Kept the mobile overlay backdrop for closing sidebar on mobile

3. **src/components/layout/sidebar.tsx** (old sidebar component)
   - Removed the floating mobile toggle button at `top-20` position
   - This was the "second three line menu" appearing below the navbar
   - Kept the mobile overlay backdrop for closing sidebar on mobile

### Implementation Details

The hamburger button:

- Positioned in the navbar next to the tractor logo on the left
- Uses the same glassmorphism style as other navbar elements
- Toggles sidebar open/close state via `useAppStore`
- Visible on all screen sizes (mobile and desktop)
- Only appears when user is authenticated
- Includes smooth hover and tap animations

### Visual Result

**Before:**

- Hamburger button in navbar (newly added)
- Second hamburger button floated below navbar at `top-20` (duplicate)

**After:**

- Single hamburger button integrated into navbar next to logo
- No duplicate buttons
- Clean, cohesive header layout
