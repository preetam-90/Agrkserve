'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ProblemNarrative() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.problem-stage',
          start: 'top top',
          end: '+=260%',
          scrub: 0.85,
          pin: true,
        },
      });

      // Story arc: dusty pain on left -> digital future on right.
      tl.to('.problem-dust', { opacity: 0.18, duration: 1.1 })
        .to('.problem-neon', { opacity: 0.88, duration: 1.1 }, 0)
        .to('.problem-line-1', { opacity: 1, y: 0, duration: 0.65 }, 0.15)
        .to('.problem-line-2', { opacity: 1, y: 0, duration: 0.65 }, 0.42)
        .to('.problem-line-3', { opacity: 1, y: 0, duration: 0.65 }, 0.69)
        .to('.problem-resolution', { opacity: 1, y: 0, duration: 0.7 }, 1.0);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="problem" ref={rootRef} className="relative bg-[#070c09] px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto mb-16 max-w-4xl text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-cyan-300/90">Chapter 01</p>
        <h2 className="text-[clamp(2.9rem,6vw,5.4rem)] font-semibold leading-[0.9] tracking-[-0.02em] text-white">
          The Broken System
        </h2>
      </div>

      <div className="problem-stage relative mx-auto min-h-[82vh] max-w-7xl overflow-hidden rounded-[2.2rem] border border-white/10">
        <div className="absolute inset-0 grid md:grid-cols-2">
          <div className="relative bg-[#21170e]">
            <div className="problem-dust absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(146,64,14,0.48),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(120,53,15,0.36),transparent_55%)]" />
          </div>
          <div className="relative bg-[#070f0c]">
            <div className="problem-neon absolute inset-0 opacity-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.15)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[82vh] max-w-3xl flex-col items-center justify-center px-6 text-center text-zinc-100">
          <p className="problem-line-1 translate-y-10 text-2xl tracking-[-0.02em] opacity-0 md:text-5xl">
            Farmers wait for machines.
          </p>
          <p className="problem-line-2 mt-4 translate-y-10 text-2xl tracking-[-0.02em] opacity-0 md:text-5xl">
            Providers wait for demand.
          </p>
          <p className="problem-line-3 mt-4 translate-y-10 text-2xl tracking-[-0.02em] opacity-0 md:text-5xl">
            Labour waits for work.
          </p>
          <p className="problem-resolution mt-8 translate-y-10 text-xs uppercase tracking-[0.24em] text-emerald-200 opacity-0 md:text-sm">
            AgriServe merges all three into one live operating network.
          </p>
        </div>
      </div>
    </section>
  );
}
