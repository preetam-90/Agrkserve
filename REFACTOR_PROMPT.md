# Remaining Refactoring Tasks - Detailed Prompt

This document contains the remaining refactoring work needed based on the Desloppify Health Report. Use this as a comprehensive prompt for an AI agent to continue the work.

## Context
- **Current Health Score:** 91.5%
- **Target:** 95%
- **Primary Issue:** Duplication at 24.4% (needs 60%)
- **Files:** 573 | **LOC:** 117K
- **Current Status:** Auth pages have been refactored to use shared primitives

---

## Priority 1: Complete Onboarding/Phone-Setup Refactoring

The auth primitives in `src/components/auth/` need to be applied to remaining pages:

### Task 1.1: Phone Setup Page
**File:** `src/app/phone-setup/PhoneSetupClient.tsx`

**Current State:** Has duplicated background, header, footer code
**Goal:** Use AuthLayout and AuthBackground components

**Steps:**
1. Read the current PhoneSetupClient.tsx
2. Replace the duplicated background code with `<AuthBackground />`
3. Replace the duplicated header with a simple header using Tractor icon
4. Replace the duplicated footer with the AuthLayout pattern
5. Use AuthForm, AuthField, AuthSubmitButton for any forms
6. Preserve all phone verification business logic

### Task 1.2: Labour Onboarding
**File:** `src/app/onboarding/labour/LabourOnboardingClient.tsx`

### Task 1.3: Provider Onboarding  
**File:** `src/app/onboarding/provider/ProviderOnboardingClient.tsx`

---

## Priority 2: Decompose Monster Components

Each of these files exceeds 800 LOC and needs decomposition into smaller pieces.

### Task 2.1: EquipmentClient.tsx (1558 LOC)
**File:** `src/app/equipment/EquipmentClient.tsx`

**Strategy - Extract into hooks:**
1. Create `src/hooks/useEquipmentData.ts` - Equipment data fetching
2. Create `src/hooks/useEquipmentFilters.ts` - Filtering/sorting logic
3. Create `src/hooks/useEquipmentController.ts` - Business logic

**Strategy - Extract into components:**
1. Create `src/components/equipment/EquipmentCard.tsx` - Single equipment card
2. Create `src/components/equipment/EquipmentGrid.tsx` - Grid layout
3. Create `src/components/equipment/EquipmentFilters.tsx` - Filter UI

**Refactor the main component:**
- Keep only JSX rendering
- Call hooks for data/logic
- No more than 300 LOC per component
- No more than 3 boolean useState flags

### Task 2.2: LabourClient.tsx (1306 LOC)
**File:** `src/app/labour/LabourClient.tsx`

Same decomposition strategy as EquipmentClient.

### Task 2.3: AboutClient.tsx (1273 LOC)
**File:** `src/app/about/AboutClient.tsx`

### Task 2.4: SettingsClient.tsx (1020 LOC)  
**File:** `src/app/admin/settings/SettingsClient.tsx`

**CRITICAL:** Has 8 boolean useState flags - MUST use useReducer

**Example Pattern:**
```typescript
// Instead of:
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [deleting, setDeleting] = useState(false);
const [error, setError] = useState(false);
// ... 4 more booleans

// Use:
type SettingsState = {
  status: 'idle' | 'loading' | 'saving' | 'deleting' | 'error' | 'success';
  error: string | null;
};

type SettingsAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_SAVING' }
  | { type: 'SET_DELETING' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_SUCCESS' }
  | { type: 'RESET' };

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, status: 'loading' };
    case 'SET_SAVING':
      return { ...state, status: 'saving' };
    // ...
  }
}

const [state, dispatch] = useReducer(settingsReducer, { status: 'idle', error: null });
```

### Task 2.5: AnalyticsClient.tsx (918 LOC)
**File:** `src/app/admin/analytics/AnalyticsClient.tsx`

### Task 2.6: StorageClient.tsx (793 LOC)
**File:** `src/app/admin/storage/StorageClient.tsx`

---

## Priority 3: Merge Privacy/Terms Near-Duplicates

These components are 92-97% similar between privacy and terms pages.

### Task 3.1: Create Shared Legal Components
**Directory:** `src/components/legal/`

Create these files:

**LegalAccordion.tsx:**
```typescript
interface LegalAccordionProps {
  section: {
    id: string;
    title: string;
    icon: React.ElementType;
    content: React.ReactNode;
  };
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  colorScheme?: 'green' | 'blue';
}

export function LegalAccordion({ section, isOpen, onToggle, index, colorScheme = 'green' }: LegalAccordionProps)
```

**LegalTableOfContents.tsx:**
```typescript
interface LegalTOCProps {
  sections: Array<{ id: string; title: string }>;
  activeId: string | null;
  onNavigate: (id: string) => void;
  title?: string;
  placeholder?: string;
}

export function LegalTableOfContents({ sections, activeId, onNavigate, title, placeholder }: LegalTOCProps)
```

**LegalContactCard.tsx:**
```typescript
interface LegalContactCardProps {
  email: string;
  phone: string;
  address: string;
  type: 'privacy' | 'terms';
}

export function LegalContactCard({ email, phone, address, type }: LegalContactCardProps)
```

**LegalHero.tsx:**
```typescript
interface LegalHeroProps {
  icon: React.ReactNode;
  title: string;
  lastUpdated: string;
  badges: Array<{ text: string; color: string }>;
}

export function LegalHero({ icon, title, lastUpdated, badges }: LegalHeroProps)
```

### Task 3.2: Refactor Privacy Page
**File:** `src/app/privacy/PrivacyClient.tsx`

**Steps:**
1. Import shared legal components
2. Replace PrivacyAccordionSection with LegalAccordion
3. Replace TableOfContents with LegalTableOfContents
4. Replace ContactCard with LegalContactCard
5. Replace hero with LegalHero

### Task 3.3: Refactor Terms Page  
**File:** `src/app/terms/TermsClient.tsx`

Same steps as Privacy page.

---

## Priority 4: Deduplicate subscribe() Functions

There are 4 similar subscribe implementations that should be unified.

### Task 4.1: Create Shared Hook
**File:** `src/hooks/useMediaQuerySubscription.ts`

```typescript
import { useEffect, useRef } from 'react';

export function useMediaQuerySubscription(
  query: string,
  callback: () => void,
  options?: { once?: boolean }
): () => void {
  // Implementation using useSyncExternalStore or useEffect
  // Returns unsubscribe function
}
```

### Task 4.2: Update Existing Files
1. `src/hooks/useAccessibility.tsx` - Replace subscribe()
2. `src/hooks/useMediaQuery.ts` - Replace subscribeToMediaQuery()
3. `src/lib/device-detection.ts` - Replace subscribe()
4. `src/components/landing/shared/CustomCursor.tsx` - Replace subscribeFinePointer()

---

## Priority 5: Fix React Anti-Patterns

### Task 5.1: Remove State Sync Anti-patterns
These useEffect hooks only set derived state - should be computed directly:

**Files to fix:**
- `src/app/help/HelpClient.tsx` - setMounted
- `src/app/not-found-client.tsx` - setMounted  
- `src/app/settings/roles/RolesSettingsClient.tsx` - setEnabledRoles
- `src/components/layout/header.tsx` - setMobileMenuOpen
- `src/components/notifications/NotificationsSearch.tsx` - setLocalValue
- `src/components/ui/media-upload.tsx` - setUploadedFiles

**Pattern to replace:**
```typescript
// BEFORE (anti-pattern):
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

// AFTER (correct):
const mounted = useSyncExternalStore(
  () => () => {},
  () => true,
  () => false
);

// OR simpler:
const mountedRef = useRef(false);
useEffect(() => { mountedRef.current = true; }, []);
// Then use mountedRef.current in conditionals
```

### Task 5.2: Replace Boolean Explosions
- `src/app/admin/settings/SettingsClient.tsx` - 8 boolean states → useReducer
- `src/app/labour/LabourClient.tsx` - 4 boolean states → useReducer
- `src/app/auth/reset-password/ResetPasswordClient.tsx` - 4 boolean states → useReducer
- `src/app/equipment/EquipmentClient.tsx` - 3 boolean states → useReducer

---

## Priority 6: Add Test Coverage

### Task 6.1: smart-query-service.ts Tests
**File:** `src/lib/services/smart-query-service.ts` (2960 LOC - CRITICAL)

**Directory:** `src/lib/services/__tests__/`

**Create:** `smart-query-service.test.ts`

**Test cases to cover:**
```typescript
// Query building
describe('query building', () => {
  test('builds simple query', () => {...});
  test('builds query with filters', () => {...});
  test('builds query with pagination', () => {...});
  test('builds query with sorting', () => {...});
});

// Error handling  
describe('error handling', () => {
  test('handles network error', () => {...});
  test('handles timeout', () => {...});
  test('handles invalid query', () => {...});
  test('handles rate limiting', () => {...});
});

// Data transformation
describe('data transformation', () => {
  test('transforms raw data to models', () => {...});
  test('handles missing fields', () => {...});
  test('handles type coercion', () => {...});
});

// Failure states
describe('failure states', () => {
  test('retries on failure', () => {...});
  test('circuit breaker pattern', () => {...});
  test('fallback to cache', () => {...});
});
```

### Task 6.2: Auth Hook Tests
**File:** `src/components/auth/useAuthForm.ts`

**Create:** `src/components/auth/__tests__/useAuthForm.test.ts`

```typescript
describe('usePasswordValidation', () => {
  test('validates password for signin (min 6 chars)', () => {...});
  test('validates password for signup (8+ chars, uppercase, lowercase, number)', () => {...});
  test('validates password match', () => {...});
});

describe('useEmailValidation', () => {
  test('validates email format', () => {...});
  test('rejects invalid email', () => {...});
});
```

---

## Priority 7: Clean Dead Code

### Task 7.1: Delete Unused Barrel Files
**Files to delete (0 importers):**
- `src/components/invoice/index.ts`
- `src/components/product/index.ts`  
- `src/lib/supabase/index.ts`

### Task 7.2: Delete Orphaned Files (verify first)
Run: `desloppify show orphaned` to identify

**Common dead code patterns:**
- Legacy landing components: `src/components/landing-v2/*`
- Old scroll animations: `src/components/landing/ScrollStory/*`
- Unused utilities: Check imports

### Task 7.3: Remove Unused Imports
Run: `desloppify fix unused-imports`

---

## Priority 8: Global Naming Standardization

### Task 8.1: Choose Standard
Pick ONE pattern: `handleSubmit`

### Task 8.2: Search and Replace
```bash
# Find inconsistent usage
grep -r "onSubmit" --include="*.tsx" src/app/
grep -r "submitHandler" --include="*.tsx" src/app/
grep -r "submitForm" --include="*.tsx" src/app/

# Replace all with handleSubmit
```

---

## Validation Commands

After completing ANY task, ALWAYS run:

```bash
bun run lint
bun run type-check
```

Ensure both pass with 0 errors before committing.

---

## File Size Rules (Enforce)

- No component > 300 LOC
- No file > 500 LOC  
- No more than 3 useState booleans per component
- No duplicated 4+ line blocks
- No barrel file without ≥2 importers

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Duplication | 24.4% | ≥60% |
| Test Health | 78.1% | ≥85% |
| File Health | 90.2% | ≥95% |
| Code Quality | 89.9% | ≥95% |
