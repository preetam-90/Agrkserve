'use client';

import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Star, MapPin, Gauge, Zap, ArrowRight, Calendar, Sparkles, Tractor } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface Equipment {
  id: string;
  name: string;
  images: string[] | null;
  price_per_day: number;
  location_name: string | null;
  is_available: boolean;
  rating?: number | null;
  category: string | null;
  description?: string;
  brand?: string;
  model?: string;
  year?: number;
  horsepower?: number;
  fuel_type?: string;
  features?: string[];
}

interface FeaturedEquipmentSectionProps {
  equipment: Equipment[];
}

export function FeaturedEquipmentSection({ equipment }: FeaturedEquipmentSectionProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const maxScrollRef = useRef(0);

  const stopAutoScroll = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    setIsPaused(true);
    isPausedRef.current = true;
  }, []);

  const resumeAutoScroll = useCallback((delay = 1500) => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      isPausedRef.current = false;
    }, delay);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const content = scrollContentRef.current;
    if (!container || !content) return;

    const lenis = new Lenis({
      wrapper: container,
      content,
      orientation: 'horizontal',
      gestureOrientation: 'horizontal',
      smoothWheel: true,
      lerp: 0.2,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    const updateMaxScroll = () => {
      maxScrollRef.current = container.scrollWidth / 2;
    };

    updateMaxScroll();

    const resizeObserver = new ResizeObserver(updateMaxScroll);
    resizeObserver.observe(content);

    let rafId = 0;
    let lastTime = performance.now();
    const speedPxPerMs = 0.02; // ~20px/sec

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      lenis.raf(now);

      if (!isPausedRef.current) {
        const maxScroll = maxScrollRef.current;
        if (maxScroll > 0) {
          const next = container.scrollLeft + delta * speedPxPerMs;
          if (next >= maxScroll) {
            lenis.scrollTo(next - maxScroll, { immediate: true });
          } else if (next < 0) {
            lenis.scrollTo(next + maxScroll, { immediate: true });
          } else {
            lenis.scrollTo(next, { immediate: true });
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  // Generate floating particles for depth - deterministic for SSR
  const particles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: `${(i * 15) % 100}%`,
      top: `${(i * 12 + 10) % 100}%`,
      size: 2 + (i % 2),
      delay: i % 3,
      duration: 15 + (i % 5),
    }));
  }, []);

  // Generate neon grid lines
  const neonLines = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      angle: -10 + i * 5,
      delay: i * 0.5,
    }));
  }, []);

  return (
    <section className="relative w-full max-w-full overflow-hidden py-32">
      {/* Seamless continuation from CategoriesSection (#0A0F0C) */}
      <div className="absolute inset-0 bg-[#0A0F0C]" />

      {/* Neon Tilted Grid Lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {neonLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute left-[-50%] h-[1px] w-[200%]"
            style={{
              top: `${20 + line.id * 12}%`,
              transform: `rotate(${line.angle}deg)`,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.4) 50%, transparent 100%)',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.6)',
            }}
            animate={{
              x: ['-50%', '50%', '-50%'],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8 + line.id,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: line.delay,
            }}
          />
        ))}
      </div>

      {/* Animated gradient orbs for depth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.07)_0%,transparent_70%)]" />
        <div
          className="absolute bottom-1/3 right-1/4 h-[450px] w-[450px] animate-pulse rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.06)_0%,transparent_70%)]"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/15"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Refined noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.01]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-5 py-2.5 text-sm font-black uppercase tracking-[0.2em] text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              Premium Fleet
            </motion.div>
            <h2 className="mb-8 text-6xl font-black leading-[0.9] tracking-tighter md:text-8xl">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                Elite Machinery
              </span>
            </h2>
            <p className="max-w-2xl text-xl font-medium text-zinc-400 md:text-2xl">
              Next-generation agricultural powerhouses. Verified equipment from elite providers.
            </p>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="scrollbar-hide relative w-full overflow-x-auto overflow-y-hidden"
        onMouseEnter={stopAutoScroll}
        onMouseLeave={() => resumeAutoScroll(1500)}
        onFocusCapture={stopAutoScroll}
        onBlurCapture={() => resumeAutoScroll(1500)}
        onWheel={() => {
          stopAutoScroll();
          resumeAutoScroll(2000);
        }}
        onTouchStart={() => {
          stopAutoScroll();
          resumeAutoScroll(2000);
        }}
        onPointerDown={() => {
          stopAutoScroll();
          resumeAutoScroll(2000);
        }}
      >
        {equipment.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <Tractor className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">No Equipment Available</h3>
              <p className="text-gray-400">Check back soon for new listings!</p>
            </div>
          </div>
        ) : (
          <div
            ref={scrollContentRef}
            className="flex gap-8 px-4"
            style={{
              width: 'max-content',
            }}
          >
            {/* Double the list for infinite scroll */}
            {[...equipment, ...equipment].map((item, index) => {
              const gradients = [
                'from-cyan-500 via-emerald-500 to-cyan-500',
                'from-purple-500 via-pink-500 to-purple-500',
                'from-amber-500 via-orange-500 to-amber-500',
              ];
              const gradient = gradients[index % 3];

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="w-[320px] shrink-0 sm:w-[360px] lg:w-[420px]"
                >
                  <Link href={`/equipment/item/${item.id}`} className="group block">
                    <div className="relative h-[700px] overflow-hidden rounded-[2rem] bg-zinc-950 transition-transform duration-500 group-hover:scale-[1.01]">
                      {/* Animated Gradient Border */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100`}
                      />
                      <div className="absolute inset-[1px] z-10 rounded-[2rem] bg-zinc-950" />

                      {/* Content Container */}
                      <div className="relative z-20 flex h-full flex-col p-6">
                        {/* Image Section */}
                        <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-zinc-900">
                          {item.images && item.images[0] ? (
                            <>
                              <div className="absolute inset-0">
                                <Image
                                  src={item.images[0]}
                                  alt=""
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="h-full w-full scale-110 object-cover object-center opacity-40 blur-2xl"
                                  loading="lazy"
                                  quality={40}
                                  aria-hidden
                                />
                              </div>
                              <div className="relative h-full w-full">
                                <Image
                                  src={item.images[0]}
                                  alt={item.name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="h-full w-full scale-100 object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                  loading="lazy"
                                  quality={85}
                                />
                              </div>
                              {/* Holographic Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-emerald-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            </>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">
                                No Image
                              </span>
                            </div>
                          )}

                          {/* Status Badge */}
                          <div
                            className={`absolute left-4 top-4 rounded-full border px-4 py-2 backdrop-blur-md ${
                              item.is_available
                                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                                : 'border-red-500/50 bg-red-500/20 text-red-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${item.is_available ? 'animate-pulse bg-emerald-400' : 'bg-red-400'}`}
                              />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                {item.is_available ? 'Available' : 'Booked'}
                              </span>
                            </div>
                          </div>

                          {/* Price Tag */}
                          <div className="absolute right-4 top-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/30 backdrop-blur-md transition-colors duration-500 group-hover:border-cyan-500/50 group-hover:bg-zinc-950/80">
                            <div className="relative px-5 py-3">
                              <div className="relative flex flex-col items-end">
                                <div className="flex items-baseline gap-0.5">
                                  <span className="font-mono text-sm font-bold text-cyan-400">
                                    ₹
                                  </span>
                                  <span className="font-mono text-2xl font-black tracking-tighter text-white">
                                    {item.price_per_day.toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors duration-500 group-hover:text-cyan-200/70">
                                  Per Day
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="space-y-4">
                            {/* Title */}
                            <div>
                              {(item.brand || item.model) && (
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                                    {item.brand}
                                  </span>
                                  <div className="h-[1px] w-3 bg-gradient-to-r from-cyan-500 to-transparent" />
                                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                                    {item.model}
                                  </span>
                                </div>
                              )}
                              <h3 className="text-3xl font-black uppercase leading-tight tracking-tight text-white transition-colors duration-500 group-hover:text-cyan-400 lg:text-4xl">
                                {item.name}
                              </h3>
                            </div>

                            {/* Location & Rating */}
                            <div className="flex items-center gap-4 text-zinc-400">
                              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                                {item.location_name || 'Location'}
                              </div>
                              {item.rating && (
                                <>
                                  <div className="h-1 w-1 rounded-full bg-zinc-700" />
                                  <div className="flex items-center gap-1.5">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-[11px] font-bold">{item.rating}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Specs */}
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                {
                                  label: 'Power',
                                  val: `${item.horsepower || '---'} HP`,
                                  icon: Gauge,
                                },
                                { label: 'Fuel', val: item.fuel_type || 'Diesel', icon: Zap },
                                { label: 'Year', val: item.year || '2024', icon: Calendar },
                              ].map((spec, i) => (
                                <div
                                  key={i}
                                  className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 backdrop-blur-xl transition-colors duration-500 group-hover:border-cyan-500/30"
                                >
                                  <spec.icon className="mb-2 h-4 w-4 text-cyan-400" />
                                  <span className="mb-1 block text-[8px] font-black uppercase tracking-wider text-zinc-600">
                                    {spec.label}
                                  </span>
                                  <span className="text-[11px] font-bold text-white">
                                    {spec.val}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="pt-6">
                            <div className="relative h-14 w-full overflow-hidden rounded-xl bg-zinc-900 transition-colors duration-500 group-hover:bg-zinc-800">
                              <div className="absolute inset-0 flex items-center justify-center gap-2">
                                <span className="text-base font-black uppercase tracking-wider text-white">
                                  Rent Now
                                </span>
                                <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
