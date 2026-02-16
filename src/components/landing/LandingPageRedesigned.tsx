'use client';

import dynamic from 'next/dynamic';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ChapterSkeleton } from './shared/SectionStates';
import { LandingNavRedesigned } from './shared/LandingNavRedesigned';
import { MobileBottomActions } from './shared/MobileBottomActions';
import { LandingPageFooter } from './shared/LandingPageFooter';
import { AmbientBackdrop } from './shared/AmbientBackdrop';
import { ScrollTransitions } from './shared/ScrollTransitions';
import { ScrollProgress } from './ScrollProgress';

// Dynamic imports with loading states
const HeroChapter = dynamic(
  () => import('./chapters/HeroChapterRedesigned').then((mod) => mod.HeroChapter),
  {
    loading: () => <ChapterSkeleton title="Initializing launch sequence..." />,
  }
);

const ProblemChapter = dynamic(
  () => import('./chapters/ProblemChapterRedesigned').then((mod) => mod.ProblemChapterRedesigned),
  {
    loading: () => <ChapterSkeleton title="Loading chapter: Problem" />,
  }
);

const FeaturesChapter = dynamic(
  () => import('./chapters/FeaturesChapterRedesigned').then((mod) => mod.FeaturesChapterRedesigned),
  {
    ssr: false,
    loading: () => <ChapterSkeleton title="Loading chapter: Features" />,
  }
);

const FinalCTAChapter = dynamic(
  () => import('./chapters/FinalCTAChapterRedesigned').then((mod) => mod.FinalCTAChapterRedesigned),
  {
    ssr: false,
    loading: () => <ChapterSkeleton title="Loading final chapter..." />,
  }
);

// Existing chapters to keep (with minor updates)
const InteractiveTractorChapter = dynamic(
  () => import('./chapters/InteractiveTractorChapter').then((mod) => mod.InteractiveTractorChapter),
  {
    ssr: false,
    loading: () => <ChapterSkeleton title="Loading 3D experience..." />,
  }
);

const ProviderNetworkChapter = dynamic(
  () => import('./chapters/ProviderNetworkChapter').then((mod) => mod.ProviderNetworkChapter),
  {
    ssr: false,
    loading: () => <ChapterSkeleton title="Loading chapter: Provider Network" />,
  }
);

const SkilledLabourChapter = dynamic(
  () => import('./chapters/SkilledLabourChapter').then((mod) => mod.SkilledLabourChapter),
  {
    ssr: false,
    loading: () => <ChapterSkeleton title="Loading chapter: Skilled Labour" />,
  }
);

const HowItWorksChapter = dynamic(
  () => import('./chapters/HowItWorksChapter').then((mod) => mod.HowItWorksChapter),
  {
    ssr: false,
    loading: () => <ChapterSkeleton title="Loading chapter: How It Works" />,
  }
);

const FutureVisionChapter = dynamic(
  () => import('./chapters/FutureVisionChapter').then((mod) => mod.FutureVisionChapter),
  {
    ssr: false,
    loading: () => <ChapterSkeleton title="Loading chapter: Future Vision" />,
  }
);

// Mobile-optimized hero - NO video, NO GSAP, CSS-only animations for fast LCP
const HeroChapterMobile = dynamic(
  () =>
    import('./chapters/HeroChapterMobileOptimized').then((mod) => mod.HeroChapterMobileOptimized),
  {
    ssr: true,
    loading: () => <ChapterSkeleton title="Loading..." />,
  }
);

const LandingDevTools =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SHOW_DEV_PERF_OVERLAY === 'true'
    ? dynamic(() => import('./shared/PerformanceMonitor').then((mod) => mod.LandingDevTools), {
        ssr: false,
      })
    : () => null;

interface LandingPageProps {
  fontClassName?: string;
  initialIsMobile?: boolean;
}

/**
 * Landing Page - Redesigned
 *
 * Premium cinematic landing experience for AgriServe
 *
 * Architecture:
 * 1. Performance-first lazy loading
 * 2. Progressive enhancement
 * 3. Accessibility built-in
 * 4. Device-aware animations
 * 5. World-class UX patterns
 */
export function LandingPageRedesigned({
  fontClassName = '',
  initialIsMobile = false,
}: LandingPageProps) {
  const isMobileViewport = useMediaQuery('(max-width: 767px)', initialIsMobile);
  const { prefersReducedMotion } = useAccessibility();

  return (
    <div
      className={`relative overflow-x-clip bg-[#030705] text-white ${fontClassName}`}
      style={{ fontFamily: 'var(--font-space-grotesk), var(--font-inter), sans-serif' }}
    >
      {/* Ambient background effects - mobile optimized */}
      <AmbientBackdrop reducedMotion={prefersReducedMotion} />

      {/* Scroll Progress Bar with Logo */}
      <ScrollProgress />

      {/* Navigation */}
      <LandingNavRedesigned />

      {/* Main Content */}
      <main id="main-content" className="relative z-10" role="main" aria-label="Main content">
        {/* Scroll transitions orchestrator — adds cinema-quality entrance animations */}
        {!prefersReducedMotion && <ScrollTransitions reducedMotion={prefersReducedMotion} />}
        {/* Hero Section - Adaptive based on screen size */}
        {isMobileViewport ? (
          <HeroChapterMobile />
        ) : (
          <HeroChapter
            runtime={{
              tier: 'high',
              enableFull3D: true,
              enableLite3D: true,
              useVideoFallback: false,
              prefersReducedMotion,
            }}
          />
        )}

        {/* Problem → Solution Chapter - in-place cinematic handoff */}
        <ProblemChapter
          reducedMotion={prefersReducedMotion}
          variant={isMobileViewport ? 'mobile' : 'desktop'}
        />

        {/* Interactive 3D Tractor Experience - SKIP on mobile */}
        {!isMobileViewport && (
          <InteractiveTractorChapter reducedMotion={prefersReducedMotion} />
        )}

        {/* Feature Matrix - loads automatically after previous component */}
        <FeaturesChapter reducedMotion={prefersReducedMotion} />

        {/* Provider Network - loads automatically */}
        <ProviderNetworkChapter reducedMotion={prefersReducedMotion} />

        {/* Skilled Labour - loads automatically */}
        <SkilledLabourChapter reducedMotion={prefersReducedMotion} />

        {/* How It Works - loads automatically */}
        <HowItWorksChapter reducedMotion={prefersReducedMotion} />

        {/* Future Vision - loads automatically */}
        <FutureVisionChapter reducedMotion={prefersReducedMotion} />

        {/* Final CTA - loads automatically */}
        <FinalCTAChapter reducedMotion={prefersReducedMotion} />
      </main>

      {/* Footer */}
      <LandingPageFooter />

      {/* Mobile Quick Actions */}
      {isMobileViewport && <MobileBottomActions />}

      {/* Development performance tooling */}
      <LandingDevTools />
    </div>
  );
}

export default LandingPageRedesigned;
