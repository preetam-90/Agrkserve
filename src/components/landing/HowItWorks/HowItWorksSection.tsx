'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { title: 'Discover', text: 'Browse equipment and labour by location and reliability score.' },
  { title: 'Book', text: 'Lock machine slots and skilled workers in one coordinated timeline.' },
  {
    title: 'Execute',
    text: 'Run operations with transparent fulfilment and live status visibility.',
  },
];

export function HowItWorksSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '.how-stage',
        start: 'top top',
        end: '+=220%',
        pin: true,
      });

      gsap.to('.how-progress-fill', {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.how-steps',
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: 0.85,
        },
      });

      gsap.fromTo(
        '.how-item',
        { opacity: 0.25, x: 30 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.3,
          duration: 0.65,
          scrollTrigger: {
            trigger: '.how-steps',
            start: 'top 75%',
            end: 'bottom 40%',
            scrub: 0.7,
          },
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={rootRef} className="bg-[#08100c] px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto mb-14 max-w-7xl">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-cyan-300/90">Chapter 05</p>
        <h2 className="max-w-4xl text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.02em] text-white">
          How It Works
        </h2>
      </div>

      <div className="how-stage mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-[#0a120e] p-6 md:p-10">
        <div className="grid gap-10 md:grid-cols-[140px_1fr]">
          <div className="relative hidden md:block">
            <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-white/10" />
            <div className="how-progress-fill absolute left-1/2 top-0 h-0 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300 to-cyan-300" />
          </div>

          <div className="how-steps space-y-5">
            {steps.map((step, i) => (
              <article
                key={step.title}
                className="how-item bg-white/8 rounded-3xl border border-white/10 p-7 backdrop-blur-2xl md:p-9"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Phase 0{i + 1}</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-3xl text-zinc-300 md:text-lg">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
