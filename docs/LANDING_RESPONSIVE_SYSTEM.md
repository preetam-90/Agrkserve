# Landing Responsive System

## Breakpoints

- `320px`: minimum smartphone baseline
- `375px`: large small-phone baseline
- `414px`: plus-size phone baseline
- `768px`: tablet
- `1024px`: small laptop
- `1280px`: laptop
- `1440px`: desktop
- `1920px+`: large desktop

These are implemented via CSS custom properties in `src/app/globals.css` under the `LANDING RESPONSIVE SYSTEM` block.

## Layout Primitives

- `ResponsiveSection`: section wrapper with consistent spacing and overflow behavior
- `ResponsiveContainer`: max-width and narrow-max-width container
- `ResponsiveGrid`: shared 2/3/4-column responsive grid

File: `src/components/landing/shared/ResponsiveLayout.tsx`

## Responsive Rules

- Mobile-first stacking at `320-767`
- Two-column transitions begin at `768`
- Three-column density starts at `1024+`
- Touch target minimum is enforced with `.landing-touch` (44px+)
- Fluid typography uses `clamp()` helpers (`.landing-fluid-title`, `.landing-fluid-subtitle`)

## Updated Landing Sections

- Hero: `src/components/landing/chapters/HeroChapterRedesigned.tsx`
- Equipment/Features stream: `src/components/landing/chapters/EquipmentUniverseChapterRedesigned.tsx`
- Features chapter: `src/components/landing/chapters/FeaturesChapterRedesigned.tsx`
- How It Works: `src/components/landing/chapters/HowItWorksChapter.tsx`
- Pricing chapter: `src/components/landing/chapters/PricingChapterRedesigned.tsx`
- Final CTA: `src/components/landing/chapters/FinalCTAChapterRedesigned.tsx`
- Footer: `src/components/landing/shared/LandingFooter.tsx`

## Figma Auto-Layout Constraints

- Root frame:
  - Width: `Fill container`
  - Min width: `320`
  - Max width: `1920+`
  - Padding horizontal: tokenized (`16, 18, 24, 32, 40, 48, 64`)
  - Padding vertical: tokenized per section (`64-160`)
- Content container:
  - Horizontal constraints: `Center`
  - Width: `Fill container`
  - Max width: `1344-1600` depending on breakpoint
- Card groups:
  - Mobile: vertical stack (`Auto-layout`, direction `vertical`, gap `12-16`)
  - Tablet: 2 columns (`Wrap`, fixed card min width)
  - Desktop: 3 columns (`Wrap`, equal-width cards)
- CTA buttons:
  - Mobile: `Fill container`, min height `44`
  - Desktop: `Hug contents`, min height `44`
- Typography:
  - Headline: fluid clamp equivalent
  - Body: `16-19px` scale with max line length `60-72ch`

## React Structure Pattern

```tsx
<ResponsiveSection id="section-id">
  <ResponsiveContainer>
    <header />
    <ResponsiveGrid cols={3}>
      <Card />
    </ResponsiveGrid>
  </ResponsiveContainer>
</ResponsiveSection>
```

## CLS/Performance Notes

- Media elements set to block-level and max-width constrained in global CSS.
- Hero and large animated sections use transform-based animation (GPU-friendly).
- Expensive effects degrade on reduced-motion or lower visual tiers.
