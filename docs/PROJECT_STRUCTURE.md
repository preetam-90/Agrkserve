# Project Structure & Best Practices Guide

## 📋 Overview

This document outlines the structure, conventions, and best practices for the AgriServe project to ensure consistency across all contributions.

---

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL)
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Package Manager:** pnpm (enforced)

### Design Patterns

- **Service Layer Pattern:** All API calls through service classes
- **Repository Pattern:** Data access abstraction via Supabase client
- **Custom Hooks:** Reusable logic extraction
- **Compound Components:** Complex UI components
- **Server Components by Default:** Client components only when needed

---

## 📂 Directory Structure

```
agri-serve-web/
├── .github/                      # GitHub specific files
│   ├── workflows/               # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   └── pull_request_template.md
├── public/                       # Static assets
│   ├── favicon.ico
│   └── site.webmanifest
├── scripts/                      # Utility scripts
│   ├── setup-auth.sh
│   └── check-realtime-setup.sh
├── src/                          # Source code
│   ├── app/                     # Next.js pages (App Router)
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/
│   │   │   └── onboarding/
│   │   ├── provider/           # Provider routes
│   │   ├── renter/             # Renter routes
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/              # React components
│   │   ├── ui/                 # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── sidebar.tsx
│   │   └── [feature].tsx       # Feature-specific components
│   ├── lib/                     # Utilities & business logic
│   │   ├── services/           # API service layer
│   │   │   ├── auth-service.ts
│   │   │   ├── equipment-service.ts
│   │   │   └── index.ts        # Export all services
│   │   ├── store/              # Zustand stores
│   │   ├── supabase/           # Supabase clients
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── middleware.ts   # Middleware client
│   │   ├── types/              # TypeScript types
│   │   │   ├── database.ts     # Database types
│   │   │   └── index.ts        # Re-exports
│   │   ├── utils/              # Helper functions
│   │   └── i18n/               # Internationalization
│   └── middleware.ts            # Next.js middleware
├── supabase/                     # Supabase files
│   └── migrations/              # SQL migrations
├── .editorconfig                # Editor configuration
├── .env.example                 # Environment template
├── .eslintrc.json               # ESLint config
├── .gitignore                   # Git ignore rules
├── .prettierrc                  # Prettier config
├── next.config.ts               # Next.js config
├── package.json                 # Dependencies & scripts
├── pnpm-workspace.yaml          # pnpm workspace
├── tsconfig.json                # TypeScript config
├── CONTRIBUTING.md              # Contribution guide
├── LICENSE                      # MIT License
└── README.md                    # Project overview
```

---

## 🎨 Coding Standards

### TypeScript

#### Types & Interfaces

```typescript
// ✅ DO: Define interfaces for props
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

// ✅ DO: Use type for unions/intersections
type UserRole = 'provider' | 'renter' | 'labour';

// ❌ DON'T: Use 'any'
const data: any = fetchData(); // Bad

// ✅ DO: Use proper types or 'unknown'
const data: User | null = fetchData();
```

#### Functions

```typescript
// ✅ DO: Type parameters and return types
function calculatePrice(hours: number, rate: number): number {
  return hours * rate;
}

// ✅ DO: Use arrow functions for components
const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ✅ DO: Use async/await over promises
async function fetchUser(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
```

### React Components

#### File Structure

```typescript
// 1. Imports (grouped)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
}

// 3. Component
export default function Component({ title }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState('');
  const router = useRouter();

  // 5. Effects
  useEffect(() => {
    // effect logic
  }, []);

  // 6. Handlers
  const handleClick = () => {
    // handler logic
  };

  // 7. Render
  return <div>{title}</div>;
}
```

#### Component Guidelines

```typescript
// ✅ DO: Server Components by default
export default function Page() {
  return <div>Server Component</div>;
}

// ✅ DO: Client Components only when needed
'use client';
export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ DO: Extract reusable logic to hooks
function useAuth() {
  const [user, setUser] = useState(null);
  // auth logic
  return { user };
}

// ✅ DO: Proper error boundaries
<Suspense fallback={<Loading />}>
  <Component />
</Suspense>
```

### Naming Conventions

```typescript
// Files
page.tsx; // Page components
layout.tsx; // Layout components
loading.tsx; // Loading states
error.tsx; // Error boundaries
button.tsx; // UI components (lowercase)
auth - service.ts; // Services (kebab-case)

// Components
export function UserProfile() {} // PascalCase
export function EquipmentCard() {} // PascalCase

// Functions
function calculateTotal() {} // camelCase
async function fetchUserData() {} // camelCase

// Variables
const userName = 'John'; // camelCase
const MAX_ITEMS = 100; // UPPER_SNAKE_CASE for constants

// Types/Interfaces
interface User {} // PascalCase
type UserRole = string; // PascalCase
```

### CSS/Styling

```tsx
// ✅ DO: Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">

// ✅ DO: Use responsive modifiers
<div className="text-sm md:text-base lg:text-lg">

// ✅ DO: Group related classes
<button className="
  px-4 py-2
  text-white bg-blue-500
  rounded-md
  hover:bg-blue-600
  focus:outline-none focus:ring-2 focus:ring-blue-500
">

// ✅ DO: Extract repeated patterns
const buttonStyles = "px-4 py-2 rounded-md font-medium";
```

---

## 🔄 Git Workflow

### Branch Naming

```bash
feature/user-authentication      # New features
fix/booking-date-bug            # Bug fixes
refactor/auth-service           # Code refactoring
docs/api-documentation          # Documentation
test/booking-service            # Tests
chore/update-dependencies       # Maintenance
```

### Commit Messages (Conventional Commits)

```bash
# Format: type(scope): subject

feat(auth): add phone number verification
fix(booking): resolve timezone issue in date picker
docs(readme): update installation instructions
style(components): format button component
refactor(services): simplify equipment service
test(auth): add unit tests for login flow
chore(deps): update next.js to 16.1.3
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

---

## 🧪 Testing Strategy (To Be Implemented)

### Unit Tests

```typescript
// Test utilities and pure functions
import { formatPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('formats price correctly', () => {
    expect(formatPrice(1000)).toBe('₹1,000');
  });
});
```

### Integration Tests

```typescript
// Test component interactions
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '@/components/login-form';

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    render(<LoginForm />);
    // test logic
  });
});
```

### E2E Tests (Future)

```typescript
// Test complete user flows with Playwright/Cypress
test('user can complete booking flow', async ({ page }) => {
  await page.goto('/equipment');
  // test steps
});
```

---

## 📦 Services Layer

### Service Structure

```typescript
// lib/services/[feature]-service.ts

class EquipmentService {
  async getAll() {
    const { data, error } = await supabase.from('equipment').select('*');

    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await supabase.from('equipment').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  }

  async create(equipment: NewEquipment) {
    const { data, error } = await supabase.from('equipment').insert(equipment).select().single();

    if (error) throw error;
    return data;
  }
}

export const equipmentService = new EquipmentService();
```

---

## 🔒 Security Best Practices

1. **Never commit secrets** - Use .env files
2. **Validate all inputs** - Use Zod schemas
3. **Use Row Level Security** - Enable RLS on all tables
4. **Sanitize user content** - Prevent XSS attacks
5. **Use HTTPS only** - Enforce secure connections
6. **Rate limit APIs** - Prevent abuse
7. **Validate file uploads** - Check types and sizes

---

## 📱 Responsive Design

```tsx
// Mobile-first approach
<div className="
  text-sm                    // Mobile (default)
  sm:text-base              // Small tablets (640px+)
  md:text-lg                // Tablets (768px+)
  lg:text-xl                // Laptops (1024px+)
  xl:text-2xl               // Desktops (1280px+)
">

// Breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

---

## 🌍 Internationalization

```typescript
// Use next-intl for translations
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('common');

  return <h1>{t('welcome')}</h1>;
}
```

---

## 🚀 Performance Guidelines

1. **Use Server Components** - Reduce client bundle
2. **Image Optimization** - Use Next.js Image component
3. **Code Splitting** - Dynamic imports for large components
4. **Memoization** - useMemo/useCallback where needed
5. **Database Queries** - Select only needed columns
6. **Caching** - Use React Query for data caching

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest/docs)

---

## ✅ Pre-Commit Checklist

- [ ] Code follows style guidelines
- [ ] Types are properly defined
- [ ] No console.logs in production code
- [ ] No commented-out code
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Responsive on all breakpoints
- [ ] Accessible (keyboard navigation, ARIA)
- [ ] Lint passes (`pnpm lint`)
- [ ] Type check passes (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)

---

**Remember:** Consistency is key to maintainable code. When in doubt, look at existing code patterns in the project.
