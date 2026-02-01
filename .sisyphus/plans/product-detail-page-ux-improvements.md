# Product Detail Page - UI/UX Improvements Plan

**Created:** 2025-02-01
**Target File:** `/src/app/equipment/[id]/page.tsx`
**Scope:** Phase 1 - High Priority Items (15-20 improvements)
**Theme:** Keep existing dark theme with emerald accents

---

## Executive Summary

This plan outlines comprehensive UI/UX improvements for the Equipment Detail page. Based on analysis of the current implementation (761 lines), we identified key areas needing enhancement while preserving the existing premium dark aesthetic.

---

## Current State Analysis

### Existing Implementation

- **Framework:** Next.js 16 App Router
- **UI Library:** Custom components + Radix UI + Tailwind CSS
- **Animations:** Framer Motion
- **State:** React useState + Zustand stores
- **Image Handling:** Next.js Image component

### Current Gallery Implementation (Lines 238-350)

```tsx
// Current: Basic carousel with arrows and dots
// Missing: Zoom, fullscreen, keyboard nav, swipe, skeleton, image count
```

### Current Rating Display (Lines 395-403)

```tsx
// Current: Shows "0.0" when no reviews
// Missing: "New Listing" text, proper empty state
```

### Current Price Card (Lines 406-468)

```tsx
// Current: Functional but basic
// Missing: Visual hierarchy, calendar preview
```

---

## Implementation Tasks

### PHASE 1: Image Gallery Enhancements (HIGH PRIORITY)

#### Task 1.1: Create ProductImageGallery Component

**File:** `/src/components/product/ProductImageGallery.tsx` (NEW)

**Features to implement:**

1. **Larger main image** - Change aspect ratio from 4/3 to 16/10 on desktop
2. **Hover zoom/magnifier** - CSS transform scale on mouse position
3. **Fullscreen modal** - Portal-based lightbox with backdrop blur
4. **Image count badge** - "1/4" indicator in bottom-left
5. **Improved carousel arrows** - Larger, more visible with better contrast
6. **Keyboard navigation** - Arrow keys for prev/next, Escape for close, F for fullscreen
7. **Active thumbnail highlight** - Stronger border + glow effect
8. **Loading skeleton** - Animated placeholder during image load
9. **Swipe gestures** - Touch events for mobile (touchstart, touchmove, touchend)

**Component Interface:**

```tsx
interface ProductImageGalleryProps {
  images?: string[] | null;
  videoUrl?: string | null;
  productName: string;
  className?: string;
}
```

**Key Implementation Details:**

```tsx
// Zoom effect
const [isZoomed, setIsZoomed] = useState(false);
const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

// Handle mouse move for zoom
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!isZoomed) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  setZoomPosition({ x, y });
};

// Apply zoom
<Image
  className={cn(isZoomed && 'scale-200')}
  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
/>;

// Swipe handling
const minSwipeDistance = 50;
const onTouchEnd = () => {
  if (!touchStart || !touchEnd) return;
  const distance = touchStart - touchEnd;
  if (distance > minSwipeDistance) handleNext();
  if (distance < -minSwipeDistance) handlePrev();
};

// Keyboard navigation
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsFullscreen(false);
    if (e.key === 'f') setIsFullscreen(!isFullscreen);
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

### PHASE 2: Rating System Improvements (HIGH PRIORITY)

#### Task 2.1: Create RatingDisplay Component

**File:** `/src/components/product/RatingDisplay.tsx` (NEW)

**Features:**

1. **Hide stars when reviews = 0** - Show "New Listing" badge instead
2. **"Be the first to review" CTA** - Link to review form
3. **Real average calculation** - Calculate from actual reviews
4. **Consistent star color** - Use amber-400 (brand color)
5. **Review count visibility** - More prominent display

**Component Interface:**

```tsx
interface RatingDisplayProps {
  rating?: number | null;
  reviewCount?: number | null;
  showCTA?: boolean;
  onReviewClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}
```

**Implementation:**

```tsx
export function RatingDisplay({
  rating,
  reviewCount,
  showCTA,
  onReviewClick,
  size = 'md',
}: RatingDisplayProps) {
  const hasReviews = reviewCount && reviewCount > 0;
  const displayRating = rating?.toFixed(1) || '0.0';

  // Calculate real average from reviews if needed
  const avgRating = useMemo(() => {
    // If rating is provided, use it; otherwise calculate from reviews
    return rating || 0;
  }, [rating]);

  if (!hasReviews) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="border-blue-500/20 bg-blue-500/10 text-blue-400">
          <Sparkles className="mr-1.5 h-3 w-3" />
          New Listing
        </Badge>
        {showCTA && (
          <button
            onClick={onReviewClick}
            className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            Be the first to review →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1">
        <Star className="mr-1.5 h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="font-bold text-amber-400">{displayRating}</span>
      </div>
      <span className="text-slate-400">
        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
```

---

### PHASE 3: Price Card Enhancement (HIGH PRIORITY)

#### Task 3.1: Enhanced Price Card Component

**Modify:** Lines 406-468 in `/src/app/equipment/[id]/page.tsx`

**Improvements:**

1. **Visual dominance** - Larger font, gradient background
2. **Price hierarchy** - Daily price prominent, hourly secondary
3. **Calendar preview** - Mini calendar showing availability
4. **Availability badge contrast** - More prominent styling

**Implementation:**

```tsx
<Card className="relative overflow-hidden border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/20 backdrop-blur-sm">
  {/* Decorative elements */}
  <div className="absolute -right-10 -top-10 opacity-5">
    <Tractor className="h-48 w-48 rotate-12" />
  </div>
  <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

  <CardContent className="relative p-8">
    {/* Price Section - Enhanced */}
    <div className="mb-6">
      <p className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-400">Daily Rate</p>
      <div className="flex items-baseline gap-2">
        <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-5xl font-bold text-transparent">
          {formatCurrency(equipment.price_per_day)}
        </span>
        <span className="text-lg font-medium text-slate-500">/ day</span>
      </div>
      {equipment.price_per_hour && (
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          Hourly: {formatCurrency(equipment.price_per_hour)}
        </p>
      )}
    </div>
    {/* Mini Calendar Preview */}
    <div className="mb-6 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Availability</span>
        <CalendarDays className="h-4 w-4 text-emerald-500" />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="font-medium text-slate-600">
            {day}
          </div>
        ))}
        {/* Next 14 days preview */}
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex aspect-square items-center justify-center rounded-full text-xs',
              i % 5 === 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        Click "Book Now" to see full calendar
      </p>
    </div>
    {/* Availability Badge - Enhanced */}
    <div className="mb-6">
      {equipment.is_available ? (
        <div className="flex items-center justify-center gap-2 rounded-full border-2 border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 font-semibold text-emerald-400">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
          </span>
          Available Now
        </div>
      ) : (
        <Badge
          variant="outline"
          className="w-full justify-center border-red-500/30 bg-red-500/10 py-2.5 text-red-400"
        >
          Currently Booked
        </Badge>
      )}
    </div>
    {/* CTA Section */}
    ...
  </CardContent>
</Card>
```

---

### PHASE 4: CTA Optimization (HIGH PRIORITY)

#### Task 4.1: Enhanced Book Now Button

**Modify:** Lines 449-464 in `/src/app/equipment/[id]/page.tsx`

**Improvements:**

1. **Micro-interactions** - Hover scale, active press, ripple effect
2. **Loading state** - Spinner during navigation
3. **Disabled state** - Clear visual feedback
4. **Icon alignment** - Proper spacing and sizing
5. **Reassurance text** - Trust signals under CTA

**Implementation:**

```tsx
const [isBooking, setIsBooking] = useState(false);

const handleBook = async () => {
  if (!user) {
    router.push(`/login?redirect=/equipment/${equipmentId}/book`);
    return;
  }
  setIsBooking(true);
  await router.push(`/equipment/${equipmentId}/book`);
};

// Enhanced CTA
<div className="space-y-4">
  <motion.div
    whileHover={{ scale: equipment.is_available ? 1.02 : 1 }}
    whileTap={{ scale: equipment.is_available ? 0.98 : 1 }}
  >
    <Button
      className={cn(
        'h-14 w-full text-lg font-semibold shadow-lg transition-all duration-200',
        equipment.is_available
          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-900/30 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-900/50'
          : 'cursor-not-allowed bg-slate-800 text-slate-500'
      )}
      disabled={!equipment.is_available || isBooking}
      onClick={handleBook}
    >
      {isBooking ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Calendar className="mr-2 h-5 w-5" />
          {equipment.is_available ? 'Book Now' : 'Currently Unavailable'}
        </>
      )}
    </Button>
  </motion.div>

  {/* Reassurance Text */}
  <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
    <span className="flex items-center gap-1">
      <Shield className="h-3 w-3 text-emerald-500" />
      Secure booking
    </span>
    <span className="flex items-center gap-1">
      <Clock className="h-3 w-3 text-emerald-500" />
      Instant confirmation
    </span>
  </div>

  {/* Social Proof */}
  {equipment.total_bookings && equipment.total_bookings > 0 && (
    <p className="flex items-center justify-center gap-1 text-center text-xs text-slate-500">
      <Users className="h-3 w-3" />
      Trusted by {equipment.total_bookings} farmers
    </p>
  )}
</div>;
```

#### Task 4.2: Secondary CTA (Save/Shortlist)

**Add alongside main CTA:**

```tsx
// Add state
const [isFavorite, setIsFavorite] = useState(false);
const [isSaving, setIsSaving] = useState(false);

// Secondary CTA row
<div className="mt-4 flex gap-3">
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      setIsSaving(true);
      setIsFavorite(!isFavorite);
      setTimeout(() => setIsSaving(false), 500);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    }}
    className={cn(
      'flex-1 border-slate-700 bg-transparent transition-all',
      isFavorite
        ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    )}
  >
    {isSaving ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : (
      <Heart className={cn('mr-2 h-4 w-4', isFavorite && 'fill-red-500')} />
    )}
    {isFavorite ? 'Saved' : 'Save'}
  </Button>
  <Button
    variant="outline"
    size="sm"
    onClick={handleShare}
    className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
  >
    <Share2 className="mr-2 h-4 w-4" />
    Share
  </Button>
</div>;
```

---

### PHASE 5: Mobile UX Improvements (HIGH PRIORITY)

#### Task 5.1: Enhanced Mobile Sticky CTA

**Modify:** Lines 731-755 in `/src/app/equipment/[id]/page.tsx`

**Improvements:**

1. **Sticky on mobile** - Already implemented, enhance visibility
2. **Keyboard reachable** - Add tabIndex and focus styles
3. **Improved touch targets** - Min 44px height
4. **Safe area padding** - Account for iPhone notch

```tsx
<motion.div
  initial={{ y: 100 }}
  animate={{ y: 0 }}
  transition={{ delay: 0.5, duration: 0.5 }}
  className="pb-safe fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 px-4 pt-4 backdrop-blur-xl lg:hidden"
>
  <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Price</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-emerald-400">
          {formatCurrency(equipment.price_per_day)}
        </span>
        <span className="text-xs text-slate-500">/ day</span>
      </div>
    </div>
    <Button
      className={cn(
        'h-12 min-w-[140px] text-base font-semibold shadow-lg',
        equipment.is_available
          ? 'bg-emerald-600 text-white shadow-emerald-900/30 hover:bg-emerald-500'
          : 'cursor-not-allowed bg-slate-800 text-slate-500'
      )}
      disabled={!equipment.is_available || isBooking}
      onClick={handleBook}
      tabIndex={0}
    >
      {isBooking ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : equipment.is_available ? (
        'Book Now'
      ) : (
        'Unavailable'
      )}
    </Button>
  </div>
</motion.div>
```

**Add to globals.css:**

```css
/* Safe area for mobile devices */
.pb-safe {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

---

### PHASE 6: Provider Card Enhancements (MEDIUM PRIORITY)

#### Task 6.1: Enhanced Provider Card

**Modify:** Lines 470-520 in `/src/app/equipment/[id]/page.tsx`

**Add these fields:**

1. **Provider rating summary** - Average rating with star
2. **Years on platform** - "Member since" calculation
3. **Completed bookings count** - Trust indicator
4. **Improved button feedback** - Hover states

```tsx
// Calculate years on platform
const memberSince = owner?.created_at ? new Date(owner.created_at) : null;
const yearsOnPlatform = memberSince
  ? Math.floor((Date.now() - memberSince.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  : null;

<Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
  <CardContent className="p-6">
    <Link href={`/user/${equipment.owner_id}`} className="group flex items-center gap-4">
      <Avatar
        src={owner.profile_image}
        name={owner.name}
        size="lg"
        className="border-2 border-slate-700 transition-all duration-300 group-hover:border-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-white transition-colors group-hover:text-emerald-400">
          {owner.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
          <span className="text-sm text-slate-400">Verified Provider</span>
        </div>
      </div>
    </Link>

    {/* Provider Stats */}
    <div className="mt-4 grid grid-cols-3 gap-3 border-y border-slate-800 py-4">
      {/* Rating */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-bold text-white">{owner.rating?.toFixed(1) || '5.0'}</span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">Rating</p>
      </div>
      {/* Years */}
      <div className="border-x border-slate-800 text-center">
        <span className="font-bold text-white">{yearsOnPlatform || 1}+</span>
        <p className="mt-0.5 text-xs text-slate-500">Years</p>
      </div>
      {/* Bookings */}
      <div className="text-center">
        <span className="font-bold text-white">{owner.total_bookings || 0}</span>
        <p className="mt-0.5 text-xs text-slate-500">Bookings</p>
      </div>
    </div>

    {/* Contact Buttons */}
    <div className="mt-4 flex gap-3">
      <Button
        variant="outline"
        size="sm"
        className="flex-1 border-slate-700 bg-transparent text-slate-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
      >
        <Phone className="mr-2 h-4 w-4" />
        Call
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleChat}
        disabled={isStartingChat}
        className="flex-1 border-slate-700 bg-transparent text-slate-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
      >
        {isStartingChat ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="mr-2 h-4 w-4" />
        )}
        {isStartingChat ? 'Connecting...' : 'Chat'}
      </Button>
    </div>
  </CardContent>
</Card>;
```

---

### PHASE 7: Title & Meta Improvements (MEDIUM PRIORITY)

#### Task 7.1: Enhanced Title Block

**Modify:** Lines 354-404 in `/src/app/equipment/[id]/page.tsx`

**Improvements:**

1. **Better line-height** - Add `leading-tight` to title
2. **Reduced density** - More spacing between elements
3. **Prominent category pill** - Gradient background
4. **Location icon** - Already present, enhance styling
5. **Add distance** - If available in equipment data

```tsx
<motion.div variants={itemVariants} className="space-y-4">
  {/* Category Badge - Enhanced */}
  {category && (
    <Badge className="inline-flex items-center gap-1.5 border-slate-600 bg-gradient-to-r from-slate-800 to-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition-all hover:from-slate-700 hover:to-slate-600">
      <span className="text-base">{category.icon}</span>
      {category.label}
    </Badge>
  )}

  {/* Title - Improved */}
  <h1 className="text-3xl font-bold leading-tight tracking-tight text-white lg:text-4xl">
    {equipment.name}
  </h1>

  {/* Location - Enhanced */}
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400">
    <span className="flex items-center gap-2">
      <MapPin className="h-4 w-4 flex-shrink-0 text-emerald-500" />
      <span className="text-base">{equipment.location_name || 'Location not specified'}</span>
    </span>
    {equipment.distance_km && (
      <span className="flex items-center gap-1.5 text-sm text-emerald-400">
        <Navigation className="h-3.5 w-3.5" />
        {equipment.distance_km.toFixed(1)} km away
      </span>
    )}
  </div>

  {/* Rating - Use new component */}
  <div className="pt-2">
    <RatingDisplay
      rating={equipment.rating}
      reviewCount={equipment.review_count}
      showCTA={true}
      onReviewClick={() => {
        document.querySelector('[value="reviews"]')?.click();
      }}
    />
  </div>
</motion.div>
```

---

### PHASE 8: Tabs Enhancement (MEDIUM PRIORITY)

#### Task 8.1: Enhanced Tabs with Animation

**Modify:** Lines 532-552 in `/src/app/equipment/[id]/page.tsx`

**Improvements:**

1. **Active tab contrast** - More prominent styling
2. **Animated underline** - Motion indicator
3. **Sticky on scroll** - Position sticky
4. **Keyboard accessibility** - Already from Radix
5. **Icons per tab** - Add relevant icons

```tsx
<div className="sticky top-20 z-30 -mx-4 bg-slate-950/95 px-4 backdrop-blur-xl">
  <Tabs defaultValue="details" className="w-full">
    <TabsList className="mb-6 h-auto w-full justify-start rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 backdrop-blur-sm">
      <TabsTrigger
        value="details"
        className="relative rounded-lg px-6 py-3 text-sm font-medium text-slate-400 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/20"
      >
        <FileText className="mr-2 h-4 w-4" />
        Details
      </TabsTrigger>
      <TabsTrigger
        value="specs"
        className="relative rounded-lg px-6 py-3 text-sm font-medium text-slate-400 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/20"
      >
        <Settings2 className="mr-2 h-4 w-4" />
        Specifications
      </TabsTrigger>
      <TabsTrigger
        value="reviews"
        className="relative rounded-lg px-6 py-3 text-sm font-medium text-slate-400 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/20"
      >
        <Star className="mr-2 h-4 w-4" />
        Reviews
        {reviews.length > 0 && (
          <span className="ml-2 rounded-full bg-slate-700 px-2 py-0.5 text-xs">
            {reviews.length}
          </span>
        )}
      </TabsTrigger>
    </TabsList>
    {/* ... TabsContent unchanged ... */}
  </Tabs>
</div>
```

---

### PHASE 9: Features Section Enhancement (MEDIUM PRIORITY)

#### Task 9.1: Features with Icons

**Modify:** Lines 567-582 in `/src/app/equipment/[id]/page.tsx`

**Improvements:**

1. **Icon + label format** - Visual icons for features
2. **Better grid alignment** - Consistent spacing
3. **Hover tooltips** - Additional info on hover

```tsx
// Feature icon mapping
const featureIcons: Record<string, React.ReactNode> = {
  GPS: <Navigation className="h-4 w-4" />,
  'Air Conditioned': <Wind className="h-4 w-4" />,
  'Power Steering': <CircleDot className="h-4 w-4" />,
  Hydraulic: <Droplets className="h-4 w-4" />,
  '4WD': <Truck className="h-4 w-4" />,
  default: <CheckCircle className="h-4 w-4" />,
};

const getFeatureIcon = (feature: string) => {
  const key = Object.keys(featureIcons).find((k) =>
    feature.toLowerCase().includes(k.toLowerCase())
  );
  return featureIcons[key || 'default'];
};

// Enhanced features list
{
  equipment.features && equipment.features.length > 0 && (
    <>
      <h3 className="mb-4 mt-8 flex items-center gap-2 text-xl font-bold text-white">
        <Sparkles className="h-5 w-5 text-emerald-500" />
        Features
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {equipment.features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-all group-hover:bg-emerald-500/20">
              {getFeatureIcon(feature)}
            </div>
            <span className="font-medium text-slate-300">{feature}</span>
          </motion.div>
        ))}
      </div>
    </>
  );
}
```

---

### PHASE 10: Accessibility Improvements (MEDIUM PRIORITY)

#### Task 10.1: Comprehensive A11y Updates

**Improvements across the page:**

1. **ARIA labels** - Add to all interactive elements
2. **Focus states** - Enhanced visibility
3. **Color contrast** - Ensure WCAG AA compliance
4. **Keyboard navigation** - Tab order and shortcuts
5. **Screen reader support** - Meaningful descriptions

```tsx
// Example ARIA improvements
<Button
  aria-label={`Book ${equipment.name} for ${formatCurrency(equipment.price_per_day)} per day`}
  aria-disabled={!equipment.is_available}
>
  Book Now
</Button>

<Image
  alt={`${equipment.name} - ${category?.label || 'Equipment'} available for rent`}
/>

// Focus ring enhancement in globals.css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950;
}
```

---

### PHASE 11: Performance Optimizations (MEDIUM PRIORITY)

#### Task 11.1: Image Lazy Loading & Blur Placeholders

**Already using Next.js Image, enhance with:**

```tsx
<Image
  src={media.url}
  alt={`${productName} - Image ${i + 1}`}
  fill
  className="object-cover"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQQBAwUAAAAAAAAAAAAAAQACAxEEBRIhBhMUMUH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8AyZr5WCN0chdG8e2uFSg9QZzmOZHOQxx2kAkVf9UItZU7bXk/MJ//2Q=="
  loading={i === 0 ? 'eager' : 'lazy'}
  sizes="(max-width: 768px) 100vw, 50vw"
  onLoad={() => setIsImageLoading(false)}
/>
```

#### Task 11.2: Skeleton Loader Component

**File:** `/src/components/product/ProductDetailSkeleton.tsx` (NEW)

```tsx
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28">
        {/* Back link skeleton */}
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-slate-800" />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-800 lg:aspect-[16/10]" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 w-20 animate-pulse rounded-lg bg-slate-800" />
              ))}
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-800" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-800" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-slate-800" />

            <div className="h-48 animate-pulse rounded-xl bg-slate-800" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## New Files to Create

1. `/src/components/product/ProductImageGallery.tsx` - Reusable image gallery
2. `/src/components/product/RatingDisplay.tsx` - Rating component with empty state
3. `/src/components/product/ProductDetailSkeleton.tsx` - Loading skeleton
4. `/src/components/product/index.ts` - Barrel export

---

## Files to Modify

1. `/src/app/equipment/[id]/page.tsx` - Main changes (significant refactor)
2. `/src/app/globals.css` - Add safe-area padding, focus ring utilities
3. `/src/components/ui/index.ts` - Export new components (if added to ui folder)

---

## Dependencies

No new dependencies required. All features use existing:

- `framer-motion` - Animations
- `lucide-react` - Icons
- `next/image` - Image optimization
- `@radix-ui/react-tabs` - Accessible tabs

---

## Testing Checklist

- [ ] Image gallery zoom works on desktop
- [ ] Swipe gestures work on mobile
- [ ] Keyboard navigation (arrows, F, Escape)
- [ ] Fullscreen modal opens/closes correctly
- [ ] Rating shows "New Listing" when reviews = 0
- [ ] CTA loading state displays correctly
- [ ] Mobile sticky bar has correct safe area padding
- [ ] Provider stats display correctly
- [ ] Tab sticky behavior works on scroll
- [ ] Skeleton loads before content
- [ ] All focus states are visible
- [ ] Screen reader announces content correctly

---

## Estimated Effort

| Phase     | Tasks            | Estimated Time  |
| --------- | ---------------- | --------------- |
| Phase 1   | Image Gallery    | 3-4 hours       |
| Phase 2   | Rating System    | 1-2 hours       |
| Phase 3   | Price Card       | 1-2 hours       |
| Phase 4   | CTA Optimization | 1-2 hours       |
| Phase 5   | Mobile UX        | 1 hour          |
| Phase 6   | Provider Card    | 1-2 hours       |
| Phase 7   | Title & Meta     | 1 hour          |
| Phase 8   | Tabs             | 1 hour          |
| Phase 9   | Features         | 1 hour          |
| Phase 10  | Accessibility    | 1-2 hours       |
| Phase 11  | Performance      | 1-2 hours       |
| **Total** |                  | **14-20 hours** |

---

## Execution Command

To implement this plan, run:

```
/start-work
```

This will invoke Sisyphus to execute the tasks systematically.

---

**Plan Version:** 1.0
**Created By:** Prometheus (Plan Builder)
**Status:** Ready for Execution
