'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProblemChapterProps {
  reducedMotion?: boolean;
}

export function ProblemChapter({ reducedMotion = false }: ProblemChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const dustyLayerRef = useRef<HTMLDivElement>(null);
  const neonLayerRef = useRef<HTMLDivElement>(null);
  const copyARef = useRef<HTMLDivElement>(null);
  const copyBRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const context = gsap.context(() => {
      // Pinned morph sequence: dusty/manual state transitions into a neon digital field.
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=190%',
          scrub: true,
          pin: true,
        },
      });

      timeline
        .fromTo(
          copyARef.current,
          { opacity: 1, y: 0 },
          { opacity: 0, y: -48, duration: 0.45, ease: 'none' }
        )
        .fromTo(
          dustyLayerRef.current,
          { opacity: 1, scale: 1, filter: 'blur(0px)' },
          { opacity: 0.12, scale: 1.08, filter: 'blur(8px)', duration: 0.55, ease: 'none' },
          '<'
        )
        .fromTo(
          neonLayerRef.current,
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 0.65, ease: 'none' },
          '-=0.1'
        )
        .fromTo(
          copyBRef.current,
          { opacity: 0, y: 48 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'none' },
          '-=0.3'
        );

      gsap.utils.toArray<HTMLElement>('[data-problem-particle]').forEach((particle, index) => {
        gsap.to(particle, {
          yPercent: -90 - index * 5,
          xPercent: index % 2 === 0 ? 24 : -20,
          opacity: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=190%',
            scrub: true,
          },
        });
      });
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [reducedMotion]);

  return (
    <section id="problem" ref={sectionRef} className="relative min-h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          ref={dustyLayerRef}
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(168,85,40,0.38),transparent_46%),radial-gradient(circle_at_72%_66%,rgba(120,53,15,0.42),transparent_55%),linear-gradient(160deg,#110b05_0%,#050504_58%,#040506_100%)]"
        />

        <div className="absolute inset-0 opacity-55 [background-image:radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.16)_0.6px,transparent_1px)] [background-size:4px_4px]" />

        <div
          ref={neonLayerRef}
          className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(52,211,153,0.26),transparent_34%),radial-gradient(circle_at_78%_28%,rgba(34,211,238,0.24),transparent_40%),linear-gradient(160deg,#04130c_0%,#030809_46%,#020203_100%)] opacity-0"
        >
          <div className="absolute inset-0 opacity-45 [background:linear-gradient(rgba(34,197,94,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.3)_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            data-problem-particle
            className="absolute h-2 w-2 rounded-full bg-cyan-200/45 shadow-[0_0_18px_rgba(34,211,238,0.55)]"
            style={{
              top: `${30 + (index % 5) * 12}%`,
              left: `${8 + (index * 17) % 84}%`,
            }}
          />
        ))}

        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-6 md:px-10">
          <div ref={copyARef} className="max-w-3xl">
            <p className="mb-5 text-[11px] uppercase tracking-[0.34em] text-amber-200/80">
              Chapter 01 // The Problem
            </p>
            <h2 className="text-[clamp(2.3rem,6vw,5.5rem)] font-semibold uppercase leading-[0.9] text-amber-50/90">
              Weather Delays. Broken Equipment. Uncertain Labour.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-amber-100/75">
              Traditional farming operations stall when machinery access is fragmented and skilled
              workers are impossible to coordinate on time.
            </p>
          </div>

          <div ref={copyBRef} className="pointer-events-none absolute max-w-3xl opacity-0">
            <p className="mb-5 text-[11px] uppercase tracking-[0.34em] text-cyan-100/75">
              Morph Sequence // Digitized Operations
            </p>
            <h3 className="text-[clamp(2.3rem,6vw,5.5rem)] font-semibold uppercase leading-[0.9] text-cyan-50">
              Every Request Becomes a Live Signal in the Network.
            </h3>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-cyan-100/75">
              AgriServe transforms manual coordination into a real-time agritech grid with verified
              machines, providers, and labour availability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
