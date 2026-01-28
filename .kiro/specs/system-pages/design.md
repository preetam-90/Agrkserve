# Design Document: System Pages

## Overview

This design document outlines the implementation of a comprehensive system pages framework for the AgriServe Agricultural Equipment Rental Platform. The system pages handle error states, network conditions, authentication flows, empty states, transaction feedback, and legal information with a farmer-first approach optimized for low-end devices and slow internet connections.

### Design Principles

1. **Farmer-First UX**: Simple, trust-building interfaces with Hindi as the primary language
2. **Performance-Optimized**: Lightweight pages that load quickly on 3G connections
3. **Accessibility-Focused**: WCAG AA compliant with keyboard navigation and screen reader support
4. **Consistent Experience**: Unified design language across all system pages
5. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with React
6. **Offline-Aware**: Graceful degradation when network is unavailable

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS 4 with custom design tokens
- **Internationalization**: next-intl for Hindi/English support
- **Animations**: Framer Motion for subtle, performant animations
- **Icons**: Lucide React for consistent iconography
- **State Management**: Zustand for client-side state
- **Error Tracking**: Integration hooks for logging (implementation-agnostic)

## Architecture

### Directory Structure

```
agri-serve-web/src/
├── app/
│   ├── [locale]/
│   │   ├── error/
│   │   │   ├── 400/page.tsx
│   │   │   ├── 401/page.tsx
│   │   │   ├── 403/page.tsx
│   │   │   ├── 404/page.tsx
│   │   │   ├── 405/page.tsx
│   │   │   ├── 408/page.tsx
│   │   │   ├── 409/page.tsx
│   │   │   ├── 410/page.tsx
│   │   │   ├── 429/page.tsx
│   │   │   ├── 500/page.tsx
│   │   │   └── 50x/page.tsx
│   │   ├── offline/page.tsx
│   │   ├── slow-connection/page.tsx
│   │   ├── auth/
│   │   │   ├── login-required/page.tsx
│   │   │   ├── session-expired/page.tsx
│   │   │   ├── otp-failed/page.tsx
│   │   │   ├── account-suspended/page.tsx
│   │   │   └── kyc-review/page.tsx
│   │   ├── transaction/
│   │   │   ├── payment-success/page.tsx
│   │   │   ├── payment-failed/page.tsx
│   │   │   ├── booking-confirmed/page.tsx
│   │   │   ├── booking-cancelled/page.tsx
│   │   │   └── refund-initiated/page.tsx
│   │   ├── legal/
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── terms/page.tsx
│   │   │   └── refund-policy/page.tsx
│   │   └── not-found.tsx
├── components/
│   ├── system-pages/
│   │   ├── SystemPageLayout.tsx
│   │   ├── ErrorPageTemplate.tsx
│   │   ├── EmptyStateTemplate.tsx
│   │   ├── TransactionPageTemplate.tsx
│   │   ├── StatusIndicator.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── NetworkStatus.tsx
│   │   └── illustrations/
│   │       ├── ErrorIllustration.tsx
│   │       ├── OfflineIllustration.tsx
│   │       ├── EmptyStateIllustration.tsx
│   │       └── SuccessIllustration.tsx
│   └── ui/
│       └── empty-state.tsx (existing)
├── lib/
│   ├── system-pages/
│   │   ├── error-logger.ts
│   │   ├── network-detector.ts
│   │   └── page-metadata.ts
│   └── i18n/
│       └── system-pages/
│           ├── en.json
│           └── hi.json
└── hooks/
    ├── useNetworkStatus.ts
    ├── useOfflineDetection.ts
    └── useLanguageToggle.ts
```

### Routing Strategy

**Next.js App Router with Internationalization**:
- All system pages under `[locale]` dynamic segment for i18n
- Error pages accessible via `/error/{code}` routes
- Custom 404 handler via `not-found.tsx`
- Server-side error boundary via `error.tsx`
- Metadata generation for SEO per page

**Error Handling Flow**:
```
1. Error occurs in application
2. Error boundary catches error
3. Error logger records details (no stack trace to user)
4. Redirect to appropriate error page with error code
5. Display user-friendly message with CTA
6. User takes action (retry, go home, contact support)
```

## Components and Interfaces

### Core Components

#### 1. SystemPageLayout

**Purpose**: Consistent layout wrapper for all system pages

**Props**:
```typescript
interface SystemPageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}
```

**Features**:
- Consistent header/footer
- Responsive container
- Accessibility landmarks
- SEO-friendly structure

#### 2. ErrorPageTemplate

**Purpose**: Reusable template for HTTP error pages

**Props**:
```typescript
interface ErrorPageTemplateProps {
  errorCode: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
  primaryAction: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  showSearchBar?: boolean;
  showPopularCategories?: boolean;
  countdown?: number; // For 429 rate limiting
}
```

**Behavior**:
- Displays error code prominently
- Shows culturally appropriate illustration
- Renders primary CTA button (min 44x44px touch target)
- Optional secondary action
- Logs error details without exposing to user
- Supports countdown timer for rate limiting

#### 3. EmptyStateTemplate

**Purpose**: Reusable template for empty state displays

**Props**:
```typescript
interface EmptyStateTemplateProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'search' | 'bookings' | 'notifications';
}
```

**Behavior**:
- Positive, encouraging messaging
- Never resembles error state
- Clear next action guidance
- Contextual illustrations

#### 4. TransactionPageTemplate

**Purpose**: Template for payment and booking feedback pages

**Props**:
```typescript
interface TransactionPageTemplateProps {
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  title: string;
  description: string;
  transactionDetails: {
    referenceNumber: string;
    amount?: number;
    date: Date;
    additionalInfo?: Record<string, string>;
  };
  primaryAction: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  showDownloadOption?: boolean;
  showShareOption?: boolean;
}
```

**Behavior**:
- Clear status indicator (icon + color)
- Transaction summary display
- Reference number for support
- Download/share options
- Next steps guidance

#### 5. StatusIndicator

**Purpose**: Visual status feedback component

**Props**:
```typescript
interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}
```

**Behavior**:
- Color-coded status (green, red, yellow, blue, gray)
- Icon representation
- Optional animation (pulse, spin)
- Accessible with aria-label

#### 6. CountdownTimer

**Purpose**: Countdown display for rate limiting (429 errors)

**Props**:
```typescript
interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  format?: 'mm:ss' | 'seconds';
}
```

**Behavior**:
- Real-time countdown display
- Callback on completion
- Accessible time announcement
- Automatic retry button enable

#### 7. NetworkStatus

**Purpose**: Network connectivity indicator

**Props**:
```typescript
interface NetworkStatusProps {
  status: 'online' | 'offline' | 'slow';
  showBanner?: boolean;
  position?: 'top' | 'bottom';
}
```

**Behavior**:
- Real-time network detection
- Visual indicator (banner or icon)
- Automatic retry on reconnection
- Cached data availability hint

### Illustration Components

All illustrations will be SVG-based, inline for performance, and culturally appropriate for Indian farmers.

**Themes**:
- Agricultural equipment (tractors, plows, harvesters)
- Farming scenes (fields, crops, farmers)
- Trust symbols (handshake, shield, checkmark)
- Network symbols (wifi, signal, cloud)

**Design Guidelines**:
- Simple, flat design style
- Green color palette (matching brand)
- Maximum 10KB per SVG
- Responsive sizing
- Meaningful alt text

## Data Models

### Error Log Entry

```typescript
interface ErrorLogEntry {
  timestamp: Date;
  errorCode: string;
  errorMessage: string;
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
  referrer?: string;
  networkStatus: 'online' | 'offline' | 'slow';
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
  };
  additionalContext?: Record<string, unknown>;
}
```

### Transaction Details

```typescript
interface TransactionDetails {
  id: string;
  type: 'payment' | 'booking' | 'refund';
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  referenceNumber: string;
  amount?: number;
  currency: 'INR';
  timestamp: Date;
  equipmentId?: string;
  equipmentName?: string;
  rentalPeriod?: {
    startDate: Date;
    endDate: Date;
  };
  userId: string;
  metadata?: Record<string, unknown>;
}
```

### Network Status

```typescript
interface NetworkStatus {
  isOnline: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink?: number; // Mbps
  rtt?: number; // Round-trip time in ms
  saveData: boolean; // User preference for reduced data
}
```

### Page Metadata

```typescript
interface SystemPageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  noindex?: boolean; // For error pages
  canonical?: string;
}
```

### Internationalization Content

```typescript
interface SystemPageTranslations {
  locale: 'en' | 'hi';
  errorPages: Record<string, {
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction?: string;
  }>;
  emptyStates: Record<string, {
    title: string;
    description: string;
    primaryAction: string;
  }>;
  transactionPages: Record<string, {
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction?: string;
  }>;
  common: {
    goHome: string;
    goBack: string;
    retry: string;
    contactSupport: string;
    loading: string;
    error: string;
    success: string;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Consistent Layout Structure

*For any* system page (error, auth, empty state, transaction, or legal page), the rendered output should include both header and footer navigation components that match the main application layout.

**Validates: Requirements 1.13, 7.1**

### Property 2: Simple, Non-Technical Language

*For any* system page text content, the language should not contain technical jargon (terms like "HTTP", "API", "server", "stack trace", "exception", "null", "undefined") and should use simple vocabulary appropriate for users with limited technical literacy.

**Validates: Requirements 1.12, 8.5**

### Property 3: No Stack Traces Exposed

*For any* error page or error state, the rendered HTML output should not contain stack trace patterns (file paths, line numbers, function call stacks) visible to the user, even though error details are logged internally.

**Validates: Requirements 1.14, 9.3**

### Property 4: Network Restoration Auto-Retry

*For any* failed request that occurred during offline mode, when network connectivity is restored, the system should automatically retry the request and update the UI with the result.

**Validates: Requirements 2.3**

### Property 5: Auth Context Preservation

*For any* authentication state page (login required, session expired, OTP failed), the page should preserve the original destination URL as a redirect parameter so users return to their intended location after successful authentication.

**Validates: Requirements 3.6**

### Property 6: Positive Empty State Language

*For any* empty state page, the text content should not contain negative or error-like words (such as "error", "failed", "wrong", "problem", "issue") and should instead use encouraging, positive language.

**Validates: Requirements 4.7**

### Property 7: Transaction Reference Numbers

*For any* transaction page (payment success, payment failed, booking confirmed, booking cancelled, refund initiated), the rendered output should display a transaction reference number that users can record for support purposes.

**Validates: Requirements 5.6**

### Property 8: Transaction Download/Share Options

*For any* transaction page, the rendered output should include both download and share action buttons to allow users to save or share their transaction details.

**Validates: Requirements 5.7**

### Property 9: Simple Legal Language

*For any* legal page (privacy policy, terms & conditions, refund policy), the text content should avoid complex legal terminology (terms like "hereinafter", "aforementioned", "pursuant to", "notwithstanding") and use plain language explanations.

**Validates: Requirements 6.7**

### Property 10: Legal Page Structure

*For any* legal page, the content should be structured with clear heading elements (h1, h2, h3), paragraphs should be under 100 words each, and the layout should be responsive across mobile, tablet, and desktop viewports.

**Validates: Requirements 6.8**

### Property 11: Footer Legal Links

*For any* page footer component, it should contain navigation links to all six legal pages (About Us, Contact Us, FAQ, Privacy Policy, Terms & Conditions, Refund & Cancellation Policy).

**Validates: Requirements 6.9**

### Property 12: Readable Typography

*For any* system page, all text elements should use font sizes of at least 16px for body text and 14px for secondary text to ensure readability on low-end mobile devices.

**Validates: Requirements 7.2**

### Property 13: Accessible Color Contrast

*For any* system page, all text and background color combinations should meet WCAG AA contrast ratio requirements (4.5:1 for normal text, 3:1 for large text 18px+).

**Validates: Requirements 7.3**

### Property 14: Single Primary CTA

*For any* system page, there should be exactly one primary call-to-action button that is visually prominent (using primary button styling) to guide the user's next action.

**Validates: Requirements 7.5**

### Property 15: Animation Duration Constraint

*For any* system page that includes animations (fade, slide, scale), all animation durations should be under 300ms to maintain performance on low-end devices.

**Validates: Requirements 7.6**

### Property 16: Responsive Layout

*For any* system page, when rendered at mobile (320px-767px), tablet (768px-1023px), and desktop (1024px+) viewport widths, the layout should not have horizontal overflow and all content should remain accessible.

**Validates: Requirements 7.7**

### Property 17: Hindi Default Language

*For any* system page, when no language preference is set, the default displayed language should be Hindi (locale 'hi').

**Validates: Requirements 8.1**

### Property 18: Language Toggle Presence

*For any* system page, the rendered output should include a language toggle component that allows switching between Hindi and English.

**Validates: Requirements 8.2**

### Property 19: Language Preference Persistence

*For any* language selection made by a user, the preference should be stored (in localStorage or cookies) and retrieved on subsequent page loads to maintain the user's choice across sessions.

**Validates: Requirements 8.3**

### Property 20: SEO Metadata Presence

*For any* system page, the HTML head should include essential SEO metadata elements (title tag, meta description, meta keywords, og:title, og:description) with appropriate content for that page type.

**Validates: Requirements 9.2**

### Property 21: Optimized Image Formats

*For any* system page that displays images, the images should be served in WebP format with appropriate fallbacks (JPEG/PNG) for browsers that don't support WebP.

**Validates: Requirements 10.3**

### Property 22: Semantic HTML Structure

*For any* system page, the HTML structure should use proper semantic elements (header, nav, main, footer, article, section) rather than generic div elements for major page sections.

**Validates: Requirements 10.4**

### Property 23: Keyboard Navigation Support

*For any* system page, all interactive elements (buttons, links, form inputs) should be keyboard accessible (focusable via Tab key, activatable via Enter/Space) and have visible focus indicators.

**Validates: Requirements 10.5**

### Property 24: Reduced Motion Respect

*For any* system page with animations, when the user's browser has prefers-reduced-motion setting enabled, all animations should be disabled or reduced to simple fades.

**Validates: Requirements 10.7**

### Property 25: Image Alt Text

*For any* system page that displays images or illustrations, each image element should have a non-empty alt attribute that meaningfully describes the image content for screen readers.

**Validates: Requirements 10.8**

## Error Handling

### Error Logging Strategy

**Client-Side Error Logging**:
- Capture errors via React Error Boundaries
- Log to external service (e.g., Sentry, LogRocket)
- Include context: user ID, session ID, URL, user agent, network status
- Never expose sensitive data in logs
- Rate limit logging to prevent spam

**Error Log Structure**:
```typescript
{
  timestamp: ISO8601,
  errorCode: string,
  errorMessage: string,
  userId: string | null,
  sessionId: string,
  url: string,
  userAgent: string,
  networkStatus: 'online' | 'offline' | 'slow',
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop',
    os: string,
    browser: string
  }
}
```

### Error Page Routing

**HTTP Error Codes**:
- 400-499: Client errors → Redirect to `/error/{code}`
- 500-599: Server errors → Redirect to `/error/{code}` or `/error/50x`
- Network errors: Redirect to `/offline`
- Timeout errors: Redirect to `/error/408`

**Error Boundary Fallback**:
```typescript
// Catch-all for unhandled React errors
<ErrorBoundary
  fallback={<ErrorPageTemplate errorCode="500" />}
  onError={(error, errorInfo) => logError(error, errorInfo)}
>
  {children}
</ErrorBoundary>
```

### Network Error Handling

**Offline Detection**:
- Use `navigator.onLine` API
- Listen to `online` and `offline` events
- Implement exponential backoff for retries
- Show offline banner when disconnected
- Auto-retry when connection restored

**Slow Connection Detection**:
- Use Network Information API (`navigator.connection`)
- Detect effective connection type (4g, 3g, 2g, slow-2g)
- Adapt UI based on connection speed
- Reduce image quality on slow connections
- Show slow connection banner

**Request Timeout Handling**:
- Set reasonable timeout (10s for API calls)
- Show timeout error page with retry option
- Implement retry with exponential backoff
- Cache successful responses for offline use

## Testing Strategy

### Dual Testing Approach

The system pages will be validated through both unit tests and property-based tests:

**Unit Tests**: Focus on specific examples, edge cases, and error conditions
- Test individual error page renders correctly (400, 401, 404, etc.)
- Test countdown timer component behavior
- Test network status detection
- Test language toggle functionality
- Test transaction page with specific data
- Test empty state variations

**Property-Based Tests**: Verify universal properties across all inputs
- Test all system pages have consistent layout (Property 1)
- Test all text content avoids technical jargon (Property 2)
- Test all error pages hide stack traces (Property 3)
- Test all transaction pages include reference numbers (Property 7)
- Test all pages meet color contrast requirements (Property 13)
- Test all pages have exactly one primary CTA (Property 14)
- Test all pages support keyboard navigation (Property 23)

### Property-Based Testing Configuration

**Testing Library**: fast-check (for TypeScript/JavaScript)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: system-pages, Property {N}: {property description}`

**Example Property Test**:
```typescript
// Feature: system-pages, Property 1: Consistent Layout Structure
test('all system pages include header and footer', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(
        'error/400', 'error/404', 'error/500',
        'auth/login-required', 'auth/session-expired',
        'transaction/payment-success', 'transaction/payment-failed',
        'legal/about', 'legal/privacy'
      ),
      (pagePath) => {
        const { container } = render(<SystemPage path={pagePath} />);
        const header = container.querySelector('header');
        const footer = container.querySelector('footer');
        return header !== null && footer !== null;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Goals

- **Unit Test Coverage**: 80%+ for component logic
- **Property Test Coverage**: All 25 correctness properties
- **Integration Test Coverage**: Critical user flows (error → retry, offline → online)
- **Accessibility Test Coverage**: All pages pass axe-core audits
- **Performance Test Coverage**: All pages meet Lighthouse thresholds

### Testing Tools

- **Unit Testing**: Jest + React Testing Library
- **Property Testing**: fast-check
- **Accessibility Testing**: jest-axe, axe-core
- **Visual Regression**: Chromatic or Percy
- **Performance Testing**: Lighthouse CI
- **E2E Testing**: Playwright (for critical flows)

## Implementation Notes

### Performance Optimizations

1. **Code Splitting**: Each error page as separate chunk
2. **Image Optimization**: Use next/image with WebP format
3. **Font Optimization**: Subset fonts to include only Hindi + English characters
4. **CSS Optimization**: Extract critical CSS, defer non-critical
5. **JavaScript Optimization**: Minimize bundle size, lazy load non-critical components
6. **Caching Strategy**: Cache static assets, implement service worker for offline support

### Accessibility Considerations

1. **Keyboard Navigation**: All interactive elements keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels, semantic HTML
3. **Focus Management**: Visible focus indicators, logical tab order
4. **Color Contrast**: WCAG AA compliance (4.5:1 for normal text)
5. **Text Sizing**: Minimum 16px body text, scalable with browser zoom
6. **Motion Sensitivity**: Respect prefers-reduced-motion preference

### Internationalization Implementation

1. **next-intl Integration**: Use existing i18n setup
2. **Translation Files**: Separate JSON files for en/hi
3. **RTL Support**: Not required (Hindi is LTR)
4. **Number Formatting**: Use Indian numbering system (lakhs, crores)
5. **Date Formatting**: Use Indian date format (DD/MM/YYYY)
6. **Currency Formatting**: Always show ₹ symbol with Indian formatting

### Mobile-First Considerations

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Viewport Meta**: Proper viewport configuration for mobile
3. **Responsive Images**: Serve appropriate sizes based on device
4. **Reduced Motion**: Minimal animations on low-end devices
5. **Offline Support**: Service worker for offline functionality
6. **Network Awareness**: Adapt UI based on connection speed

## Design System Integration

### Color Palette

Based on existing AgriServe brand:
- **Primary Green**: #22c55e (green-500)
- **Dark Green**: #16a34a (green-600)
- **Light Green**: #86efac (green-300)
- **Accent Lime**: #84cc16 (lime-500)
- **Error Red**: #ef4444 (red-500)
- **Warning Yellow**: #f59e0b (amber-500)
- **Info Blue**: #3b82f6 (blue-500)
- **Success Green**: #10b981 (emerald-500)
- **Neutral Gray**: #6b7280 (gray-500)

### Typography Scale

- **Heading 1**: 2.5rem (40px) / 3rem (48px) on desktop
- **Heading 2**: 2rem (32px) / 2.5rem (40px) on desktop
- **Heading 3**: 1.5rem (24px) / 1.75rem (28px) on desktop
- **Body Large**: 1.125rem (18px)
- **Body**: 1rem (16px)
- **Body Small**: 0.875rem (14px)
- **Caption**: 0.75rem (12px)

### Spacing System

- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### Component Variants

**Button Variants**:
- Primary: Green background, white text
- Secondary: White background, green border, green text
- Outline: Transparent background, green border, green text
- Ghost: Transparent background, green text
- Danger: Red background, white text

**Status Indicators**:
- Success: Green circle with checkmark
- Error: Red circle with X
- Warning: Yellow circle with exclamation
- Info: Blue circle with i
- Pending: Gray circle with spinner

### Animation Presets

All animations under 300ms:
- **Fade In**: opacity 0 → 1, 200ms ease-out
- **Slide Up**: translateY(10px) → 0, 250ms ease-out
- **Slide Down**: translateY(-10px) → 0, 250ms ease-out
- **Scale**: scale(0.95) → 1, 200ms ease-out
- **Pulse**: opacity 1 → 0.5 → 1, 2s infinite (for loading states)

## Security Considerations

1. **No Sensitive Data Exposure**: Never display stack traces, API keys, or internal paths
2. **XSS Prevention**: Sanitize all user-generated content
3. **CSRF Protection**: Use Next.js built-in CSRF protection
4. **Rate Limiting**: Implement rate limiting for error logging
5. **Content Security Policy**: Strict CSP headers for all pages
6. **Input Validation**: Validate all user inputs on client and server

## Monitoring and Analytics

### Error Tracking Metrics

- Error frequency by type (400, 404, 500, etc.)
- Error resolution time
- User impact (number of users affected)
- Error trends over time
- Geographic distribution of errors

### User Behavior Metrics

- Most common error pages visited
- Average time on error pages
- Error page bounce rate
- Retry success rate
- Support contact rate from error pages

### Performance Metrics

- Page load time (P50, P95, P99)
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

### Accessibility Metrics

- Keyboard navigation usage
- Screen reader usage
- Color contrast violations
- Focus indicator visibility
- ARIA label coverage
