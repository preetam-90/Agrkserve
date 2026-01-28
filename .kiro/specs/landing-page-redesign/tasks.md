# Implementation Plan: Landing Page Redesign

## Overview

This implementation plan breaks down the landing page redesign into discrete, incremental coding tasks. Each task builds on previous work, with testing integrated throughout. The implementation follows a component-by-component approach, starting with foundational utilities and design system, then building up sections from top to bottom.

## Tasks

- [x] 1. Set up design system and animation infrastructure
  - Install Framer Motion: `pnpm add framer-motion`
  - Install fast-check for property-based testing: `pnpm add -D @fast-check/jest`
  - Create color palette constants in `src/lib/utils/design-tokens.ts`
  - Create typography scale constants
  - Create animation variants in `src/lib/animations/variants.ts` (fadeInUp, staggerContainer, scaleIn, cardHover, floating)
  - Create custom hooks directory `src/hooks/`
  - _Requirements: 1.1, 1.2, 3.6_

- [x] 2. Implement utility functions and custom hooks
  - [x] 2.1 Create contrast ratio calculator utility
    - Implement `calculateContrastRatio(color1, color2)` in `src/lib/utils/contrast.ts`
    - Implement `hexToRgb(hex)` helper function
    - Implement `getLuminance(color)` helper function
    - _Requirements: 1.4, 13.3_
  
  - [ ]* 2.2 Write property test for contrast ratio calculator
    - **Property 1: Color Contrast Compliance**
    - **Validates: Requirements 1.4, 13.3**
  
  - [x] 2.3 Create useCountUp custom hook
    - Implement `useCountUp(end, duration)` in `src/hooks/useCountUp.ts`
    - Use `useInView` from Framer Motion for viewport detection
    - Implement easing function for smooth animation
    - Return `{ count, ref }` for component usage
    - _Requirements: 3.4, 7.2_
  
  - [ ]* 2.4 Write property test for counter animation
    - **Property 2: Counter Animation Correctness**
    - **Validates: Requirements 3.4, 7.2**
  
  - [x] 2.5 Create useParallax custom hook
    - Implement `useParallax(speed)` in `src/hooks/useParallax.ts`
    - Use `useScroll` and `useTransform` from Framer Motion
    - _Requirements: 2.6_

- [x] 3. Create reusable UI components
  - [x] 3.1 Create AnimatedCounter component
    - Implement component in `src/components/landing/AnimatedCounter.tsx`
    - Use useCountUp hook
    - Support prefix, suffix, and decimal formatting
    - Include screen reader support with aria-live
    - _Requirements: 3.4, 7.1, 7.2_
  
  - [ ]* 3.2 Write unit tests for AnimatedCounter
    - Test counter renders with correct initial value
    - Test counter animates to target value
    - Test prefix and suffix rendering
    - _Requirements: 3.4, 7.2_
  
  - [x] 3.3 Create ProcessStep component
    - Implement component in `src/components/landing/ProcessStep.tsx`
    - Accept props: step number, icon, title, description, delay
    - Implement scroll-reveal animation with stagger
    - Add hover effect for icon rotation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 3.4 Create TestimonialCard component
    - Implement component in `src/components/landing/TestimonialCard.tsx`
    - Display quote, author, location, star rating
    - Apply glassmorphism styling
    - Implement scroll-reveal animation
    - _Requirements: 7.3_

- [x] 4. Implement EquipmentCard component with animations
  - [x] 4.1 Create EquipmentCard component
    - Implement component in `src/components/landing/EquipmentCard.tsx`
    - Display equipment image, name, price, location, availability badge, rating, category
    - Use Next.js Image component for optimization
    - Implement hover effects (lift, glow, image scale)
    - Add lazy loading for images
    - Ensure minimum touch target size (44x44px)
    - _Requirements: 5.2, 5.3, 5.5, 11.4, 12.1, 12.2, 12.5_
  
  - [ ]* 4.2 Write property test for equipment card completeness
    - **Property 3: Equipment Card Completeness**
    - **Validates: Requirements 5.2**
  
  - [ ]* 4.3 Write unit tests for EquipmentCard
    - Test all fields render correctly
    - Test availability badge shows correct status
    - Test hover effects apply
    - Test lazy loading attribute is present
    - _Requirements: 5.2, 5.5_

- [x] 5. Build Hero Section
  - [x] 5.1 Create HeroSection component structure
    - Implement component in `src/components/landing/HeroSection.tsx`
    - Set up full viewport height container with gradient background
    - Implement parallax background using useParallax hook
    - Add animated gradient overlay
    - _Requirements: 2.1, 2.6_
  
  - [x] 5.2 Add Hero content and animations
    - Implement logo with scale-in animation
    - Add headline with staggered word reveal animation
    - Add subheading with fade-in
    - Implement page load animation sequence (logo → headline → stats → CTAs)
    - _Requirements: 2.2, 3.1_
  
  - [x] 5.3 Add live statistics display
    - Integrate AnimatedCounter components for total users and total equipment
    - Add pulsing red dot indicators
    - Apply glassmorphism styling to stat containers
    - _Requirements: 2.5, 7.1_
  
  - [x] 5.4 Add CTA buttons with animations
    - Create primary CTA "Rent Now" with ripple effect
    - Create secondary CTA "List Your Equipment"
    - Implement slide-up entrance animation
    - Add hover pulse effects
    - Link to appropriate routes
    - _Requirements: 2.3, 3.5_
  
  - [x] 5.5 Add floating equipment visuals
    - Create FloatingEquipment component with tractor/harvester images
    - Implement continuous floating animation (vertical motion + rotation)
    - Position elements around hero content
    - _Requirements: 2.4_
  
  - [x] 5.6 Add trust badge
    - Create trust badge with shield icon
    - Apply glassmorphism effect
    - Add fade-in animation
    - _Requirements: 2.5_
  
  - [ ]* 5.7 Write unit tests for Hero Section
    - Test headline renders correctly
    - Test both CTAs are present
    - Test statistics display
    - Test trust badge is visible
    - _Requirements: 2.2, 2.3, 2.5_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Build How It Works Section
  - [x] 7.1 Create HowItWorksSection component
    - Implement component in `src/components/landing/HowItWorksSection.tsx`
    - Create section header with title and description
    - Render 3 ProcessStep components with appropriate icons
    - Step 1: Search & Discover (Search icon)
    - Step 2: Book & Pay (CreditCard icon)
    - Step 3: Use & Return (CheckCircle icon)
    - Implement stagger animation for sequential reveal
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 7.2 Write unit tests for How It Works Section
    - Test exactly 3 steps are rendered
    - Test each step has correct title and icon
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Build Featured Equipment Section
  - [x] 8.1 Create FeaturedEquipmentSection component
    - Implement component in `src/components/landing/FeaturedEquipmentSection.tsx`
    - Create section header
    - Implement loading state with Spinner
    - Implement empty state with fallback message and CTA
    - Render grid of EquipmentCard components
    - Add "Browse All Equipment" CTA button
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ]* 8.2 Write unit tests for Featured Equipment Section
    - Test loading spinner displays when isLoading is true
    - Test empty state shows when no equipment
    - Test equipment cards render when data is available
    - _Requirements: 5.1, 5.4_

- [x] 9. Build Benefits Section
  - [x] 9.1 Create BenefitsSection component
    - Implement component in `src/components/landing/BenefitsSection.tsx`
    - Create section header
    - Create array of 6 benefits with icons:
      - Location-Based Search (MapPin icon)
      - Verified Providers (Shield icon)
      - Flexible Rentals (Clock icon)
      - Secure Payments (CreditCard icon)
      - Easy Booking (Smartphone icon)
      - 24/7 Support (Headphones icon)
    - Render benefits in responsive grid
    - Implement scroll-reveal animation for each benefit card
    - Apply hover effects (border color change, shadow lift)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 9.2 Write unit tests for Benefits Section
    - Test all 6 benefits are rendered
    - Test each benefit has correct title and icon
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 10. Build Impact and Trust Section
  - [x] 10.1 Create ImpactSection component
    - Implement component in `src/components/landing/ImpactSection.tsx`
    - Create section header
    - Add 3 AnimatedCounter components for statistics:
      - Total Users (with "+" suffix)
      - Total Equipment (with "+" suffix)
      - Categories Available
    - Render 2 TestimonialCard components with sample testimonials
    - Implement scroll-reveal animations
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 10.2 Add trust indicators
    - Add verified badge
    - Add secure payment badge
    - Apply glassmorphism styling
    - _Requirements: 7.4_
  
  - [ ]* 10.3 Write unit tests for Impact Section
    - Test statistics are displayed
    - Test testimonials render
    - Test trust badges are present
    - _Requirements: 7.1, 7.3, 7.4_

- [x] 11. Build App Preview Section
  - [x] 11.1 Create ScreenshotSlider component
    - Implement component in `src/components/landing/ScreenshotSlider.tsx`
    - Create auto-playing carousel with 3-second interval
    - Add pause on hover functionality
    - Implement smooth slide transitions
    - Add dot indicators for navigation
    - Add swipe support for mobile using touch events
    - _Requirements: 8.2_
  
  - [x] 11.2 Create AppPreviewSection component
    - Implement component in `src/components/landing/AppPreviewSection.tsx`
    - Create section header
    - Add mockup images for mobile and web apps
    - Integrate ScreenshotSlider with booking flow screenshots
    - Implement scroll-reveal animation for mockups
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 11.3 Write unit tests for App Preview Section
    - Test mockup images are displayed
    - Test screenshot slider is present
    - _Requirements: 8.1, 8.2_

- [x] 12. Build CTA Section
  - [x] 12.1 Create CTASection component
    - Implement component in `src/components/landing/CTASection.tsx`
    - Apply dark gradient background
    - Add emotional headline: "Farming is hard. Renting equipment shouldn't be."
    - Add subheading text
    - Create large primary CTA button "Start Renting Now"
    - Create secondary CTA button "List Your Equipment"
    - Link buttons to appropriate routes
    - Implement scroll-reveal animation
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 12.2 Write unit tests for CTA Section
    - Test emotional message is displayed
    - Test both CTA buttons are present
    - Test buttons link to correct routes
    - _Requirements: 9.2, 9.3, 9.4_

- [x] 13. Update Footer component
  - [x] 13.1 Enhance existing Footer component
    - Update `src/components/layout/footer.tsx`
    - Ensure clean, minimal design
    - Add navigation links (About, Help, Terms, Privacy)
    - Add social media links (Twitter, Facebook, Instagram)
    - Add trust and legal information
    - Ensure all links are keyboard focusable
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 13.2 Write unit tests for Footer
    - Test navigation links are present
    - Test social media links are present
    - Test legal information is displayed
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Integrate all sections into main landing page
  - [x] 15.1 Update main page component
    - Update `src/app/page.tsx`
    - Import all section components
    - Set up data fetching with useEffect
    - Fetch equipment data from equipmentService
    - Fetch statistics (calculate from equipment data)
    - Implement loading state management
    - Implement error handling with fallback content
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [x] 15.2 Compose page structure
    - Remove old landing page code
    - Add HeroSection with stats prop
    - Add TrustStrip (existing component)
    - Add HowItWorksSection
    - Add FeaturedEquipmentSection with equipment data
    - Add BenefitsSection
    - Add ImpactSection with stats and testimonials
    - Add AppPreviewSection
    - Add CTASection
    - Keep existing Footer
    - Wrap page in motion.div for page load animation
    - _Requirements: All sections_
  
  - [ ]* 15.3 Write integration tests for landing page
    - Test page loads and displays equipment data
    - Test API error handling shows fallback content
    - Test loading state displays spinner
    - _Requirements: 14.1, 14.3, 14.4_

- [x] 16. Implement responsive design
  - [x] 16.1 Add responsive breakpoints to all components
    - Review all components for mobile-first responsive classes
    - Ensure proper spacing on mobile (py-12) vs desktop (py-20)
    - Ensure grid layouts adapt (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
    - Ensure text sizes scale appropriately (text-4xl md:text-5xl lg:text-6xl)
    - Test on mobile (320px), tablet (768px), and desktop (1024px) viewports
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ]* 16.2 Write property test for touch target sizes
    - **Property 4: Touch Target Size Compliance**
    - **Validates: Requirements 11.4**

- [x] 17. Implement accessibility features
  - [x] 17.1 Add semantic HTML and ARIA attributes
    - Ensure proper heading hierarchy (h1 → h2 → h3)
    - Add descriptive alt text to all images
    - Add aria-labels to icon-only buttons
    - Add aria-live regions for dynamic content (counters, loading states)
    - Add skip-to-content link
    - _Requirements: 13.1, 13.2, 13.5_
  
  - [ ]* 17.2 Write property test for heading hierarchy
    - **Property 5: Heading Hierarchy Validity**
    - **Validates: Requirements 13.1**
  
  - [ ]* 17.3 Write property test for image alt text
    - **Property 6: Image Alt Text Presence**
    - **Validates: Requirements 13.2**
  
  - [ ]* 17.4 Write property test for keyboard focusability
    - **Property 7: Interactive Element Focusability**
    - **Validates: Requirements 13.5**
  
  - [x] 17.2 Implement keyboard navigation
    - Ensure all interactive elements are focusable
    - Add visible focus indicators with high contrast
    - Test tab order is logical
    - Add escape key handler for carousel
    - _Requirements: 13.5_
  
  - [x] 17.3 Add motion preferences support
    - Create useReducedMotion hook
    - Conditionally disable animations when prefers-reduced-motion is set
    - Provide simplified variants for reduced motion
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 17.4 Write accessibility tests
    - Run jest-axe on landing page
    - Test keyboard navigation works
    - Test focus indicators are visible
    - _Requirements: 13.1, 13.2, 13.5_

- [x] 18. Add SEO optimization
  - [x] 18.1 Add metadata to page
    - Update metadata export in `src/app/page.tsx`
    - Add title, description, keywords
    - Add Open Graph tags (title, description, image)
    - Add Twitter Card tags
    - _Requirements: 13.4_
  
  - [x] 18.2 Add structured data
    - Create JSON-LD structured data for WebSite schema
    - Add SearchAction for equipment search
    - Inject into page head
    - _Requirements: 13.4_
  
  - [ ]* 18.3 Write unit tests for SEO
    - Test meta tags are present
    - Test structured data is valid JSON-LD
    - _Requirements: 13.4_

- [x] 19. Performance optimization
  - [x] 19.1 Optimize images
    - Ensure all images use Next.js Image component
    - Set appropriate width and height props
    - Use priority prop for hero images
    - Use lazy loading for below-fold images
    - Set quality to 85 for balance
    - _Requirements: 12.1, 12.2, 12.5_
  
  - [x] 19.2 Implement code splitting
    - Use dynamic imports for ScreenshotSlider (client-side only)
    - Use dynamic imports for heavy animation components
    - Add loading fallbacks
    - _Requirements: 12.3_
  
  - [ ]* 19.3 Write performance tests
    - Test render time is under 100ms
    - Test Next.js Image is used for all images
    - _Requirements: 12.2, 12.5_

- [-] 20. Final testing and polish
  - [ ]* 20.1 Run all property-based tests
    - Execute all 7 property tests with 100 iterations each
    - Verify all properties pass
    - _Requirements: All testable properties_
  
  - [ ]* 20.2 Run all unit tests
    - Execute complete unit test suite
    - Verify 100% of unit tests pass
    - _Requirements: All unit test requirements_
  
  - [-] 20.3 Manual testing checklist
    - Test on Chrome, Firefox, Safari
    - Test on mobile devices (iOS, Android)
    - Test all animations are smooth
    - Test all links navigate correctly
    - Test loading states work
    - Test error states work
    - Verify color contrast with browser tools
    - Test keyboard navigation
    - Test with screen reader
    - _Requirements: All requirements_
  
  - [ ] 20.4 Performance audit
    - Run Lighthouse audit on mobile
    - Verify performance score is 90+
    - Fix any issues identified
    - _Requirements: 12.3_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- The implementation follows a bottom-up approach: utilities → components → sections → integration
- All animations use Framer Motion for consistency and performance
- All components follow mobile-first responsive design
- Accessibility is built in from the start, not added later
