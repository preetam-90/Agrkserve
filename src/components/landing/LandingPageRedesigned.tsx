'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CustomCursor } from './shared/CustomCursor';
import { ChapterSkeleton } from './shared/SectionStates';
import { LazyMount } from './shared/LazyMount';
import { LandingNavRedesigned } from './shared/LandingNavRedesigned';
import { MobileBottomActions } from './shared/MobileBottomActions';
import { LandingFooter } from './shared/LandingFooter';
import { AmbientBackdrop } from './shared/AmbientBackdrop';
import { ScrollTransitions } from './shared/ScrollTransitions';

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

interface DeferredChapterProps {
  children: ReactNode;
  title: string;
  anchorId?: string;
  rootMargin?: string;
}

function DeferredChapter({
  children,
  title,
  anchorId,
  rootMargin = '220px 0px',
}: DeferredChapterProps) {
  return (
    <LazyMount
      className="landing-deferred"
      rootMargin={rootMargin}
      fallback={<ChapterSkeleton id={anchorId} title={title} />}
    >
      {children}
    </LazyMount>
  );
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
  const { prefersReducedMotion, isKeyboardMode } = useAccessibility();

  return (
    <div
      className={`relative overflow-x-clip bg-[#030705] text-white ${fontClassName}`}
      style={{ fontFamily: 'var(--font-space-grotesk), var(--font-inter), sans-serif' }}
    >
      {/* Ambient background effects - mobile optimized */}
      <AmbientBackdrop reducedMotion={prefersReducedMotion} />

      {/* Custom cursor - only for desktop with mouse */}
      {!isMobileViewport && !prefersReducedMotion && !isKeyboardMode && <CustomCursor />}

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

        {/* Interactive 3D Tractor Experience - SKIP on mobile, loads heavy 3D */}
        {!isMobileViewport && (
          <DeferredChapter title="Loading 3D experience..." rootMargin="180px 0px">
            <InteractiveTractorChapter reducedMotion={prefersReducedMotion} />
          </DeferredChapter>
        )}

        {/* Feature Matrix */}
        <DeferredChapter
          title="Loading chapter: Features"
          anchorId="features"
          rootMargin="180px 0px"
        >
          <FeaturesChapter reducedMotion={prefersReducedMotion} />
        </DeferredChapter>

        {/* Provider Network */}
        <DeferredChapter
          title="Loading chapter: Provider Network"
          anchorId="provider-network"
          rootMargin="160px 0px"
        >
          <ProviderNetworkChapter reducedMotion={prefersReducedMotion} />
        </DeferredChapter>

        {/* Skilled Labour */}
        <DeferredChapter
          title="Loading chapter: Skilled Labour"
          anchorId="labour-network"
          rootMargin="160px 0px"
        >
          <SkilledLabourChapter reducedMotion={prefersReducedMotion} />
        </DeferredChapter>

        {/* How It Works */}
        <DeferredChapter
          title="Loading chapter: How It Works"
          anchorId="how-it-works"
          rootMargin="160px 0px"
        >
          <HowItWorksChapter reducedMotion={prefersReducedMotion} />
        </DeferredChapter>

        {/* Pricing removed */}

        {/* Future Vision */}
        <DeferredChapter title="Loading chapter: Future Vision" rootMargin="160px 0px">
          <FutureVisionChapter reducedMotion={prefersReducedMotion} />
        </DeferredChapter>

        {/* Final CTA - Conversion focused */}
        <DeferredChapter title="Loading final chapter..." rootMargin="140px 0px">
          <FinalCTAChapter reducedMotion={prefersReducedMotion} />
        </DeferredChapter>
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Mobile Quick Actions */}
      {isMobileViewport && <MobileBottomActions />}

      {/* Development performance tooling */}
      <LandingDevTools />
    </div>
  );
}

export default LandingPageRedesigned;
