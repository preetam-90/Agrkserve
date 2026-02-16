'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Clock, Wrench, Users } from 'lucide-react';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProblemChapterProps {
  reducedMotion?: boolean;
  variant?: 'desktop' | 'mobile';
}

const problemPoints = [
  {
    icon: Clock,
    title: 'Weather Delays',
    description: 'Critical operations stall when equipment is unavailable at the right moment.',
  },
  {
    icon: Wrench,
    title: 'Broken Machinery',
    description: 'Fragmented access to spare parts and repair services disrupts harvest cycles.',
  },
  {
    icon: Users,
    title: 'Uncertain Labour',
    description: 'Skilled workers are hard to coordinate, leading to crop losses and inefficiency.',
  },
];

const solutionPoints = [
  {
    icon: Clock,
    title: 'Real-Time Booking',
    description: 'Instant availability checks and confirmed slots within minutes.',
  },
  {
    icon: Wrench,
    title: 'Verified Equipment',
    description: 'Every machine inspected, rated, and ready for dispatch.',
  },
  {
    icon: Users,
    title: 'Skilled Workforce',
    description: 'Certified operators and farm workers at your fingertips.',
  },
];

/**
 * Problem Chapter - Redesigned
 *
 * Features:
 * 1. Scroll-tied morph animation (problem → solution)
 * 2. Visual transition from fragmented to connected
 * 3. Clear pain point communication
 * 4. Immediate solution preview
 */
export function ProblemChapterRedesigned({
  reducedMotion = false,
  variant = 'desktop',
}: ProblemChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const problemLayerRef = useRef<HTMLDivElement>(null);
  const problemContentRef = useRef<HTMLDivElement>(null);
  const solutionLayerRef = useRef<HTMLDivElement>(null);
  const solutionContentRef = useRef<HTMLDivElement>(null);
  const colorShiftRef = useRef<HTMLDivElement>(null);
  const connectedGridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = reducedMotion || Boolean(prefersReducedMotion);
  const isMobileVariant = variant === 'mobile';
  const particleCount = isMobileVariant ? 7 : 12;
  const holdDuration = isMobileVariant ? 0.95 : 1.25;

  useLayoutEffect(() => {
    if (!sectionRef.current || shouldReduceMotion) return;

    const context = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      const cards = gsap.utils.toArray<HTMLElement>('[data-solution-card]', section);
      const particles = gsap.utils.toArray<HTMLElement>('[data-morph-particle]', section);
      const lines = gsap.utils.toArray<SVGLineElement>('[data-network-line]', section);

      gsap.set(problemLayerRef.current, { opacity: 1, scale: 1 });
      gsap.set(problemContentRef.current, { opacity: 1, y: 0, filter: 'blur(0px)' });
      gsap.set(solutionLayerRef.current, { opacity: 0, scale: isMobileVariant ? 1.015 : 1.035 });
      gsap.set(solutionContentRef.current, {
        opacity: 0,
        y: isMobileVariant ? 36 : 52,
        filter: 'blur(6px)',
      });
      gsap.set(cards, { opacity: 0, y: 24, scale: 0.96 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: isMobileVariant ? '+=185%' : '+=235%',
          scrub: isMobileVariant ? 0.9 : 1.12,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
          invalidateOnRefresh: true,
        },
      });

      timeline.fromTo(
        problemContentRef.current,
        { opacity: 1, y: 0, filter: 'blur(0px)' },
        {
          opacity: 0,
          y: isMobileVariant ? -28 : -54,
          filter: 'blur(6px)',
          duration: 0.34,
          ease: 'none',
        },
        0.16
      );

      timeline.fromTo(
        problemLayerRef.current,
        { opacity: 1, scale: 1 },
        {
          opacity: 0.05,
          scale: isMobileVariant ? 1.03 : 1.06,
          duration: 0.52,
          ease: 'none',
        },
        0.14
      );

      timeline.fromTo(
        colorShiftRef.current,
        { opacity: 0 },
        { opacity: 0.85, duration: 0.28, ease: 'none' },
        0.26
      );
      timeline.to(colorShiftRef.current, { opacity: 0, duration: 0.26, ease: 'none' }, 0.58);

      timeline.fromTo(
        solutionLayerRef.current,
        { opacity: 0, scale: isMobileVariant ? 1.015 : 1.035 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'none' },
        0.24
      );

      timeline.fromTo(
        solutionContentRef.current,
        { opacity: 0, y: isMobileVariant ? 36 : 52, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'none' },
        0.32
      );

      timeline.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: isMobileVariant ? 0.03 : 0.05,
          duration: 0.18,
          ease: 'none',
        },
        0.48
      );

      particles.forEach((particle, index) => {
        timeline.fromTo(
          particle,
          { opacity: 0.24, scale: 0.45, y: 0, x: 0 },
          {
            opacity: isMobileVariant ? 0.7 : 0.86,
            scale: isMobileVariant ? 1 : 1.18,
            y: (isMobileVariant ? -75 : -110) - index * (isMobileVariant ? 8 : 14),
            x: index % 2 === 0 ? 30 : -30,
            duration: 0.65,
            ease: 'none',
          },
          0.2
        );
      });

      timeline.fromTo(
        connectedGridRef.current,
        { opacity: 0 },
        { opacity: isMobileVariant ? 0.22 : 0.32, duration: 0.3, ease: 'none' },
        0.45
      );

      lines.forEach((line, index) => {
        const length = line.getTotalLength ? line.getTotalLength() : 200;
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
        timeline.to(
          line,
          { strokeDashoffset: 0, duration: 0.14, ease: 'none' },
          0.48 + index * 0.02
        );
      });

      // Hold the final "One Platform. Every Resource." state before unpin.
      timeline.to({}, { duration: holdDuration });
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [holdDuration, isMobileVariant, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <section
        id="problem"
        data-no-global-transition="true"
        className="relative overflow-hidden bg-[#030705] px-5 py-20 md:px-8 md:py-28"
        aria-label="The problem and our solution"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-2">
          <article className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 md:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Chapter 01 // The Problem
              </span>
            </div>
            <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-bold uppercase leading-[0.95] tracking-tight text-white">
              Farmer Operations
              <span className="block text-amber-400">Are Fragmented</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/70">
              Traditional farming relies on scattered providers, uncertain availability, and manual
              coordination. Every delay costs farmers time, money, and crops.
            </p>
          </article>

          <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 md:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                The Solution // Connected Operations
              </span>
            </div>
            <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-bold uppercase leading-[0.95] tracking-tight text-white">
              One Platform.
              <span className="block text-emerald-400">Every Resource.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/70">
              AgriServe transforms scattered operations into a unified network. Equipment,
              providers, and skilled labour, all accessible in real-time.
            </p>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section
      id="problem"
      data-no-global-transition="true"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-[#030705]"
      aria-label="The problem and our solution"
    >
      <div className="h-screen overflow-hidden">
        {/* Color shift overlay for morph transition */}
        <div
          ref={colorShiftRef}
          className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),rgba(6,182,212,0.1),transparent_60%)] opacity-0"
        />
        <div ref={problemLayerRef} className="absolute inset-0">
          {/* Background - Fragmented/Dusty aesthetic */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(180,120,60,0.15),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(120,80,40,0.12),transparent_45%)]" />

          {/* Fragmented grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="fragmented-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="none"
                    stroke="rgba(180,120,60,0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 8"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#fragmented-grid)" />
            </svg>
          </div>

          {/* Problem Content */}
          <div
            ref={problemContentRef}
            className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-5 md:px-8"
          >
            <div className="max-w-4xl">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Chapter 01 // The Problem
                </span>
              </div>

              {/* Headline */}
              <h2 className="mb-6 text-[clamp(1.75rem,5vw,4rem)] font-bold uppercase leading-[0.95] tracking-tight text-white">
                Farmer Operations
                <span className="block text-amber-400">Are Fragmented</span>
              </h2>

              {/* Description */}
              <p className="mb-10 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
                Traditional farming relies on scattered providers, uncertain availability, and
                manual coordination. Every delay costs farmers time, money, and crops.
              </p>

              {/* Problem Points */}
              <div className="grid gap-4 md:grid-cols-3">
                {problemPoints.map((point) => (
                  <div
                    key={point.title}
                    data-problem-card
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                      <point.icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{point.title}</h3>
                      <p className="text-sm text-white/60">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating particles */}
          {[...Array(particleCount)].map((_, i) => (
            <div
              key={i}
              data-morph-particle
              className="absolute h-2 w-2 rounded-full bg-amber-400/40"
              style={{
                left: `${10 + i * 7}%`,
                top: `${20 + (i % 5) * 15}%`,
              }}
            />
          ))}
        </div>

        {/* Solution Layer - Connected State */}
        <div ref={solutionLayerRef} className="absolute inset-0 opacity-0">
          {/* Background - Connected/Neon aesthetic */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.2),transparent_35%),radial-gradient(circle_at_75%_75%,rgba(6,182,212,0.15),transparent_40%)]" />

          {/* Connected grid pattern */}
          <div ref={connectedGridRef} className="absolute inset-0 opacity-0">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="connected-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="none"
                    stroke="rgba(16,185,129,0.4)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#connected-grid)" />
            </svg>
          </div>

          {/* Network lines animation */}
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(16,185,129,0.5)" />
                <stop offset="100%" stopColor="rgba(6,182,212,0.5)" />
              </linearGradient>
            </defs>
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                data-network-line
                className="opacity-40"
                x1={`${20 + i * 10}%`}
                y1="80%"
                x2={`${25 + i * 8}%`}
                y2="20%"
                stroke="url(#line-gradient)"
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* Solution Content */}
          <div
            ref={solutionContentRef}
            className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-5 md:px-8"
          >
            <div className="max-w-4xl">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  The Solution // Connected Operations
                </span>
              </div>

              {/* Headline */}
              <h2 className="mb-6 text-[clamp(1.75rem,5vw,4rem)] font-bold uppercase leading-[0.95] tracking-tight text-white">
                One Platform.
                <span className="block text-emerald-400">Every Resource.</span>
              </h2>

              {/* Description */}
              <p className="mb-10 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
                AgriServe transforms scattered operations into a unified network. Equipment,
                providers, and skilled labour—all accessible in real-time.
              </p>

              {/* Solution Points */}
              <div className="grid gap-4 md:grid-cols-3">
                {solutionPoints.map((point) => (
                  <div
                    key={point.title}
                    data-solution-card
                    className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                      <point.icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{point.title}</h3>
                      <p className="text-sm text-white/60">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-10">
                <a
                  href="#equipment-universe"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-400"
                >
                  Explore Equipment
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Floating particles */}
          {[...Array(particleCount)].map((_, i) => (
            <div
              key={i}
              data-morph-particle
              className="absolute h-2 w-2 rounded-full bg-emerald-400"
              style={{
                left: `${10 + i * 7}%`,
                top: `${20 + (i % 5) * 15}%`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProblemChapterRedesigned;
