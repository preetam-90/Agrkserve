/**
 * Mobile-Optimized Hero Chapter
 *
 * A simplified, performance-focused version of the hero section for mobile devices
 * Provides the same core messaging with reduced visual complexity
 */

'use client';

import { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Tractor,
  Users,
  Wrench,
  Sparkles,
  ShieldCheck,
  Globe2,
  Gauge,
  ChevronDown,
} from 'lucide-react';
import { TrustLayer, SupportCTA } from '../shared/TrustLayer';
import { safeGsapRevert } from '../shared/safeGsapRevert';
import { MagneticButton } from '../shared/MagneticButton';
import { useDeviceCapabilities } from '@/lib/device-detection';
import { useAccessibility } from '@/hooks/useAccessibility';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const HEADLINE_LINES = [
  "INDIA'S AGRI",
  'OPERATING SYSTEM',
  'Built for Scale. Built to Win.',
] as const;

const TELEMETRY_CHIPS = [
  {
    value: '120K+',
    label: 'Verified Providers',
    icon: ShieldCheck,
  },
  {
    value: '2.4M',
    label: 'Active Farmers',
    icon: Globe2,
  },
  {
    value: '780+',
    label: 'District Coverage',
    icon: Gauge,
  },
] as const;

interface HeroChapterProps {
  runtime?: {
    tier: 'high' | 'mid' | 'low';
    enableFull3D: boolean;
    enableLite3D: boolean;
    useVideoFallback: boolean;
    prefersReducedMotion: boolean;
  };
}

/**
 * Simplified video background for mobile
 */
function MobileHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const scheduleLoad = () => setShouldLoadVideo(true);

    if (typeof window === 'undefined') return;

    const browserWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof browserWindow.requestIdleCallback === 'function') {
      const idleId = browserWindow.requestIdleCallback(scheduleLoad, { timeout: 1600 });
      return () => browserWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(scheduleLoad, 700);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo) return;

    const video = videoRef.current;
    if (!video) return;

    // Mobile video optimization
    const playVideo = () => {
      video.play().catch(() => {
        // Retry on first user interaction
        const handleInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
          document.removeEventListener('scroll', handleInteraction);
        };
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('touchstart', handleInteraction, { once: true });
        document.addEventListener('scroll', handleInteraction, { once: true });
      });
    };

    // Wait for video to be ready
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', playVideo);
    };
  }, [shouldLoadVideo]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster="/Landingpagevideo-poster.jpg"
    >
      {shouldLoadVideo && <source src="/Landingpagevideo-mobile.webm" type="video/webm" />}
    </video>
  );
}

export function HeroChapterMobile({ runtime }: HeroChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion || runtime?.prefersReducedMotion);
  const lowTier = runtime?.tier === 'low';
  const enableRichFx = !reduceMotion && !lowTier;

  // Device capabilities for adaptive rendering
  const deviceCapabilities = useDeviceCapabilities();
  const accessibility = useAccessibility();

  const shouldRenderVideo =
    !deviceCapabilities.isLowEnd &&
    deviceCapabilities.connection !== 'slow-2g' &&
    deviceCapabilities.connection !== '2g' &&
    !accessibility.prefersReducedMotion;

  const enableScrollParallax = !deviceCapabilities.isLowEnd && !accessibility.prefersReducedMotion;

  useLayoutEffect(() => {
    if (!sectionRef.current || reduceMotion || accessibility.prefersReducedMotion) return;

    const section = sectionRef.current;

    const context = gsap.context(() => {
      // Mobile-optimized animation durations
      const baseDuration = deviceCapabilities.isLowEnd
        ? 1.8
        : deviceCapabilities.isHighEnd
          ? 0.6
          : 1.2;

      const intro = gsap.timeline({ delay: 0.1 }); // Reduced delay for mobile

      intro.from('.hero-kicker', {
        opacity: 0,
        y: 16,
        duration: 0.5 * baseDuration,
        ease: 'power2.out',
      });

      intro.from(
        '.hero-headline-line',
        {
          opacity: 0,
          yPercent: 80,
          filter: 'blur(8px)',
          stagger: 0.1 * baseDuration,
          duration: 0.8 * baseDuration,
          ease: 'power2.out',
        },
        '-=0.15'
      );

      intro.from(
        '.hero-subcopy',
        {
          opacity: 0,
          y: 12,
          filter: 'blur(4px)',
          duration: 0.4 * baseDuration,
          ease: 'power2.out',
        },
        '-=0.4'
      );

      intro.from(
        '.hero-action',
        {
          opacity: 0,
          y: 12,
          scale: 0.98,
          stagger: 0.08 * baseDuration,
          duration: 0.4 * baseDuration,
          ease: 'back.out(1.2)',
        },
        '-=0.3'
      );

      intro.from(
        '.hero-signal',
        {
          opacity: 0,
          y: 12,
          stagger: 0.06 * baseDuration,
          duration: 0.35 * baseDuration,
          ease: 'power2.out',
        },
        '-=0.2'
      );

      intro.from(
        '.hero-trust',
        {
          opacity: 0,
          y: 14,
          stagger: 0.08 * baseDuration,
          duration: 0.4 * baseDuration,
          ease: 'power2.out',
        },
        '-=0.25'
      );

      intro.from(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          y: -8,
          duration: 0.3 * baseDuration,
          ease: 'power2.out',
        },
        '-=0.2'
      );

      if (enableScrollParallax) {
        // Keep subtle parallax only on capable devices to reduce mobile main-thread work.
        const scrubValue = deviceCapabilities.isHighEnd ? 0.6 : 1.2;

        gsap.to('.hero-video-layer', {
          scale: 1.05,
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom+=80 top',
            scrub: scrubValue * 1.1,
          },
        });

        gsap.to('.hero-mid-layer', {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom+=80 top',
            scrub: scrubValue * 0.9,
          },
        });

        gsap.to('.hero-foreground-layer', {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom+=80 top',
            scrub: scrubValue,
          },
        });
      }
    }, section);

    return () => {
      safeGsapRevert(context);
    };
  }, [
    enableRichFx,
    reduceMotion,
    accessibility.prefersReducedMotion,
    deviceCapabilities.isLowEnd,
    deviceCapabilities.isHighEnd,
    enableScrollParallax,
  ]);

  return (
    <section
      id="hero-chapter-mobile"
      ref={sectionRef}
      className="relative isolate min-h-[80vh] overflow-hidden bg-[#040806] md:hidden"
      aria-label="Welcome to AgriServe - Mobile"
    >
      {/* Simplified Video Background - Conditionally rendered */}
      {shouldRenderVideo && (
        <div className="hero-video-layer absolute inset-0 transform-gpu will-change-transform">
          <MobileHeroVideo />
          <div className="absolute inset-0 bg-gradient-to-b from-[#041009]/60 via-[#041009]/40 to-[#040806]" />
        </div>
      )}

      {/* Simplified mid-layer effects */}
      <div className="hero-mid-layer pointer-events-none absolute inset-0 transform-gpu will-change-transform">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-[conic-gradient(from_180deg_at_50%_100%,rgba(16,185,129,0.25),rgba(16,185,129,0)_28%,rgba(45,212,191,0.18)_65%,rgba(45,212,191,0)_100%)] opacity-35 blur-xl" />
      </div>

      {/* Filmic overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(0,0,0,0),rgba(0,0,0,0.8))]" />
      <div className="hero-scanline pointer-events-none absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(to_bottom,rgba(180,255,224,0.05)_0px,rgba(180,255,224,0.05)_1px,transparent_1px,transparent_3px)]" />
      <div
        className="hero-grain pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 0.3px, transparent 0.3px)',
          backgroundSize: '1px 1px',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Hero Content */}
      <div className="hero-foreground-layer relative z-20 mx-auto grid min-h-[80vh] w-full max-w-[var(--landing-max-width)] grid-cols-1 gap-6 px-[var(--landing-padding-x)] pb-[max(5rem,10vh)] pt-[max(4rem,8vh)]">
        <div className="max-w-2xl">
          <motion.div className="hero-kicker mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/20 bg-black/35 px-3 py-1.5 backdrop-blur-xl">
            <Sparkles className="h-3 w-3 text-emerald-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/90">
              Live Market Intelligence
            </span>
          </motion.div>

          <h1 className="mb-4">
            {HEADLINE_LINES.map((line, index) => (
              <span key={line} className="block overflow-hidden">
                <span
                  className={`hero-headline-line block uppercase leading-[0.95] ${
                    index === 0
                      ? 'text-[clamp(1.8rem,8vw,4rem)] font-black tracking-[-0.035em] text-white'
                      : index === 1
                        ? 'bg-[linear-gradient(96deg,#d9f99d_0%,#34d399_45%,#2dd4bf_100%)] bg-clip-text text-[clamp(1.8rem,7.5vw,3.5rem)] font-black tracking-[-0.035em] text-transparent'
                        : 'text-white/82 text-[clamp(1rem,2.5vw,1.6rem)] font-semibold tracking-[0.18em]'
                  }`}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p className="hero-subcopy mb-6 max-w-xl text-sm leading-relaxed text-white/80">
            The command network for modern agriculture: instant equipment access, real-time provider
            matching, and nationwide dispatch intelligence.
          </p>

          <div className="hero-actions mb-8 flex flex-col gap-3">
            <div className="hero-action">
              <MagneticButton
                href="/equipment"
                magnetic="off"
                strength={0.25}
                className="landing-touch w-full justify-center border-emerald-100/15 bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-200 px-6 py-3 text-sm font-black tracking-[0.12em] text-[#052818] shadow-[0_16px_60px_rgba(74,222,128,0.3)]"
              >
                <span className="flex items-center gap-2">
                  <Tractor className="h-3 w-3" />
                  <span>Book Equipment</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </MagneticButton>
            </div>

            <div className="hero-action">
              <MagneticButton
                href="/provider/equipment"
                magnetic="off"
                strength={0.2}
                className="landing-touch w-full justify-center border-emerald-100/30 bg-black/35 px-6 py-3 text-sm font-semibold tracking-[0.14em] text-white hover:border-emerald-200/55 hover:bg-emerald-300/10"
              >
                <span className="flex items-center gap-2">
                  <Wrench className="h-3 w-3 text-emerald-200" />
                  <span>List Equipment</span>
                </span>
              </MagneticButton>
            </div>

            <div className="hero-action">
              <MagneticButton
                href="/labour"
                magnetic="off"
                strength={0.2}
                className="landing-touch w-full justify-center border-cyan-100/30 bg-black/35 px-6 py-3 text-sm font-semibold tracking-[0.14em] text-white hover:border-cyan-200/65 hover:bg-cyan-300/10"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-cyan-200" />
                  <span>Hire Labour</span>
                </span>
              </MagneticButton>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-2">
            {TELEMETRY_CHIPS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="hero-signal rounded-xl border border-white/15 bg-black/35 p-3 backdrop-blur-xl"
              >
                <Icon className="mb-1 h-3 w-3 text-emerald-300" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
                  {label}
                </p>
                <p className="mt-1 text-lg font-black tracking-tight text-emerald-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="hero-trust mb-6">
            <TrustLayer variant="hero" />
          </div>

          <div className="hero-trust">
            <SupportCTA />
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Simplified for mobile */}
      <div ref={scrollIndicatorRef} className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <motion.div
          animate={reduceMotion || accessibility.prefersReducedMotion ? {} : { y: [0, 6, 0] }}
          transition={{
            duration: deviceCapabilities.isLowEnd ? 2.0 : 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-xs uppercase tracking-[0.16em] text-white/40">Scroll</span>
          <ChevronDown className="h-4 w-4 text-white/40" />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroChapterMobile;
