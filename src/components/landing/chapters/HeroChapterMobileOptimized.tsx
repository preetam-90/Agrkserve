/**
 * Mobile-Optimized Hero Chapter - Performance First
 *
 * This component is specifically designed for mobile performance:
 * - NO video loading (static image only)
 * - NO GSAP animations (CSS-only)
 * - NO 3D/Three.js
 * - Minimal JS bundle
 * - Instant LCP
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

const HEADLINE_LINES = [
  "INDIA'S AGRI",
  'OPERATING SYSTEM',
  'Built for Scale. Built to Win.',
] as const;

const TELEMETRY_CHIPS = [
  { value: '120K+', label: 'Verified Providers', icon: ShieldCheck },
  { value: '2.4M', label: 'Active Farmers', icon: Globe2 },
  { value: '780+', label: 'District Coverage', icon: Gauge },
] as const;

/**
 * Lightweight trust indicators - no heavy components
 */
function TrustIndicators() {
  return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.1em] text-white/50">
      <span className="flex items-center gap-1">
        <ShieldCheck className="h-3 w-3 text-emerald-400" />
        Verified
      </span>
      <span>•</span>
      <span>Secure Payments</span>
      <span>•</span>
      <span>24/7 Support</span>
    </div>
  );
}

/**
 * Mobile-optimized hero with zero video loading
 * Uses CSS-only animations and static image
 */
export function HeroChapterMobileOptimized() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger CSS animations after mount
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  return (
    <section
      id="hero-chapter-mobile"
      className="relative isolate min-h-[85vh] overflow-hidden bg-[#030705]"
      aria-label="Welcome to AgriServe - India's Agri Operating System"
    >
      {/* STATIC OPTIMIZED BACKGROUND - NO VIDEO */}
      {/* This is critical for LCP - using priority loaded image */}
      <div className="absolute inset-0">
        {/* Priority loaded poster image for instant LCP */}
        <Image
          src="/Landingpagevideo-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k="
        />
        {/* Gradient overlay for text readability - critical CSS */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(3,7,5,0.7) 0%, rgba(3,7,5,0.5) 40%, rgba(3,7,5,0.8) 100%)',
          }}
        />
      </div>

      {/* Simplified ambient effect - CSS only, no JS */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(16,185,129,0.15) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Hero Content - Rendered immediately, no waiting */}
      <div className="relative z-10 mx-auto flex min-h-[85vh] w-full max-w-xl flex-col justify-center px-5 py-8">
        {/* Kicker - Immediate render */}
        <div
          className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/20 bg-black/50 px-3 py-1.5 backdrop-blur-sm transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <Sparkles className="h-3 w-3 text-emerald-300" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/90">
            Live Market Intelligence
          </span>
        </div>

        {/* Headline - Critical for SEO and above fold */}
        <h1 className="mb-4">
          {HEADLINE_LINES.map((line, index) => (
            <span
              key={line}
              className={`block transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <span
                className={`block uppercase leading-[0.95] ${
                  index === 0
                    ? 'text-[2.5rem] font-black tracking-[-0.03em] text-white'
                    : index === 1
                      ? 'bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-[2.2rem] font-black tracking-[-0.03em] text-transparent'
                      : 'text-[1.1rem] font-semibold tracking-[0.15em] text-white/80'
                }`}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        {/* Subcopy */}
        <p
          className={`mb-6 text-sm leading-relaxed text-white/80 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '300ms' }}
        >
          The command network for modern agriculture: instant equipment access, real-time provider
          matching, and nationwide dispatch intelligence.
        </p>

        {/* CTA Buttons - No magnetic effects on mobile for performance */}
        <div
          className={`mb-6 flex flex-col gap-3 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Primary CTA */}
          <Link
            href="/equipment"
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100/15 bg-gradient-to-r from-emerald-500 via-lime-400 to-teal-300 px-6 py-3.5 text-sm font-bold tracking-[0.1em] text-[#052818] shadow-lg"
          >
            <Tractor className="h-4 w-4" />
            <span>Book Equipment</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Secondary CTAs */}
          <div className="flex gap-2">
            <Link
              href="/provider/equipment"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-xs font-semibold tracking-[0.12em] text-white backdrop-blur-sm"
            >
              <Wrench className="h-3 w-3 text-emerald-200" />
              <span>List Equipment</span>
            </Link>

            <Link
              href="/labour"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-200/20 bg-black/40 px-4 py-3 text-xs font-semibold tracking-[0.12em] text-white backdrop-blur-sm"
            >
              <Users className="h-3 w-3 text-cyan-200" />
              <span>Hire Labour</span>
            </Link>
          </div>
        </div>

        {/* Telemetry Stats - Simple grid, no animations */}
        <div
          className={`mb-6 grid grid-cols-3 gap-2 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '500ms' }}
        >
          {TELEMETRY_CHIPS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm"
            >
              <Icon className="mb-1 h-3 w-3 text-emerald-400" />
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/70">
                {label}
              </p>
              <p className="mt-1 text-lg font-bold tracking-tight text-emerald-100">{value}</p>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div
          className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '600ms' }}
        >
          <TrustIndicators />
        </div>
      </div>

      {/* Simple scroll indicator - CSS animation only */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Scroll</span>
          <ChevronDown
            className="h-4 w-4 animate-bounce text-white/40"
            style={{ animationDuration: '1.5s' }}
          />
        </div>
      </div>
    </section>
  );
}

export default HeroChapterMobileOptimized;
