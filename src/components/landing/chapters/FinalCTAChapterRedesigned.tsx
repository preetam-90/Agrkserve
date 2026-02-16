'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Tractor,
  Users,
  Wrench,
  Phone,
  Shield,
  Clock,
  BadgeCheck,
  Star
} from 'lucide-react';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FinalCTAChapterProps {
  reducedMotion?: boolean;
}

const primaryCTAs = [
  {
    label: 'Book Equipment',
    href: '/equipment',
    icon: Tractor,
    description: 'Browse verified tractors, harvesters & more',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    label: 'Hire Labour',
    href: '/labour',
    icon: Users,
    description: 'Find skilled farm workers near you',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    label: 'List Equipment',
    href: '/provider/equipment',
    icon: Wrench,
    description: 'Join as a verified provider',
    color: 'from-violet-500 to-violet-600',
  },
];

const trustBadges = [
  { icon: Shield, label: 'Verified Providers' },
  { icon: Clock, label: '24/7 Support' },
  { icon: BadgeCheck, label: 'ISI Certified' },
  { icon: Star, label: '4.8★ Rating' },
];

/**
 * Final CTA Chapter - Redesigned
 * 
 * Conversion-optimized layout:
 * 1. Clear headline with urgency
 * 2. Prominent primary CTAs
 * 3. Trust reinforcement
 * 4. Support phone for rural users
 * 5. Secondary actions
 */
export function FinalCTAChapterRedesigned({ reducedMotion = false }: FinalCTAChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      // Badge \u2014 pop in from above
      timeline.from('.cta-badge', {
        opacity: 0,
        y: -20,
        scale: 0.85,
        duration: 0.6,
        ease: 'back.out(2)',
      });

      // Headline \u2014 clip-path wipe reveal
      timeline.fromTo(
        '.cta-headline',
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 0.9,
          ease: 'power3.inOut',
        },
        '-=0.3'
      );

      // Description \u2014 fade with blur
      timeline.from(
        '.cta-description',
        {
          opacity: 0,
          y: 20,
          filter: 'blur(4px)',
          duration: 0.6,
          ease: 'power3.out',
        },
        '-=0.5'
      );

      // CTA cards \u2014 3D perspective cascade  
      timeline.from(
        '.cta-primary > *',
        {
          opacity: 0,
          y: 40,
          rotateX: -10,
          scale: 0.9,
          stagger: 0.12,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'rotateX',
        },
        '-=0.3'
      );

      // Trust badges \u2014 staggered scale-in
      timeline.from(
        '.cta-trust > *',
        {
          opacity: 0,
          scale: 0.7,
          stagger: 0.06,
          duration: 0.45,
          ease: 'back.out(1.5)',
        },
        '-=0.3'
      );

      // Support \u2014 slide in from below
      timeline.from(
        '.cta-support',
        {
          opacity: 0,
          y: 22,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.2'
      );

      // Container glow pulse \u2014 breathing urgency
      gsap.to('.cta-container-glow', {
        boxShadow:
          '0 0 80px rgba(16,185,129,0.12), 0 0 120px rgba(6,182,212,0.06), inset 0 0 60px rgba(16,185,129,0.04)',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Border glow pulse
      gsap.to('.cta-border-glow', {
        opacity: 0.7,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#030705] py-[var(--landing-section-y)]"
      aria-label="Get started with AgriServe"
    >
      {/* Background decorations */}
      <div
        data-scroll-depth
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.12),transparent_40%)]"
      />
      <div
        data-scroll-depth
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(6,182,212,0.1),transparent_35%)]"
      />

      {/* Grid pattern */}
      <div data-scroll-depth className="pointer-events-none absolute inset-0 opacity-20">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div
        data-scroll-content
        className="relative z-10 mx-auto w-full max-w-[var(--landing-max-width-narrow)] px-[var(--landing-padding-x)]"
      >
        <div className="cta-container-glow rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl md:p-10 lg:p-14" style={{ perspective: '1000px' }}>
          {/* Inner gradient border */}
          <div className="cta-border-glow pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 opacity-40" />

          {/* Content */}
          <div className="relative text-center">
            {/* Badge */}
            <div className="cta-badge mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Start Operating Today
              </span>
            </div>

            {/* Headline */}
            <h2 className="cta-headline mb-4 text-[clamp(1.5rem,5vw,3rem)] font-bold uppercase leading-[0.95] tracking-tight text-white md:leading-[0.9]">
              Ready to Transform
              <span className="block text-emerald-400">Your Farm Operations?</span>
            </h2>

            {/* Description */}
            <p className="cta-description mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Join thousands of farmers across India who have streamlined their operations
              with AgriServe. Equipment, labour, and verified providers—all in one place.
            </p>

            {/* Primary CTAs */}
            <div className="cta-primary mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {primaryCTAs.map((cta) => (
                <Link key={cta.href} href={cta.href} className="block">
                  <motion.div
                    data-scroll-float
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="landing-touch group h-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-white/20 hover:bg-white/10 md:p-5"
                  >
                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cta.color} text-white transition-transform group-hover:scale-110`}>
                      <cta.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1 font-semibold text-white">{cta.label}</h3>
                    <p className="text-xs text-white/60">{cta.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <span>Get started</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="cta-trust mb-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {trustBadges.map((badge) => (
                <div key={badge.label} data-scroll-float className="flex items-center gap-2 text-white/60">
                  <badge.icon className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Support */}
            <div className="cta-support flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="tel:+911234567890"
                className="landing-touch flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
              >
                <Phone className="h-4 w-4" />
                Call Support: +91 12345 67890
              </a>
              <Link
                href="/help"
                className="text-sm text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Need help? Visit our support center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTAChapterRedesigned;
