'use client';

import dynamic from 'next/dynamic';
import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { safeGsapRevert } from '../shared/safeGsapRevert';
import {
  Shield,
  Clock,
  IndianRupee,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Tractor,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const InteractiveTractorScene = dynamic(
  () => import('../3d/InteractiveTractorScene').then((mod) => mod.InteractiveTractorScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center">
        <div className="relative text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400"></div>
          <p className="mt-4 text-xs uppercase tracking-widest text-emerald-300/70">
            Loading 3D Preview
          </p>
        </div>
      </div>
    ),
  }
);

interface InteractiveTractorChapterProps {
  reducedMotion?: boolean;
}

// Feature highlights with clear benefits
const highlights = [
  {
    icon: Shield,
    title: 'Verified Providers',
    body: 'Every equipment owner is ID-verified with ratings and service history.',
    stat: '100% Verified',
    color: 'emerald',
  },
  {
    icon: Clock,
    title: 'Real-Time Availability',
    body: 'See which machines are available now. Book instantly.',
    stat: 'Instant Booking',
    color: 'cyan',
  },
  {
    icon: IndianRupee,
    title: 'Transparent Pricing',
    body: 'Daily rates upfront. No hidden fees. Compare before you book.',
    stat: '₹500/day onwards',
    color: 'violet',
  },
  {
    icon: MapPin,
    title: 'Nearest Match',
    body: 'We connect you with the closest available equipment.',
    stat: 'Avg. 15km away',
    color: 'amber',
  },
];

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    glow: 'group-hover:shadow-violet-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
  },
};

export function InteractiveTractorChapter({
  reducedMotion = false,
}: InteractiveTractorChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const context = gsap.context(() => {
      // Badge — elastic pop-in with glow
      gsap.fromTo(
        '[data-badge]',
        { opacity: 0, y: -24, scale: 0.8, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.85,
          ease: 'back.out(2.2)',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
        }
      );

      // Headline — clip-path left wipe reveal 
      gsap.fromTo(
        '[data-headline]',
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1.1,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' },
        }
      );

      // Description — blur dissolve
      gsap.fromTo(
        '[data-desc]',
        { opacity: 0, y: 28, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      // 3D Scene — cinematic scale-in with glow aura
      gsap.fromTo(
        '[data-scene]',
        { opacity: 0, scale: 0.9, filter: 'blur(4px)' },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.4,
          ease: 'power3.out',
          clearProps: 'filter',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 62%' },
        }
      );

      // Feature cards — 3D perspective tilt cascade
      gsap.fromTo(
        '[data-card]',
        { opacity: 0, y: 50, rotateX: -10, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'rotateX',
          scrollTrigger: { trigger: '[data-card]', start: 'top 85%' },
        }
      );

      // Floating badges — organic oscillation with rotation
      gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el, index) => {
        gsap.to(el, {
          y: -12,
          rotateZ: index % 2 === 0 ? 2 : -2,
          duration: 2.4 + index * 0.4,
          delay: index * 0.15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Background parallax
      gsap.to('[data-tractor-bg]', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.3,
        },
      });
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [reducedMotion]);

  return (
    <section
      id="tractor-experience"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#030705] px-5 py-20 md:px-8 md:py-32"
    >
      {/* Background */}
      <div data-tractor-bg className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.12),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(6,182,212,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.06)_1px,transparent_1px)] [background-size:50px_50px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center md:mb-14">
          <div
            data-badge
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
              How It Works
            </span>
          </div>

          <h2
            data-headline
            className="mb-4 text-[clamp(1.75rem,5vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-white"
          >
            Find Equipment.
            <span className="text-emerald-400"> Book Instantly.</span>
          </h2>

          <p
            data-desc
            className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            Browse verified tractors, harvesters, and farm equipment from providers near you. See
            real-time availability, compare prices, and book in seconds.
          </p>
        </div>

        {/* 3D Scene + Feature Cards Split Layout */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Left: 3D Scene */}
          <div data-scene className="relative h-[350px] overflow-hidden md:h-[450px]">
            <div className="pointer-events-none absolute -inset-6 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.22),rgba(6,182,212,0.1)_35%,transparent_65%)] blur-2xl" />

            {/* 3D Scene */}
            <div className="absolute inset-0">
              <InteractiveTractorScene reducedMotion={reducedMotion} />
            </div>

            {/* Floating Info Badges */}
            <div
              data-float
              className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-xl"
            >
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">Verified</span>
            </div>

            <div
              data-float
              className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 backdrop-blur-xl"
            >
              <Star className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-300">4.8★</span>
            </div>

            <div
              data-float
              className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 backdrop-blur-xl"
            >
              <Users className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-300">2,500+ Providers</span>
            </div>

            <div
              data-float
              className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 backdrop-blur-xl"
            >
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-300">Near You</span>
            </div>
          </div>

          {/* Right: Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item, index) => {
              const colors = colorClasses[item.color as keyof typeof colorClasses];
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.title}
                  data-card
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl ${colors.glow}`}
                  style={{
                    transform: hoveredCard === index ? 'translateY(-4px)' : 'translateY(0)',
                  }}
                >
                  {/* Icon */}
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} ${colors.border} border`}
                  >
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>

                  {/* Title */}
                  <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-white">
                    {item.title}
                  </h3>

                  {/* Stat */}
                  <p className={`mb-2 text-xs font-semibold ${colors.text}`}>{item.stat}</p>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-white/60">{item.body}</p>

                  {/* Hover indicator */}
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 w-0 ${colors.bg} transition-all duration-500 group-hover:w-full`}
                  />
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/equipment">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/40"
            >
              <Tractor className="h-4 w-4" />
              Browse Equipment
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
          <Link href="/provider/equipment">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur-xl transition-all hover:border-white/40 hover:bg-white/10"
            >
              List Your Equipment
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default InteractiveTractorChapter;
