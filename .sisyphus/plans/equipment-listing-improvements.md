# Equipment Listing UI/UX Improvements

## TL;DR

> **Quick Summary**: Implement all 10 UI/UX improvements from the analysis document to enhance the equipment listing page at `/provider/equipment`
>
> **Deliverables**:
>
> - Functional filter modal with category, price, availability, rating filters
> - localStorage-persisted view mode preference (grid/list)
> - Mobile-responsive stats card layout
> - Enhanced empty state with animations
> - Improved card action dropdown with visual separation
> - Prominent price display styling
> - Skeleton loading states
> - Keyboard shortcuts (Ctrl+N, /)
> - Auto-focus search input
> - Bulk action capabilities
>
> **Estimated Effort**: Medium (1-2 days)
> **Parallel Execution**: NO - sequential tasks with dependencies
> **Critical Path**: Task 1 (Filters) → Task 7 (Skeleton) → Task 9 (Keyboard Shortcuts)

---

## Context

### Original Request

Implement the UI/UX improvements outlined in `.sisyphus/equipment-listing-ui-ux-analysis.md`

### Interview Summary

**Key Decisions**:

- **Scope**: All 10 improvements (High, Medium, Low priority)
- **Filter UI Style**: Dialog modal (following `/app/renter/labour/page.tsx` pattern)
- **Test Strategy**: Manual verification only (no test infrastructure setup)
- **Filters to Include**: Category, Price range, Availability status, Rating threshold

**Research Findings**:

- Current page: `src/app/provider/equipment/page.tsx` (771 lines)
- Filter patterns exist in: `/app/renter/labour/page.tsx` (Dialog), `/app/equipment/page.tsx` (Sidebar)
- `EQUIPMENT_CATEGORIES`: 11 categories with icons (tractor, harvester, plough, etc.)
- `PRICE_RANGE_OPTIONS`: 6 price ranges (Under ₹500 to Above ₹10,000)
- `RATING_OPTIONS`: 4 rating thresholds (4+ stars to Any Rating)
- `EmptyState` component at `/components/ui/empty-state.tsx`
- No localStorage usage currently in project
- No test infrastructure exists

### Metis Review

**Identified Gaps** (to be addressed):

- Guardrail: Bulk actions must have confirmation dialogs to prevent accidental operations
- Guardrail: Keyboard shortcuts should not interfere with form inputs
- Edge case: Empty state should handle both "no equipment" and "no search results" differently
- Edge case: Filter modal needs scrollable content on small screens
- Accessibility: Filter dialog needs ARIA labels, focus management, escape key handling
- Accessibility: Keyboard shortcuts need proper modifiers (Ctrl/Cmd based on OS)
- Performance: Animations should respect `prefers-reduced-motion`
- Mobile: Filter modal should be full-screen or nearly full-screen on mobile

---

## Work Objectives

### Core Objective

Implement all 10 UI/UX improvements to elevate the equipment listing page from "production-ready" (7.5/10) to "premium experience" (9/10+) while maintaining existing dark-themed, glassmorphic aesthetic.

### Concrete Deliverables

1. **Filter Modal**: Dialog-based filter panel with category, price range, availability, and rating filters
2. **View Mode Persistence**: localStorage integration for grid/list view preference
3. **Mobile Stats Layout**: Responsive grid that stacks on mobile devices
4. **Enhanced Empty State**: Animated, gradient-styled empty state with Sparkles icon
5. **Card Actions Separator**: Visual separator before Delete option in dropdown menus
6. **Enhanced Price Display**: Prominent price cards with emerald styling
7. **Skeleton Loading States**: Animated skeleton cards for loading states
8. **Keyboard Shortcuts**: Ctrl/Cmd+N for new equipment, "/" for search focus
9. **Auto-Focus Search**: Search input auto-focus on page load
10. **Bulk Actions**: Select all checkbox with bulk operations (mark available/unavailable, delete)

### Definition of Done

- [x] All 10 improvements functional and verified via manual testing
- [x] No visual regressions in existing functionality
- [x] Mobile responsiveness maintained across all improvements
- [x] Keyboard navigation works correctly
- [x] Filter functionality filters equipment correctly
- [x] View mode persists across page reloads
- [x] Bulk actions work with proper confirmations

### Must Have

- All 10 improvements from the analysis document
- Dialog-based filter modal with Apply/Clear buttons
- localStorage persistence for view mode
- Mobile-responsive stats layout
- Enhanced empty state with animations
- DropdownMenuSeparator for Delete action
- Prominent price display on cards
- Skeleton loading UI
- Keyboard shortcuts with OS detection
- Auto-focus search input
- Bulk selection with checkbox UI

### Must NOT Have (Guardrails)

- Changes to business logic or data fetching patterns
- New dependencies beyond what's in `lucide-react` and `@radix-ui/react-*`
- Backend/API changes
- Changes to authentication or authorization
- Removal of existing functionality
- Breaking changes to existing routes
- Test infrastructure setup (user chose manual verification)
- Accessibility violations (must maintain keyboard navigation, focus management)
- Performance regressions (must handle reduced-motion preference)

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: NO
- **User wants tests**: NO (manual verification only)
- **QA approach**: Manual verification with Playwright browser automation

### Automated Verification via Playwright

**Task 1 - Filter Modal**:

```
# Agent executes via playwright browser automation:
1. Navigate to: http://localhost:3001/provider/equipment
2. Wait for: equipment list to load
3. Click: button containing "Filter" text
4. Wait for: Dialog overlay to appear
5. Assert: Dialog title "Filter Equipment" is visible
6. Click: Category dropdown (Select component)
7. Select: "Tractor" option
8. Click: "Apply Filters" button
9. Assert: Filtered results show only tractor equipment OR empty state if no tractors
10. Click: "Filter" button again
11. Click: "Clear Filters" button
12. Assert: All equipment displayed again
13. Screenshot: .sisyphus/evidence/task-1-filter-modal.png
```

**Task 2 - View Mode Persistence**:

```
# Agent executes via playwright browser automation:
1. Navigate to: http://localhost:3001/provider/equipment
2. Wait for: page to load in grid view
3. Click: button with List icon (title="Switch to list view")
4. Assert: View changes to list layout (cards in single column)
5. Reload page (F5 or navigate away and back)
6. Assert: View remains in list mode (persists in localStorage)
7. Click: button with Grid icon (title="Switch to grid view")
8. Reload page
9. Assert: View returns to grid mode
10. Screenshot: .sisyphus/evidence/task-2-view-mode.gif (animated GIF showing toggle)
```

**Task 3 - Mobile Stats Layout**:

```
# Agent executes via playwright browser automation:
1. Navigate to: http://localhost:3001/provider/equipment
2. Set viewport: 375x812 (iPhone X size)
3. Assert: Stats cards stack vertically (grid-cols-1)
4. Assert: Each stat card is full width
5. Assert: No horizontal overflow or cramped text
6. Set viewport: 768x1024 (tablet)
7. Assert: Stats cards show in 2 columns (sm:grid-cols-2)
8. Set viewport: 1280x800 (desktop)
9. Assert: Stats cards show in 4 columns (lg:grid-cols-4)
10. Screenshots: .sisyphus/evidence/task-3-mobile-{375,768,1280}.png
```

**Task 4 - Enhanced Empty State**:

```
# Agent executes via playwright browser automation:
1. If equipment exists: delete all via API or mock empty state
2. Navigate to: http://localhost:3001/provider/equipment
3. Wait for: empty state to appear
4. Assert: Sparkles icon is visible with animation (check CSS classes)
5. Assert: Title "Start Building Your Fleet" is visible
6. Assert: Description mentions "Add your first piece of equipment"
7. Assert: "List Your First Equipment" button has gradient styling
8. Assert: Animation classes present (animate-float, animate-pulse)
9. Screenshot: .sisyphus/evidence/task-4-empty-state.png
```

**Task 5 - Card Actions Separator**:

```
# Agent executes via playwright browser automation:
1. Navigate to: http://localhost:3001/provider/equipment
2. Wait for: equipment cards to load
3. Click: first card's "More actions" button (three dots)
4. Assert: Dropdown menu appears with 4 items
5. Assert: Visual separator line exists before "Delete" option
6. Assert: "Delete" option has red text styling
7. Assert: "Delete" hover shows red background
8. Click elsewhere to close dropdown
9. Screenshot: .sisyphus/evidence/task-5-dropdown-menu.png
```

**Task 6 - Enhanced Price Display**:

```
# Agent executes via playwright browser automation:
1. Navigate to: http://localhost:3001/provider/equipment
2. Wait for: equipment cards to load
3. Assert: Price displayed prominently with larger font size
4. Assert: Price has "Daily Rate" label in uppercase
5. Assert: Price container has emerald styling (bg-emerald-500/5, border-emerald-500/20)
6. Assert: Price text is emerald-400 color
7. Screenshot: .sisyphus/evidence/task-6-price-display.png
```

**Task 7 - Skeleton Loading States**:

```
# Agent executes via playwright browser automation:
1. Navigate to: http://localhost:3001/provider/equipment
2. Throttle network to slow 3G (if possible) or clear cache and reload
3. Assert: Skeleton cards appear with pulse animation
4. Assert: 6 skeleton cards visible (matching grid layout)
5. Assert: Each skeleton has: image placeholder, title placeholder, meta placeholders
6. Wait for: actual content to load
7. Assert: Skeletons replaced by actual cards with fade animation
8. Screenshot: .sisyphus/evidence/task-7-skeleton-loading.gif
```

**Task 8 - Keyboard Shortcuts**:

```
# Agent executes via playwright browser automation:
1. Navigate to: http://localhost:3001/provider/equipment
2. Press: Ctrl+N (or Cmd+N on Mac)
3. Assert: URL changes to /provider/equipment/new
4. Go back to equipment list
5. Press: "/" key
6. Assert: Search input is focused (document.activeElement is search input)
7. Type: "test" in search (should not trigger any shortcuts)
8. Press: Ctrl+N while in search input
9. Assert: Search input prevents shortcut (event default prevented or cursor in input)
10. Screenshots: .sisyphus/evidence/task-8-keyboard-shortcuts.png
```

**Task 9 - Auto-Focus Search**:

```
# Agent executes via playwright browser automation:
1. Navigate to: http://localhost:3001/provider/equipment
2. Wait for: page to fully load
3. Assert: Search input has focus (document.activeElement)
4. Assert: Search input placeholder is visible and readable
5. Screenshot: .sisyphus/evidence/task-9-auto-focus.png
```

**Task 10 - Bulk Actions**:

```
# Agent executes via playwright browser automation:
1. Navigate to: http://localhost:3001/provider/equipment
2. Wait for: equipment cards to load (need at least 2 items)
3. Assert: Select all checkbox appears at top of list (if bulk actions enabled)
4. Click: first equipment card's checkbox
5. Assert: "1 selected" text appears
6. Click: second equipment card's checkbox
7. Assert: "2 selected" text appears
8. Assert: Bulk action buttons appear (Mark Available, Mark Unavailable, Delete)
9. Click: "Mark Unavailable" bulk action
10. Assert: Toast notification "2 equipment marked as unavailable"
11. Assert: Selected equipment cards show "Unavailable" badge
12. Screenshots: .sisyphus/evidence/task-10-bulk-actions.png
```

---

## Execution Strategy

### Sequential Execution (Due to File Dependencies)

All tasks modify `src/app/provider/equipment/page.tsx`, so they must be executed sequentially:

```
Phase 1: High Priority (Quick Wins - 4-6 hours)
├── Task 1: Filter Functionality
├── Task 2: View Mode Persistence
└── Task 3: Mobile Stats Layout

Phase 2: Medium Priority (UI Polish - 2-4 hours)
├── Task 4: Enhanced Empty State
├── Task 5: Card Actions Separator
└── Task 6: Enhanced Price Display

Phase 3: Low Priority (Advanced Features - 4-6 hours)
├── Task 7: Skeleton Loading States
├── Task 8: Keyboard Shortcuts
├── Task 9: Auto-Focus Search
└── Task 10: Bulk Actions
```

### Agent Dispatch Summary

| Phase | Tasks       | Recommended Agent                                                                          |
| ----- | ----------- | ------------------------------------------------------------------------------------------ |
| 1     | 1, 2, 3     | delegate_task(category='visual-engineering', load_skills=['frontend-ui-ux', 'playwright']) |
| 2     | 4, 5, 6     | delegate_task(category='visual-engineering', load_skills=['frontend-ui-ux', 'playwright']) |
| 3     | 7, 8, 9, 10 | delegate_task(category='unspecified-high', load_skills=['frontend-ui-ux', 'playwright'])   |

**Why visual-engineering for Phase 1 & 2**: These are primarily UI styling and component modifications requiring strong CSS/Tailwind and animation skills.

**Why unspecified-high for Phase 3**: These tasks involve more complex state management (bulk selection), event handling (keyboard shortcuts), and conditional rendering (skeleton states) requiring higher cognitive load.

---

## TODOs

### Phase 1: High Priority - Core UX Improvements

- [x] **1. Filter Functionality** - Add Dialog-based filter modal

  **What to do**:
  - Add filter state: `selectedCategory`, `priceRange`, `availabilityFilter`, `ratingFilter`
  - Add `showFilters` state for modal visibility
  - Create filter modal using Dialog component with:
    - Category filter: Select dropdown with EQUIPMENT_CATEGORIES
    - Price range: Select with PRICE_RANGE_OPTIONS
    - Availability: Toggle or Select (Available/Unavailable/All)
    - Rating: Select with RATING_OPTIONS
  - Add filter logic to `filteredEquipment` (combine with search)
  - Add "Apply Filters" and "Clear Filters" buttons
  - Show active filter count on Filter button badge
  - Follow pattern from `/app/renter/labour/page.tsx` lines 180-250

  **Must NOT do**:
  - Don't modify equipmentService or backend
  - Don't add new dependencies
  - Don't remove existing search functionality
  - Don't break responsive layout

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` - UI-focused task with modal and form styling
    - Reason: Requires Dialog styling, Select component configuration, responsive layout
  - **Skills**: `['frontend-ui-ux', 'playwright']`
    - `frontend-ui-ux`: Tailwind styling, component composition, glassmorphic effects
    - `playwright`: UI verification with browser automation

  **Parallelization**:
  - **Can Run In Parallel**: NO (modifies main page file)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 2-10 (all modify same file)
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `src/app/renter/labour/page.tsx:180-250` - Filter Dialog implementation with Apply/Clear buttons
  - `src/app/renter/labour/page.tsx:440-530` - DialogContent with filter sections

  **Constants References**:
  - `src/lib/utils/constants.ts:2-14` - EQUIPMENT_CATEGORIES array with value/label/icon
  - `src/lib/utils/constants.ts:68-75` - PRICE_RANGE_OPTIONS with min/max/label
  - `src/lib/utils/constants.ts:78-83` - RATING_OPTIONS with value/label

  **UI Component References**:
  - `src/components/ui/dialog.tsx` - Dialog component implementation
  - `src/components/ui/select.tsx` - Select component with content/trigger/value

  **Acceptance Criteria** (Agent-Executable via Playwright):

  ```
  1. Navigate to http://localhost:3001/provider/equipment
  2. Click "Filter" button
  3. Verify: Dialog opens with title "Filter Equipment"
  4. Select "Tractor" from Category dropdown
  5. Click "Apply Filters"
  6. Verify: Only tractor equipment shown OR empty state
  7. Click "Filter" button again
  8. Click "Clear Filters"
  9. Verify: All equipment displayed again
  10. Screenshot: .sisyphus/evidence/task-1-filter-modal.png
  ```

  **Evidence to Capture**:
  - [ ] Screenshot of filter modal open
  - [ ] Screenshot of filtered results
  - [ ] Screenshot after clearing filters

  **Commit**: YES
  - Message: `feat(provider): add filter modal with category, price, availability, rating`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: `bun type-check` must pass

---

- [x] **2. View Mode Persistence** - Persist grid/list view in localStorage

  **What to do**:
  - Modify `viewMode` state initialization to read from localStorage:
    ```tsx
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(
      (typeof window !== 'undefined' &&
        (localStorage.getItem('equipmentViewMode') as 'grid' | 'list')) ||
        'grid'
    );
    ```
  - Add useEffect to save viewMode to localStorage on change:
    ```tsx
    useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('equipmentViewMode', viewMode);
      }
    }, [viewMode]);
    ```
  - Add titles to view mode buttons for accessibility

  **Must NOT do**:
  - Don't use useLayoutEffect (causes hydration issues)
  - Don't access localStorage during SSR (check typeof window)
  - Don't change the view mode toggle UI

  **Recommended Agent Profile**:
  - **Category**: `quick` - Simple state modification
    - Reason: Straightforward localStorage integration with existing state
  - **Skills**: `['frontend-ui-ux', 'playwright']`
    - `frontend-ui-ux`: React hooks best practices, SSR safety
    - `playwright`: Verify persistence across page reloads

  **Parallelization**:
  - **Can Run In Parallel**: NO (same file)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 3-10
  - **Blocked By**: Task 1

  **References**:
  - `src/app/provider/equipment/page.tsx:99` - Current viewMode state (line ~99)
  - `src/app/provider/equipment/page.tsx:345-370` - View toggle buttons

  **Acceptance Criteria**:

  ```
  1. Navigate to http://localhost:3001/provider/equipment
  2. Click List view button
  3. Verify: View changes to list layout
  4. Reload page (F5)
  5. Verify: View remains in list mode
  6. Click Grid view button
  7. Reload page
  8. Verify: View is grid mode
  9. Screenshot: .sisyphus/evidence/task-2-view-mode.gif
  ```

  **Commit**: YES
  - Message: `feat(provider): persist equipment view mode in localStorage`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: `bun type-check`

---

- [x] **3. Mobile Stats Layout** - Stack stats cards on mobile

  **What to do**:
  - Change stats grid from `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` to proper responsive classes
  - Current: Line ~257 shows `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4`
  - Verify: On mobile (<640px): 1 column
  - Verify: On sm (640-1024px): 2 columns
  - Verify: On lg (>1024px): 4 columns
  - Check that text doesn't overflow or overlap on mobile

  **Must NOT do**:
  - Don't change the stats card styling
  - Don't modify the stats calculation logic
  - Don't remove any responsive breakpoints

  **Recommended Agent Profile**:
  - **Category**: `quick` - CSS-only change
    - Reason: Single line Tailwind class modification
  - **Skills**: `['frontend-ui-ux', 'playwright']`
    - `frontend-ui-ux`: Tailwind responsive design
    - `playwright`: Viewport testing at multiple sizes

  **Parallelization**:
  - **Can Run In Parallel**: NO (same file)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 4-10
  - **Blocked By**: Task 2

  **References**:
  - `src/app/provider/equipment/page.tsx:255-320` - Stats grid section

  **Acceptance Criteria**:

  ```
  1. Navigate to http://localhost:3001/provider/equipment
  2. Set viewport to 375x812 (mobile)
  3. Verify: Stats cards stack vertically (1 column)
  4. Set viewport to 768x1024 (tablet)
  5. Verify: Stats cards show in 2 columns
  6. Set viewport to 1280x800 (desktop)
  7. Verify: Stats cards show in 4 columns
  8. Screenshots: .sisyphus/evidence/task-3-mobile-{375,768,1280}.png
  ```

  **Commit**: YES
  - Message: `style(provider): make stats cards responsive on mobile`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: Visual check at 3 viewport sizes

---

### Phase 2: Medium Priority - UI Polish

- [x] **4. Enhanced Empty State** - Add animations and engaging design

  **What to do**:
  - Replace current EmptyState with enhanced version when no equipment exists
  - Add `Sparkles` icon from lucide-react with `animate-float` class
  - Change title to "Start Building Your Fleet"
  - Add gradient button styling for CTA
  - Add subtle background glow effects
  - Keep existing EmptyState for "no search results" scenario
  - Use different empty state for initial load vs filtered results

  **Must NOT do**:
  - Don't remove the existing EmptyState component
  - Don't break the empty state for filtered results
  - Don't add new animation libraries

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` - Animation and visual effects
    - Reason: Requires float animation, gradient styling, visual hierarchy
  - **Skills**: `['frontend-ui-ux', 'playwright']`
    - `frontend-ui-ux`: Framer Motion animations, Tailwind gradients
    - `playwright`: Verify animations render correctly

  **Parallelization**:
  - **Can Run In Parallel**: NO (same file)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 5-10
  - **Blocked By**: Task 3

  **References**:
  - `src/app/provider/equipment/page.tsx:449-478` - Current EmptyState usage
  - `src/components/ui/empty-state.tsx` - EmptyState component definition
  - `src/app/provider/equipment/page.tsx:450-478` - Conditional rendering logic

  **Acceptance Criteria**:

  ```
  1. Remove all equipment or mock empty state
  2. Navigate to http://localhost:3001/provider/equipment
  3. Verify: Sparkles icon with float animation visible
  4. Verify: Title "Start Building Your Fleet"
  5. Verify: Gradient button with pulse animation
  6. Screenshot: .sisyphus/evidence/task-4-empty-state.png
  ```

  **Commit**: YES
  - Message: `feat(provider): enhance empty state with animations and gradients`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: `bun type-check`

---

- [x] **5. Card Actions Separator** - Add visual separator before Delete

  **What to do**:
  - Locate dropdown menu in card component (around lines 537-593)
  - Add `DropdownMenuSeparator` before the Delete option
  - Ensure Delete option has proper red styling (text-red-400)
  - Ensure Delete hover has red background (focus:bg-red-500/10)
  - Apply to both grid view and list view card dropdowns

  **Must NOT do**:
  - Don't change the dropdown functionality
  - Don't remove any existing menu items
  - Don't break the dropdown trigger styling

  **Recommended Agent Profile**:
  - **Category**: `quick` - Component modification
    - Reason: Simple UI component insertion
  - **Skills**: `['frontend-ui-ux', 'playwright']`

  **Parallelization**:
  - **Can Run In Parallel**: NO (same file)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 6-10
  - **Blocked By**: Task 4

  **References**:
  - `src/app/provider/equipment/page.tsx:537-593` - Grid view dropdown menu
  - `src/components/ui/dropdown-menu.tsx` - DropdownMenuSeparator component

  **Acceptance Criteria**:

  ```
  1. Navigate to http://localhost:3001/provider/equipment
  2. Click three-dot menu on first card
  3. Verify: Separator line before "Delete" option
  4. Verify: Delete has red text
  5. Hover over Delete
  6. Verify: Red background appears
  7. Screenshot: .sisyphus/evidence/task-5-dropdown-menu.png
  ```

  **Commit**: YES
  - Message: `feat(provider): add separator and warning styling to delete action`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: `bun type-check`

---

- [x] **6. Enhanced Price Display** - Make price more prominent

  **What to do**:
  - Modify price display on equipment cards
  - Add prominent price card container with:
    - `bg-emerald-500/5` background
    - `border-emerald-500/20` border
    - `rounded-lg` corners
    - `p-3` padding
    - `text-center` alignment
  - Change price text to `text-2xl font-bold text-emerald-400`
  - Add "Daily Rate" label above price in `text-xs uppercase tracking-wider text-emerald-300`
  - Apply to both grid view and list view cards

  **Must NOT do**:
  - Don't change the price value or formatCurrency function
  - Don't break the card layout
  - Don't make price display too large (maintain balance)

  **Recommended Agent Profile**:
  - **Category**: `quick` - Styling update
    - Reason: CSS-only enhancement to existing element
  - **Skills**: `['frontend-ui-ux', 'playwright']`

  **Parallelization**:
  - **Can Run In Parallel**: NO (same file)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 7-10
  - **Blocked By**: Task 5

  **References**:
  - `src/app/provider/equipment/page.tsx:597-602` - Grid view price display
  - `src/app/provider/equipment/page.tsx:688-693` - List view price display

  **Acceptance Criteria**:

  ```
  1. Navigate to http://localhost:3001/provider/equipment
  2. Verify: Price displayed in emerald-styled container
  3. Verify: "Daily Rate" label visible above price
  4. Verify: Price is text-2xl with emerald color
  5. Screenshot: .sisyphus/evidence/task-6-price-display.png
  ```

  **Commit**: YES
  - Message: `feat(provider): enhance price display with prominent styling`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: `bun type-check`

---

### Phase 3: Low Priority - Advanced Features

- [x] **7. Skeleton Loading States** - Add loading skeleton UI

  **What to do**:
  - Create skeleton card component with pulse animation
  - Show skeleton cards when `isLoading` is true and equipment.length === 0
  - Show 6 skeleton cards to match grid layout
  - Skeleton should include:
    - Image placeholder (aspect-[16/10] bg-white/5 rounded-xl)
    - Title placeholder (h-6 bg-white/5 rounded-md w-3/4)
    - Category placeholder (h-4 bg-white/5 rounded-md w-1/2)
    - Price placeholder (h-8 bg-white/5 rounded-md w-1/3)
  - Use `animate-pulse` class for animation
  - Hide skeletons when data loads

  **Must NOT do**:
  - Don't remove existing loading spinner
  - Don't show skeletons for pagination/filtering (only initial load)
  - Don't add new animation libraries

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` - Animation and conditional rendering
    - Reason: Requires loading state management, pulse animation, responsive layout
  - **Skills**: `['frontend-ui-ux', 'playwright']`
    - `frontend-ui-ux`: Conditional rendering, animation classes
    - `playwright`: Verify skeleton appears and transitions correctly

  **Parallelization**:
  - **Can Run In Parallel**: NO (same file)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 8-10
  - **Blocked By**: Task 6

  **References**:
  - `src/app/provider/equipment/page.tsx:422-448` - Current loading spinner
  - `src/app/renter/labour/page.tsx` - Loading state patterns (if any)

  **Acceptance Criteria**:

  ```
  1. Clear cache and throttle network
  2. Navigate to http://localhost:3001/provider/equipment
  3. Verify: Skeleton cards appear with pulse animation
  4. Verify: 6 skeleton cards match grid layout
  5. Wait for data to load
  6. Verify: Skeletons fade out, actual content fades in
  7. Screenshot GIF: .sisyphus/evidence/task-7-skeleton-loading.gif
  ```

  **Commit**: YES
  - Message: `feat(provider): add skeleton loading states for equipment cards`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: `bun type-check`

---

- [x] **8. Keyboard Shortcuts** - Add keyboard navigation

  **What to do**:
  - Add keyboard event listener useEffect
  - Implement Ctrl/Cmd+N shortcut:
    - Detect OS (Cmd for Mac, Ctrl for others)
    - Navigate to `/provider/equipment/new`
  - Implement "/" shortcut:
    - Focus search input
    - Only works when not in an input/textarea
  - Add guard to prevent shortcuts when user is typing in any input:
    ```tsx
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    ```
  - Add event cleanup on unmount

  **Must NOT do**:
  - Don't interfere with browser default shortcuts
  - Don't trigger shortcuts when typing in forms
  - Don't add shortcuts that conflict with accessibility tools

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` - Complex event handling
    - Reason: Requires keyboard event management, OS detection, guard conditions
  - **Skills**: `['frontend-ui-ux', 'playwright']`
    - `frontend-ui-ux`: React event handling, accessibility best practices
    - `playwright`: Verify shortcuts work correctly

  **Parallelization**:
  - **Can Run In Parallel**: NO (same file)
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 9-10
  - **Blocked By**: Task 7

  **References**:
  - `src/app/provider/equipment/page.tsx:122-125` - Existing event listener pattern (mouse move)
  - Keyboard shortcut examples from analysis doc lines 328-342

  **Acceptance Criteria**:

  ```
  1. Navigate to http://localhost:3001/provider/equipment
  2. Press Ctrl+N (or Cmd+N on Mac)
  3. Verify: Navigates to /provider/equipment/new
  4. Go back
  5. Press "/" key
  6. Verify: Search input is focused
  7. Type in search input
  8. Press Ctrl+N while typing
  9. Verify: Shortcut doesn't trigger (input prevents it)
  10. Screenshot: .sisyphus/evidence/task-8-keyboard-shortcuts.png
  ```

  **Commit**: YES
  - Message: `feat(provider): add keyboard shortcuts (Ctrl+N for new, / for search)`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: `bun type-check`

---

- [x] **9. Auto-Focus Search** - Auto-focus search on page load

  **What to do**:
  - Add `autoFocus` prop to search input element
  - Input is around line 329 in the search bar section
  - Ensure focus doesn't break mobile experience (soft keyboard shouldn't auto-open)
  - Consider using `useEffect` with ref for more control if needed:
    ```tsx
    const searchInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      // Only auto-focus on desktop to prevent mobile keyboard popup
      if (window.innerWidth > 768) {
        searchInputRef.current?.focus();
      }
    }, []);
    ```

  **Must NOT do**:
  - Don't auto-focus on mobile (prevents soft keyboard popup)
  - Don't steal focus from other important elements
  - Don't break accessibility

  **Recommended Agent Profile**:
  - **Category**: `quick` - Simple enhancement
    - Reason: Single prop or useEffect addition
  - **Skills**: `['frontend-ui-ux', 'playwright']`

  **Parallelization**:
  - **Can Run In Parallel**: NO (same file)
  - **Parallel Group**: Sequential
  - **Blocks**: Task 10
  - **Blocked By**: Task 8

  **References**:
  - `src/app/provider/equipment/page.tsx:327-335` - Search input component

  **Acceptance Criteria**:

  ```
  1. Navigate to http://localhost:3001/provider/equipment
  2. Set viewport to 1280x800 (desktop)
  3. Verify: Search input has focus (visible cursor)
  4. Set viewport to 375x812 (mobile)
  5. Reload page
  6. Verify: Search input does NOT have focus (no soft keyboard)
  7. Screenshots: .sisyphus/evidence/task-9-auto-focus-{desktop,mobile}.png
  ```

  **Commit**: YES
  - Message: `feat(provider): auto-focus search input on desktop page load`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: `bun type-check`

---

- [x] **10. Bulk Actions** - Add multi-select and bulk operations

  **What to do**:
  - Add state for selected equipment IDs: `selectedIds: string[]`
  - Add "Select All" checkbox in header or toolbar
  - Add checkboxes on each equipment card (visible when at least one selected or on hover)
  - Show bulk action toolbar when equipment selected:
    - Selected count display ("X selected")
    - "Mark Available" button
    - "Mark Unavailable" button
    - "Delete" button with confirmation
  - Implement bulk toggle availability:
    - Call `equipmentService.updateEquipment` for each selected item
    - Show toast notification with count
    - Clear selection after operation
  - Implement bulk delete:
    - Show confirmation dialog
    - Call `equipmentService.deleteEquipment` for each selected item
    - Show toast notification
    - Clear selection

  **Must NOT do**:
  - Don't show checkboxes by default (clutter UI) - show on hover or when selection active
  - Don't implement without confirmation dialogs for destructive actions
  - Don't break single-item actions (keep existing dropdown menu)
  - Don't modify service layer - use existing CRUD operations

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` - Complex state management and UX
    - Reason: Multi-selection state, conditional UI, batch operations, confirmation dialogs
  - **Skills**: `['frontend-ui-ux', 'playwright']`
    - `frontend-ui-ux`: Complex state patterns, conditional rendering
    - `playwright`: Verify bulk operations work correctly

  **Parallelization**:
  - **Can Run In Parallel**: NO (same file)
  - **Parallel Group**: Sequential
  - **Blocks**: None (final task)
  - **Blocked By**: Task 9

  **References**:
  - `src/app/provider/equipment/page.tsx:145-156` - Toggle availability function (reference for bulk)
  - `src/app/provider/equipment/page.tsx:158-173` - Delete function (reference for bulk)
  - `src/app/provider/equipment/page.tsx:737-764` - Delete confirmation Dialog
  - `src/components/ui/checkbox.tsx` - Checkbox component

  **Acceptance Criteria**:

  ```
  1. Navigate to http://localhost:3001/provider/equipment
  2. Verify: Checkboxes appear on equipment cards (or on first selection)
  3. Click: First equipment checkbox
  4. Verify: "1 selected" text appears
  5. Click: Second equipment checkbox
  6. Verify: "2 selected" text appears
  7. Verify: Bulk action buttons visible (Mark Available, Mark Unavailable, Delete)
  8. Click: "Mark Unavailable" button
  9. Verify: Toast notification "2 equipment marked as unavailable"
  10. Verify: Selected cards show "Unavailable" badge
  11. Verify: Selection cleared after operation
  12. Screenshot: .sisyphus/evidence/task-10-bulk-actions.png
  ```

  **Commit**: YES
  - Message: `feat(provider): add bulk actions for equipment management`
  - Files: `src/app/provider/equipment/page.tsx`
  - Pre-commit: `bun type-check`

---

## Commit Strategy

| After Task | Message                                                                       | Files                                 | Verification                            |
| ---------- | ----------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------- |
| 1          | `feat(provider): add filter modal with category, price, availability, rating` | `src/app/provider/equipment/page.tsx` | Filter modal opens, applies, clears     |
| 2          | `feat(provider): persist equipment view mode in localStorage`                 | `src/app/provider/equipment/page.tsx` | View persists after reload              |
| 3          | `style(provider): make stats cards responsive on mobile`                      | `src/app/provider/equipment/page.tsx` | Layout stacks on mobile                 |
| 4          | `feat(provider): enhance empty state with animations and gradients`           | `src/app/provider/equipment/page.tsx` | Sparkles icon, animated button          |
| 5          | `feat(provider): add separator and warning styling to delete action`          | `src/app/provider/equipment/page.tsx` | Dropdown shows separator                |
| 6          | `feat(provider): enhance price display with prominent styling`                | `src/app/provider/equipment/page.tsx` | Price card visible with emerald styling |
| 7          | `feat(provider): add skeleton loading states for equipment cards`             | `src/app/provider/equipment/page.tsx` | Skeletons appear during loading         |
| 8          | `feat(provider): add keyboard shortcuts (Ctrl+N for new, / for search)`       | `src/app/provider/equipment/page.tsx` | Shortcuts work, don't conflict          |
| 9          | `feat(provider): auto-focus search input on desktop page load`                | `src/app/provider/equipment/page.tsx` | Search focused on desktop only          |
| 10         | `feat(provider): add bulk actions for equipment management`                   | `src/app/provider/equipment/page.tsx` | Multi-select, bulk operations work      |

---

## Success Criteria

### Verification Commands

```bash
# Type check all commits
bun type-check

# Build verification
bun build
```

### Final Checklist

- [x] All 10 improvements functional
- [x] Filter modal works with all 4 filter types
- [x] View mode persists across page reloads
- [x] Stats cards responsive on mobile
- [x] Empty state shows enhanced design with animations
- [x] Dropdown menu has separator before Delete
- [x] Price display prominent with emerald styling
- [x] Skeleton loading appears during initial load
- [x] Keyboard shortcuts work (Ctrl+N, /)
- [x] Search auto-focuses on desktop
- [x] Bulk actions work with multi-select
- [x] No visual regressions in existing functionality
- [x] Mobile experience improved, not degraded
- [x] All type checks pass
- [x] Build succeeds without errors

---

## Implementation Notes

### Accessibility Requirements

- Filter dialog must trap focus when open
- Escape key should close filter dialog
- All interactive elements must have proper ARIA labels
- Keyboard shortcuts must not interfere with screen readers
- Bulk action checkboxes need proper labels

### Performance Considerations

- Animations must respect `prefers-reduced-motion` media query
- Bulk operations should be batched to avoid too many API calls
- localStorage operations are synchronous and fast
- Skeleton loading prevents layout shift

### Mobile Considerations

- Filter dialog should be nearly full-screen on mobile
- Bulk action checkboxes need adequate touch targets (44px+)
- Auto-focus should be disabled on mobile
- View toggle buttons need larger hit areas on mobile

### State Management

- All new state should be local to the component
- Filter state should be reset when dialog closes without applying
- Selected equipment IDs should persist during filtering
- View mode should persist across sessions

---

## Risk Assessment

| Risk                               | Likelihood | Impact | Mitigation                                    |
| ---------------------------------- | ---------- | ------ | --------------------------------------------- |
| File conflicts with multiple edits | Low        | High   | Sequential task execution                     |
| localStorage hydration mismatch    | Medium     | Low    | Check typeof window before access             |
| Mobile keyboard auto-popup         | Low        | Medium | Disable auto-focus on mobile                  |
| Bulk operations timeout            | Low        | High   | Batch operations, show progress               |
| Animation performance issues       | Low        | Medium | Use CSS animations, respect reduced-motion    |
| Accessibility violations           | Medium     | Medium | Test with keyboard navigation, screen readers |
