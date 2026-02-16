'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProviderNetworkChapterProps {
  reducedMotion?: boolean;
}

interface NetworkStat {
  label: string;
  value: number;
  suffix: string;
}

const stats: NetworkStat[] = [
  { label: 'Verified Providers', value: 12840, suffix: '+' },
  { label: 'Active Equipment Listings', value: 78650, suffix: '+' },
  { label: 'Avg Match Time', value: 6, suffix: ' min' },
  { label: 'Daily Booking Signals', value: 142000, suffix: '+' },
];

function useCountUp(target: number, shouldAnimate: boolean, reducedMotion: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shouldAnimate || reducedMotion) return;

    let frame = 0;
    const startTime = performance.now();
    const duration = 1400;

    const step = (time: number) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, shouldAnimate, target]);

  if (reducedMotion) return target;
  return shouldAnimate ? value : 0;
}

function CountCard({
  stat,
  shouldAnimate,
  reducedMotion,
}: {
  stat: NetworkStat;
  shouldAnimate: boolean;
  reducedMotion: boolean;
}) {
  const value = useCountUp(stat.value, shouldAnimate, reducedMotion);

  return (
    <motion.article
      whileHover={reducedMotion ? {} : { y: -8, scale: 1.01 }}
      className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-5 backdrop-blur-xl md:p-6"
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/70">{stat.label}</p>
      <p className="mt-4 text-[clamp(1.75rem,5vw,3rem)] font-semibold uppercase text-white">
        {value.toLocaleString()}
        {stat.suffix}
      </p>
    </motion.article>
  );
}

export function ProviderNetworkChapter({ reducedMotion = false }: ProviderNetworkChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const context = gsap.context(() => {
      // Heading reveal with clip-path wipe
      gsap.fromTo(
        '[data-provider-heading]',
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Stat cards — cascade with 3D perspective rotation
      gsap.fromTo(
        '[data-provider-panel]',
        { opacity: 0, y: 60, rotateX: -12, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 1,
          stagger: 0.14,
          ease: 'power3.out',
          clearProps: 'rotateX',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Network nodes — organic pulse with offset phases
      gsap.utils.toArray<HTMLElement>('[data-network-node]').forEach((node, index) => {
        gsap.to(node, {
          scale: 1.5,
          opacity: 1,
          boxShadow: '0 0 24px rgba(34,211,238,0.8)',
          duration: 1.8 + (index % 4) * 0.5,
          delay: (index % 5) * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Section-level parallax for depth
      gsap.to('[data-provider-bg]', {
        yPercent: -8,
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

  const nodes = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, index) => ({
        id: index,
        top: `${18 + ((index * 13) % 64)}%`,
        left: `${5 + ((index * 19) % 90)}%`,
      })),
    []
  );

  return (
    <section
      id="provider-network"
      ref={sectionRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#010302_0%,#03110c_45%,#020606_100%)] py-[var(--landing-section-y)]"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}
    >
      <div
        data-provider-bg
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(34,197,94,0.24),transparent_36%),radial-gradient(circle_at_72%_30%,rgba(34,211,238,0.22),transparent_38%)]"
      />
      <div className="absolute inset-0 opacity-35 [background-size:84px_84px] [background:linear-gradient(rgba(34,197,94,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.12)_1px,transparent_1px)]" />

      {nodes.map((node) => (
        <span
          key={node.id}
          data-network-node
          className="absolute h-2 w-2 rounded-full bg-cyan-100/55 opacity-50 shadow-[0_0_18px_rgba(34,211,238,0.65)]"
          style={{ top: node.top, left: node.left }}
        />
      ))}

      <div className="relative z-10 mx-auto w-full max-w-[var(--landing-max-width)] px-[var(--landing-padding-x)]">
        <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-100/75">
          Chapter 03 // Provider Network
        </p>
        <h2
          data-provider-heading
          className="mt-4 max-w-5xl text-[clamp(2.2rem,6vw,5.5rem)] font-semibold uppercase leading-[0.9] text-white"
        >
          A Connected Marketplace of Owners, Operators, and Live Inventory.
        </h2>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-white/75 md:text-lg">
          Verified providers publish machines into a real-time network, while demand routing maps
          farmers to the nearest available options with transparent pricing intelligence.
        </p>

        <div className="mt-12 grid gap-5 min-[414px]:grid-cols-2 md:mt-14">
          {stats.map((stat) => (
            <div key={stat.label} data-provider-panel>
              <CountCard stat={stat} shouldAnimate={isInView} reducedMotion={reducedMotion} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
