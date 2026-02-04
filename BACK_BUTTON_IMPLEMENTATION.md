# Back Button Implementation

## Overview
Added a reusable back button component to all major pages in the application, allowing users to easily navigate back to the previous page or a fallback URL.

## Component Created

### `src/components/ui/back-button.tsx`
A flexible back button component with three variants:
- **default**: Standard button with border and background
- **minimal**: Text-only button with hover effects
- **floating**: Fixed position floating button (useful for full-screen pages)

**Features:**
- Smart navigation: Uses browser history if available, otherwise redirects to fallback URL
- Customizable label and styling
- Accessible with proper ARIA labels
- Smooth transitions and hover effects
- Dark mode compatible

## Pages Updated

### Main Application Pages
1. **Equipment Listing** (`src/app/equipment/page.tsx`) - minimal variant
2. **Labour Listing** (`src/app/labour/page.tsx`) - minimal variant
3. **Dashboard** (`src/app/dashboard/page.tsx`) - minimal variant
4. **Profile** (`src/app/profile/page.tsx`) - floating variant
5. **Settings** (`src/app/settings/page.tsx`) - minimal variant
6. **Help** (`src/app/help/page.tsx`) - minimal variant
7. **Gallery** (`src/app/gallery/page.tsx`) - minimal variant

## Usage

```tsx
import { BackButton } from '@/components/ui/back-button';

// Default variant
<BackButton />

// Minimal variant (recommended for most pages)
<BackButton variant="minimal" />

// Floating variant (for full-screen pages)
<BackButton variant="floating" />

// Custom fallback and label
<BackButton 
  fallbackUrl="/dashboard" 
  label="Go Back"
  variant="minimal"
/>
```

## Design Decisions

1. **Placement**: Back buttons are placed at the top of the main content area, before page headers
2. **Variant Selection**:
   - Minimal variant for standard pages (less visual weight)
   - Floating variant for immersive pages like profile
3. **Fallback URLs**: Default fallback is home page ('/'), but can be customized per page
4. **Accessibility**: Includes proper ARIA labels and keyboard navigation support

## Benefits

- **Improved UX**: Users can easily navigate back without using browser controls
- **Consistency**: Same back button experience across all pages
- **Mobile-Friendly**: Touch-friendly button sizes and positioning
- **Flexible**: Three variants to match different page layouts
- **Accessible**: Proper semantic HTML and ARIA attributes

## Future Enhancements

Consider adding back buttons to:
- Individual equipment detail pages
- Booking confirmation pages
- Message conversation pages
- Admin panel pages
- Error pages (404, 500, etc.)
