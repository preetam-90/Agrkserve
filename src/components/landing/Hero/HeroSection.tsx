'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { HeroVisual } from './HeroVisual';
import { MagneticButton } from '../shared/MagneticButton';

const headline = 'Book Equipment. Hire Skilled Labour. Power Your Farm.';

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  const words = useMemo(
    () =>
      headline.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} className="hero-word mr-[0.34em] inline-block opacity-0">
          {word}
        </span>
      )),
    []
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Launch film opening: blackout, grain reveal, headline timing, then CTA pop-in.
      gsap
        .timeline()
        .fromTo('.hero-black', { opacity: 1 }, { opacity: 0, duration: 1.3, ease: 'power2.out' })
        .fromTo('.hero-grain', { opacity: 0 }, { opacity: 0.42, duration: 1 }, '-=1')
        .fromTo('.hero-word', { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 }, '-=0.7')
        .fromTo('.hero-subcopy', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.45')
        .fromTo('.hero-cta', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, stagger: 0.1, duration: 0.6 }, '-=0.35');
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="hero-scene relative flex min-h-screen items-center overflow-hidden px-5 pb-16 pt-28 md:px-8">
      <HeroVisual />

      <div className="hero-grain pointer-events-none absolute inset-0 opacity-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:4px_4px]" />
      <div className="hero-black pointer-events-none absolute inset-0 bg-black" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,5,0.04),#0A0F0C_88%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-5xl">
          <p className="mb-6 inline-flex rounded-full border border-emerald-300/25 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-cyan-100 backdrop-blur">
            Cinematic Agritech Platform
          </p>

          <h1 className="text-[clamp(3rem,8vw,8rem)] font-semibold leading-[0.9] tracking-[-0.02em] text-white">
            {words}
          </h1>

          <p className="hero-subcopy mt-8 max-w-2xl text-base text-zinc-200/85 md:text-xl">
            From machine access to workforce deployment, one unified operating layer for modern farming.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton className="hero-cta rounded-2xl border border-emerald-200/35 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-medium uppercase tracking-[0.08em] text-white shadow-[0_0_34px_rgba(34,197,94,0.5)] transition hover:shadow-[0_0_56px_rgba(34,197,94,0.7)]">
              <Link href="/equipment">Book Equipment</Link>
            </MagneticButton>

            <MagneticButton className="hero-cta rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.08em] text-white backdrop-blur-xl transition hover:bg-white/18">
              <Link href="/auth/register?role=provider">List Equipment</Link>
            </MagneticButton>

            <MagneticButton className="hero-cta rounded-2xl border border-cyan-300/35 bg-cyan-400/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.08em] text-cyan-100 backdrop-blur-xl transition hover:bg-cyan-300/20">
              <Link href="/labour">Hire Labour</Link>
            </MagneticButton>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 12, 0], opacity: [0.35, 1, 0.35] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-xs uppercase tracking-[0.22em] text-zinc-400 md:block"
      >
        Scroll Through The Story
      </motion.div>
    </section>
  );
}
