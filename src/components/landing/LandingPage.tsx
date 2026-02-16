'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LazyMount } from './shared/LazyMount';
import { useLandingPerformance } from './shared/useLandingPerformance';
import { CustomCursor } from './shared/CustomCursor';
import { AmbientBackdrop } from './shared/AmbientBackdrop';

const HeroChapter = dynamic(() => import('./chapters/HeroChapter').then((mod) => mod.HeroChapter), {
  ssr: false,
  loading: () => <ChapterFallback title="Initializing cinematic launch..." />, 
});

const ProblemChapter = dynamic(
  () => import('./chapters/ProblemChapter').then((mod) => mod.ProblemChapter),
  {
    ssr: false,
    loading: () => <ChapterFallback title="Loading chapter: Problem" />,
  }
);

const InteractiveTractorChapter = dynamic(
  () =>
    import('./chapters/InteractiveTractorChapter').then((mod) => mod.InteractiveTractorChapter),
  {
    ssr: false,
    loading: () => <ChapterFallback title="Loading chapter: Interactive Tractor Bay" />,
  }
);

const EquipmentUniverseChapter = dynamic(
  () =>
    import('./chapters/EquipmentUniverseChapter').then((mod) => mod.EquipmentUniverseChapter),
  {
    ssr: false,
    loading: () => <ChapterFallback title="Loading chapter: Equipment Universe" />,
  }
);

const ProviderNetworkChapter = dynamic(
  () => import('./chapters/ProviderNetworkChapter').then((mod) => mod.ProviderNetworkChapter),
  {
    ssr: false,
    loading: () => <ChapterFallback title="Loading chapter: Provider Network" />,
  }
);

const SkilledLabourChapter = dynamic(
  () => import('./chapters/SkilledLabourChapter').then((mod) => mod.SkilledLabourChapter),
  {
    ssr: false,
    loading: () => <ChapterFallback title="Loading chapter: Skilled Labour Network" />,
  }
);

const HowItWorksChapter = dynamic(
  () => import('./chapters/HowItWorksChapter').then((mod) => mod.HowItWorksChapter),
  {
    ssr: false,
    loading: () => <ChapterFallback title="Loading chapter: How It Works" />,
  }
);

const FutureVisionChapter = dynamic(
  () => import('./chapters/FutureVisionChapter').then((mod) => mod.FutureVisionChapter),
  {
    ssr: false,
    loading: () => <ChapterFallback title="Loading chapter: Future Vision" />,
  }
);

const FinalCTAChapter = dynamic(
  () => import('./chapters/FinalCTAChapter').then((mod) => mod.FinalCTAChapter),
  {
    ssr: false,
    loading: () => <ChapterFallback title="Loading final transmission..." />,
  }
);

interface LandingPageProps {
  fontClassName?: string;
}

function ChapterFallback({ title }: { title: string }) {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="rounded-[1.8rem] border border-emerald-300/15 bg-black/35 px-6 py-4 text-sm uppercase tracking-[0.22em] text-emerald-100/70 backdrop-blur-xl">
        {title}
      </div>
    </section>
  );
}

function FloatingMobileCTAs() {
  const buttons = [
    { label: 'Book Equipment', href: '/equipment' },
    { label: 'List Equipment', href: '/provider/equipment' },
    { label: 'Hire Labour', href: '/labour' },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] px-3 pb-4 md:hidden">
      <div className="pointer-events-auto flex gap-2 overflow-x-auto rounded-2xl border border-emerald-400/25 bg-black/70 p-2 backdrop-blur-xl">
        {buttons.map((button) => (
          <Link
            key={button.href}
            href={button.href}
            className="shrink-0 rounded-xl border border-cyan-200/25 bg-gradient-to-r from-emerald-400/25 to-cyan-300/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
          >
            {button.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-[110] px-4 py-4 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/35 px-4 py-2.5 backdrop-blur-xl md:px-6">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200"
        >
          AgriServe // Launch
        </Link>
        <nav className="hidden items-center gap-5 text-xs uppercase tracking-[0.18em] text-white/70 md:flex">
          <a href="#problem" className="transition-colors hover:text-emerald-200">
            Problem
          </a>
          <a href="#tractor-experience" className="transition-colors hover:text-emerald-200">
            Tractor
          </a>
          <a href="#equipment-universe" className="transition-colors hover:text-emerald-200">
            Equipment
          </a>
          <a href="#provider-network" className="transition-colors hover:text-emerald-200">
            Providers
          </a>
          <a href="#labour-network" className="transition-colors hover:text-emerald-200">
            Labour
          </a>
        </nav>
        <Link
          href="/equipment"
          className="rounded-full border border-emerald-300/35 bg-emerald-300/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100 transition hover:bg-emerald-300/25"
          data-magnetic
        >
          Enter Platform
        </Link>
      </div>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className="relative z-40 border-t border-white/10 bg-black px-6 py-10 text-[11px] uppercase tracking-[0.18em] text-white/60 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>AgriServe Cinematic Landing Experience</p>
        <p>Equipment Rental • Provider Marketplace • Skilled Labour Network</p>
      </div>
    </footer>
  );
}

export function LandingPage({ fontClassName = '' }: LandingPageProps) {
  const runtime = useLandingPerformance();

  return (
    <div
      className={`relative overflow-x-clip bg-[#030705] text-white ${fontClassName}`}
      style={{ fontFamily: 'var(--font-space-grotesk), var(--font-inter), sans-serif' }}
    >
      <AmbientBackdrop reducedMotion={runtime.prefersReducedMotion} />
      {!runtime.prefersReducedMotion && <CustomCursor />}
      <LandingNav />

      <motion.main
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <HeroChapter runtime={runtime} />

        <LazyMount rootMargin="280px">
          <ProblemChapter reducedMotion={runtime.prefersReducedMotion} />
        </LazyMount>

        <LazyMount rootMargin="260px">
          <InteractiveTractorChapter reducedMotion={runtime.prefersReducedMotion} />
        </LazyMount>

        <LazyMount rootMargin="280px">
          <EquipmentUniverseChapter reducedMotion={runtime.prefersReducedMotion} />
        </LazyMount>

        <LazyMount rootMargin="280px">
          <ProviderNetworkChapter reducedMotion={runtime.prefersReducedMotion} />
        </LazyMount>

        <LazyMount rootMargin="280px">
          <SkilledLabourChapter reducedMotion={runtime.prefersReducedMotion} />
        </LazyMount>

        <LazyMount rootMargin="260px">
          <HowItWorksChapter reducedMotion={runtime.prefersReducedMotion} />
        </LazyMount>

        <LazyMount rootMargin="240px">
          <FutureVisionChapter reducedMotion={runtime.prefersReducedMotion} />
        </LazyMount>

        <LazyMount rootMargin="200px">
          <FinalCTAChapter reducedMotion={runtime.prefersReducedMotion} />
        </LazyMount>
      </motion.main>

      <LandingFooter />
      <FloatingMobileCTAs />
    </div>
  );
}
