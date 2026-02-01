# Draft: Breadcrumb Navigation & Layout Refinement

## Requirements (confirmed)

- Ensure breadcrumb path navigation is available on recommended pages.
- Fix breadcrumb locations if mismatched.
- Pages to include:
  - Provider/Renter Dashboards
  - Labour listings
  - User Profile pages
  - Booking lists
  - Messages
- Follow the "Dark Emerald / Organic Modernism" aesthetic.
- Maintain `max-w-[1600px]` container standard.
- Use `pt-16` top padding for pages with the new 56px (`h-14`) navbar.

## Technical Decisions

- Use the existing `Breadcrumb` component from `src/components/ui/breadcrumb.tsx`.
- Use the helper functions (`createDashboardBreadcrumb`, `createUserBreadcrumb`, etc.) to generate breadcrumb items.
- Standardize the placement of breadcrumbs: usually at the top of the main content area, before headers.

## Research Findings

- **Header Change**: Navbar reduced to `h-14` (56px). Old `pt-28` (112px) creates too much gap. New standard is `pt-16` (64px).
- **Dashboard Layout**: `src/app/renter/dashboard/page.tsx` is still using `pt-28`.
- **Breadcrumb Helpers**: `src/components/ui/breadcrumb.tsx` already has logic for Dashboards, Equipment, and Users.

## Open Questions

- Should the breadcrumbs be placed inside or outside the `max-w-1600px` container if one exists? (Usually inside for alignment).
- For dashboard pages with sidebars, should the breadcrumb be inside the `main` tag? (Yes, usually).

## Scope Boundaries

- INCLUDE: Dashboard, Labour, Profile, Booking, Message pages.
- EXCLUDE: Home page (doesn't need breadcrumbs starting from home).
- EXCLUDE: Login/Onboarding pages (minimalist navigation).
