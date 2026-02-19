# Labour Listing Redesign And Route Consolidation

## TL;DR

> **Quick Summary**: Redesign `/labour` to match the provided dark emerald reference and deprecate the duplicate renter listing entry at `/renter/labour`.
>
> **Deliverables**:
>
> - Route consolidation: `/renter/labour` redirects to `/labour`
> - Internal link migration away from `/renter/labour` listing/detail entry links
> - Visual redesign of `src/app/labour/LabourClient.tsx` (cards, filters, toolbar, states)
> - Verification evidence in `.sisyphus/evidence/`
>
> **Estimated Effort**: Medium-Large
> **Parallel Execution**: YES - 3 waves + final review wave
> **Critical Path**: T1 -> T2 -> T6 -> T8 -> T11 -> F1-F4

---

## Context

### Original Request

User asked to implement the existing labour redesign plan from the provided image, then clarified scope to remove `/renter/labour` and keep only `/labour` for labour discovery.

### Interview Summary

**Key Discussions**:

- Redesign target remains the labour listing UX to visually match the shared reference.
- Route scope changed: remove renter listing entry route and keep public listing route.
- Keep work focused on UI + routing; no backend/data model changes requested.

**Research Findings**:

- Significant references to `/renter/labour` exist in navigation, dashboard CTAs, favourites, user profile links, and booking detail cross-links.
- Test infrastructure is minimal: no Jest/Vitest/Playwright setup in repo scripts; CI currently runs lint, type-check, and build.
- `/renter/labour/bookings` flow exists and must not be broken by listing route deprecation.

### Metis Review

**Identified Gaps (addressed in this plan)**:

- Safe deprecation guardrails were missing for `/renter/labour`.
- Booking-related links needed explicit IN/OUT scope.
- Acceptance criteria needed redirect validation and deep-link checks.
- Scope creep risk: accidentally refactoring booking history routes while only deprecating listing entry.

---

## Work Objectives

### Core Objective

Deliver a reference-quality labour marketplace UI on `/labour` and eliminate duplicate listing entry UX by deprecating `/renter/labour` safely.

### Concrete Deliverables

- Route behavior:
  - `/renter/labour` permanently routes users to `/labour`.
  - Existing booking history flow remains accessible.
- Visual updates on `/labour`:
  - Card overlay badges, refined stats row, polished tags/buttons
  - Emerald-accent filter sidebar and toolbar polish
  - Improved loading/empty/responsive behavior
- Link migration:
  - Internal links stop targeting deprecated listing entry route.

### Definition of Done

- [ ] `/renter/labour` no longer serves its own listing UI
- [ ] Internal navigation to labour discovery points to `/labour`
- [ ] `/labour` visually aligns with provided reference intent
- [ ] Search, filter, sort, message, and hire entry points still work
- [ ] `bun run type-check`, `bun run lint`, and `bun run build` pass

### Must Have

- Route consolidation without breaking booking management pages
- Emerald dark visual style matching reference patterns
- Fully responsive listing experience (mobile/tablet/desktop)
- Evidence-backed QA for redirects, links, and visual behavior

### Must NOT Have (Guardrails)

- Do not modify Supabase schema, service layer contracts, or API responses
- Do not remove or break `/renter/labour/bookings` routes
- Do not introduce unrelated provider/admin/renter dashboard redesign
- Do not add new dependencies unless absolutely required (none expected)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - Verification is agent-executed.

### Test Decision

- **Infrastructure exists**: NO (no dedicated automated test framework in repo)
- **Automated tests**: None (for this scope)
- **Framework**: N/A
- **Primary verification**: Agent-executed QA + static checks (`type-check`, `lint`, `build`)

### QA Policy

- **Frontend/UI**: Playwright (visual checks + interaction checks)
- **Routing/Redirects**: Bash (`curl`) + Playwright navigation assertions
- **Static Quality**: Bash (`bun run type-check`, `bun run lint`, `bun run build`)
- **Evidence Location**: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Route consolidation + link migration, parallel-safe)
├── T1: Deprecate /renter/labour entry route via redirect [quick]
├── T2: Update navigation + renter dashboard discovery links [quick]
├── T3: Update favorites/profile/public cross-links to /labour [quick]
├── T4: Update renter labour detail/book fallback links [unspecified-high]
├── T5: Update booking-detail cross-links while preserving bookings routes [unspecified-high]
└── T6: Add redirect/link regression checklist harness + evidence stubs [quick]

Wave 2 (Visual redesign on /labour, parallelized by concern)
├── T7: Redesign card media overlay (availability + rating badges) [visual-engineering]
├── T8: Redesign card body (name/status/stats/tags/buttons) [visual-engineering]
├── T9: Redesign filter sidebar sections + control styling [visual-engineering]
├── T10: Polish toolbar/search/sort/active-filter chips + grid rhythm [visual-engineering]
└── T11: Align loading/empty/load-more states + responsive polish [visual-engineering]

Wave 3 (Behavioral hardening + release checks)
├── T12: Functional regression (search/filter/sort/hire/message) [unspecified-high]
├── T13: Redirect and deep-link verification [quick]
├── T14: Accessibility + responsive QA + evidence packaging [unspecified-high]
└── T15: Static quality checks (type/lint/build) + release readiness [quick]

Wave FINAL (Independent parallel review)
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Real QA replay of all scenarios [unspecified-high]
└── F4: Scope fidelity audit [deep]
```

### Dependency Matrix (full)

| Task | Blocked By                | Blocks         |
| ---- | ------------------------- | -------------- |
| T1   | None                      | T13            |
| T2   | None                      | T12            |
| T3   | None                      | T12            |
| T4   | T1                        | T12            |
| T5   | T1                        | T12            |
| T6   | T1,T2,T3,T4,T5            | T13,F3         |
| T7   | T6                        | T8,T11         |
| T8   | T7                        | T10,T11,T12    |
| T9   | T6                        | T10,T12        |
| T10  | T8,T9                     | T11,T12        |
| T11  | T7,T8,T10                 | T12,T14        |
| T12  | T2,T3,T4,T5,T8,T9,T10,T11 | T14,F3         |
| T13  | T1,T6                     | F3,F4          |
| T14  | T11,T12                   | F2,F3          |
| T15  | T12,T13,T14               | F1,F2,F4       |
| F1   | T15                       | Final sign-off |
| F2   | T14,T15                   | Final sign-off |
| F3   | T6,T12,T13,T14            | Final sign-off |
| F4   | T13,T15                   | Final sign-off |

### Agent Dispatch Summary

- **Wave 1**: T1,T2,T3,T6 -> `quick`; T4,T5 -> `unspecified-high`
- **Wave 2**: T7-T11 -> `visual-engineering` (+ `frontend-ui-ux`, `playwright` as needed)
- **Wave 3**: T12,T14 -> `unspecified-high`; T13,T15 -> `quick`
- **FINAL**: F1 -> `oracle`; F2/F3 -> `unspecified-high`; F4 -> `deep`

---

## TODOs

- [ ] 1. Deprecate `/renter/labour` listing entry route

  **What to do**:
  - Replace listing entry behavior so `/renter/labour` routes to `/labour`.
  - Keep nested booking routes intact (`/renter/labour/bookings*`).

  **Must NOT do**:
  - Do not delete booking pages.
  - Do not remove detail/booking route directories in this task.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: isolated routing update.
  - **Skills**: [`desloppify`]
    - `desloppify`: avoids collateral edits and keeps scope tight.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T13
  - **Blocked By**: None

  **References**:
  - `src/app/renter/labour/page.tsx` - deprecated listing entrypoint.
  - `src/app/renter/labour/bookings/page.tsx` - route that must remain available.

  **Acceptance Criteria**:
  - [ ] Visiting `/renter/labour` lands on `/labour`.
  - [ ] Visiting `/renter/labour/bookings` still opens bookings list.

  **QA Scenarios**:

  ```
  Scenario: listing route redirects correctly
    Tool: Bash (curl)
    Preconditions: app running on localhost:3000
    Steps:
      1. Run: curl -I http://localhost:3000/renter/labour
      2. Assert status is redirect (307/308)
      3. Assert Location header ends with /labour
    Expected Result: Redirect to /labour is present
    Evidence: .sisyphus/evidence/task-1-renter-labour-redirect.txt

  Scenario: bookings route remains accessible
    Tool: Playwright
    Preconditions: app running
    Steps:
      1. Navigate to /renter/labour/bookings
      2. Wait for page shell to render
      3. Assert URL still contains /renter/labour/bookings
    Expected Result: No forced redirect to /labour for bookings path
    Evidence: .sisyphus/evidence/task-1-bookings-route-survives.png
  ```

  **Commit**: YES
  - Message: `refactor(routes): deprecate renter labour listing entry`

---

- [ ] 2. Update navigation and dashboard labour discovery links

  **What to do**:
  - Migrate renter discovery links from `/renter/labour` to `/labour`.
  - Preserve booking-history links that intentionally stay under renter namespace.

  **Must NOT do**:
  - Do not remove labour booking navigation entries.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`desloppify`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T3/T4/T5)
  - **Blocks**: T12
  - **Blocked By**: None

  **References**:
  - `src/lib/navigation.ts` - source of renter sidebar link targets.
  - `src/components/dashboard/RenterDashboardView.tsx` - dashboard CTA links.
  - `src/app/renter/dashboard/DashboardClient.tsx` - alternate renter dashboard link surface.

  **Acceptance Criteria**:
  - [ ] “Find Labour” style links route to `/labour`.
  - [ ] “Labour Bookings” links still route to `/renter/labour/bookings`.

  **QA Scenarios**:

  ```
  Scenario: renter dashboard opens labour discovery at /labour
    Tool: Playwright
    Preconditions: logged-in renter session
    Steps:
      1. Open renter dashboard
      2. Click labour discovery CTA link/button
      3. Assert URL equals /labour
    Expected Result: Discovery links use /labour
    Evidence: .sisyphus/evidence/task-2-dashboard-labour-link.png

  Scenario: bookings nav remains unchanged
    Tool: Playwright
    Preconditions: renter dashboard open
    Steps:
      1. Click Labour Bookings link
      2. Assert URL includes /renter/labour/bookings
    Expected Result: Booking history path still valid
    Evidence: .sisyphus/evidence/task-2-bookings-link-preserved.png
  ```

  **Commit**: YES
  - Message: `refactor(nav): point renter labour discovery to public route`

---

- [ ] 3. Migrate cross-links in favourites, profile, and public labour entry

  **What to do**:
  - Replace stale `/renter/labour` discovery/detail links in cross-surface UIs.

  **Must NOT do**:
  - Do not alter booking API IDs or data contracts.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`desloppify`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T12
  - **Blocked By**: None

  **References**:
  - `src/app/renter/favorites/FavoritesClient.tsx` - “Browse Labour” empty state link.
  - `src/app/user/[id]/UserProfileClient.tsx` - labour profile links.
  - `src/app/labour/LabourClient.tsx` - any cross-links currently pointing to renter path.

  **Acceptance Criteria**:
  - [ ] No cross-surface discovery/detail links target deprecated listing entry namespace.

  **QA Scenarios**:

  ```
  Scenario: favorites empty state sends users to /labour
    Tool: Playwright
    Preconditions: account with empty labour favorites
    Steps:
      1. Open favorites page
      2. Click Browse Labour
      3. Assert URL is /labour
    Expected Result: Link updated
    Evidence: .sisyphus/evidence/task-3-favorites-link.png

  Scenario: profile labour links avoid deprecated route
    Tool: Bash (grep)
    Preconditions: repository available
    Steps:
      1. Search for "/renter/labour/${" in updated link contexts
      2. Confirm no residual references in targeted files
    Expected Result: Deprecated discovery/detail links removed from touched files
    Evidence: .sisyphus/evidence/task-3-link-grep.txt
  ```

  **Commit**: YES
  - Message: `refactor(links): migrate labour cross-links to /labour`

---

- [ ] 4. Update renter labour detail and booking fallback links

  **What to do**:
  - Adjust back/fallback/login-redirect links in renter labour detail/book clients so listing fallback points to `/labour`.

  **Must NOT do**:
  - Do not break booking submit flow.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`desloppify`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T12
  - **Blocked By**: T1

  **References**:
  - `src/app/renter/labour/[id]/LabourDetailClient.tsx`
  - `src/app/renter/labour/[id]/book/BookLabourClient.tsx`

  **Acceptance Criteria**:
  - [ ] Error/back fallback from detail/book returns to `/labour`.
  - [ ] Login redirect target uses active `/labour/*` paths.

  **QA Scenarios**:

  ```
  Scenario: detail back action routes to /labour
    Tool: Playwright
    Preconditions: open a renter labour detail page
    Steps:
      1. Click Back to labour list action
      2. Assert URL is /labour
    Expected Result: Correct fallback route
    Evidence: .sisyphus/evidence/task-4-detail-back.png

  Scenario: unauthenticated hire flow uses updated redirect param
    Tool: Playwright
    Preconditions: logged out session
    Steps:
      1. Open a labour detail and click Hire Now
      2. Land on login page
      3. Assert redirect query contains /labour/
    Expected Result: No redirect param points to deprecated listing path
    Evidence: .sisyphus/evidence/task-4-login-redirect.png
  ```

  **Commit**: YES
  - Message: `fix(labour): align renter detail fallback links with /labour`

---

- [ ] 5. Update booking-detail cross-links safely

  **What to do**:
  - In booking detail UI, update “Hire Labour” and profile links to active `/labour` entry paths.
  - Keep booking breadcrumbs and booking list route intact.

  **Must NOT do**:
  - Do not change booking status logic.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`desloppify`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T12
  - **Blocked By**: T1

  **References**:
  - `src/app/renter/labour/bookings/[id]/LabourBookingDetailClient.tsx`

  **Acceptance Criteria**:
  - [ ] Booking detail’s labour discovery links point to `/labour`.
  - [ ] Booking breadcrumb/list links remain `/renter/labour/bookings*`.

  **QA Scenarios**:

  ```
  Scenario: booking detail hire link goes to /labour
    Tool: Playwright
    Preconditions: open booking detail page
    Steps:
      1. Click Hire Labour
      2. Assert URL is /labour
    Expected Result: Discovery link migrated
    Evidence: .sisyphus/evidence/task-5-booking-hire-link.png

  Scenario: booking breadcrumb still points to bookings list
    Tool: Playwright
    Preconditions: booking detail page open
    Steps:
      1. Click breadcrumb to bookings list
      2. Assert URL contains /renter/labour/bookings
    Expected Result: Booking namespace preserved
    Evidence: .sisyphus/evidence/task-5-breadcrumb-preserved.png
  ```

  **Commit**: YES
  - Message: `fix(bookings): preserve booking routes while updating labour links`

---

- [ ] 6. Add redirect/link regression harness and evidence checklist

  **What to do**:
  - Add a lightweight markdown checklist in `.sisyphus/evidence/` for route/link assertions to ensure consistency before UI polish begins.

  **Must NOT do**:
  - Do not alter production logic in this task.

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: [`desloppify`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (final task)
  - **Blocks**: T7,T9,T13,F3
  - **Blocked By**: T1,T2,T3,T4,T5

  **References**:
  - `.sisyphus/evidence/` - evidence root required by this plan.

  **Acceptance Criteria**:
  - [ ] Regression checklist file exists and enumerates all link migration checks.

  **QA Scenarios**:

  ```
  Scenario: checklist includes all migrated surfaces
    Tool: Bash
    Preconditions: task completed
    Steps:
      1. Open checklist file in .sisyphus/evidence
      2. Verify sections for nav, dashboard, favorites, profile, detail, bookings
    Expected Result: No migration surface missing
    Evidence: .sisyphus/evidence/task-6-checklist-audit.txt

  Scenario: checklist catches stale links
    Tool: Bash (grep)
    Preconditions: code updated
    Steps:
      1. Grep project for "/renter/labour" in non-bookings contexts
      2. Compare findings to checklist expected residuals
    Expected Result: Only approved residual routes remain
    Evidence: .sisyphus/evidence/task-6-stale-link-scan.txt
  ```

  **Commit**: YES
  - Message: `docs(qa): add labour route migration evidence checklist`

---

- [ ] 7. Redesign card media overlay on `/labour`

  **What to do**:
  - Implement top-left availability badge and top-right rating badge with dark translucent chips.
  - Use emerald/yellow accenting consistent with reference.

  **Must NOT do**:
  - Do not change data query fields.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T8,T11
  - **Blocked By**: T6

  **References**:
  - `src/app/labour/LabourClient.tsx` - current card rendering logic.

  **Acceptance Criteria**:
  - [ ] Availability and rating badges appear in correct positions.
  - [ ] Badge text contrast is readable on dark image overlays.

  **QA Scenarios**:

  ```
  Scenario: badge placement matches reference
    Tool: Playwright
    Preconditions: /labour has at least one card
    Steps:
      1. Open /labour
      2. Capture first card screenshot
      3. Assert availability badge at top-left
      4. Assert rating chip at top-right
    Expected Result: Overlay layout matches target
    Evidence: .sisyphus/evidence/task-7-card-overlay.png

  Scenario: low-contrast regression is avoided
    Tool: Playwright
    Preconditions: card image with bright background
    Steps:
      1. Inspect badge text over bright image
      2. Assert readability at normal zoom (100%)
    Expected Result: text remains legible
    Evidence: .sisyphus/evidence/task-7-contrast-check.png
  ```

  **Commit**: YES
  - Message: `feat(labour-ui): add card media badges`

---

- [ ] 8. Redesign card body, stats row, tags, and action buttons

  **What to do**:
  - Update name row, location row, 3-column stats, uppercase skill pills, and dual CTA buttons to match reference hierarchy.

  **Must NOT do**:
  - Do not change `onBook`/`onMessage` business logic.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 sequential after T7
  - **Blocks**: T10,T11,T12
  - **Blocked By**: T7

  **References**:
  - `src/app/labour/LabourClient.tsx`

  **Acceptance Criteria**:
  - [ ] Stats labels use uppercase micro-label style.
  - [ ] Rate column is emerald-accented with `/d` formatting.
  - [ ] CTA visual styles match reference intent.

  **QA Scenarios**:

  ```
  Scenario: stats and CTA hierarchy is correct
    Tool: Playwright
    Preconditions: /labour loaded
    Steps:
      1. Capture first card body
      2. Assert 3 stats columns exist
      3. Assert Hire button is filled emerald
      4. Assert Message button is outlined
    Expected Result: card body matches target hierarchy
    Evidence: .sisyphus/evidence/task-8-card-body.png

  Scenario: unavailable worker does not expose invalid hire behavior
    Tool: Playwright
    Preconditions: card with unavailable status exists
    Steps:
      1. Click Hire on unavailable card
      2. Assert expected guarded behavior (disabled or safe prompt)
    Expected Result: graceful handling, no crash
    Evidence: .sisyphus/evidence/task-8-unavailable-guard.png
  ```

  **Commit**: YES
  - Message: `feat(labour-ui): redesign labour card content`

---

- [ ] 9. Redesign filter sidebar visuals

  **What to do**:
  - Apply emerald section headers, refined controls, and chip-like skill filters while preserving existing filter semantics.

  **Must NOT do**:
  - Do not change filter state algorithm.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (parallel with T7, before T10)
  - **Blocks**: T10,T12
  - **Blocked By**: T6

  **References**:
  - `src/app/labour/LabourClient.tsx` - existing filter sidebar implementation.

  **Acceptance Criteria**:
  - [ ] Availability, skills, price, and experience sections match updated style.
  - [ ] Filter toggles still update result set correctly.

  **QA Scenarios**:

  ```
  Scenario: sidebar visual update matches reference direction
    Tool: Playwright
    Preconditions: desktop viewport
    Steps:
      1. Open /labour
      2. Capture sidebar screenshot
      3. Assert emerald headers and chip controls are present
    Expected Result: visual parity with reference intent
    Evidence: .sisyphus/evidence/task-9-sidebar-style.png

  Scenario: filter behavior remains correct after restyling
    Tool: Playwright
    Preconditions: /labour loaded
    Steps:
      1. Apply availability + skill filter
      2. Assert results change
      3. Clear filters and assert list resets
    Expected Result: no logic regression
    Evidence: .sisyphus/evidence/task-9-filter-regression.png
  ```

  **Commit**: YES
  - Message: `feat(labour-ui): polish filter sidebar styling`

---

- [ ] 10. Polish toolbar, search, sort, active filter chips, and grid rhythm

  **What to do**:
  - Refine title/count hierarchy, search field shell, sort trigger visuals, chip row, and card grid spacing.

  **Must NOT do**:
  - Do not alter query parameter semantics.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 after T8 and T9
  - **Blocks**: T11,T12
  - **Blocked By**: T8,T9

  **References**:
  - `src/app/labour/LabourClient.tsx`

  **Acceptance Criteria**:
  - [ ] Header and search/sort controls visually match reference direction.
  - [ ] Grid remains 1/2/3 columns for mobile/tablet/desktop.

  **QA Scenarios**:

  ```
  Scenario: toolbar and controls are visually aligned
    Tool: Playwright
    Preconditions: /labour loaded
    Steps:
      1. Capture top content area screenshot
      2. Assert title, count, search, sort are aligned
    Expected Result: polished toolbar with clean spacing
    Evidence: .sisyphus/evidence/task-10-toolbar.png

  Scenario: search and sort still function
    Tool: Playwright
    Preconditions: /labour loaded
    Steps:
      1. Search for "tractor"
      2. Apply sort "Highest Rated"
      3. Assert filtered/sorted list updates
    Expected Result: behavior intact
    Evidence: .sisyphus/evidence/task-10-search-sort.png
  ```

  **Commit**: YES
  - Message: `feat(labour-ui): refine toolbar search and grid spacing`

---

- [ ] 11. Align loading, empty, and load-more states with redesigned UI

  **What to do**:
  - Update skeleton/empty/load-more visual language so transitions remain coherent with new card and sidebar style.

  **Must NOT do**:
  - Do not change pagination semantics.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 final task
  - **Blocks**: T12,T14
  - **Blocked By**: T7,T8,T10

  **References**:
  - `src/app/labour/LabourClient.tsx`
  - `src/components/skeletons/LabourSkeleton.tsx`

  **Acceptance Criteria**:
  - [ ] Loading skeletons align with revised card dimensions.
  - [ ] Empty state is readable and offers recovery action.

  **QA Scenarios**:

  ```
  Scenario: loading state aligns with redesigned card shell
    Tool: Playwright
    Preconditions: throttled network
    Steps:
      1. Open /labour with slow network
      2. Capture skeleton state
    Expected Result: skeleton layout resembles final card structure
    Evidence: .sisyphus/evidence/task-11-loading-state.png

  Scenario: empty state recovers cleanly
    Tool: Playwright
    Preconditions: apply filters that return zero results
    Steps:
      1. Trigger empty state
      2. Click clear/reset action
      3. Assert list repopulates
    Expected Result: graceful empty-state recovery
    Evidence: .sisyphus/evidence/task-11-empty-recovery.png
  ```

  **Commit**: YES
  - Message: `feat(labour-ui): align loading and empty states`

---

- [ ] 12. Run functional regression for discovery interactions

  **What to do**:
  - Validate search, filter, sort, hire, and message entry points after redesign and route migration.

  **Must NOT do**:
  - Do not patch code in this verification task unless defect is documented and fed back.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T14,T15,F3
  - **Blocked By**: T2,T3,T4,T5,T8,T9,T10,T11

  **References**:
  - `src/app/labour/LabourClient.tsx`

  **Acceptance Criteria**:
  - [ ] All primary user interactions complete without runtime errors.

  **QA Scenarios**:

  ```
  Scenario: complete happy-path discovery flow
    Tool: Playwright
    Preconditions: seeded labour data
    Steps:
      1. Open /labour
      2. Apply availability + skill filters
      3. Search by keyword and sort
      4. Click Message and Hire entry points
    Expected Result: all interactions execute and route safely
    Evidence: .sisyphus/evidence/task-12-functional-happy.png

  Scenario: conflicting filters produce no crash
    Tool: Playwright
    Preconditions: /labour loaded
    Steps:
      1. Apply restrictive filters yielding no result
      2. Remove one filter
      3. Assert UI recovers
    Expected Result: graceful no-result behavior
    Evidence: .sisyphus/evidence/task-12-functional-edge.png
  ```

  **Commit**: NO

---

- [ ] 13. Verify redirects and deep links after route deprecation

  **What to do**:
  - Validate old entry links and deep links resolve correctly with the new single listing surface.

  **Must NOT do**:
  - Do not rewrite booking routes in this task.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T15,F3,F4
  - **Blocked By**: T1,T6

  **References**:
  - `src/app/renter/labour/page.tsx`
  - `src/lib/navigation.ts`

  **Acceptance Criteria**:
  - [ ] `/renter/labour` consistently resolves to `/labour`.
  - [ ] `/renter/labour/bookings*` remains accessible.

  **QA Scenarios**:

  ```
  Scenario: deprecated listing URL forwards to /labour
    Tool: Playwright
    Preconditions: app running
    Steps:
      1. Open /renter/labour?search=tractor
      2. Assert final URL starts with /labour
    Expected Result: users are routed to active listing surface
    Evidence: .sisyphus/evidence/task-13-deprecated-forward.png

  Scenario: bookings deep link is not hijacked
    Tool: Playwright
    Preconditions: valid bookings route available
    Steps:
      1. Open /renter/labour/bookings
      2. Assert route does not redirect to /labour
    Expected Result: booking pages remain stable
    Evidence: .sisyphus/evidence/task-13-bookings-deeplink.png
  ```

  **Commit**: NO

---

- [ ] 14. Accessibility and responsive QA sweep

  **What to do**:
  - Validate keyboard focus visibility, contrast, and responsive layout at 375px, 768px, and >=1280px.

  **Must NOT do**:
  - Do not mark complete without evidence from all three breakpoints.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T15,F2,F3
  - **Blocked By**: T11,T12

  **References**:
  - `src/app/labour/LabourClient.tsx`
  - `docs/responsive-test-plan.md`

  **Acceptance Criteria**:
  - [ ] Mobile/tablet/desktop screenshots captured and readable.
  - [ ] Keyboard tab flow is visible on interactive controls.

  **QA Scenarios**:

  ```
  Scenario: responsive layout across breakpoints
    Tool: Playwright
    Preconditions: /labour available
    Steps:
      1. Capture 375x667 screenshot
      2. Capture 768x1024 screenshot
      3. Capture 1440x900 screenshot
    Expected Result: 1/2/3-column behavior and stable spacing
    Evidence: .sisyphus/evidence/task-14-responsive-pack.png

  Scenario: keyboard focus remains visible
    Tool: Playwright
    Preconditions: desktop viewport
    Steps:
      1. Tab through search, sort, filter controls, CTA buttons
      2. Capture focus states
    Expected Result: clear visible focus ring for each interactive element
    Evidence: .sisyphus/evidence/task-14-focus-states.png
  ```

  **Commit**: NO

---

- [ ] 15. Run static quality checks and finalize release evidence

  **What to do**:
  - Run `bun run type-check`, `bun run lint`, `bun run build`.
  - Assemble evidence index linking all task artifacts.

  **Must NOT do**:
  - Do not ignore failing checks.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`desloppify`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 final
  - **Blocks**: F1,F2,F4
  - **Blocked By**: T12,T13,T14

  **References**:
  - `package.json` - scripts for lint/type-check/build.

  **Acceptance Criteria**:
  - [ ] Type-check passes.
  - [ ] Lint passes.
  - [ ] Build passes.
  - [ ] Evidence index exists and points to all task artifacts.

  **QA Scenarios**:

  ```
  Scenario: all static checks pass
    Tool: Bash
    Preconditions: code changes complete
    Steps:
      1. Run bun run type-check
      2. Run bun run lint
      3. Run bun run build
    Expected Result: all commands exit 0
    Evidence: .sisyphus/evidence/task-15-static-checks.txt

  Scenario: failures are surfaced (negative gate)
    Tool: Process policy
    Preconditions: if any command fails
    Steps:
      1. Stop completion workflow
      2. Record failing command and log path
    Expected Result: task remains incomplete until fixed
    Evidence: .sisyphus/evidence/task-15-failure-gate.txt
  ```

  **Commit**: NO

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **Plan Compliance Audit** - `oracle`
  - Verify every Must Have/Must NOT Have in this plan against implementation and evidence.

- [ ] F2. **Code Quality Review** - `unspecified-high`
  - Review changed files for quality anti-patterns and run static checks.

- [ ] F3. **Real QA Replay** - `unspecified-high` (+ `playwright`)
  - Replay all QA scenarios from T1-T15 and confirm evidence exists.

- [ ] F4. **Scope Fidelity Audit** - `deep`
  - Ensure no scope creep beyond labour listing redesign + route consolidation.

---

## Commit Strategy

- **Commit 1**: `refactor(routes): consolidate labour discovery entry route`
  - Includes: T1-T5
- **Commit 2**: `feat(labour-ui): redesign listing cards and sidebar`
  - Includes: T7-T9
- **Commit 3**: `feat(labour-ui): polish toolbar and state views`
  - Includes: T10-T11
- **Commit 4**: `docs(qa): add evidence index for labour redesign`
  - Includes: T6 + evidence indexing artifacts

---

## Success Criteria

### Verification Commands

```bash
bun run type-check
bun run lint
bun run build
```

### Final Checklist

- [ ] `/renter/labour` no longer serves independent listing UI
- [ ] `/labour` visually matches target direction from reference image
- [ ] Booking routes remain functional
- [ ] No stale critical links to deprecated listing entry route
- [ ] Static checks pass
- [ ] Evidence pack complete for all tasks and final wave
