# Animation Architecture Documentation

## Overview

This project uses a **multi-library animation stack** optimized for performance on mobile devices:

- **Framer Motion**: UI transitions and React-first animations
- **GSAP**: Complex timelines, scroll animations, and advanced effects
- **Three.js + R3F**: 3D product showcases
- **Lenis**: Smooth scrolling with mobile optimization

## Directory Structure

```
src/
├── lib/animations/
│   ├── animation-registry.ts     # Library selection matrix
│   ├── device-capability.ts      # Performance tier detection
│   ├── gsap-context.tsx          # GSAP React hooks
│   └── performance-monitor.tsx   # FPS tracking & adaptive quality
├── components/
│   ├── EnhancedSmoothScroll.tsx  # Lenis wrapper with device optimization
│   └── three/
│       ├── LazyThreeScene.tsx    # Dynamic 3D loader
│       └── Equipment3DModel.tsx  # Example 3D component
```

## When to Use Each Library

### Framer Motion

**Best for:** UI component animations, page transitions, gestures

```tsx
import { motion } from 'framer-motion';

<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
  Content
</motion.div>;
```

### GSAP

**Best for:** Scroll-triggered animations, complex sequences, SVG morphing

```tsx
import { useGSAPAnimation } from '@/lib/animations/gsap-context';

useGSAPAnimation((gsap, ScrollTrigger) => {
  gsap.from('.hero', {
    opacity: 0,
    y: 100,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top 80%',
      end: 'top 30%',
      scrub: true,
    },
  });
}, []);
```

### Three.js

**Best for:** 3D product showcases, interactive visualizations

```tsx
import { LazyThreeScene } from '@/components/three/LazyThreeScene';

<LazyThreeScene
  componentPath="@/components/three/Equipment3DModel"
  componentProps={{ modelUrl: '/models/tractor.glb' }}
  className="h-[600px]"
/>;
```

## Performance Optimization

### Device Capability Detection

The system automatically detects device performance and adjusts animation quality:

```tsx
import { useDeviceCapability } from '@/lib/animations/device-capability';

const deviceInfo = useDeviceCapability();
// Returns: { capability: 'low' | 'medium' | 'high', isMobile, prefersReducedMotion, ... }
```

### Tiered Animation Quality

| Device Tier | Animations Enabled | 3D Rendering | Particle Count |
| ----------- | ------------------ | ------------ | -------------- |
| **High**    | All                | Yes          | 50             |
| **Medium**  | UI + Some GSAP     | No           | 20             |
| **Low**     | CSS only           | No           | 0              |

### Automatic Adaptation

The performance monitor adjusts quality in real-time:

```tsx
import { useAdaptivePerformance } from '@/lib/animations/performance-monitor';

const { qualityLevel, metrics } = useAdaptivePerformance();
// Automatically reduces quality if FPS < 30 for 3 seconds
```

## Mobile Optimization Strategies

### 1. Reduced Motion Support

All animations respect `prefers-reduced-motion`:

```tsx
// GSAP automatically disables
// Lenis falls back to native scroll
// Framer Motion uses duration: 0
```

### 2. Lazy Loading

Heavy libraries are code-split:

```tsx
// Three.js only loads when component is rendered
<LazyThreeScene componentPath="..." />;

// GSAP plugins loaded on-demand
import { ScrollTrigger } from 'gsap/ScrollTrigger';
```

### 3. Touch Optimization

Lenis configuration varies by device:

- **Desktop**: Smooth wheel scrolling
- **Mobile**: Native touch scrolling (better performance)
- **Low-end**: Disabled smooth scroll entirely

### 4. Will-Change Management

Animations use `will-change` sparingly to avoid layer explosion:

```css
/* Only on active animations, not hover states */
.animating {
  will-change: transform, opacity;
}
```

## Integration with Existing Code

### Adding GSAP to Existing Components

```tsx
// Before (Framer Motion only)
<motion.div whileInView={{ opacity: 1 }}>

// After (GSAP for scroll-linked)
useGSAPAnimation((gsap) => {
  gsap.from('.element', {
    opacity: 0,
    scrollTrigger: { trigger: '.element', scrub: true }
  });
}, []);
```

### Upgrading Lenis Setup

```tsx
// Old (src/components/SmoothScroll.tsx)
<ReactLenis root options={{ lerp: 0.1 }}>

// New (auto-optimized)
import { EnhancedSmoothScroll } from '@/components/EnhancedSmoothScroll';
<EnhancedSmoothScroll>{children}</EnhancedSmoothScroll>
```

### Adding 3D Showcase

```tsx
// Add to equipment detail page
import { LazyThreeScene } from '@/components/three/LazyThreeScene';

<LazyThreeScene
  componentPath="@/components/three/Equipment3DModel"
  componentProps={{
    modelUrl: equipment.model3dUrl,
  }}
  notSupportedFallback={<ImageGallery />}
/>;
```

## Fallback Strategy

### Progressive Enhancement Hierarchy

1. **High-end devices**: Full animations + 3D
2. **Medium devices**: UI animations + 2D images
3. **Low-end devices**: Static images + CSS transitions
4. **Reduced motion**: Instant transitions

### Fallback Implementation

```tsx
const deviceInfo = useDeviceCapability();

if (deviceInfo.prefersReducedMotion) {
  return <StaticContent />;
}

if (!shouldEnable3D(deviceInfo)) {
  return <ImageCarousel />;
}

return <LazyThreeScene />;
```

## Testing Strategy

### Performance Benchmarks

| Metric | Target  | Critical Threshold |
| ------ | ------- | ------------------ |
| FPS    | 60      | < 30               |
| LCP    | < 2.5s  | > 4s               |
| TBT    | < 200ms | > 600ms            |
| Bundle | < 500KB | > 1MB              |

### Testing Checklist

- [ ] Test on low-end Android (< 2GB RAM)
- [ ] Test on 3G connection
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Verify 3D fallbacks work
- [ ] Check bundle size impact
- [ ] Measure FPS during scroll
- [ ] Test touch interactions on mobile

### Device Testing Matrix

| Device Type | Test Devices          | Key Checks             |
| ----------- | --------------------- | ---------------------- |
| Low-end     | Redmi 8A, Samsung A10 | FPS, memory, scrolling |
| Medium      | iPhone 11, Pixel 5    | All animations work    |
| High-end    | iPhone 15, S23        | 3D renders smoothly    |

### Debug Tools

Enable FPS monitor in development:

```tsx
import { FPSMonitor } from '@/lib/animations/performance-monitor';

<FPSMonitor show={true} />;
```

## Risk Mitigation

### Bundle Size Management

**Current Impact:**

- GSAP: ~50KB gzipped
- Three.js: ~600KB (lazy loaded)
- R3F: ~100KB (lazy loaded)

**Mitigation:**

- Code-split all 3D components
- Use dynamic imports for GSAP plugins
- Tree-shake unused Framer Motion features

### Animation Conflicts

**Problem:** Multiple libraries manipulating same element

**Solution:**

1. Use GSAP for scroll-linked animations
2. Use Framer Motion for interaction states
3. Never mix on same element

```tsx
// ❌ BAD - Conflict
<motion.div animate={{ x: 100 }}>
  {gsap.to('.box', { x: 200 })}
</motion.div>

// ✅ GOOD - Separate concerns
<div>
  <FramerMotionButton />
  <GSAPScrollSection />
</div>
```

### Mobile Performance

**Risks:**

- 3D drains battery
- Smooth scroll causes jank
- Too many particles lag

**Mitigation:**

- Detect device capability first
- Reduce animation complexity on mobile
- Use CSS animations for simple effects
- Disable 3D on low-end devices

## Rollback Criteria

Rollback if ANY of these occur:

1. **LCP > 4s** on mobile (3G)
2. **FPS < 20** during scroll on medium devices
3. **Bundle size > 1.5MB** after code-splitting
4. **User complaints** about battery drain
5. **Crash rate > 1%** on Android < 8

### Rollback Plan

```bash
# 1. Remove GSAP from critical pages
git revert [commit-hash]

# 2. Disable 3D components
# Set environment variable
DISABLE_3D=true

# 3. Fallback to basic Lenis
# Revert EnhancedSmoothScroll to original SmoothScroll
```

## Next Steps

1. **Phase 1**: Deploy GSAP + Enhanced Lenis (low risk)
2. **Phase 2**: A/B test 3D on equipment pages
3. **Phase 3**: Monitor metrics for 2 weeks
4. **Phase 4**: Expand 3D to more pages if successful

## Resources

- [GSAP Docs](https://greensock.com/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Lenis Smooth Scroll](https://github.com/studio-freight/lenis)
- [Framer Motion](https://www.framer.com/motion/)
