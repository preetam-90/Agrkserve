# ⚡ Performance Optimization Checklist

## Bundle Size Targets

| Bundle              | Target  | Max   |
| ------------------- | ------- | ----- |
| Initial JS          | < 100KB | 150KB |
| Initial CSS         | < 30KB  | 50KB  |
| Total Page          | < 200KB | 350KB |
| Hero Video          | < 5MB   | 10MB  |
| Images (above fold) | < 200KB | 400KB |

## Critical Path Optimization

### 1. Hero Section

- [ ] LQIP blur poster loads instantly (< 2KB)
- [ ] Sharp poster loads within 100ms
- [ ] Video starts loading after 1.5s delay
- [ ] Video only on good connections (not 2G/3G)
- [ ] MP4 + WebM sources for cross-browser support

### 2. Fonts

- [x] `display: swap` for all fonts
- [x] Variable font for Space Grotesk
- [x] Preload critical fonts in `<head>`

### 3. JavaScript

- [x] Dynamic imports for all chapters
- [x] GSAP loaded only when needed
- [x] Three.js loaded only for 3D sections
- [x] Code splitting per chapter

### 4. Images

- [ ] Use Next.js Image with `priority` for above-fold
- [ ] Lazy load all below-fold images
- [ ] Use `sizes` attribute correctly
- [ ] WebP format with fallback

## Core Web Vitals

### LCP (Largest Contentful Paint)

**Target: < 2.5s**

Optimization:

- Hero poster is LCP element
- Preload hero poster: `<link rel="preload" as="image">`
- Minimize render-blocking CSS
- Inline critical CSS

### FID (First Input Delay)

**Target: < 100ms**

Optimization:

- Defer non-critical JS
- Break up long tasks
- Use `requestIdleCallback` for non-essential work

### CLS (Cumulative Layout Shift)

**Target: < 0.1**

Optimization:

- Set explicit dimensions on images
- Reserve space for dynamic content
- Avoid FOUC (Flash of Unstyled Content)
- Use CSS containment

## Animation Performance

### GSAP Optimization

- [x] Use `gsap.context()` for cleanup
- [x] Use `scrollTrigger` with `scrub` efficiently
- [x] Avoid animating expensive properties
- [x] Use `will-change` sparingly

### Framer Motion Optimization

- [x] Use `useReducedMotion` hook
- [x] Avoid layout thrashing
- [x] Use hardware acceleration (`transform`, `opacity`)

### Three.js Optimization

- [x] Limit `dpr` to [1, 1.5]
- [x] Use `powerPreference: "high-performance"`
- [x] Dispose geometries and materials
- [x] Use instance rendering for particles

## Network Optimization

### Caching Strategy

```
Static Assets: 1 year
HTML: No cache (SSR)
API Data: 5 minutes
Images: 1 month
```

### Compression

- [x] Brotli compression enabled
- [x] Gzip fallback
- [x] Minified CSS/JS

### Preconnect

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://your-supabase-url.supabase.co" />
```

## Mobile Optimization

### Bandwidth Detection

```typescript
// Skip video on slow connections
if (connection.saveData || connection.effectiveType === '2g') {
  showStaticImage();
}
```

### Touch Optimization

- [x] Touch targets ≥ 44px
- [x] No hover-only interactions
- [x] Snap-scroll for carousels
- [x] Native scroll performance

### Battery Optimization

- [x] Reduce animations on low battery
- [x] Pause WebGL when not visible
- [x] Throttle scroll events

## Lighthouse Audit Checklist

### Performance (Target: 90+)

- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1
- [ ] Speed Index < 3s

### Accessibility (Target: 100)

- [x] Image alt attributes
- [x] Form labels
- [x] Link text
- [x] Color contrast
- [x] Keyboard navigation
- [x] Focus management

### Best Practices (Target: 100)

- [x] HTTPS
- [x] No browser errors
- [x] Modern image formats
- [x] Efficient animations

### SEO (Target: 100)

- [x] Meta description
- [x] Title tag
- [x] Heading hierarchy
- [x] Structured data
- [x] Canonical URL

## Monitoring

### Real User Monitoring (RUM)

- Use Vercel Analytics
- Track Core Web Vitals
- Monitor error rates
- Track conversion funnels

### Synthetic Monitoring

- Daily Lighthouse audits
- Cross-browser testing
- Mobile device testing

---

**Last Updated:** 2024  
**Review Frequency:** Weekly
