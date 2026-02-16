'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { MagneticButton } from '../shared/MagneticButton';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroChapterProps {
  runtime: {
    tier: 'high' | 'mid' | 'low';
    enableFull3D: boolean;
    enableLite3D: boolean;
    useVideoFallback: boolean;
    prefersReducedMotion: boolean;
  };
}

const headlineWords = [
  'Farming',
  'Used',
  'to',
  'Depend',
  'on',
  'Luck.',
  'Now',
  'It',
  'Runs',
  'on',
  'Precision.',
];

function HeroMedia() {
  return (
    <video
      className="h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/logo-original.png"
    >
      <source src="/Landingpagevideo.webm" type="video/webm" />
    </video>
  );
}

export function HeroChapter({ runtime }: HeroChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRefs = useRef<HTMLSpanElement[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const headline = useMemo(
    () =>
      headlineWords.map((word, index) => (
        <span
          key={`${word}-${index}`}
          ref={(element) => {
            if (element) headlineRefs.current[index] = element;
          }}
          className="inline-block pr-[0.24em]"
        >
          {word}
        </span>
      )),
    []
  );

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const context = gsap.context(() => {
      if (!runtime.prefersReducedMotion) {
        // Reveal headline word-by-word to mimic a launch film title card.
        gsap.fromTo(
          headlineRefs.current,
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.3,
            stagger: 0.07,
            ease: 'power4.out',
          }
        );

        gsap.fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.45, ease: 'power2.out' }
        );

        gsap.fromTo(
          ctaRef.current,
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.7, ease: 'power2.out' }
        );

        // Depth layers drift slower than foreground content for a cinematic parallax feel.
        gsap.utils.toArray<HTMLElement>('[data-parallax-layer]').forEach((element) => {
          const speed = Number(element.dataset.depth || 12);
          gsap.to(element, {
            yPercent: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: '#hero-chapter',
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        });
      }
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [runtime.prefersReducedMotion]);

  return (
    <section id="hero-chapter" ref={sectionRef} className="hero-scene relative min-h-[180vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <HeroMedia />
        </div>

        <div
          data-parallax-layer
          data-depth="18"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_14%,rgba(255,255,255,0.22),transparent_44%)]"
        />

        <div
          data-parallax-layer
          data-depth="26"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_72%,rgba(16,185,129,0.24),transparent_36%)]"
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.58)_78%,rgba(0,0,0,0.88)_100%)]" />

        <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-soft-light [background-image:radial-gradient(circle_at_40%_18%,rgba(255,255,255,0.35)_0.5px,transparent_1px)] [background-size:3px_3px]" />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(6,182,212,0.1),transparent_30%,rgba(16,185,129,0.15)_70%,transparent_100%)]" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-5 pb-12 pt-28 md:px-8 md:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-6 text-[11px] font-medium uppercase tracking-[0.36em] text-cyan-100/75"
          >
            A cinematic agritech product reveal
          </motion.p>

          <h1 className="max-w-5xl text-[clamp(2.45rem,8vw,8.3rem)] font-semibold uppercase leading-[0.88] text-white">
            {headline}
          </h1>

          <p
            ref={subtitleRef}
            className="mt-6 max-w-3xl text-sm leading-relaxed text-white/75 md:text-lg md:leading-relaxed"
          >
            Scroll through the transition from fragmented, manual farming operations to one
            intelligent platform that unifies equipment rental, verified providers, and skilled
            labour hiring in real time.
          </p>

          <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-3 md:mt-10 md:gap-4">
            <MagneticButton href="/equipment" className="min-w-[170px]">
              Book Equipment
            </MagneticButton>
            <MagneticButton href="/provider/equipment" className="min-w-[170px]">
              List Equipment
            </MagneticButton>
            <MagneticButton href="/labour" className="min-w-[170px]">
              Hire Labour
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
