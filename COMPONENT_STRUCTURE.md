# Component Structure - Premium Landing Page

## Component Hierarchy

```
page.tsx (Main Landing Page)
│
├── PremiumHeader (Fixed Navigation)
│   ├── Logo with animation
│   ├── Navigation links
│   ├── CTA button
│   └── Mobile menu
│
├── PremiumHeroSection (Full-screen Hero)
│   ├── Parallax background
│   ├── Animated grid
│   ├── Floating particles
│   ├── Gradient headline
│   ├── Dual CTA buttons
│   ├── Trust indicators
│   └── Scroll indicator
│
├── StatsSection (Animated Counters)
│   └── 4x Stat Cards
│       ├── Icon (animated)
│       ├── AnimatedCounter
│       └── Label
│
├── CategoriesSection (Service Categories)
│   └── 3x Category Cards
│       ├── Equipment
│       ├── Vehicles
│       └── Labor
│
├── FeaturedRentalsGallery (Equipment Showcase)
│   ├── Section header
│   ├── Grid of equipment cards
│   │   ├── Image with hover zoom
│   │   ├── Availability badge
│   │   ├── Name & location
│   │   ├── Rating
│   │   └── Price & CTA
│   └── View All button
│
├── TimelineSection (How It Works)
│   ├── Section header
│   ├── Animated connecting line
│   └── 5x Step Cards
│       ├── Step number
│       ├── Icon
│       ├── Title
│       └── Description
│
├── TestimonialsCarousel (Customer Stories)
│   ├── Section header
│   ├── Carousel container
│   │   ├── Quote card
│   │   ├── Star rating
│   │   ├── Customer info
│   │   └── Avatar
│   └── Navigation (arrows + dots)
│
├── FinalCTASection (Call to Action)
│   ├── Dramatic background
│   ├── Floating particles
│   ├── Headline
│   ├── Benefits checklist
│   ├── Dual CTA buttons
│   └── Email signup form
│
└── PremiumFooter (Site Footer)
    ├── Brand section
    ├── Link columns (3x)
    ├── Social media icons
    └── Copyright
```

## Component Files

### Core Landing Components

| Component | File | Purpose |
|-----------|------|---------|
| Main Page | `src/app/page.tsx` | Landing page container |
| Header | `PremiumHeader.tsx` | Fixed navigation |
| Hero | `PremiumHeroSection.tsx` | Full-screen hero |
| Stats | `StatsSection.tsx` | Animated counters |
| Categories | `CategoriesSection.tsx` | Service categories |
| Gallery | `FeaturedRentalsGallery.tsx` | Equipment showcase |
| Timeline | `TimelineSection.tsx` | How it works |
| Testimonials | `TestimonialsCarousel.tsx` | Customer stories |
| CTA | `FinalCTASection.tsx` | Final call-to-action |
| Footer | `PremiumFooter.tsx` | Site footer |

### Utility Components

| Component | File | Purpose |
|-----------|------|---------|
| Counter | `AnimatedCounter.tsx` | Animated number counter |
| Button | `src/components/ui/button.tsx` | Reusable button |
| Input | `src/components/ui/input.tsx` | Form input |

### Legacy Components (Preserved)

| Component | File | Status |
|-----------|------|--------|
| Old Hero | `HeroSection.tsx` | Backup |
| Old How It Works | `HowItWorksSection.tsx` | Backup |
| Old Featured | `FeaturedEquipmentSection.tsx` | Backup |
| Old Benefits | `BenefitsSection.tsx` | Backup |
| Old Impact | `ImpactSection.tsx` | Backup |
| Old CTA | `CTASection.tsx` | Backup |

## Data Flow

```
page.tsx
  │
  ├─> Fetch equipment data (useEffect)
  │   └─> equipmentService.getEquipment()
  │
  └─> Pass data to components
      ├─> FeaturedRentalsGallery (equipment array)
      └─> Other components (static content)
```

## Animation Flow

### Scroll-triggered Animations

```
User scrolls down
  │
  ├─> useInView hook detects element
  │
  ├─> isInView becomes true
  │
  └─> Framer Motion animates
      ├─> Fade in (opacity: 0 → 1)
      ├─> Slide up (y: 30 → 0)
      └─> Stagger children (delay between items)
```

### Hover Animations

```
User hovers over card
  │
  ├─> CSS transitions trigger
  │   ├─> Scale: 1 → 1.05
  │   ├─> Border glow appears
  │   └─> Background opacity increases
  │
  └─> Framer Motion whileHover
      ├─> Icon rotates
      ├─> Arrow translates
      └─> Shadow intensifies
```

### Parallax Effect

```
User scrolls
  │
  ├─> useScroll tracks scrollY
  │
  ├─> useTransform maps scroll to movement
  │   └─> [0, 500] → [0, 150]
  │
  └─> Background moves slower than content
      └─> Creates depth illusion
```

## State Management

### Component State

```tsx
// Local state in components
const [currentIndex, setCurrentIndex] = useState(0);
const [email, setEmail] = useState('');
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
```

### Scroll State

```tsx
// Scroll position tracking
const { scrollY } = useScroll();
const [isScrolled, setIsScrolled] = useState(false);
```

### View State

```tsx
// Intersection observer
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: '-100px' });
```

## Props Interface

### FeaturedRentalsGallery

```typescript
interface FeaturedRentalsGalleryProps {
  equipment: Equipment[];
  isLoading: boolean;
}

interface Equipment {
  id: string;
  name: string;
  images: string[];
  price_per_day: number;
  location_name: string;
  is_available: boolean;
  rating?: number;
  category: string;
}
```

### AnimatedCounter

```typescript
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label?: string;
  className?: string;
}
```

## Styling Architecture

### Tailwind Classes

```
Component
  │
  ├─> Layout classes
  │   └─> flex, grid, relative, absolute
  │
  ├─> Spacing classes
  │   └─> p-*, m-*, gap-*
  │
  ├─> Color classes
  │   └─> bg-*, text-*, border-*
  │
  ├─> Effect classes
  │   └─> backdrop-blur-*, shadow-*, rounded-*
  │
  └─> Animation classes
      └─> transition-*, hover:*, animate-*
```

### Custom CSS

```css
/* globals.css */
@keyframes gradient { }
@keyframes shimmer { }
@keyframes glow { }

.animate-gradient { }
.glass { }
.gradient-text { }
```

## Responsive Breakpoints

```
Mobile (default)
  └─> Single column, stacked layout

sm: 640px
  └─> 2-column grids start

md: 768px
  └─> Desktop navigation appears
  └─> 2-column layouts

lg: 1024px
  └─> 3-4 column grids
  └─> Full desktop experience

xl: 1280px
  └─> Maximum width containers
  └─> Enhanced spacing
```

## Performance Optimizations

### Image Loading

```
Equipment images
  │
  ├─> Lazy loading (native)
  │
  ├─> Skeleton placeholders
  │
  └─> Hover zoom (transform)
```

### Animation Performance

```
Animations use:
  ├─> transform (GPU accelerated)
  ├─> opacity (GPU accelerated)
  └─> Avoid: width, height, top, left
```

### Code Splitting

```
Next.js automatically splits:
  ├─> Each page
  ├─> Each component
  └─> Dynamic imports
```

## Accessibility Features

### Keyboard Navigation

```
Tab order:
  1. Skip to content
  2. Logo
  3. Navigation links
  4. CTA button
  5. Hero CTAs
  6. Interactive cards
  7. Form inputs
  8. Footer links
```

### Screen Reader Support

```tsx
// ARIA labels
<button aria-label="Next testimonial">
  <ChevronRight />
</button>

// Live regions
<div role="status" aria-live="polite">
  <AnimatedCounter />
</div>

// Hidden text
<span className="sr-only">
  Detailed description
</span>
```

## Testing Checklist

### Visual Testing
- [ ] All sections render correctly
- [ ] Animations trigger on scroll
- [ ] Hover effects work
- [ ] Mobile menu functions
- [ ] Images load properly

### Responsive Testing
- [ ] Mobile (320px - 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (1024px+)
- [ ] Touch interactions work

### Performance Testing
- [ ] Page load time < 3s
- [ ] Smooth 60fps animations
- [ ] No layout shifts
- [ ] Images optimized

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes
- [ ] Focus indicators visible

## Deployment Checklist

- [ ] Run `pnpm type-check`
- [ ] Run `pnpm lint`
- [ ] Run `pnpm build`
- [ ] Test production build locally
- [ ] Check all links work
- [ ] Verify analytics tracking
- [ ] Test on real devices
- [ ] Deploy to staging
- [ ] Final QA
- [ ] Deploy to production

## Maintenance

### Regular Updates
- Update testimonials monthly
- Refresh equipment images quarterly
- Review analytics weekly
- A/B test CTAs monthly
- Update stats as they grow

### Performance Monitoring
- Track Core Web Vitals
- Monitor page load times
- Check error rates
- Review user feedback
- Optimize as needed

---

**Component structure complete! 🎉**
