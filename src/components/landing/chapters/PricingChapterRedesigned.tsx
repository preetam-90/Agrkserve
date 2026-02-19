'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { ResponsiveSection, ResponsiveGrid } from '../shared/ResponsiveLayout';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface PricingChapterRedesignedProps {
  reducedMotion?: boolean;
}

const plans = [
  {
    name: 'Starter',
    audience: 'Small farms',
    price: '₹0',
    cadence: 'No monthly fee',
    highlight: false,
    features: ['Marketplace discovery', 'Basic booking workflow', 'Standard support'],
    cta: 'Start Free',
    href: '/equipment',
  },
  {
    name: 'Growth',
    audience: 'High-frequency users',
    price: '₹2,499',
    cadence: '/month',
    highlight: true,
    features: [
      'Priority matching',
      'Advanced scheduling',
      'Provider performance analytics',
      'Faster support lane',
    ],
    cta: 'Choose Growth',
    href: '/auth/register',
  },
  {
    name: 'Enterprise',
    audience: 'Agri businesses & fleets',
    price: 'Custom',
    cadence: 'Volume-based',
    highlight: false,
    features: [
      'Dedicated success manager',
      'Custom SLA and dispatch controls',
      'API and integration support',
    ],
    cta: 'Talk to Sales',
    href: '/contact',
  },
] as const;

function PricingChapterRedesigned({ reducedMotion = false }: PricingChapterRedesignedProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Heading clip-path wipe reveal
      gsap.fromTo(
        '[data-pricing-heading]',
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

      // Plan cards — staggered 3D cascade
      gsap.fromTo(
        '[data-pricing-card]',
        { opacity: 0, y: 50, rotateX: -10, scale: 0.93 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'rotateX',
          scrollTrigger: {
            trigger: '[data-pricing-grid]',
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Highlighted plan — breathing glow
      gsap.to('[data-pricing-highlight]', {
        boxShadow: '0 0 72px rgba(16,185,129,0.28), 0 0 120px rgba(16,185,129,0.1)',
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, sectionRef.current!);

    return () => safeGsapRevert(ctx);
  }, [reducedMotion]);

  return (
    <ResponsiveSection
      ref={sectionRef}
      id="pricing"
      className="bg-[linear-gradient(180deg,#020706_0%,#03130c_52%,#020705_100%)]"
      aria-label="Pricing plans"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}
    >
      <div
        data-scroll-depth
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(16,185,129,0.16),transparent_36%),radial-gradient(circle_at_78%_34%,rgba(6,182,212,0.13),transparent_42%)]"
      />
      <div
        data-scroll-depth
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(34,197,94,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] [background-size:72px_72px]"
      />
      <div
        data-scroll-depth
        className="pointer-events-none absolute inset-x-0 top-[18%] h-[340px] bg-emerald-300/10 blur-3xl"
      />

      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-200/75">
          Chapter 07 // Pricing
        </p>
        <h2
          data-pricing-heading
          className="landing-fluid-title mt-4 font-semibold uppercase text-white"
        >
          Clear Pricing. Zero Guesswork.
        </h2>
        <p className="landing-fluid-subtitle text-white/72 mx-auto mt-5 max-w-2xl">
          Structured plans for farmers, providers, and enterprise-scale operations.
        </p>
      </div>

      <ResponsiveGrid
        data-pricing-grid
        cols={3}
        className="mt-10 md:mt-14"
        style={{ perspective: '1000px' }}
      >
        {plans.map((plan) => (
          <article
            key={plan.name}
            data-pricing-card
            data-scroll-float
            {...(plan.highlight ? { 'data-pricing-highlight': true } : {})}
            className={`relative rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 md:p-6 ${
              plan.highlight
                ? 'from-emerald-300/18 border-emerald-200/45 bg-gradient-to-br to-cyan-300/10 shadow-[0_0_52px_rgba(16,185,129,0.22)]'
                : 'border-white/12 bg-black/35 hover:border-white/20'
            }`}
            style={{ willChange: 'transform, opacity' }}
          >
            {plan.highlight && (
              <span className="bg-emerald-300/12 mb-4 inline-flex items-center gap-1 rounded-full border border-emerald-100/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                <Sparkles className="h-3.5 w-3.5" />
                Most Popular
              </span>
            )}

            <p className="text-white/72 text-sm font-medium">{plan.audience}</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">{plan.name}</h3>
            <div className="mt-4 flex items-end gap-2">
              <p className="text-4xl font-black text-white">{plan.price}</p>
              <span className="pb-1 text-sm text-white/65">{plan.cadence}</span>
            </div>

            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="text-white/78 flex items-start gap-2 text-sm">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href={plan.href}
              className={`landing-touch mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-all ${
                plan.highlight
                  ? 'bg-emerald-300/16 border-emerald-100/35 text-emerald-50 hover:bg-emerald-300/25'
                  : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {plan.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </ResponsiveGrid>
    </ResponsiveSection>
  );
}

export default PricingChapterRedesigned;
