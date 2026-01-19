# AgriServe - AI Coding Agent Instructions

## Project Overview
AgriServe is a hyperlocal agricultural equipment marketplace built with Next.js 16 (App Router), Supabase (PostgreSQL with PostGIS), and TypeScript. It connects farmers needing equipment with providers who rent it out, featuring location-based search and multi-role user management.

## Architecture & Key Patterns

### Multi-Role User System
Users can have multiple roles (`renter`, `provider`, `labour`, `admin`) stored in `user_roles` table. Active role switching is managed via Zustand store (`auth-store.ts`). Routes are segregated by role: `/renter/*`, `/provider/*`, `/admin/*`. Always check `activeRole` when building role-specific features.

### State Management (Zustand)
- **`auth-store.ts`**: User authentication, profile, roles, and active role switching. Persisted to localStorage.
- **`app-store.ts`**: App-wide UI state (sidebar, filters, language), user location via browser geolocation.
- Services fetch data, stores manage UI state. Avoid mixing concerns.

### Supabase Client Patterns
**Three distinct client instances** - never mix them:
- `lib/supabase/client.ts`: Client-side (browser) operations
- `lib/supabase/server.ts`: Server Components and Route Handlers
- `lib/supabase/middleware.ts`: Session management in Next.js middleware

Always use `createClient()` from the appropriate file based on execution context.

### Service Layer Architecture
All database interactions go through services in `lib/services/`:
- `auth-service.ts`: Sign in/up, OAuth, password reset, profile CRUD
- `equipment-service.ts`: Equipment CRUD, geospatial search, filtering
- `booking-service.ts`: Booking lifecycle management
- Services handle error cases gracefully (e.g., missing tables return null/empty arrays)

### Database Schema (PostGIS-enabled)
Schema in `supabase/migrations/001_initial_schema.sql`:
- Uses PostGIS for geospatial queries (`location GEOGRAPHY(Point, 4326)`)
- Equipment and bookings have lat/lng + computed geography columns
- RLS policies enabled on all tables (see migration file)
- Automatic `updated_at` triggers on all tables

### Internationalization (i18n)
Custom i18n system in `lib/i18n/` supporting English/Hindi:
- Use `useI18n()` hook in components: `const { t, locale, setLocale } = useI18n()`
- Translation keys are nested: `t('dashboard.welcome')` → `en.json` → `dashboard.welcome`
- All user-facing strings must be translated - add keys to both `locales/en.json` and `locales/hi.json`

## Development Workflow

### Running the App
```bash
cd agri-serve-web
pnpm dev  # Runs on http://localhost:3000
```

**Important**: Always run commands from `agri-serve-web/` directory, NOT the parent `agro/` folder.

### Database Setup
1. Run migration in Supabase SQL Editor: `supabase/migrations/001_initial_schema.sql`
2. Test connection at `/test-connection`
3. Follow `DATABASE_SETUP.md` for detailed steps

### Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (image uploads)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (payments)

## Component & Code Conventions

### UI Components
Radix UI primitives in `components/ui/` with Tailwind styling. Use existing components (Button, Card, Input, etc.) before creating new ones. Import from `@/components/ui` barrel export.

### Path Aliases
- `@/*` → `src/*` (configured in `tsconfig.json`)
- Always use absolute imports: `import { useAuthStore } from '@/lib/store'`

### Form Handling
- React Hook Form + Zod for validation (see `package.json`)
- No form examples in codebase yet - follow React Hook Form docs when implementing

### Styling
- Tailwind CSS 4 with custom design system in `globals.css`
- Use utility classes, avoid inline styles
- Responsive design: mobile-first approach

### TypeScript Types
- Database types in `lib/types/database.ts` match Supabase schema
- Export types from `lib/types/index.ts` barrel export
- Strict mode enabled - no implicit `any`

## Critical Gotchas

### Middleware Deprecation Warning
Next.js shows warning about `middleware.ts` → `proxy.ts` convention. This is expected and doesn't affect functionality. Don't create `proxy.ts` unless migrating to Next.js 16+ standards.

### Location-Based Features
Equipment search uses PostGIS distance queries. User location from `app-store.ts` (`userLocation: Coordinates | null`). Default location in `constants.ts` if geolocation fails.

### Authentication Flow
1. Sign up → `auth-service.signUpWithEmail()` → creates `auth.users` entry
2. Onboarding → `/onboarding` → sets roles + profile
3. Profile completion check → `is_profile_complete` field
4. Role switch → `auth-store.switchRole()` → updates `activeRole` in store

### Error Handling in Services
Services check for table existence (`error.code === '42P01'`) and return graceful defaults. This allows development before DB migration is run.

## Testing & Quality

### Current Testing Setup
No test files exist yet. When implementing:
- Use Jest/Vitest for unit tests
- React Testing Library for component tests
- Consider E2E with Playwright

### Linting
ESLint configured (`eslint.config.mjs`). Run with `pnpm lint`.

## External Integrations

- **Cloudinary**: Image uploads in equipment forms (see `provider/equipment/[id]/page.tsx`)
- **Razorpay**: Payment gateway in booking flow (see `renter/equipment/[id]/book/page.tsx`)
- **Supabase Auth**: Email/password + OAuth (Google provider configured)

## Key Files to Reference

- `DATABASE_SETUP.md`: Step-by-step Supabase setup
- `supabase/migrations/001_initial_schema.sql`: Complete DB schema
- `src/lib/store/auth-store.ts`: Auth state management patterns
- `src/app/provider/dashboard/page.tsx`: Example of role-specific dashboard
- `src/lib/services/equipment-service.ts`: Geospatial query examples
- `src/lib/utils/constants.ts`: Shared constants and options

## When Adding Features

1. **New DB tables**: Add migration SQL, update `database.ts` types, create service functions
2. **New routes**: Follow role-based folder structure (`/renter/*`, `/provider/*`)
3. **New UI components**: Use Radix UI + Tailwind, add to `components/ui/` with barrel export
4. **New translations**: Add to both `en.json` and `hi.json` with identical key structure
5. **State management**: Add to existing stores or create new store in `lib/store/`

## Questions to Clarify

- **Payment flow**: Is Razorpay integration complete? Are there test credentials?
- **Image uploads**: Are there size/format restrictions for equipment images?
- **Location search**: Should distance radius be configurable per user?
- **Notifications**: In-app notifications are in schema but no UI exists yet - planned?
