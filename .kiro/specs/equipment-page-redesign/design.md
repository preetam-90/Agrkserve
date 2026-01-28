# Design Document: Equipment Page Redesign

## Overview

This design document outlines the UI/UX redesign of the Equipment page for an agriculture equipment rental platform. The redesign focuses on modernizing the visual presentation while preserving all existing functionality. The page will implement a cohesive agri-tech design system with deep agricultural greens, earthy tones, and modern design patterns including glassmorphism and micro-interactions.

The redesign is purely cosmetic - no backend logic, API calls, database schemas, or core functionality will be modified. All existing features including search, filters, infinite scroll, real-time updates, booking, and messaging will remain intact.

## Architecture

### Component Structure

The Equipment page consists of the following component hierarchy:

```
Page (equipment/page.tsx)
├── Header (from @/components/layout)
├── Main Content Container
│   ├── Hero Header Section
│   │   ├── Title and Subtitle
│   │   └── Last Updated Indicator
│   ├── Search and Filter Panel
│   │   ├── Search Input
│   │   ├── Category Dropdown
│   │   ├── Sort Dropdown
│   │   ├── Rating Filter
│   │   └── More Filters Button
│   ├── Active Filters Display
│   ├── Results Count
│   ├── Equipment Grid
│   │   └── Equipment Cards (multiple)
│   │       ├── Image Gallery
│   │       ├── Availability Badge
│   │       ├── Owner Info
│   │       ├── Equipment Details
│   │       ├── Price Display
│   │       ├── Rating Display
│   │       ├── Category Badge
│   │       └── Action Buttons
│   └── Infinite Scroll Trigger
├── Filter Dialog
├── Message Dialog
└── Footer (from @/components/layout)
```

### Design System Integration

The redesign will implement a comprehensive design system with the following tokens:

**Color Palette:**
- Primary: `#0F7A3E` (deep green), `#16A34A` (agricultural green)
- Secondary: Beige (`#F5F5DC`), Light Brown (`#D2B48C`), Muted Yellow (`#F0E68C`)
- Neutral: Off-white (`#FAFAFA`), Soft Gray (`#E5E7EB`)
- Accent: Emerald shades for gradients and highlights

**Typography:**
- Headings: Inter/Poppins/Manrope (Bold, 600-700 weight)
- Body: Inter/DM Sans (Regular, 400-500 weight)
- Scale: 3xl (title), xl (subtitle), lg (card title), base (body), sm (meta)

**Spacing:**
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Section gaps: `mb-6` (24px), `mb-8` (32px)
- Card padding: `p-4` (16px) → `p-6` (24px)
- Grid gaps: `gap-4 md:gap-6` (16px-24px)

**Border Radius:**
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px) for primary, `rounded-md` (6px) for secondary
- Inputs: `rounded-lg` (8px)
- Badges: `rounded-full` (pill shape)

**Shadows:**
- Cards: `shadow-md` default, `shadow-lg` on hover
- Buttons: `shadow-sm` for primary
- Filters: `shadow-sm` for sticky state

### Responsive Breakpoints

- Mobile: `< 640px` - 1 card per row, stacked filters
- Tablet: `640px - 1024px` - 2 cards per row, horizontal filters
- Desktop: `> 1024px` - 3-4 cards per row, sticky filters

## Components and Interfaces

### 1. Hero Header Section

**Purpose:** Provide clear page context and freshness indicator

**Visual Design:**
- Background: Subtle gradient from `bg-gradient-to-r from-green-50 to-emerald-50` or soft agricultural pattern
- Layout: Flexbox with space-between alignment
- Title: `text-2xl md:text-3xl font-bold text-gray-900`
- Subtitle: `text-gray-600 mt-1 font-normal`
- Last Updated: `text-sm text-gray-500 flex items-center gap-1`

**Implementation:**
```tsx
<div className="mb-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        Agricultural Equipment
      </h1>
      <p className="text-gray-600 mt-1">
        Find and rent farming equipment from local providers
      </p>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <RefreshCw className="h-4 w-4" />
      <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
    </div>
  </div>
</div>
```

### 2. Search and Filter Panel

**Purpose:** Provide intuitive search and filtering controls

**Visual Design:**
- Container: `bg-white rounded-xl shadow-sm p-4 mb-6`
- Search Input: Large with icon, `pl-10 h-12 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500`
- Filter Chips: Pill-style dropdowns with `rounded-full bg-white border-gray-200 hover:border-green-500 transition-colors`
- Sticky Behavior: `sticky top-0 z-10` on desktop when scrolled

**Micro-interactions:**
- Hover: Border color change, subtle scale (1.02)
- Focus: Ring effect with green color
- Active: Background tint

**Implementation:**
```tsx
<div className="bg-white rounded-xl shadow-sm p-4 mb-6 sticky top-0 z-10">
  <form onSubmit={handleSearch} className="flex flex-col gap-3">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search equipment by name or description..."
          className="pl-10 h-12 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>
      <Button type="submit" className="h-12 px-6 bg-green-600 hover:bg-green-700 rounded-lg shadow-sm">
        <Search className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </div>
    
    <div className="flex flex-wrap gap-2">
      {/* Filter chips with pill style */}
    </div>
  </form>
</div>
```

### 3. Equipment Card Component

**Purpose:** Display equipment information in an attractive, scannable format

**Visual Design:**
- Container: `bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group`
- Image: `aspect-[4/3] rounded-t-xl` with gradient overlay `bg-gradient-to-t from-black/20 to-transparent`
- Padding: Increased from `p-4` to `p-6`
- Hover Effect: `hover:scale-[1.02] hover:-translate-y-1`

**Layout Structure:**
1. **Image Section:**
   - Full-width image with rounded top corners
   - Gradient overlay at bottom
   - Availability badge (top-right): `absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md`
   - Image navigation buttons with backdrop blur

2. **Content Section:**
   - Owner info: Horizontal layout with avatar (32px) and name
   - Equipment title: `text-lg font-bold text-gray-900 hover:text-green-600`
   - Location: `text-sm text-gray-500 flex items-center gap-1`
   - Price: Large emphasis `text-2xl font-bold text-green-600` with small "/day"
   - Rating: Star icon with number
   - Category badge: `bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs`

3. **Action Buttons:**
   - Primary "Book Now": `w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg shadow-sm hover:shadow-md transition-all`
   - Secondary actions: `flex gap-2` with outline buttons
   - Calendar: `border-gray-300 hover:border-green-500 hover:bg-green-50`
   - Message: `border-gray-300 hover:border-green-500 hover:bg-green-50`

**Implementation:**
```tsx
<Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group hover:scale-[1.02] hover:-translate-y-1">
  {/* Image with gradient overlay */}
  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden rounded-t-xl">
    <Image
      src={images[currentImageIndex]}
      alt={equipment.name}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    
    {/* Availability Badge */}
    <Badge className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
      <Check className="h-3 w-3 mr-1 inline" />
      Available
    </Badge>
  </div>
  
  <CardContent className="p-6">
    {/* Owner Info - Horizontal */}
    <div className="flex items-center gap-3 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={equipment.owner?.profile_image} />
        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
      </Avatar>
      <span className="text-sm text-gray-600 font-medium hover:text-green-600 transition-colors">
        {equipment.owner?.name}
      </span>
    </div>
    
    {/* Equipment Title - Larger, Bolder */}
    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
      {equipment.name}
    </h3>
    
    {/* Location with Icon */}
    <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
      <MapPin className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{equipment.location_name}</span>
    </p>
    
    {/* Price - Strong Emphasis */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-baseline">
        <IndianRupee className="h-5 w-5 text-green-600" />
        <span className="text-2xl font-bold text-green-600">
          {equipment.price_per_day}
        </span>
        <span className="text-sm text-gray-500 ml-1">/day</span>
      </div>
      
      {/* Rating */}
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-semibold">{equipment.rating?.toFixed(1)}</span>
      </div>
    </div>
    
    {/* Category Badge */}
    <Badge className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
      {equipment.category}
    </Badge>
    
    {/* Action Buttons */}
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all"
        >
          <Calendar className="h-4 w-4 mr-1" />
          Calendar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          Message
        </Button>
      </div>
      
      <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg shadow-sm hover:shadow-md transition-all">
        Book Now
      </Button>
    </div>
  </CardContent>
</Card>
```

### 4. Responsive Grid

**Purpose:** Adapt layout to different screen sizes

**Implementation:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {equipment.map((item) => (
    <EquipmentCard key={item.id} equipment={item} />
  ))}
</div>
```

**Breakpoint Behavior:**
- `< 640px`: 1 column, full width cards
- `640px - 1024px`: 2 columns, medium cards
- `1024px - 1280px`: 3 columns, standard cards
- `> 1280px`: 4 columns, compact cards

### 5. Loading and Empty States

**Loading State:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {[...Array(8)].map((_, i) => (
    <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  ))}
</div>
```

**Empty State:**
```tsx
<div className="flex flex-col items-center justify-center py-16 px-4">
  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
    <Tractor className="h-12 w-12 text-green-600" />
  </div>
  <h3 className="text-xl font-bold text-gray-900 mb-2">No equipment found</h3>
  <p className="text-gray-500 text-center mb-6">
    Try adjusting your filters or search query
  </p>
  <Button variant="outline" onClick={clearFilters}>
    Clear Filters
  </Button>
</div>
```

## Data Models

No changes to data models. The redesign uses existing TypeScript interfaces:

```typescript
interface Equipment {
  id: string;
  name: string;
  description: string;
  category: EquipmentCategory;
  price_per_day: number;
  location_name: string;
  images: string[];
  is_available: boolean;
  rating?: number;
  review_count?: number;
  owner_id: string;
  owner?: {
    name: string;
    profile_image?: string;
    phone?: string;
  };
}

type EquipmentCategory = 
  | 'tractor'
  | 'harvester'
  | 'plough'
  | 'seeder'
  | 'sprayer'
  | 'other';
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Design Token Consistency

*For any* similar UI elements (cards, buttons, inputs) on the Equipment page, they should use consistent design token values for spacing, border radius, typography, and shadows.

**Validates: Requirements 1.5**

### Property 2: Filter Hover Interactions

*For any* filter control element, when a hover or focus event is simulated, the element should display a visual state change (border color, background, or scale transformation).

**Validates: Requirements 3.4**

### Property 3: Card Hover Shadow Effect

*For any* equipment card, when a hover event is simulated, the computed box-shadow value should be larger than the default state, creating a lift effect.

**Validates: Requirements 4.11**

### Property 4: Card Border Radius Consistency

*For any* equipment card, all child elements with rounded corners should use the same border-radius token value (or proportional values from the same scale).

**Validates: Requirements 4.12**

### Property 5: Button Hover Transitions

*For any* action button (Book Now, Calendar, Message), when a hover event is simulated, the button should display a transition effect (color change, scale, or shadow change).

**Validates: Requirements 5.3**

### Property 6: Card Entrance Animations

*For any* equipment card that is rendered, the card should have animation properties (fade-in, slide-up, or similar) applied during initial render.

**Validates: Requirements 8.3**

### Property 7: Filter Focus States

*For any* filter input or dropdown, when a focus event is simulated, the element should display a visual focus state (ring, border change, or background change).

**Validates: Requirements 8.4**

### Property 8: Icon Library Consistency

*For any* icon component used on the Equipment page, the icon should be from the same icon library (Lucide React).

**Validates: Requirements 10.2**

### Property 9: Contrast Ratio Accessibility

*For any* text element on the Equipment page, the contrast ratio between the text color and its background color should meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 10.3**

### Property 10: Touch Target Spacing

*For any* interactive element (button, link, input), the element should have minimum dimensions of 44x44 pixels or appropriate spacing to meet accessibility standards.

**Validates: Requirements 10.4**

### Property 11: Minimum Font Size

*For any* text element on the Equipment page, the computed font size should be at least 14px (0.875rem) to maintain readability.

**Validates: Requirements 10.5**

### Property 12: Filter Functionality Preservation

*For any* filter combination (category, price range, rating), applying the filters should return correctly filtered results matching the filter criteria.

**Validates: Requirements 11.3**

## Error Handling

Since this is a UI/UX redesign with no changes to business logic, error handling remains unchanged:

1. **API Errors:** Existing error handling for failed equipment fetches displays empty state with appropriate messaging
2. **Image Loading Errors:** Fallback to placeholder icon when equipment images fail to load
3. **Authentication Errors:** Redirect to login page when unauthenticated users attempt to book or message
4. **Network Errors:** Display error state with retry option when network requests fail
5. **Validation Errors:** Form validation for message content and filter inputs

All error handling logic is preserved from the existing implementation.

## Testing Strategy

### Dual Testing Approach

This redesign requires both unit tests and property-based tests to ensure visual correctness and functional preservation:

**Unit Tests** will verify:
- Specific visual elements render correctly (badges, buttons, icons)
- Layout structure matches design specifications
- Responsive breakpoints trigger correct grid layouts
- Empty and loading states display correctly
- Dialogs open and close properly
- Specific color values and styling are applied

**Property-Based Tests** will verify:
- Design token consistency across all similar elements
- Hover and focus states work for all interactive elements
- Accessibility standards are met for all text and interactive elements
- All filters correctly filter results regardless of input combination
- Animations and transitions are applied to all relevant elements

### Testing Framework

- **Unit Testing:** React Testing Library with Jest
- **Property-Based Testing:** fast-check (JavaScript/TypeScript PBT library)
- **Visual Regression:** Chromatic or Percy for visual diff testing
- **Accessibility Testing:** jest-axe for automated a11y checks

### Property Test Configuration

Each property-based test should:
- Run minimum 100 iterations to cover edge cases
- Use appropriate generators for test data (equipment objects, filter combinations)
- Tag tests with feature name and property number
- Reference the design document property being validated

**Example Tag Format:**
```typescript
// Feature: equipment-page-redesign, Property 1: Design Token Consistency
test('all cards use consistent border radius tokens', () => {
  fc.assert(
    fc.property(fc.array(equipmentGenerator, { minLength: 1, maxLength: 10 }), (equipment) => {
      // Test implementation
    }),
    { numRuns: 100 }
  );
});
```

### Visual Regression Testing

Since this is primarily a visual redesign, visual regression testing is critical:

1. **Baseline Snapshots:** Capture screenshots of all page states (loaded, loading, empty, filtered)
2. **Component Snapshots:** Capture individual component screenshots (cards, filters, dialogs)
3. **Responsive Snapshots:** Capture at mobile, tablet, and desktop breakpoints
4. **Interaction Snapshots:** Capture hover, focus, and active states
5. **Diff Review:** Review all visual diffs before approving changes

### Integration Testing

Verify that the redesign doesn't break existing functionality:

1. **Search Flow:** Search for equipment and verify results display correctly
2. **Filter Flow:** Apply various filter combinations and verify results
3. **Booking Flow:** Click "Book Now" and verify navigation to booking page
4. **Message Flow:** Open message dialog, compose message, verify send
5. **Calendar Flow:** Open calendar dialog, verify availability display
6. **Infinite Scroll:** Scroll to bottom and verify more items load
7. **Real-time Updates:** Simulate new equipment addition and verify UI updates

### Accessibility Testing

Automated and manual accessibility testing:

1. **Automated:** Run jest-axe on all rendered components
2. **Keyboard Navigation:** Verify all interactive elements are keyboard accessible
3. **Screen Reader:** Test with screen reader to verify proper labeling
4. **Color Contrast:** Verify all text meets WCAG AA contrast ratios
5. **Focus Indicators:** Verify visible focus indicators on all interactive elements

### Performance Testing

Ensure the redesign doesn't negatively impact performance:

1. **Render Performance:** Measure time to first render and time to interactive
2. **Animation Performance:** Verify animations run at 60fps
3. **Image Loading:** Verify lazy loading and progressive image loading
4. **Bundle Size:** Ensure CSS and JS bundle sizes don't increase significantly
5. **Lighthouse Score:** Maintain or improve Lighthouse performance score

## Implementation Notes

### CSS Strategy

Use Tailwind CSS utility classes for all styling to maintain consistency and reduce CSS bundle size:

```tsx
// Good: Utility classes
<div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all">

// Avoid: Custom CSS
<div className="custom-card">
```

### Animation Performance

Use CSS transforms and opacity for animations to ensure smooth 60fps performance:

```tsx
// Good: Transform-based animations
<div className="transition-transform hover:scale-105">

// Avoid: Layout-triggering animations
<div className="transition-all hover:margin-top-2">
```

### Responsive Design

Use mobile-first approach with Tailwind responsive prefixes:

```tsx
// Mobile first, then tablet, then desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

### Accessibility

Always include proper ARIA labels and semantic HTML:

```tsx
// Good: Semantic HTML with ARIA
<button aria-label="Search equipment" className="...">
  <Search className="h-5 w-5" />
</button>

// Avoid: Non-semantic without labels
<div onClick={handleSearch}>
  <Search />
</div>
```

### Component Reusability

Extract reusable design patterns into shared components or Tailwind classes:

```tsx
// Define reusable button styles
const primaryButtonClasses = "bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all";

// Use throughout the page
<Button className={primaryButtonClasses}>Book Now</Button>
```

### Browser Compatibility

Ensure all CSS features are supported in target browsers:

- Backdrop blur: Supported in modern browsers (Safari 14+, Chrome 76+, Firefox 103+)
- CSS Grid: Widely supported
- CSS Transitions: Widely supported
- Provide fallbacks for older browsers if needed

### Performance Optimization

1. **Image Optimization:** Use Next.js Image component with proper sizing
2. **Lazy Loading:** Lazy load images and components below the fold
3. **Code Splitting:** Split large components into separate chunks
4. **Memoization:** Use React.memo for expensive card renders
5. **Debouncing:** Debounce search input to reduce API calls

## Migration Strategy

Since this is a redesign of an existing page, the migration should be:

1. **Feature Flag:** Implement behind a feature flag for gradual rollout
2. **A/B Testing:** Run A/B test comparing old vs new design
3. **User Feedback:** Collect user feedback during beta period
4. **Metrics Monitoring:** Monitor key metrics (engagement, bookings, bounce rate)
5. **Rollback Plan:** Maintain ability to quickly rollback if issues arise

## Success Metrics

Measure the success of the redesign through:

1. **User Engagement:** Time on page, scroll depth, interaction rate
2. **Conversion Rate:** Booking rate, message rate, click-through rate
3. **User Satisfaction:** User surveys, feedback scores
4. **Performance:** Page load time, time to interactive, Lighthouse score
5. **Accessibility:** Automated a11y test pass rate, user feedback from assistive technology users

## Conclusion

This redesign transforms the Equipment page into a modern, visually appealing marketplace while preserving all existing functionality. The design system provides consistency, the responsive layout ensures great experience across devices, and the micro-interactions create a polished, premium feel. Through comprehensive testing and careful implementation, the redesign will enhance user experience without introducing regressions.
