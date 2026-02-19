# Labour Route Migration Evidence Checklist

Generated: 2026-02-19

## Summary

This checklist tracks the migration of labour discovery links from `/renter/labour` to `/labour`.
Booking routes remain at `/renter/labour/bookings*`.

## Migration Status

### Navigation (T2)

- [x] `src/lib/navigation.ts` - "Find Labour" link updated to `/labour`
- [x] `src/lib/navigation.ts` - "Labour Bookings" link preserved at `/renter/labour/bookings`

### Dashboard Links (T2)

- [x] `src/components/dashboard/RenterDashboardView.tsx` - Find Labour CTA updated
- [x] `src/app/renter/dashboard/DashboardClient.tsx` - Find Labour CTA updated

### Cross-Surface Links (T3)

- [x] `src/app/renter/favorites/FavoritesClient.tsx` - Browse Labour link updated
- [x] `src/app/user/[id]/UserProfileClient.tsx` - Labour profile link updated
- [x] `src/app/labour/LabourClient.tsx` - Card navigation links updated

### Detail/Booking Fallbacks (T4)

- [x] `src/app/renter/labour/[id]/LabourDetailClient.tsx` - Back links and redirects updated
- [x] `src/app/renter/labour/[id]/book/BookLabourClient.tsx` - Back links and redirects updated

### Booking Detail Links (T5)

- [x] `src/app/renter/labour/bookings/[id]/LabourBookingDetailClient.tsx` - Hire Labour link updated
- [x] `src/app/renter/labour/bookings/[id]/LabourBookingDetailClient.tsx` - View Worker Profile link updated
- [x] Booking list/breadcrumb links preserved at `/renter/labour/bookings`

### Route Deprecation (T1)

- [x] `src/app/renter/labour/page.tsx` - Redirects to `/labour`

## Verification Commands

```bash
# Check for any remaining /renter/labour references (excluding bookings)
grep -r "/renter/labour" src/ --include="*.tsx" --include="*.ts" | grep -v "/bookings"

# Expected result: Only references should be in:
# - src/app/renter/labour/page.tsx (the redirect itself)
# - src/app/renter/labour/[id]/... (detail/book pages that need their internal links)

# Check booking routes are preserved
grep -r "/renter/labour/bookings" src/ --include="*.tsx" --include="*.ts"

# Expected result: References should exist for booking navigation
```

## Test Scenarios

### Redirect Test

- [ ] Navigate to `/renter/labour` → Should redirect to `/labour`
- [ ] Navigate to `/renter/labour?search=tractor` → Should redirect to `/labour?search=tractor`

### Booking Route Preservation Test

- [ ] Navigate to `/renter/labour/bookings` → Should show bookings list
- [ ] Navigate to `/renter/labour/bookings/[id]` → Should show booking detail

### Discovery Link Test

- [ ] Click "Find Labour" in navigation → Should go to `/labour`
- [ ] Click "Browse Labour" in favorites empty state → Should go to `/labour`
- [ ] Click labour profile from user page → Should go to `/labour/[id]`

### Fallback Link Test

- [ ] Click "Back to Labour" from detail page → Should go to `/labour`
- [ ] Click "Hire Labour" from booking detail → Should go to `/labour`

## Files Modified

1. src/app/renter/labour/page.tsx
2. src/lib/navigation.ts
3. src/components/dashboard/RenterDashboardView.tsx
4. src/app/renter/dashboard/DashboardClient.tsx
5. src/app/renter/favorites/FavoritesClient.tsx
6. src/app/user/[id]/UserProfileClient.tsx
7. src/app/labour/LabourClient.tsx
8. src/app/renter/labour/[id]/LabourDetailClient.tsx
9. src/app/renter/labour/[id]/book/BookLabourClient.tsx
10. src/app/renter/labour/bookings/[id]/LabourBookingDetailClient.tsx

## Evidence Files

- task-1-renter-labour-redirect.txt
- task-2-dashboard-labour-link.png
- task-2-bookings-link-preserved.png
- task-3-favorites-link.png
- task-3-link-grep.txt
- task-4-detail-back.png
- task-4-login-redirect.png
- task-5-booking-hire-link.png
- task-5-breadcrumb-preserved.png
- task-6-checklist-audit.txt (this file)
- task-6-stale-link-scan.txt
