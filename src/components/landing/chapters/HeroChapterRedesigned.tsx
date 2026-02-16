'use client';

import { useLayoutEffect, useRef, useEffect } from 'react';
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
  Radar,
  Cpu,
  CircleCheck,
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

const FLOATING_CHIPS = [
  { label: 'AI MATCHING', value: 'LIVE', top: '16%', left: '58%' },
  { label: 'DISPATCHED', value: '1,284', top: '30%', left: '74%' },
  { label: 'VERIFIED', value: '24/7', top: '63%', left: '62%' },
] as const;

const COMMAND_STAGES = [
  {
    title: 'Demand Intake',
    status: 'LIVE',
    detail: 'Farmer request validated and geo-tagged',
    width: '92%',
  },
  {
    title: 'AI Matching',
    status: 'VERIFIED',
    detail: 'Provider and operator matched by SLA',
    width: '78%',
  },
  {
    title: 'Dispatch Orchestration',
    status: 'DISPATCHED',
    detail: 'Machine + crew assigned to route',
    width: '88%',
  },
] as const;

const DUST_PARTICLES = [
  { top: '18%', left: '12%', size: 2 },
  { top: '34%', left: '17%', size: 3 },
  { top: '49%', left: '8%', size: 2 },
  { top: '62%', left: '16%', size: 3 },
  { top: '74%', left: '10%', size: 2 },
  { top: '22%', left: '83%', size: 2 },
  { top: '39%', left: '90%', size: 3 },
  { top: '57%', left: '84%', size: 2 },
  { top: '71%', left: '88%', size: 3 },
  { top: '81%', left: '78%', size: 2 },
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
 * Background video layer - auto-playing hero video with scroll-based pause
 * Performance optimized: pauses when scrolled past to save CPU/GPU
 */
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Attempt to play immediately
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

    // Intersection Observer to pause video when scrolled past hero section
    // This saves CPU/GPU resources for the rest of the page
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Video is in view - play it
          if (video.paused && video.readyState >= 3) {
            video.play().catch(() => {});
          }
        } else {
          // Video is out of view - pause to save resources
          if (!video.paused) {
            video.pause();
          }
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of video is visible
        rootMargin: '100px 0px', // Start slightly before video enters viewport
      }
    );

    observer.observe(container);

    return () => {
      video.removeEventListener('canplay', playVideo);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/Landingpagevideo-poster.jpg"
      >
        <source src="/Landingpagevideo.webm" type="video/webm" />
      </video>
    </div>
  );
}

export function HeroChapter({ runtime }: HeroChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion || runtime?.prefersReducedMotion);
  const lowTier = runtime?.tier === 'low';
  const enableRichFx = !reduceMotion && !lowTier;

  // Device capabilities for adaptive rendering
  const deviceCapabilities = useDeviceCapabilities();
  const accessibility = useAccessibility();

  // Adaptive cursor effect - only for high-end devices and when not in reduced motion
  useEffect(() => {
    if (
      !sectionRef.current ||
      reduceMotion ||
      accessibility.isKeyboardMode ||
      deviceCapabilities.isLowEnd
    ) {
      return;
    }

    const section = sectionRef.current;
    let raf = 0;
    let targetX = 50;
    let targetY = 48;
    let currentX = 50;
    let currentY = 48;

    const tick = () => {
      // Adjust animation speed based on device capability
      const speed = deviceCapabilities.isHighEnd ? 0.15 : 0.1;
      currentX += (targetX - currentX) * speed;
      currentY += (targetY - currentY) * speed;
      section.style.setProperty('--cursor-x', `${currentX}%`);
      section.style.setProperty('--cursor-y', `${currentY}%`);
      raf = 0;
    };

    const schedule = () => {
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
      schedule();
    };

    const handlePointerLeave = () => {
      targetX = 50;
      targetY = 48;
      schedule();
    };

    section.addEventListener('pointermove', handlePointerMove);
    section.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [
    enableRichFx,
    reduceMotion,
    accessibility.isKeyboardMode,
    deviceCapabilities.isLowEnd,
    deviceCapabilities.isHighEnd,
  ]);

  useLayoutEffect(() => {
    if (!sectionRef.current || reduceMotion || accessibility.prefersReducedMotion) return;

    const section = sectionRef.current;

    const context = gsap.context(() => {
      // Adjust animation duration based on device capability
      const baseDuration = deviceCapabilities.isLowEnd
        ? 0.8
        : deviceCapabilities.isHighEnd
          ? 0.4
          : 0.6;

      // === PHASE 1: Cinematic intro sequence ===
      const intro = gsap.timeline({ delay: 0.15 });

      // Kicker badge — slide in with blur dissolve
      intro.from('.hero-kicker', {
        opacity: 0,
        y: 20,
        filter: 'blur(8px)',
        duration: 0.6 * baseDuration,
        ease: 'power3.out',
      });

      // Headline lines — dramatic reveal with clip-path + blur
      intro.from(
        '.hero-headline-line',
        {
          opacity: 0,
          yPercent: 120,
          filter: 'blur(16px)',
          rotateX: -12,
          transformOrigin: 'bottom center',
          stagger: 0.12 * baseDuration,
          duration: 1.15 * baseDuration,
          ease: 'expo.out',
        },
        '-=0.15'
      );

      // Subcopy — smooth fade with blur
      intro.from(
        '.hero-subcopy',
        {
          opacity: 0,
          y: 22,
          filter: 'blur(8px)',
          duration: 0.65 * baseDuration,
          ease: 'power3.out',
        },
        '-=0.6'
      );

      // CTA buttons — spring in with elastic bounce
      intro.from(
        '.hero-action',
        {
          opacity: 0,
          y: 24,
          scale: 0.88,
          stagger: 0.1 * baseDuration,
          duration: 0.7 * baseDuration,
          ease: 'back.out(2.2)',
        },
        '-=0.45'
      );

      // Telemetry chips — cascade with 3D tilt
      intro.from(
        '.hero-signal',
        {
          opacity: 0,
          y: 28,
          rotateY: -8,
          scale: 0.92,
          stagger: 0.09 * baseDuration,
          duration: 0.6 * baseDuration,
          ease: 'power3.out',
          clearProps: 'rotateY',
        },
        '-=0.3'
      );

      // Command panel — cinematic slide from right with scale
      intro.from(
        '.hero-panel',
        {
          opacity: 0,
          x: 50,
          scale: 0.94,
          rotateY: -6,
          filter: 'blur(6px)',
          duration: 0.9 * baseDuration,
          ease: 'power3.out',
          clearProps: 'filter,rotateY',
        },
        '-=0.6'
      );

      // Trust layer elements — smooth staggered reveal
      intro.from(
        '.hero-trust',
        {
          opacity: 0,
          y: 18,
          stagger: 0.08 * baseDuration,
          duration: 0.5 * baseDuration,
          ease: 'power2.out',
        },
        '-=0.35'
      );

      // Scroll indicator
      intro.from(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          y: -14,
          duration: 0.4 * baseDuration,
          ease: 'power2.out',
        },
        '-=0.2'
      );

      // Progress bars — scale-in with glow
      intro.from(
        '.hero-progress-fill',
        {
          scaleX: 0,
          transformOrigin: 'left center',
          stagger: 0.14 * baseDuration,
          duration: 0.75 * baseDuration,
          ease: 'power4.out',
        },
        '-=0.5'
      );

      // === PHASE 2: Continuous cinematic loops ===
      if (deviceCapabilities.isHighEnd) {
        // Floating chips — pulsed Y oscillation
        gsap.to('.hero-float', {
          y: -12,
          duration: 2.1 * baseDuration,
          stagger: 0.15 * baseDuration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        // Beam lights — slow drift
        gsap.to('.hero-beam-left', {
          xPercent: 9,
          yPercent: -7,
          duration: 7 * baseDuration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to('.hero-beam-right', {
          xPercent: -8,
          yPercent: 9,
          duration: 8 * baseDuration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to('.hero-grain', {
          backgroundPosition: '240px 160px',
          duration: 5 * baseDuration,
          repeat: -1,
          ease: 'none',
        });

        gsap.to('.hero-scanline', {
          backgroundPositionY: '-80px',
          duration: 3.5 * baseDuration,
          repeat: -1,
          ease: 'none',
        });

        // Ambient glow — breathing pulse with variable intensity
        gsap.to('.hero-ambient-glow', {
          opacity: 0.62,
          duration: 1.8 * baseDuration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        // Dust particle drift — organic floating movement
        if (enableRichFx) {
          gsap.utils.toArray<HTMLElement>('.hero-dust').forEach((node, index) => {
            gsap.to(node, {
              y: -70 - (index % 4) * 14,
              x: index % 2 === 0 ? 18 : -18,
              opacity: index % 3 === 0 ? 0.44 : 0.28,
              duration: 4.5 + (index % 3),
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            });
          });
        }

        // Command console stages — subtle pulse glow on active stage
        gsap.to('.hero-console-shell', {
          boxShadow: '0 32px 160px rgba(74,222,128,0.12), 0 0 80px rgba(16,185,129,0.08)',
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // === PHASE 3: Scroll parallax layers ===
      const scrubValue = deviceCapabilities.isLowEnd
        ? 1.5
        : deviceCapabilities.isHighEnd
          ? 0.8
          : 1.0;

      // Video layer — zooms and drifts on scroll
      gsap.to('.hero-video-layer', {
        scale: 1.06,
        yPercent: 4,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom+=150 top',
          scrub: scrubValue * 1.6,
        },
      });

      // Mid-layer fog — counter-parallax for depth
      gsap.to('.hero-mid-layer', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom+=150 top',
          scrub: scrubValue * 1.4,
        },
      });

      // Foreground — fastest parallax layer
      gsap.to('.hero-foreground-layer', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom+=150 top',
          scrub: scrubValue * 1.2,
        },
      });

      // Scroll-driven content fade + scale for exit
      gsap.to('.hero-foreground-layer', {
        opacity: 0,
        scale: 0.97,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: '60% top',
          end: 'bottom top',
          scrub: scrubValue * 1.0,
        },
      });

      if (deviceCapabilities.isHighEnd) {
        // Console panel — subtle drift and scale on scroll
        gsap.to('.hero-console-shell', {
          scale: 1.08,
          xPercent: -10,
          yPercent: -3,
          transformOrigin: 'center center',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 20%',
            end: 'bottom top',
            scrub: scrubValue * 1.4,
          },
        });

        // Dashboard preview — cinematic reveal on deep scroll
        gsap.fromTo(
          '.hero-dashboard-preview',
          { autoAlpha: 0, y: 90, scale: 0.92, filter: 'blur(8px)' },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: '35% center',
              end: 'bottom top',
              scrub: scrubValue * 1.3,
            },
          }
        );
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
  ]);

  return (
    <section
      id="hero-chapter"
      ref={sectionRef}
      className="relative isolate min-h-[90vh] overflow-hidden bg-[#040806]"
      aria-label="Welcome to AgriServe"
    >
      {/* Video Background - Auto-playing hero video */}
      <div className="hero-video-layer absolute inset-0 transform-gpu will-change-transform">
        <HeroVideo />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#040806]" />
      </div>

      {/* Mid-layer cinematic fog + light rays - Adaptive rendering */}
      <div className="hero-mid-layer pointer-events-none absolute inset-0 transform-gpu will-change-transform">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(16,185,129,0.34),transparent_34%),radial-gradient(circle_at_84%_73%,rgba(45,212,191,0.18),transparent_38%)]" />
        {!deviceCapabilities.isLowEnd && (
          <>
            <div className="hero-beam-left absolute -left-28 top-4 h-[22rem] w-[22rem] rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="hero-beam-right bg-cyan-300/16 absolute -right-24 bottom-8 h-[24rem] w-[24rem] rounded-full blur-3xl" />
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 h-[52vh] bg-[conic-gradient(from_180deg_at_50%_100%,rgba(16,185,129,0.3),rgba(16,185,129,0)_28%,rgba(45,212,191,0.24)_65%,rgba(45,212,191,0)_100%)] opacity-45 blur-2xl" />
        <div className="hero-ambient-glow absolute inset-0 opacity-45 [background:radial-gradient(circle_at_var(--cursor-x)_var(--cursor-y),rgba(110,231,183,0.22),transparent_40%)]" />
      </div>

      {/* Filmic overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(0,0,0,0),rgba(0,0,0,0.35))]" />
      <div className="hero-scanline pointer-events-none absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(to_bottom,rgba(180,255,224,0.07)_0px,rgba(180,255,224,0.07)_1px,transparent_1px,transparent_4px)]" />
      <div
        className="hero-grain pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.28) 0.5px, transparent 0.5px)',
          backgroundSize: '2px 2px',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Dust particles - Only on high-end devices */}
      {deviceCapabilities.isHighEnd && (
        <div className="pointer-events-none absolute inset-0">
          {DUST_PARTICLES.map((particle, index) => (
            <span
              key={`${particle.left}-${particle.top}-${index}`}
              className="hero-dust absolute rounded-full bg-emerald-100/40"
              style={{
                left: particle.left,
                top: particle.top,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                filter: 'blur(0.2px)',
              }}
            />
          ))}
        </div>
      )}

      {/* Floating telemetry chips overlay - Adaptive rendering */}
      {!deviceCapabilities.isLowEnd && (
        <div className="pointer-events-none absolute inset-0 z-[18] hidden lg:block">
          {FLOATING_CHIPS.map((chip) => (
            <div
              key={chip.label}
              className="hero-float bg-black/38 absolute rounded-full border border-emerald-100/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/85 backdrop-blur-xl"
              style={{ top: chip.top, left: chip.left }}
            >
              <span className="mr-2 text-white/65">{chip.label}</span>
              <span className="text-emerald-200">{chip.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hero Content */}
      <div className="hero-foreground-layer relative z-20 mx-auto grid min-h-[90vh] w-full max-w-[var(--landing-max-width)] grid-cols-1 gap-8 px-[var(--landing-padding-x)] pb-[max(7rem,12vh)] pt-[max(5.5rem,10vh)] md:gap-10 md:pb-24 md:pt-32 lg:grid-cols-[1.03fr_0.97fr] lg:items-center xl:pt-36">
        <div className="max-w-3xl">
          <motion.div className="hero-kicker mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/20 bg-black/35 px-4 py-2 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/90">
              Live Market Intelligence Layer
            </span>
          </motion.div>

          <h1 className="mb-6">
            {HEADLINE_LINES.map((line, index) => (
              <span key={line} className="block overflow-hidden">
                <span
                  className="hero-headline-line block uppercase leading-[0.9]"
                  style={
                    index === 0
                      ? {
                          fontSize: 'clamp(2.1rem, 7.6vw, 5.8rem)',
                          fontWeight: 900,
                          letterSpacing: '-0.045em',
                          color: '#ffffff',
                          textShadow:
                            '0 0 60px rgba(255, 255, 255, 0.15), 0 0 120px rgba(52, 211, 153, 0.1)',
                        }
                      : index === 1
                        ? {
                            fontSize: 'clamp(2.1rem, 7.1vw, 5.2rem)',
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                            background:
                              'linear-gradient(135deg, #ffffff 0%, #d4faa8 30%, #34d399 60%, #22d3ee 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: 'none',
                            filter: 'drop-shadow(0 0 40px rgba(52, 211, 153, 0.2))',
                          }
                        : {
                            fontSize: 'clamp(1.1rem, 2.8vw, 2rem)',
                            fontWeight: 500,
                            letterSpacing: '0.18em',
                            color: 'rgba(255, 255, 255, 0.6)',
                          }
                  }
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p className="hero-subcopy mb-9 max-w-2xl text-base leading-relaxed text-white/80 md:text-xl md:leading-relaxed">
            The command network for modern agriculture: instant equipment access, real-time provider
            matching, and nationwide dispatch intelligence.
          </p>

          <div className="hero-actions mb-10 flex flex-wrap gap-3 md:gap-4">
            <div className="hero-action max-[479px]:w-full">
              <MagneticButton
                href="/equipment"
                strength={0.32}
                className="landing-touch border-emerald-100/15 bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-200 px-7 py-3.5 text-sm font-black tracking-[0.12em] text-[#052818] shadow-[0_22px_80px_rgba(74,222,128,0.4)] max-[479px]:w-full max-[479px]:justify-center md:px-9 md:py-4 md:text-base"
              >
                <span className="flex items-center gap-2">
                  <Tractor className="h-4 w-4" />
                  <span>Book Equipment Instantly</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </MagneticButton>
            </div>

            <div className="hero-action max-[479px]:w-full">
              <MagneticButton
                href="/provider/equipment"
                strength={0.25}
                className="landing-touch border-emerald-100/30 bg-black/35 px-6 py-3.5 text-sm font-semibold tracking-[0.14em] text-white hover:border-emerald-200/55 hover:bg-emerald-300/10 max-[479px]:w-full max-[479px]:justify-center md:px-8 md:text-base"
              >
                <span className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-emerald-200" />
                  <span>List Equipment</span>
                </span>
              </MagneticButton>
            </div>

            <div className="hero-action max-[479px]:w-full">
              <MagneticButton
                href="/labour"
                strength={0.25}
                className="landing-touch border-cyan-100/30 bg-black/35 px-6 py-3.5 text-sm font-semibold tracking-[0.14em] text-white hover:border-cyan-200/65 hover:bg-cyan-300/10 max-[479px]:w-full max-[479px]:justify-center md:px-8 md:text-base"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-200" />
                  <span>Hire Labour Teams</span>
                </span>
              </MagneticButton>
            </div>
          </div>

          <div className="mb-9 grid max-w-2xl grid-cols-1 gap-3 min-[414px]:grid-cols-2 sm:grid-cols-3">
            {TELEMETRY_CHIPS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="hero-signal hero-float rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-xl"
              >
                <Icon className="mb-2 h-4 w-4 text-emerald-300" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
                  {label}
                </p>
                <p className="mt-1 text-xl font-black tracking-tight text-emerald-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="hero-trust mb-7">
            <TrustLayer variant="hero" />
          </div>

          <div className="hero-trust">
            <SupportCTA />
          </div>
        </div>

        <div className="hero-panel relative hidden self-start pt-24 xl:block">
          <div className="hero-console-shell bg-black/42 relative overflow-hidden rounded-[2.1rem] border border-emerald-100/25 p-7 shadow-[0_32px_140px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-[2.1rem] border border-cyan-200/10" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="bg-cyan-300/12 pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.1)_0%,transparent_45%,rgba(110,231,183,0.16)_100%)] opacity-65" />

            <div className="relative">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/80">
                    Operations Console
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                    Agri Command Center
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100/35 bg-emerald-300/10">
                  <Radar className="h-4 w-4 text-emerald-100" />
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {['LIVE', 'AI MATCHING', 'DISPATCHED', 'VERIFIED'].map((label, index) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-100/25 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/85"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full ${
                          index % 2 === 0 ? 'bg-emerald-300' : 'bg-cyan-300'
                        } animate-ping opacity-70`}
                      />
                      <span
                        className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                          index % 2 === 0 ? 'bg-emerald-300' : 'bg-cyan-300'
                        }`}
                      />
                    </span>
                    {label}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                {COMMAND_STAGES.map((stage) => (
                  <div
                    key={stage.title}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-white/75">
                      <span>{stage.title}</span>
                      <span className="text-emerald-200">{stage.status}</span>
                    </div>
                    <p className="text-white/92 mt-1 text-sm">{stage.detail}</p>
                    <div className="mt-3 h-1.5 rounded-full bg-white/10">
                      <motion.div
                        className={`hero-progress-fill h-full rounded-full bg-gradient-to-r from-emerald-300 via-lime-200 to-cyan-200 ${stage.width}`}
                        animate={reduceMotion ? { opacity: 1 } : { opacity: [0.55, 1, 0.6, 1] }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'ACTIVE GRID', icon: Cpu },
                  { label: 'ROUTE STABLE', icon: CircleCheck },
                  { label: 'AUTO ALERTS', icon: Radar },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="hero-float bg-black/36 rounded-xl border border-white/10 px-2 py-2 text-center"
                  >
                    <item.icon className="mx-auto mb-1 h-3.5 w-3.5 text-emerald-200" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Adaptive animation */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 sm:block"
      >
        <motion.div
          animate={reduceMotion || accessibility.prefersReducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{
            duration: deviceCapabilities.isLowEnd ? 2.5 : 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-white/45">
            Scroll To Explore
          </span>
          <ChevronDown className="h-5 w-5 text-white/45" />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroChapter;
