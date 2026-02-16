'use client';

import { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FutureVisionChapterProps {
  reducedMotion?: boolean;
}

const drones = [
  { id: 1, left: '10%', top: '28%', delay: 0 },
  { id: 2, left: '42%', top: '18%', delay: 0.5 },
  { id: 3, left: '74%', top: '32%', delay: 0.9 },
];

export function FutureVisionChapter({ reducedMotion = false }: FutureVisionChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const context = gsap.context(() => {
      // Light rays \u2014 staggered reveal with intensity build
      gsap.fromTo(
        '[data-light-ray]',
        { opacity: 0, scaleY: 0.3, transformOrigin: 'top center' },
        {
          opacity: 0.75,
          scaleY: 1,
          stagger: 0.08,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            end: 'center center',
            scrub: 0.9,
          },
        }
      );

      // Light rays \u2014 gentle breathing pulse after reveal
      gsap.utils.toArray<HTMLElement>('[data-light-ray]').forEach((ray, index) => {
        gsap.to(ray, {
          opacity: 0.45 + (index % 3) * 0.1,
          duration: 3 + index * 0.5,
          delay: 1.5 + index * 0.1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Heading \u2014 clip-path reveal with y drift
      gsap.fromTo(
        '[data-future-copy]',
        { y: 55, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
        {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'center center',
            scrub: 0.7,
          },
        }
      );

      // Drone tags \u2014 cascade entrance from above before orbital loop
      gsap.fromTo(
        '[data-drone-tag]',
        { opacity: 0, y: -40, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: 'back.out(1.6)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Background farmland gradient \u2014 parallax rise
      gsap.to('[data-future-farm]', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.4,
        },
      });
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#020203_0%,#03090a_40%,#010101_100%)] py-[var(--landing-section-y)]"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}
    >
      <div
        data-scroll-depth
        className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(16,185,129,0.24),transparent_30%),radial-gradient(circle_at_72%_36%,rgba(34,211,238,0.26),transparent_34%),radial-gradient(circle_at_48%_80%,rgba(120,53,15,0.2),transparent_45%)]"
      />

      <div
        data-future-farm
        className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(180deg,rgba(16,185,129,0)_0%,rgba(16,185,129,0.22)_100%)]"
      />
      <div
        data-scroll-depth
        className="absolute inset-x-0 bottom-0 h-[36%] opacity-60 [background-size:48px_48px] [background:linear-gradient(rgba(34,197,94,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.08)_1px,transparent_1px)]"
      />

      {Array.from({ length: 8 }).map((_, index) => (
        <span
          key={index}
          data-light-ray
          className="absolute top-[18%] h-[48vh] w-[2px] origin-top bg-gradient-to-b from-cyan-100/35 via-emerald-100/20 to-transparent"
          style={{ left: `${8 + index * 11}%` }}
        />
      ))}

      {drones.map((drone) => (
        <motion.div
          key={drone.id}
          data-drone-tag
          className="absolute z-10"
          style={{ left: drone.left, top: drone.top }}
          animate={
            reducedMotion
              ? { x: 0, y: 0 }
              : {
                  x: [0, 24, -16, 0],
                  y: [0, -16, 10, 0],
                  rotate: [0, 6, -4, 0],
                }
          }
          transition={{
            duration: 8 + drone.id,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: drone.delay,
          }}
        >
          <div className="rounded-full border border-cyan-100/35 bg-cyan-200/20 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-cyan-100">
            Drone {drone.id}
          </div>
          <div className="mx-auto h-8 w-px bg-gradient-to-b from-cyan-100/35 to-transparent" />
        </motion.div>
      ))}

      <div
        data-future-copy
        className="relative z-20 mx-auto w-full max-w-[var(--landing-max-width)] px-[var(--landing-padding-x)]"
      >
        <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-100/75">
          Chapter 06 // Future Vision
        </p>
        <h2 className="mt-5 max-w-5xl text-[clamp(2.3rem,6.7vw,6.2rem)] font-semibold uppercase leading-[0.88] text-white">
          Cybernetic Farms. Autonomous Fleets. Glowing Fields of Precision.
        </h2>
        <p className="mt-7 max-w-3xl text-sm leading-relaxed text-white/75 md:text-lg">
          The next decade of agriculture is orchestrated by data-rich equipment, predictive labour
          routing, and coordinated field intelligence that keeps every acre productive.
        </p>
      </div>
    </section>
  );
}
