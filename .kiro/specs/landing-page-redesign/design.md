# Design Document: Landing Page Redesign

## Overview

This design document outlines the comprehensive redesign of the AgriServe landing page (src/app/page.tsx). The redesign transforms the current functional landing page into a modern, premium, animated experience that blends traditional agriculture values with cutting-edge technology aesthetics.

The design follows a mobile-first approach while ensuring desktop experiences feel cinematic and spacious. All animations are purposeful and smooth, using Framer Motion for production-ready motion design. The page maintains the existing Next.js 14+ App Router architecture with TypeScript and Tailwind CSS, integrating seamlessly with the Supabase backend.

### Design Goals

1. **Modern Premium Aesthetic**: Glassmorphism, soft shadows, rounded corners, subtle gradients
2. **Purposeful Motion**: Smooth animations that enhance UX without distraction (300-600ms timing)
3. **Trust & Credibility**: Verified badges, testimonials, animated statistics, social proof
4. **Performance**: Lazy loading, optimized images, 90+ Lighthouse score
5. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, semantic HTML
6. **Responsive Excellence**: Mobile-first with cinematic desktop experience

## Architecture

### Component Structure

The landing page will be restructured into modular, reusable components following React best practices:

```
src/app/page.tsx (Main Landing Page)
├── HeroSection
│   ├── AnimatedBackground
│   ├── HeroContent
│   ├── LiveStats
│   └── FloatingEquipment
├── TrustStrip
├── HowItWorksSection
│   └── ProcessStep (x3)
├── FeaturedEquipmentSection
│   └── EquipmentCarousel
│       └── EquipmentCard
├── BenefitsSection
│   └── BenefitCard (x6)
├── ImpactSection
│   ├── AnimatedCounter (x3)
│   └── TestimonialCard
├── AppPreviewSection
│   └── ScreenshotSlider
├── CTASection
└── Footer
```

### Animation Architecture

All animations will use Framer Motion for consistency and performance:

- **Page Load**: Orchestrated entrance animations using `stagger` for sequential reveals
- **Scroll Animations**: `useInView` hook to trigger animations when elements enter viewport
- **Hover Effects**: `whileHover` and `whileTap` variants for interactive elements
- **Parallax**: `useScroll` and `useTransform` for parallax effects
- **Counters**: Custom `useCountUp` hook with `useSpring` for smooth number animations

### State Management

The landing page will use React hooks for local state:

- `useState`: Featured equipment, loading states, statistics
- `useEffect`: Data fetching from Supabase
- `useInView`: Scroll-based animation triggers
- `useReducedMotion`: Respect user's motion preferences

### Data Flow

```
Supabase Backend
    ↓
equipmentService.getEquipment()
    ↓
Landing Page State
    ↓
Component Props
    ↓
Rendered UI
```

## Components and Interfaces

### 1. HeroSection Component

**Purpose**: Full-screen hero with animated background, headline, CTAs, and floating equipment visuals.

**Props Interface**:
```typescript
interface HeroSectionProps {
  stats: {
    totalUsers: number;
    totalEquipment: number;
  };
}
```

**Key Features**:
- Parallax scrolling background with gradient overlay
- Animated headline with staggered word reveal
- Floating equipment images with slow rotation and vertical motion
- Live stats with pulsing indicators
- Dual CTAs with ripple effects
- Trust badge with glassmorphism

**Animation Sequence**:
1. Background fades in (0-300ms)
2. Logo scales in with bounce (300-600ms)
3. Headline words stagger in (600-1200ms)
4. Stats fade in (1200-1500ms)
5. CTAs slide up (1500-1800ms)
6. Floating equipment starts continuous motion

### 2. AnimatedCounter Component

**Purpose**: Displays numbers that animate from 0 to target value when visible.

**Props Interface**:
```typescript
interface AnimatedCounterProps {
  end: number;
  duration?: number; // default 2000ms
  suffix?: string;
  prefix?: string;
  decimals?: number;
}
```

**Implementation**:
- Uses Framer Motion's `useSpring` for smooth easing
- Triggers on first viewport intersection
- Respects `prefers-reduced-motion`

### 3. EquipmentCard Component

**Purpose**: Displays equipment with hover interactions and dynamic data.

**Props Interface**:
```typescript
interface EquipmentCardProps {
  equipment: {
    id: string;
    name: string;
    images: string[];
    price_per_day: number;
    location_name: string;
    is_available: boolean;
    rating?: number;
    category: string;
  };
  index: number; // for stagger animations
}
```

**Hover Interactions**:
- Lift effect: `translateY(-8px)`
- Glow effect: `box-shadow` expansion
- Image scale: `scale(1.05)`
- Transition: 300ms ease-out

### 4. ProcessStep Component

**Purpose**: Displays a single step in the "How It Works" section.

**Props Interface**:
```typescript
interface ProcessStepProps {
  step: number;
  icon: React.ComponentType;
  title: string;
  description: string;
  delay: number; // for stagger
}
```

**Animation**:
- Fade in + slide up when in view
- Icon rotates 360° on hover
- Step number pulses

### 5. TestimonialCard Component

**Purpose**: Displays farmer testimonials with ratings.

**Props Interface**:
```typescript
interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
  rating: number;
  delay: number;
}
```

**Styling**:
- Glassmorphism background
- Soft border with earth tones
- Star ratings with fill animation

### 6. ScreenshotSlider Component

**Purpose**: Auto-playing carousel of app screenshots.

**Props Interface**:
```typescript
interface ScreenshotSliderProps {
  screenshots: {
    src: string;
    alt: string;
    caption: string;
  }[];
  autoPlayInterval?: number; // default 3000ms
}
```

**Features**:
- Auto-advance with pause on hover
- Smooth slide transitions
- Dot indicators
- Swipe support on mobile

## Data Models

### Equipment Data Model

```typescript
interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  price_per_day: number;
  price_per_hour?: number;
  location_name: string;
  location_coordinates?: {
    lat: number;
    lng: number;
  };
  is_available: boolean;
  rating?: number;
  total_bookings?: number;
  owner_id: string;
  created_at: string;
}
```

### Statistics Data Model

```typescript
interface LandingPageStats {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  acresCovered: number;
  categoryCounts: Record<string, number>;
}
```

### Testimonial Data Model

```typescript
interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
  rating: number;
  verified: boolean;
}
```

## Design System

### Color Palette

```typescript
const colors = {
  primary: {
    dark: '#0f3d2e',      // Deep agricultural green
    DEFAULT: '#16a34a',   // Green-600
    light: '#22c55e',     // Green-500
  },
  accent: {
    lime: '#84cc16',      // Lime-500 for CTAs
    yellow: '#fbbf24',    // Yellow-400 for highlights
  },
  earth: {
    sand: '#fef3c7',      // Amber-100
    beige: '#fef3c7',     // Amber-100
    brown: '#78350f',     // Amber-900
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    800: '#262626',
    900: '#171717',
  }
};
```

### Typography Scale

```typescript
const typography = {
  hero: {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 700,
    lineHeight: 1.1,
    fontFamily: 'var(--font-space-grotesk)',
  },
  h2: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  body: {
    fontSize: '1.125rem',
    lineHeight: 1.7,
    fontFamily: 'var(--font-inter)',
  },
};
```

### Spacing System

```typescript
const spacing = {
  section: {
    mobile: '5rem',    // 80px
    desktop: '7.5rem', // 120px
  },
  container: {
    maxWidth: '1280px',
    padding: {
      mobile: '1rem',
      desktop: '2rem',
    },
  },
};
```

### Border Radius

```typescript
const borderRadius = {
  card: '1rem',      // 16px
  button: '0.75rem', // 12px
  badge: '9999px',   // pill shape
  large: '1.5rem',   // 24px
};
```

### Shadow System

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgb(34 197 94 / 0.3)', // green glow
};
```

### Animation Timing

```typescript
const timing = {
  fast: '150ms',
  DEFAULT: '300ms',
  slow: '600ms',
  easing: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};
```

## Animation Specifications

### Page Load Animation Sequence

```typescript
const pageLoadVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
```

### Scroll Reveal Animation

```typescript
const scrollRevealVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

// Usage with useInView
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: '-100px' });
```

### Hover Animations

```typescript
const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  hover: {
    scale: 1.02,
    y: -8,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 0 20px rgb(34 197 94 / 0.3)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};
```

### Counter Animation

```typescript
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [isInView, end, duration]);
  
  return { count, ref };
};
```

### Parallax Effect

```typescript
const useParallax = (speed: number = 0.5) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed]);
  return y;
};
```

### Floating Animation

```typescript
const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, 0, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
```

## Responsive Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};
```

### Mobile-First Approach

All components start with mobile styles and progressively enhance:

```typescript
// Example: Hero Section
<div className="
  min-h-screen          // Mobile: full viewport
  py-12                 // Mobile: padding
  md:py-20              // Tablet: more padding
  lg:py-0               // Desktop: remove padding (use flex center)
  flex items-center     // Desktop: vertical center
">
```

## Performance Optimizations

### Image Optimization

```typescript
// Use Next.js Image component with priority for above-fold images
<Image
  src={equipment.images[0]}
  alt={equipment.name}
  width={400}
  height={300}
  priority={index < 3} // Priority for first 3 items
  loading={index < 3 ? 'eager' : 'lazy'}
  quality={85}
  className="object-cover"
/>
```

### Lazy Loading Strategy

- **Above the fold**: Hero section, trust strip (eager loading)
- **Below the fold**: All other sections (lazy loading)
- **Images**: Lazy load all images except hero
- **Components**: Use dynamic imports for heavy components

```typescript
const ScreenshotSlider = dynamic(() => import('./ScreenshotSlider'), {
  loading: () => <Spinner />,
  ssr: false, // Client-side only for carousel
});
```

### Code Splitting

```typescript
// Separate animation utilities
const animations = {
  pageLoad: () => import('./animations/pageLoad'),
  scroll: () => import('./animations/scroll'),
  hover: () => import('./animations/hover'),
};
```

## Accessibility Features

### Keyboard Navigation

- All interactive elements focusable with Tab
- Focus indicators with high contrast
- Skip to main content link
- Escape key closes modals/carousels

### Screen Reader Support

```typescript
// Example: Animated counter
<div role="status" aria-live="polite">
  <span className="sr-only">
    {`${prefix}${count}${suffix} ${label}`}
  </span>
  <span aria-hidden="true">
    {prefix}{count.toLocaleString()}{suffix}
  </span>
</div>
```

### Color Contrast

All text meets WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- Interactive elements: 3:1 minimum

### Motion Preferences

```typescript
const prefersReducedMotion = useReducedMotion();

const variants = prefersReducedMotion
  ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
  : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
```

## SEO Optimization

### Meta Tags

```typescript
export const metadata: Metadata = {
  title: 'AgriServe - Rent Farm Equipment | Tractors, Harvesters & More',
  description: 'Rent agricultural equipment across India. Verified providers, secure payments, flexible rentals. Find tractors, harvesters, and farming tools near you.',
  keywords: ['farm equipment rental', 'tractor rental', 'harvester rental', 'agricultural equipment', 'farming tools'],
  openGraph: {
    title: 'AgriServe - Rent Farm Equipment',
    description: 'Turn underused equipment into income. Connect with farmers India-wide.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriServe - Rent Farm Equipment',
    description: 'Rent agricultural equipment across India',
    images: ['/twitter-image.jpg'],
  },
};
```

### Structured Data

```typescript
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AgriServe',
  url: 'https://agriserve.in',
  description: 'Agricultural equipment rental platform',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://agriserve.in/equipment?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties. I performed reflection to eliminate redundancy:

**Redundancy Analysis:**
- Properties 1.4 and 13.3 both test color contrast ratios - these are the same property
- Properties 3.4 and 7.2 both test counter animation logic - these are the same property
- Properties 5.5 and 12.1 both test lazy loading attributes - these are the same property

**Consolidated Properties:**
The following properties provide unique validation value without redundancy:

### Property 1: Color Contrast Compliance

*For any* text element and its background color combination used in the landing page, the contrast ratio should meet or exceed WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text 18pt+).

**Validates: Requirements 1.4, 13.3**

### Property 2: Counter Animation Correctness

*For any* target number value, when the animated counter component becomes visible, it should animate from 0 to the target value smoothly over the specified duration, and the final displayed value should equal the target value.

**Validates: Requirements 3.4, 7.2**

### Property 3: Equipment Card Completeness

*For any* equipment object passed to an EquipmentCard component, the rendered output should contain all required fields: image, price per day, location name, and availability badge.

**Validates: Requirements 5.2**

### Property 4: Touch Target Size Compliance

*For any* interactive element (button, link, input) on the landing page, its clickable/tappable area should be at least 44x44 pixels to meet touch-friendly accessibility standards.

**Validates: Requirements 11.4**

### Property 5: Heading Hierarchy Validity

*For any* sequence of heading elements (h1, h2, h3, h4, h5, h6) in the landing page, the hierarchy should be properly ordered without skipping levels (e.g., h1 → h2 → h3, not h1 → h3).

**Validates: Requirements 13.1**

### Property 6: Image Alt Text Presence

*For any* image element rendered on the landing page, it should have a non-empty alt attribute that describes the image content.

**Validates: Requirements 13.2**

### Property 7: Interactive Element Focusability

*For any* interactive element (button, link, input) on the landing page, it should be keyboard focusable (either naturally focusable or have a tabIndex attribute).

**Validates: Requirements 13.5**

## Error Handling

### API Error Handling

```typescript
const fetchLandingPageData = async () => {
  try {
    setIsLoading(true);
    const [equipmentResult, statsResult] = await Promise.all([
      equipmentService.getEquipment({ limit: 6 }),
      fetchStatistics(),
    ]);
    
    setFeaturedEquipment(equipmentResult.data);
    setStats(statsResult);
  } catch (error) {
    console.error('Failed to fetch landing page data:', error);
    // Display fallback content
    setFeaturedEquipment([]);
    setStats({ totalUsers: 0, totalEquipment: 0 });
    // Show user-friendly error message
    toast.error('Unable to load latest equipment. Please refresh the page.');
  } finally {
    setIsLoading(false);
  }
};
```

### Image Loading Errors

```typescript
<Image
  src={equipment.images[0]}
  alt={equipment.name}
  width={400}
  height={300}
  onError={(e) => {
    // Fallback to placeholder
    e.currentTarget.src = '/placeholder-equipment.jpg';
  }}
/>
```

### Animation Errors

```typescript
// Graceful degradation for animation errors
const AnimatedSection = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    // Render without animations
    return <div>{children}</div>;
  }
  
  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        {children}
      </motion.div>
    </ErrorBoundary>
  );
};
```

### Network Timeout Handling

```typescript
const fetchWithTimeout = async (promise: Promise<any>, timeout: number = 5000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  );
  
  return Promise.race([promise, timeoutPromise]);
};
```

## Testing Strategy

### Dual Testing Approach

The landing page redesign will employ both unit testing and property-based testing for comprehensive coverage:

**Unit Tests** will focus on:
- Specific component rendering (Hero section contains expected elements)
- User interactions (clicking CTA buttons navigates correctly)
- Edge cases (empty equipment list shows fallback message)
- Integration points (API calls are made with correct parameters)
- Error conditions (failed API calls show error state)

**Property-Based Tests** will focus on:
- Universal properties across all inputs (color contrast for any color combination)
- Component behavior with random data (equipment cards render correctly for any equipment object)
- Accessibility compliance (all interactive elements are focusable)
- Animation correctness (counters animate correctly for any target number)

### Property-Based Testing Configuration

**Library**: We will use `@fast-check/jest` for property-based testing in the TypeScript/React environment.

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property reference
- Tag format: `Feature: landing-page-redesign, Property {number}: {property_text}`

**Example Property Test**:

```typescript
import fc from 'fast-check';

describe('Landing Page Redesign - Property Tests', () => {
  // Feature: landing-page-redesign, Property 1: Color Contrast Compliance
  it('should maintain WCAG AA contrast ratios for all text-background combinations', () => {
    fc.assert(
      fc.property(
        fc.hexaColor(), // foreground color
        fc.hexaColor(), // background color
        fc.boolean(),   // is large text
        (fgColor, bgColor, isLargeText) => {
          const contrastRatio = calculateContrastRatio(fgColor, bgColor);
          const minRatio = isLargeText ? 3 : 4.5;
          
          // If this combination is used in the design, it must meet standards
          if (isUsedInDesign(fgColor, bgColor)) {
            expect(contrastRatio).toBeGreaterThanOrEqual(minRatio);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: landing-page-redesign, Property 2: Counter Animation Correctness
  it('should animate counters from 0 to target value correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }), // target value
        fc.integer({ min: 500, max: 3000 }),  // duration
        (targetValue, duration) => {
          const { result } = renderHook(() => useCountUp(targetValue, duration));
          
          // Wait for animation to complete
          act(() => {
            jest.advanceTimersByTime(duration);
          });
          
          expect(result.current.count).toBe(targetValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: landing-page-redesign, Property 3: Equipment Card Completeness
  it('should render all required fields for any equipment object', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1 }),
          images: fc.array(fc.webUrl(), { minLength: 1 }),
          price_per_day: fc.integer({ min: 100, max: 10000 }),
          location_name: fc.string({ minLength: 1 }),
          is_available: fc.boolean(),
          category: fc.constantFrom('tractor', 'harvester', 'plough'),
        }),
        (equipment) => {
          const { container } = render(<EquipmentCard equipment={equipment} index={0} />);
          
          // Check all required fields are present
          expect(container).toHaveTextContent(equipment.name);
          expect(container).toHaveTextContent(equipment.price_per_day.toString());
          expect(container).toHaveTextContent(equipment.location_name);
          expect(container.querySelector('img')).toHaveAttribute('src', equipment.images[0]);
          
          const badge = equipment.is_available ? 'Available' : 'Booked';
          expect(container).toHaveTextContent(badge);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: landing-page-redesign, Property 4: Touch Target Size Compliance
  it('should ensure all interactive elements meet minimum touch target size', () => {
    const { container } = render(<LandingPage />);
    const interactiveElements = container.querySelectorAll('button, a, input, [role="button"]');
    
    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44;
      
      expect(rect.width).toBeGreaterThanOrEqual(minSize);
      expect(rect.height).toBeGreaterThanOrEqual(minSize);
    });
  });

  // Feature: landing-page-redesign, Property 5: Heading Hierarchy Validity
  it('should maintain proper heading hierarchy without skipping levels', () => {
    const { container } = render(<LandingPage />);
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    const levels = headings.map((h) => parseInt(h.tagName.substring(1)));
    
    for (let i = 1; i < levels.length; i++) {
      const diff = levels[i] - levels[i - 1];
      // Should not skip levels (diff should be -1, 0, or 1)
      expect(Math.abs(diff)).toBeLessThanOrEqual(1);
    }
  });

  // Feature: landing-page-redesign, Property 6: Image Alt Text Presence
  it('should ensure all images have non-empty alt text', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1 }),
            images: fc.array(fc.webUrl(), { minLength: 1 }),
            price_per_day: fc.integer({ min: 100, max: 10000 }),
            location_name: fc.string({ minLength: 1 }),
            is_available: fc.boolean(),
            category: fc.constantFrom('tractor', 'harvester', 'plough'),
          }),
          { minLength: 1, maxLength: 6 }
        ),
        (equipmentList) => {
          const { container } = render(<LandingPage initialEquipment={equipmentList} />);
          const images = container.querySelectorAll('img');
          
          images.forEach((img) => {
            const alt = img.getAttribute('alt');
            expect(alt).toBeTruthy();
            expect(alt.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: landing-page-redesign, Property 7: Interactive Element Focusability
  it('should ensure all interactive elements are keyboard focusable', () => {
    const { container } = render(<LandingPage />);
    const interactiveElements = container.querySelectorAll('button, a, input, [role="button"]');
    
    interactiveElements.forEach((element) => {
      // Element should be focusable (tabIndex >= 0 or naturally focusable)
      const tabIndex = element.getAttribute('tabindex');
      const isNaturallyFocusable = ['A', 'BUTTON', 'INPUT'].includes(element.tagName);
      
      const isFocusable = isNaturallyFocusable || (tabIndex !== null && parseInt(tabIndex) >= 0);
      expect(isFocusable).toBe(true);
    });
  });
});
```

### Unit Test Examples

```typescript
describe('Landing Page Redesign - Unit Tests', () => {
  describe('Hero Section', () => {
    it('should render the main headline', () => {
      render(<HeroSection stats={{ totalUsers: 100, totalEquipment: 50 }} />);
      expect(screen.getByText(/Rent Farm Equipment/i)).toBeInTheDocument();
    });

    it('should render both CTA buttons', () => {
      render(<HeroSection stats={{ totalUsers: 100, totalEquipment: 50 }} />);
      expect(screen.getByRole('button', { name: /Rent Now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /List Your Equipment/i })).toBeInTheDocument();
    });

    it('should display live statistics', () => {
      render(<HeroSection stats={{ totalUsers: 1250, totalEquipment: 450 }} />);
      expect(screen.getByText('1250')).toBeInTheDocument();
      expect(screen.getByText('450')).toBeInTheDocument();
    });
  });

  describe('Featured Equipment Section', () => {
    it('should show loading spinner when data is loading', () => {
      render(<FeaturedEquipmentSection isLoading={true} equipment={[]} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show fallback message when no equipment is available', () => {
      render(<FeaturedEquipmentSection isLoading={false} equipment={[]} />);
      expect(screen.getByText(/No equipment listed yet/i)).toBeInTheDocument();
    });

    it('should render equipment cards when data is available', () => {
      const mockEquipment = [
        {
          id: '1',
          name: 'John Deere Tractor',
          images: ['/tractor.jpg'],
          price_per_day: 2500,
          location_name: 'Punjab',
          is_available: true,
          category: 'tractor',
        },
      ];
      
      render(<FeaturedEquipmentSection isLoading={false} equipment={mockEquipment} />);
      expect(screen.getByText('John Deere Tractor')).toBeInTheDocument();
      expect(screen.getByText('Punjab')).toBeInTheDocument();
    });
  });

  describe('How It Works Section', () => {
    it('should render exactly 3 steps', () => {
      render(<HowItWorksSection />);
      const steps = screen.getAllByRole('article');
      expect(steps).toHaveLength(3);
    });

    it('should render step 1 with correct content', () => {
      render(<HowItWorksSection />);
      expect(screen.getByText(/Search & Discover/i)).toBeInTheDocument();
    });

    it('should render step 2 with correct content', () => {
      render(<HowItWorksSection />);
      expect(screen.getByText(/Book & Pay/i)).toBeInTheDocument();
    });

    it('should render step 3 with correct content', () => {
      render(<HowItWorksSection />);
      expect(screen.getByText(/Use & Return/i)).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should fetch equipment data on mount', async () => {
      const mockGetEquipment = jest.fn().mockResolvedValue({
        data: [],
        count: 0,
      });
      
      jest.spyOn(equipmentService, 'getEquipment').mockImplementation(mockGetEquipment);
      
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(mockGetEquipment).toHaveBeenCalledWith({ limit: 6 });
      });
    });

    it('should display error message when API call fails', async () => {
      jest.spyOn(equipmentService, 'getEquipment').mockRejectedValue(new Error('API Error'));
      
      render(<LandingPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Unable to load/i)).toBeInTheDocument();
      });
    });
  });

  describe('Lazy Loading', () => {
    it('should use lazy loading for below-fold images', () => {
      const mockEquipment = [
        {
          id: '1',
          name: 'Tractor',
          images: ['/tractor.jpg'],
          price_per_day: 2500,
          location_name: 'Punjab',
          is_available: true,
          category: 'tractor',
        },
      ];
      
      const { container } = render(
        <FeaturedEquipmentSection isLoading={false} equipment={mockEquipment} />
      );
      
      const images = container.querySelectorAll('img');
      images.forEach((img, index) => {
        if (index >= 3) {
          expect(img).toHaveAttribute('loading', 'lazy');
        }
      });
    });
  });
});
```

### Integration Testing

```typescript
describe('Landing Page - Integration Tests', () => {
  it('should load and display real equipment data', async () => {
    render(<LandingPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Verify equipment cards are rendered
    const equipmentCards = screen.getAllByRole('article');
    expect(equipmentCards.length).toBeGreaterThan(0);
  });

  it('should navigate to equipment detail page when card is clicked', async () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
    });
    
    render(<LandingPage />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    const firstCard = screen.getAllByRole('article')[0];
    fireEvent.click(firstCard);
    
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/renter/equipment/'));
  });
});
```

### Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Landing Page - Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<LandingPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', () => {
    render(<LandingPage />);
    
    const firstButton = screen.getAllByRole('button')[0];
    firstButton.focus();
    
    expect(document.activeElement).toBe(firstButton);
    
    // Tab to next element
    userEvent.tab();
    expect(document.activeElement).not.toBe(firstButton);
  });
});
```

### Performance Testing

```typescript
describe('Landing Page - Performance Tests', () => {
  it('should render within acceptable time', () => {
    const startTime = performance.now();
    render(<LandingPage />);
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(100); // 100ms threshold
  });

  it('should use Next.js Image component for optimization', () => {
    const { container } = render(<LandingPage />);
    
    // Check that Next.js Image is used (has specific data attributes)
    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      // Next.js Image adds specific attributes
      const hasNextImageAttributes = 
        img.hasAttribute('srcset') || 
        img.closest('[data-nimg]') !== null;
      
      expect(hasNextImageAttributes).toBe(true);
    });
  });
});
```

## Implementation Notes

### Framer Motion Setup

Install Framer Motion:
```bash
pnpm add framer-motion
```

Create animation variants file:
```typescript
// src/lib/animations/variants.ts
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};
```

### Custom Hooks

```typescript
// src/hooks/useCountUp.ts
export const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [isInView, end, duration]);
  
  return { count, ref };
};
```

### Utility Functions

```typescript
// src/lib/utils/contrast.ts
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string) => {
    const rgb = hexToRgb(color);
    const [r, g, b] = rgb.map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};
```
