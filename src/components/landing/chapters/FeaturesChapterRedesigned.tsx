'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Radar, ShieldCheck, Zap, BarChart3, Layers } from 'lucide-react';
import { ResponsiveSection, ResponsiveGrid } from '../shared/ResponsiveLayout';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FeaturesChapterRedesignedProps {
  reducedMotion?: boolean;
}

const features = [
  {
    title: 'AI Match Engine',
    description: 'Real-time matching between farmers, equipment owners, and workforce demand.',
    icon: Cpu,
  },
  {
    title: 'Live Dispatch Grid',
    description: 'Track assignment state from request intake to field deployment.',
    icon: Radar,
  },
  {
    title: 'Verified Trust Layer',
    description: 'Provider verification, transparent history, and structured reliability signals.',
    icon: ShieldCheck,
  },
  {
    title: 'Instant Booking Flow',
    description: 'Frictionless booking journey optimized for both rural and urban users.',
    icon: Zap,
  },
  {
    title: 'Market Analytics',
    description: 'Demand, utilization, and fulfillment insights to optimize operations.',
    icon: BarChart3,
  },
  {
    title: 'Unified Operations Stack',
    description: 'Equipment, labour, and communications connected in one control layer.',
    icon: Layers,
  },
] as const;

export function FeaturesChapterRedesigned({ reducedMotion = false }: FeaturesChapterRedesignedProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Heading reveal with clip-path left-to-right wipe
      gsap.fromTo(
        '[data-feature-heading]',
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1.1,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: sectionRef.current!,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Feature cards — staggered 3D cascade
      gsap.fromTo(
        '[data-feature-card]',
        {
          opacity: 0,
          y: 50,
          rotateX: -10,
          scale: 0.93,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'rotateX',
          scrollTrigger: {
            trigger: '[data-feature-grid]',
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Icon glow pulse on each card
      gsap.utils.toArray<HTMLElement>('[data-feature-icon]').forEach((icon, index) => {
        gsap.to(icon, {
          boxShadow: '0 0 20px rgba(110,231,183,0.4)',
          duration: 2 + index * 0.3,
          delay: index * 0.15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Background parallax
      gsap.to('[data-feature-bg]', {
        yPercent: -5,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.3,
        },
      });
    }, sectionRef.current!);

    return () => safeGsapRevert(ctx);
  }, [reducedMotion]);

  return (
    <ResponsiveSection
      ref={sectionRef}
      id="features"
      className="bg-[linear-gradient(180deg,#020503_0%,#041009_45%,#020705_100%)]"
      aria-label="Platform features"
    >
      <div data-feature-bg className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(6,182,212,0.1),transparent_38%)]" />

      <div className="mx-auto max-w-3xl text-center relative z-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-200/75">
          Chapter 06 // Features
        </p>
        <h2 data-feature-heading className="landing-fluid-title mt-4 font-semibold uppercase text-white">
          Built Like A Mission-Critical
          <span className="block bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
            Agri Intelligence Platform
          </span>
        </h2>
        <p className="landing-fluid-subtitle mx-auto mt-5 max-w-2xl text-white/72">
          Every workflow is responsive by design across mobile, tablet, and desktop surfaces with
          premium clarity and performance.
        </p>
      </div>

      <ResponsiveGrid data-feature-grid cols={3} className="mt-10 md:mt-14 relative z-10" style={{ perspective: '1000px' }}>
        {features.map((feature) => (
          <article
            key={feature.title}
            data-feature-card
            className="group rounded-3xl border border-white/12 bg-black/35 p-5 backdrop-blur-xl md:p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300/25 hover:shadow-[0_8px_40px_rgba(16,185,129,0.12)]"
            style={{ willChange: 'transform, opacity' }}
          >
            <div
              data-feature-icon
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100/30 bg-emerald-300/10 text-emerald-100 transition-transform duration-300 group-hover:scale-110"
            >
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
              {feature.description}
            </p>
          </article>
        ))}
      </ResponsiveGrid>
    </ResponsiveSection>
  );
}

export default FeaturesChapterRedesigned;
