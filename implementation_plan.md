# Implementation Plan

[Overview]
Optimize the landing page performance by addressing the critical issues identified in the Lighthouse report: video file sizes, unused JavaScript, and the massive 27-second element render delay causing LCP failure.

[Types]
No type system changes required.

[Files]
Single sentence describing file modifications.

- `public/Landingpagevideo.webm` - Compress from 4MB to <2MB using optimized codec settings
- `public/Landingpagevideo-mobile.webm` - Keep as is (already optimized at 1.6MB)
- `public/Landingpagevideo-poster.jpg` - Already optimized at 71KB (good)
- `src/components/landing/HeroSection.tsx` - Add loading="lazy" to video, add poster image, defer animations
- `src/components/landing/LandingPageRedesigned.tsx` - Add dynamic imports for below-fold sections
- `next.config.ts` - Add bundle analyzer and optimize chunking for large dependencies

[Functions]
Single sentence describing function modifications.

- No function signatures changed - all optimizations are configuration and markup changes

[Classes]
Single sentence describing class modifications.

- No class changes required

[Dependencies]
Single sentence describing dependency modifications.

- No new dependencies - existing packages already support the optimizations needed
- Consider marking react-icons as lazy-loaded (already in optimizePackageImports)

[Testing]
Single sentence describing testing approach.

- Run Lighthouse after each optimization to verify improvements
- Test on Chrome incognito mode (no extensions) for accurate results

[Implementation Order]
Single sentence describing the implementation sequence.

1. Compress the desktop video file (biggest impact)
2. Add video optimization attributes (lazy loading, poster, preload)
3. Defer below-fold content with dynamic imports
4. Verify improvements with Lighthouse

---

## Detailed Analysis

### Root Causes Identified

1. **Video File Size (4MB desktop, 1.6MB mobile)**
   - Lighthouse recommends <3MB for optimal performance
   - Desktop video is 4MB - needs compression

2. **Massive Unused JavaScript (1,763 KiB potential savings)**
   - react-icons: 437KB unused (97% of 449KB)
   - three.js: 165KB unused
   - @react-three/fiber: 138KB unused
   - framer-motion chunks: 150KB unused
   - Next.js devtools: 145KB unused

3. **Element Render Delay (27,010ms = 27 seconds!)**
   - This is the #1 killer - LCP element takes 27 seconds to render
   - Caused by JavaScript blocking the main thread during initial load
   - Related to forced reflows from GSAP and Next.js DOM operations

4. **Forced Reflows**
   - Next.js compiled code: 521ms of forced reflow
   - GSAP animations: 447ms of forced reflow

### Optimization Steps

**Step 1: Compress Video (Priority: Critical)**
- Desktop video: 4MB → ~1.5MB (60-70% reduction)
- Use FFmpeg with VP9 codec for better compression:
  ```
  ffmpeg -i input.webm -c:v libvpx-vp9 -b:v 0 -crf 30 -an -speed 4 output.webm
  ```
- Or use Handbrake with WebM/VP9 preset

**Step 2: Optimize Video Loading in HeroSection.tsx**
- Add `loading="lazy"` attribute
- Ensure poster image displays immediately
- Use `preload="none"` initially then switch to `preload="auto"` after FCP

**Step 3: Defer Below-Fold Content**
- Use `next/dynamic` for sections below the fold
- Only load animation libraries when sections come into view

**Step 4: Fix LCP Render Delay**
- The 27-second delay suggests JavaScript is blocking rendering
- Move non-critical JS to load after initial paint
- Use `requestAnimationFrame` for animation initialization
