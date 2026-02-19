'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../shared/MagneticButton';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FinalCTAChapterProps {
  reducedMotion?: boolean;
}

export function FinalCTAChapter({ reducedMotion = false }: FinalCTAChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=160%',
          scrub: true,
          pin: true,
        },
      });

      timeline
        .fromTo(
          panelRef.current,
          { y: 80, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'none' }
        )
        .to(panelRef.current, { y: -36, duration: 0.35, ease: 'none' })
        .to(
          fadeRef.current,
          {
            opacity: 0.78,
            duration: 0.45,
            ease: 'none',
          },
          '-=0.1'
        );
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative min-h-[150vh] bg-black">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_22%,rgba(16,185,129,0.2),transparent_34%),radial-gradient(circle_at_72%_68%,rgba(34,211,238,0.2),transparent_36%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div
          ref={panelRef}
          className="relative z-20 mx-auto w-full max-w-4xl rounded-[2.2rem] border border-cyan-100/25 bg-black/45 px-6 py-10 text-center backdrop-blur-2xl md:px-12 md:py-14"
        >
          <div className="from-emerald-200/18 to-cyan-200/18 pointer-events-none absolute inset-0 rounded-[2.2rem] bg-gradient-to-br via-transparent" />
          <p className="relative text-[11px] uppercase tracking-[0.34em] text-cyan-100/75">
            Final Chapter // Launch the Future
          </p>
          <h2 className="relative mt-5 text-[clamp(2.3rem,6vw,5.6rem)] font-semibold uppercase leading-[0.9] text-white">
            Ready to Operate in the New Agriculture Economy?
          </h2>
          <p className="relative mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/75 md:text-lg">
            Join the unified platform where farmers, equipment providers, and skilled labour teams
            work as one coordinated network.
          </p>

          <div className="relative mt-8 flex flex-wrap justify-center gap-3 md:mt-10 md:gap-4">
            <MagneticButton href="/equipment" className="min-w-[180px]">
              Book Equipment
            </MagneticButton>
            <MagneticButton href="/provider/equipment" className="min-w-[180px]">
              List Equipment
            </MagneticButton>
            <MagneticButton href="/labour" className="min-w-[180px]">
              Hire Labour
            </MagneticButton>
          </div>
        </div>

        <div
          ref={fadeRef}
          className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.78)_72%,rgba(0,0,0,0.9)_100%)] opacity-0"
          aria-hidden
        />
      </div>
    </section>
  );
}
