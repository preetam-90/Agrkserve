'use client';

import { useLayoutEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface EquipmentUniverseChapterProps {
  reducedMotion?: boolean;
}

interface EquipmentCard {
  name: string;
  category: string;
  range: string;
  accent: string;
  description: string;
}

const equipmentCards: EquipmentCard[] = [
  {
    name: 'Autonomous Tractor X9',
    category: 'Field Mobility',
    range: '24/7 GPS Sync',
    accent: 'from-emerald-400/40 to-cyan-300/30',
    description: 'Precision tilling with telematics, route replay, and adaptive torque mapping.',
  },
  {
    name: 'HyperHarvest Combine',
    category: 'Harvest Operations',
    range: 'Realtime Yield Scan',
    accent: 'from-cyan-300/35 to-emerald-300/25',
    description:
      'High-throughput harvesting, loss analytics, and moisture-aware cutting orchestration.',
  },
  {
    name: 'Irrigation Drone Relay',
    category: 'Water Intelligence',
    range: 'Swarm Enabled',
    accent: 'from-lime-300/35 to-cyan-300/25',
    description:
      'Aerial irrigation monitoring and dispatch, coordinated to crop stage and terrain heat.',
  },
  {
    name: 'Soil Forge Seeder',
    category: 'Planting Systems',
    range: 'Variable Rate AI',
    accent: 'from-amber-500/30 to-emerald-400/25',
    description: 'Adaptive seed depth and row geometry mapped to live soil response data.',
  },
  {
    name: 'Pulse Sprayer Grid',
    category: 'Crop Protection',
    range: 'Micron Precision',
    accent: 'from-cyan-300/35 to-sky-300/25',
    description: 'Targeted spraying with drift control and per-zone nutrient calibration.',
  },
  {
    name: 'TerraScan Rover',
    category: 'Field Diagnostics',
    range: 'Terrain Mapping',
    accent: 'from-emerald-300/35 to-amber-500/30',
    description:
      'Ground-level diagnostics for compaction, moisture pockets, and crop stress zones.',
  },
];

function TiltCard({ card }: { card: EquipmentCard }) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 16, mass: 0.35 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 16, mass: 0.35 });

  const onMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    rotateX.set((0.5 - y) * 16);
    rotateY.set((x - 0.5) * 16);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      className="group relative flex min-h-[420px] w-[82vw] max-w-[520px] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border border-white/15 bg-black/45 p-7 backdrop-blur-xl md:w-[44vw]"
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 1200 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-75`} />
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen [background-image:radial-gradient(circle,rgba(255,255,255,0.38)_0.7px,transparent_1px)] [background-size:4px_4px]" />

      <div className="relative z-10 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/70">{card.category}</p>
        <h3 className="text-3xl font-semibold uppercase leading-tight text-white md:text-4xl">
          {card.name}
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-white/80 md:text-base">
          {card.description}
        </p>
      </div>

      <div className="relative z-10 mt-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-emerald-100/80">
        <span>{card.range}</span>
        <span className="rounded-full border border-white/20 px-3 py-1">Live Inventory</span>
      </div>
    </motion.article>
  );
}

export function EquipmentUniverseChapter({ reducedMotion = false }: EquipmentUniverseChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !trackRef.current || reducedMotion) return;

    const media = window.matchMedia('(min-width: 900px)');
    if (!media.matches) return;

    const context = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      const getScrollDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

      // Convert vertical scroll into a pinned horizontal product lane.
      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      gsap.utils.toArray<HTMLElement>('[data-equipment-parallax]').forEach((element, index) => {
        gsap.to(element, {
          yPercent: 16 + index * 10,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [reducedMotion]);

  return (
    <section id="equipment-universe" ref={sectionRef} className="relative bg-black py-24 md:py-36">
      <div className="relative mx-auto mb-14 flex max-w-7xl flex-col gap-5 px-6 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-100/70">
          Chapter 02 // Equipment Universe
        </p>
        <h2
          data-equipment-parallax
          className="max-w-5xl text-[clamp(2.2rem,6.7vw,6.3rem)] font-semibold uppercase leading-[0.9]"
        >
          Horizontal Access to Every Machine Class You Need.
        </h2>
        <p
          data-equipment-parallax
          className="max-w-3xl text-sm leading-relaxed text-white/75 md:text-lg"
        >
          Explore a cinematic inventory lane where every card represents a deployable machine with
          transparent availability, smart telemetry, and trusted providers.
        </p>
      </div>

      <div ref={trackRef} className="flex gap-6 px-6 pb-14 md:gap-8 md:px-10">
        {equipmentCards.map((card) => (
          <TiltCard key={card.name} card={card} />
        ))}
      </div>
    </section>
  );
}
