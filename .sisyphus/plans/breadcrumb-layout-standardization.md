# Breadcrumb & Layout Standardization Plan

## TL;DR

> **Quick Summary**: Standardize breadcrumb navigation and fix layout inconsistencies (padding/width) across 43+ pages of the AgriServe platform.
>
> **Deliverables**:
>
> - Breadcrumbs added to 43 navigation-heavy pages
> - Legacy inline breadcrumbs refactored to use shared component
> - All page top padding standardized to `pt-16` (64px)
> - Width standardized to `max-w-[1600px]` where applicable
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - Grouped by sections (Renter, Provider, Admin, Global)
> **Critical Path**: Renter Dashboards → Provider Dashboards → Admin → Global Sections

---

## Context

### Original Request

Ensure breadcrumb path navigation is available on recommended pages and fix breadcrumb locations if any pages have mismatched implementations.

### Interview Summary

**Key Discussions**:

- Use the existing `Breadcrumb` component in `src/components/ui/breadcrumb.tsx` with helper functions.
- Breadcrumbs should be placed _inside_ the main content area for alignment with the 1600px container.
- Manual verification is preferred (automated commands + screenshots).

**Research Findings**:

- **Shared Component**: `src/components/ui/breadcrumb.tsx` with helper functions:
  - `createEquipmentBreadcrumb(category, equipmentName, equipmentId)`
  - `createBookingBreadcrumb(equipmentName, equipmentId)`
  - `createDashboardBreadcrumb(role, section)`
  - `createUserBreadcrumb(userName)`
- **Legacy Implementations**:
  - `src/app/equipment/[id]/page.tsx` uses inline breadcrumb component (needs refactoring)
  - `src/app/profile/page.tsx` uses manual hardcoded navigation (needs refactoring)
- **Layout Issues**: Dashboards using `pt-28` (112px) padding with new 56px navbar (should be `pt-16` = 64px).

### Metis Review

**Identified Gaps** (addressed):

- Mobile view behavior for long breadcrumb paths: Use truncation with `max-w-[200px]` (already in component).
- Sidebar vs full-width layouts: Breadcrumbs stay inside `main` content area.
- 43 pages identified across Renter (10), Provider (11), Admin (16), Global (6).

---

## Work Objectives

### Core Objective

Systematically add standardized breadcrumb navigation and fix layout inconsistencies across all 43+ identified pages in the AgriServe platform.

### Concrete Deliverables

- **Breadcrumbs on 43 pages** using shared `Breadcrumb` component with proper helper functions
- **Legacy refactors**: Replace inline/manual breadcrumbs in Equipment Detail and Profile pages
- **Layout fixes**: Update `pt-28` → `pt-16` on all affected pages
- **Width standardization**: Ensure `max-w-[1600px]` where applicable

### Definition of Done

- [ ] All 43 pages display breadcrumbs with proper path hierarchy
- [ ] Legacy inline breadcrumbs replaced with shared component
- [ ] Top padding standardized to `pt-16` on all dashboard pages
- [ ] Verification screenshots captured for each page group
- [ ] No visual regressions in mobile/desktop layouts

### Must Have

- Proper breadcrumb hierarchy (Home → Section → Sub-section → Page)
- Use of shared component helpers for consistency
- `pt-16` top padding on all dashboard pages
- Truncation for long page names (200px max-width)

### Must NOT Have (Guardrails)

- NO new breadcrumb component variations (use shared only)
- NO `pt-28` padding (obsolete with new navbar)
- NO light-mode styles (maintain dark theme)
- NO breadcrumbs on login/onboarding pages (minimalist navigation only)
- NO separate test files (verification is manual only per user request)

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (Playwright available but not used per user preference)
- **User wants tests**: NO (Manual verification only)
- **Framework**: None (manual QA)

### Manual Verification Procedures

**For Each Page Group** (using Playwright browser automation):

```
1. Navigate to: http://localhost:3000/[page-path]
2. Capture screenshot: .sisyphus/evidence/breadcrumb-[page-group].png
3. Verify: Breadcrumb is visible at top of content area
4. Verify: Path hierarchy is correct (Home → X → Y)
5. Verify: Current page name is truncated if > 200px
6. Click "Home" link → Should navigate to /
7. Click parent link → Should navigate to parent section
8. Verify: Padding is pt-16 (not pt-28) by checking computed styles
```

**Evidence Requirements**:

- Screenshots saved to `.sisyphus/evidence/breadcrumb-[page-group].png`
- Terminal output from style verification
- JSON summary of verification results

---

## Execution Strategy

### Parallel Execution Waves

**Wave 1: Renter Dashboard (10 pages)**

- Can run in parallel
- No dependencies
- Files: `src/app/renter/**/*.tsx`

**Wave 2: Provider Dashboard (11 pages)**

- Can run in parallel
- No dependencies
- Files: `src/app/provider/**/*.tsx`

**Wave 3: Admin Dashboard (16 pages)**

- Can run in parallel
- No dependencies
- Files: `src/app/admin/**/*.tsx`

**Wave 4: Global Sections (6 pages) + Legacy Refactors**

- Can run in parallel
- Includes: `/src/app/dashboard/page.tsx`, `/src/app/labour/page.tsx`, etc.
- Includes: Legacy refactors (Equipment Detail, Profile)

**Critical Path**: Wave 1 → Wave 2 → Wave 3 → Wave 4
**Parallel Speedup**: ~75% faster than sequential (4 waves running simultaneously)

### Dependency Matrix

| Task                   | Depends On | Blocks  | Can Parallelize With   |
| ---------------------- | ---------- | ------- | ---------------------- |
| Wave 1 (Renter)        | None       | Nothing | Wave 2, Wave 3, Wave 4 |
| Wave 2 (Provider)      | None       | Nothing | Wave 1, Wave 3, Wave 4 |
| Wave 3 (Admin)         | None       | Nothing | Wave 1, Wave 2, Wave 4 |
| Wave 4 (Global+Legacy) | None       | Nothing | Wave 1, Wave 2, Wave 3 |

### Agent Dispatch Summary

| Wave | Tasks    | Recommended Agents                                                                      |
| ---- | -------- | --------------------------------------------------------------------------------------- |
| 1    | 10 pages | delegate_task(category="quick", load_skills=["frontend-ui-ux"], run_in_background=true) |
| 2    | 11 pages | delegate_task(category="quick", load_skills=["frontend-ui-ux"], run_in_background=true) |
| 3    | 16 pages | delegate_task(category="quick", load_skills=["frontend-ui-ux"], run_in_background=true) |
| 4    | 8 pages  | delegate_task(category="quick", load_skills=["frontend-ui-ux"], run_in_background=true) |

---

## TODOs

### Wave 1: Renter Dashboard Pages (10 pages)

- [ ] 1.1 Renter Dashboard (`src/app/renter/dashboard/page.tsx`)

  **What to do**:
  - Add import: `import { Breadcrumb, createDashboardBreadcrumb } from '@/components/ui'`
  - Add breadcrumb inside main content (after Header, before Welcome section)
  - Change `pt-28` to `pt-16` in main className
  - Add: `<Breadcrumb items={createDashboardBreadcrumb('renter')} className="mb-6" />`

  **Must NOT do**:
  - Don't change sidebar layout
  - Don't add breadcrumbs to sidebar itself
  - Don't modify other page logic

  **Recommended Agent Profile**:
  - **Category**: `quick` - Simple component addition and className change
  - **Skills**: `frontend-ui-ux` - For proper placement within dark theme

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Nothing
  - **Blocked By**: Nothing

  **References**:
  - `src/components/ui/breadcrumb.tsx:100-119` - `createDashboardBreadcrumb` helper function
  - `src/app/about/page.tsx:119` - Example usage pattern

  **Acceptance Criteria**:

  ```bash
  # Agent executes:
  curl -s http://localhost:3000/renter/dashboard | grep -q "Dashboard" && echo "Breadcrumb present"
  # Verify: pt-16 padding via browser dev tools
  # Screenshot: .sisyphus/evidence/wave1-renter-dashboard.png
  ```

  **Commit**: YES
  - Message: `feat(renter): add breadcrumb to dashboard page`
  - Files: `src/app/renter/dashboard/page.tsx`

- [ ] 1.2 Renter Bookings List (`src/app/renter/bookings/page.tsx`)

  **What to do**:
  - Add breadcrumb: `<Breadcrumb items={createDashboardBreadcrumb('renter', 'Bookings')} className="mb-6" />`
  - Change `pt-28` to `pt-16`

  **References**:
  - `src/components/ui/breadcrumb.tsx:100-119` - Dashboard breadcrumb helper

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Bookings

- [ ] 1.3 Renter Booking Detail (`src/app/renter/bookings/[id]/page.tsx`)

  **What to do**:
  - Add breadcrumb with booking ID
  - Change `pt-28` to `pt-16`

  **References**:
  - Current page structure to determine where to place breadcrumb

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Bookings → [Booking ID truncated]

- [ ] 1.4 Renter Labour List (`src/app/renter/labour/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('renter', 'Labour')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Labour

- [ ] 1.5 Renter Labour Detail (`src/app/renter/labour/[id]/page.tsx`)

  **What to do**:
  - Add breadcrumb with labour name
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Labour → [Labour Name]

- [ ] 1.6 Renter Labour Book Page (`src/app/renter/labour/[id]/book/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Dashboard → Labour → [Name] → Book
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows full path to booking action

- [ ] 1.7 Renter Labour Bookings (`src/app/renter/labour/bookings/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('renter', 'Labour Bookings')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Labour Bookings

- [ ] 1.8 Renter Reviews (`src/app/renter/reviews/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('renter', 'Reviews')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Reviews

- [ ] 1.9 Renter Messages (`src/app/renter/messages/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('renter', 'Messages')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Messages

- [ ] 1.10 Renter Favorites (`src/app/renter/favorites/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('renter', 'Favorites')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Favorites

### Wave 2: Provider Dashboard Pages (11 pages)

- [ ] 2.1 Provider Dashboard (`src/app/provider/dashboard/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('provider')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard

- [ ] 2.2 Provider Landing (`src/app/provider/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('provider')`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Provider Dashboard

- [ ] 2.3 Provider Bookings (`src/app/provider/bookings/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('provider', 'Bookings')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Bookings

- [ ] 2.4 Provider Equipment List (`src/app/provider/equipment/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('provider', 'Equipment')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Equipment

- [ ] 2.5 Provider Equipment Detail (`src/app/provider/equipment/[id]/page.tsx`)

  **What to do**:
  - Add breadcrumb with equipment name
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Equipment → [Equipment Name]

- [ ] 2.6 Provider Labour List (`src/app/provider/labour/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('provider', 'Labour Services')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Labour Services

- [ ] 2.7 Provider Labour Create (`src/app/provider/labour/create/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Dashboard → Labour → Create
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows full creation path

- [ ] 2.8 Provider Labour Edit (`src/app/provider/labour/edit/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Dashboard → Labour → Edit
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows edit path

- [ ] 2.9 Provider Reviews (`src/app/provider/reviews/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('provider', 'Reviews')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Reviews

- [ ] 2.10 Provider Messages (`src/app/provider/messages/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('provider', 'Messages')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Messages

- [ ] 2.11 Provider Earnings (`src/app/provider/earnings/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('provider', 'Earnings')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard → Earnings

### Wave 3: Admin Dashboard Pages (16 pages)

- [ ] 3.1 Admin Landing (`src/app/admin/page.tsx`)

  **What to do**:
  - Add breadcrumb: `createDashboardBreadcrumb('admin')`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin

- [ ] 3.2 Admin Dashboard (`src/app/admin/dashboard/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Dashboard
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Dashboard

- [ ] 3.3 Admin Equipment (`src/app/admin/equipment/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Equipment
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Equipment

- [ ] 3.4 Admin Users List (`src/app/admin/users/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Users
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Users

- [ ] 3.5 Admin User Detail (`src/app/admin/users/[id]/page.tsx`)

  **What to do**:
  - Add breadcrumb with user name
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Users → [User Name]

- [ ] 3.6 Admin Labour (`src/app/admin/labour/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Labour
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Labour

- [ ] 3.7 Admin Bookings List (`src/app/admin/bookings/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Bookings
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Bookings

- [ ] 3.8 Admin Booking Detail (`src/app/admin/bookings/[id]/page.tsx`)

  **What to do**:
  - Add breadcrumb with booking ID
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Bookings → [Booking ID]

- [ ] 3.9 Admin Reviews (`src/app/admin/reviews/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Reviews
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Reviews

- [ ] 3.10 Admin Analytics (`src/app/admin/analytics/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Analytics
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Analytics

- [ ] 3.11 Admin Payments (`src/app/admin/payments/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Payments
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Payments

- [ ] 3.12 Admin Disputes (`src/app/admin/disputes/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Disputes
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Disputes

- [ ] 3.13 Admin Storage (`src/app/admin/storage/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Storage
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Storage

- [ ] 3.14 Admin Database (`src/app/admin/database/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Database
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Database

- [ ] 3.15 Admin Settings (`src/app/admin/settings/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Settings
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Settings

- [ ] 3.16 Admin Logs (`src/app/admin/logs/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Admin → Logs
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Admin → Logs

### Wave 4: Global Sections + Legacy Refactors (8 pages)

- [ ] 4.1 Global Dashboard (`src/app/dashboard/page.tsx`)

  **What to do**:
  - Add breadcrumb: `<Breadcrumb items={[{ label: 'Dashboard' }]} className="mb-6" />`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Dashboard

- [ ] 4.2 Labour Main Page (`src/app/labour/page.tsx`)

  **What to do**:
  - Add breadcrumb: `<Breadcrumb items={[{ label: 'Labour Services' }]} className="mb-6" />`
  - Change `pt-28` to `pt-16` if present

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Labour Services

- [ ] 4.3 Bookings Main Page (`src/app/bookings/page.tsx`)

  **What to do**:
  - Add breadcrumb: `<Breadcrumb items={[{ label: 'Bookings' }]} className="mb-6" />`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Bookings

- [ ] 4.4 Messages List (`src/app/messages/page.tsx`)

  **What to do**:
  - Add breadcrumb: `<Breadcrumb items={[{ label: 'Messages' }]} className="mb-6" />`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Messages

- [ ] 4.5 Message Detail (`src/app/messages/[id]/page.tsx`)

  **What to do**:
  - Add breadcrumb: Home → Messages → [Conversation]
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows conversation path

- [ ] 4.6 Equipment Main Page (`src/app/equipment/page.tsx`)

  **What to do**:
  - Add breadcrumb: `<Breadcrumb items={[{ label: 'Equipment', href: '/equipment' }]} className="mb-6" />`
  - Change `pt-28` to `pt-16`

  **Acceptance Criteria**:
  - Breadcrumb shows: Home → Equipment (with link)

- [ ] 4.7 Legacy: Equipment Detail Refactor (`src/app/equipment/[id]/page.tsx`)

  **What to do**:
  - **CRITICAL**: Remove inline `Breadcrumb` function (lines 525-566)
  - Use shared component: `createEquipmentBreadcrumb(category, equipmentName, id)`
  - Keep `pt-16` (already correct)

  **References**:
  - `src/app/equipment/[id]/page.tsx:525-566` - Inline component to remove
  - `src/components/ui/breadcrumb.tsx:70-87` - `createEquipmentBreadcrumb` helper

  **Acceptance Criteria**:
  - No inline breadcrumb component exists
  - Shared component is used
  - Breadcrumb shows: Home → Equipment → [Category] → [Equipment Name]

- [ ] 4.8 Legacy: Profile Page Refactor (`src/app/profile/page.tsx`)

  **What to do**:
  - **CRITICAL**: Replace manual breadcrumb (lines 432-455) with shared component
  - Use: `createUserBreadcrumb(profile?.name || 'Profile')`
  - Remove manual button-based navigation

  **References**:
  - `src/app/profile/page.tsx:432-455` - Manual breadcrumb to replace
  - `src/components/ui/breadcrumb.tsx:121-123` - `createUserBreadcrumb` helper

  **Acceptance Criteria**:
  - Manual breadcrumb removed
  - Shared component used
  - Breadcrumb shows: Home → Profile → [User Name]

---

## Commit Strategy

| After Wave | Message                                                                                | Files                                                                                                                                                                       | Verification            |
| ---------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Wave 1     | `feat(renter): add breadcrumbs to all dashboard pages`                                 | `src/app/renter/**/*.tsx`                                                                                                                                                   | Screenshot verification |
| Wave 2     | `feat(provider): add breadcrumbs to all dashboard pages`                               | `src/app/provider/**/*.tsx`                                                                                                                                                 | Screenshot verification |
| Wave 3     | `feat(admin): add breadcrumbs to all admin pages`                                      | `src/app/admin/**/*.tsx`                                                                                                                                                    | Screenshot verification |
| Wave 4     | `feat(global): add breadcrumbs to global sections and refactor legacy implementations` | `src/app/dashboard/page.tsx`, `src/app/labour/page.tsx`, `src/app/bookings/page.tsx`, `src/app/messages/**/*.tsx`, `src/app/equipment/**/*.tsx`, `src/app/profile/page.tsx` | Screenshot verification |

---

## Success Criteria

### Verification Commands

```bash
# Quick spot check - verify breadcrumbs are present
curl -s http://localhost:3000/renter/dashboard | grep -q "Breadcrumb" && echo "Renter dashboard: OK"
curl -s http://localhost:3000/provider/dashboard | grep -q "Breadcrumb" && echo "Provider dashboard: OK"
curl -s http://localhost:3000/admin/dashboard | grep -q "Breadcrumb" && echo "Admin dashboard: OK"

# Check for removed inline components
grep -r "function Breadcrumb" src/app/equipment/[id]/page.tsx && echo "FAIL: Inline breadcrumb still exists" || echo "OK: Inline breadcrumb removed"
grep -r "Breadcrumb Navigation" src/app/profile/page.tsx && echo "FAIL: Manual breadcrumb still exists" || echo "OK: Manual breadcrumb removed"
```

### Final Checklist

- [ ] All 43 pages have breadcrumbs
- [ ] Legacy inline breadcrumbs removed
- [ ] All `pt-28` changed to `pt-16`
- [ ] Screenshots captured for all 4 waves
- [ ] No visual regressions
- [ ] All commits follow conventional format

---

## Plan Metadata

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Plan Name      | breadcrumb-layout-standardization                      |
| Total Pages    | 43                                                     |
| Total Waves    | 4                                                      |
| Estimated Time | Large (4-6 hours with parallel execution)              |
| Risk Level     | Medium (touching many files, but changes are isolated) |
| Test Strategy  | Manual verification with screenshots                   |
| Dependencies   | None (uses existing shared component)                  |
