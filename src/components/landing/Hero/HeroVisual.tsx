'use client';

import dynamic from 'next/dynamic';
import { useMemo, useSyncExternalStore } from 'react';
import { useLandingPerformance } from '../shared/useLandingPerformance';

const HeroCanvas = dynamic(() => import('./HeroVisualCanvas').then((mod) => mod.HeroVisualCanvas), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_25%_20%,rgba(34,197,94,0.2),transparent_45%),radial-gradient(circle_at_75%_70%,rgba(6,182,212,0.25),transparent_55%),#050a08]" />
  ),
});

export function HeroVisual() {
  const perf = useLandingPerformance();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const fallback = useMemo(
    () => (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.28),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(6,182,212,0.22),transparent_52%),linear-gradient(160deg,#040805_20%,#0b120f_75%,#071410_100%)]" />
    ),
    []
  );

  // Keep SSR and initial client render identical to avoid hydration mismatches.
  if (!hydrated) {
    return fallback;
  }

  if (perf.useVideoFallback) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {fallback}
        <video
          className="h-full w-full object-cover opacity-45"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/farm-bg.jpg"
        >
          <source src="/hero-farm.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }

  if (!perf.enableLite3D) {
    return fallback;
  }

  return <HeroCanvas lite={!perf.enableFull3D} />;
}
