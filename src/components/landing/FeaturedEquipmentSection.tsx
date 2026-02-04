'use client';

import { motion } from 'framer-motion';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Star, MapPin, ChevronLeft, ChevronRight, Gauge, Zap, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  isLoading: boolean;
}

export function FeaturedEquipmentSection({ equipment, isLoading }: FeaturedEquipmentSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate floating particles for depth - deterministic for SSR
  const particles = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${(i * 10) % 100}%`,
      top: `${(i * 9.09 + 5) % 100}%`,
      size: 1 + (i % 3),
      delay: (i * 0.6) % 6,
      duration: 18 + (i % 12),
    }));
  }, []);

  // Generate neon grid lines
  const neonLines = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: -15 + i * 6,
      delay: i * 0.4,
    }));
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || !scrollContainerRef.current || equipment.length === 0) return;

    autoScrollInterval.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = 2; // Slow smooth scroll
        container.scrollLeft += scrollAmount;

        // Loop back to start when reaching end
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 10) {
          container.scrollLeft = 0;
        }
      }
    }, 30);

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [isAutoScrolling, equipment.length]);

  // Stop auto-scroll on user interaction
  const handleUserInteraction = () => {
    setIsAutoScrolling(false);
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    handleUserInteraction();
    if (scrollContainerRef.current) {
      const scrollAmount = 450;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-32 w-full max-w-full overflow-hidden relative">
      {/* Seamless continuation from CategoriesSection (#0A0F0C) */}
      <div className="absolute inset-0 bg-[#0A0F0C]" />
      
      {/* Neon Tilted Grid Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {neonLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute w-[200%] h-[1px] left-[-50%]"
            style={{
              top: `${20 + line.id * 12}%`,
              transform: `rotate(${line.angle}deg)`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.4) 50%, transparent 100%)',
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
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/5 w-[500px] h-[500px] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.07) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 40, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/5 w-[450px] h-[450px] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.25, 1, 1.25],
            x: [0, -40, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
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
            y: [0, -50, 0],
            x: [0, 15, 0],
            opacity: [0.15, 0.4, 0.15],
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
        className="absolute inset-0 opacity-[0.01] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Very subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-5 py-2.5 mb-8 text-sm font-black tracking-[0.2em] text-cyan-400 uppercase bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Premium Fleet
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]"
            >
              <span className="bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                Elite Machinery
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl"
            >
              Next-generation agricultural powerhouses. Verified equipment from elite providers.
            </motion.p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="w-14 h-14 rounded-full border-cyan-500/30 bg-cyan-500/10 backdrop-blur-xl hover:bg-cyan-500 hover:text-black transition-all duration-500 group shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)]"
            >
              <ChevronLeft className="w-6 h-6 group-active:scale-90 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="w-14 h-14 rounded-full border-cyan-500/30 bg-cyan-500/10 backdrop-blur-xl hover:bg-cyan-500 hover:text-black transition-all duration-500 group shadow-[0_0_50px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)]"
            >
              <ChevronRight className="w-6 h-6 group-active:scale-90 transition-transform" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onMouseEnter={handleUserInteraction}
          onTouchStart={handleUserInteraction}
          onWheel={handleUserInteraction}
          className="flex gap-8 overflow-x-auto pb-20 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[400px] h-[700px] bg-zinc-900/50 rounded-[2rem] animate-pulse border border-white/5" />
            ))
          ) : (
            equipment.map((item, index) => {
              const gradients = [
                'from-cyan-500 via-emerald-500 to-cyan-500',
                'from-purple-500 via-pink-500 to-purple-500',
                'from-amber-500 via-orange-500 to-amber-500'
              ];
              const gradient = gradients[index % 3];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="min-w-[380px] md:min-w-[420px] snap-start"
                >
                  <Link href={`/equipment/${item.id}`} className="block group">
                    <div className="relative h-[700px] rounded-[2rem] overflow-hidden bg-zinc-950 transition-all duration-700 group-hover:scale-[1.02]">

                      {/* Animated Gradient Border */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl`} />
                      <div className="absolute inset-[1px] rounded-[2rem] bg-zinc-950 z-10" />

                      {/* Content Container */}
                      <div className="relative z-20 h-full flex flex-col p-6">

                        {/* Image Section */}
                        <div className="relative h-[340px] rounded-[1.5rem] overflow-hidden mb-6 group-hover:shadow-[0_20px_60px_rgba(6,182,212,0.4)] transition-all duration-700">
                          {item.images && item.images[0] ? (
                            <>
                              <Image
                                src={item.images[0]}
                                alt={item.name}
                                fill
                                className="object-cover transition-all duration-1000 scale-100 group-hover:scale-110"
                              />
                              {/* Holographic Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                              <span className="text-zinc-600 text-xs font-black uppercase tracking-[0.3em]">No Image</span>
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className={`absolute top-4 left-4 px-4 py-2 rounded-full backdrop-blur-2xl border ${item.is_available
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-red-500/20 border-red-500/50 text-red-300'
                            } shadow-[0_0_20px_rgba(16,185,129,0.5)]`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                {item.is_available ? 'Available' : 'Booked'}
                              </span>
                            </div>
                          </div>

                          {/* Price Tag */}
                          <div className="absolute top-4 right-4 px-4 py-2 rounded-full backdrop-blur-2xl bg-black/60 border border-white/20">
                            <div className="text-right">
                              <span className="block text-2xl font-black text-white leading-none">₹{item.price_per_day}</span>
                              <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-400">/day</span>
                            </div>
                          </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            {/* Title */}
                            <div>
                              {(item.brand || item.model) && (
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.25em]">
                                    {item.brand}
                                  </span>
                                  <div className="w-3 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent" />
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">
                                    {item.model}
                                  </span>
                                </div>
                              )}
                              <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 group-hover:bg-clip-text transition-all duration-500 uppercase leading-tight">
                                {item.name}
                              </h3>
                            </div>

                            {/* Location & Rating */}
                            <div className="flex items-center gap-4 text-zinc-400">
                              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                                {item.location_name || 'Location'}
                              </div>
                              {item.rating && (
                                <>
                                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                  <div className="flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[11px] font-bold">{item.rating}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Specs */}
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { label: 'Power', val: `${item.horsepower || '---'} HP`, icon: Gauge },
                                { label: 'Fuel', val: item.fuel_type || 'Diesel', icon: Zap },
                                { label: 'Year', val: item.year || '2024', icon: Calendar }
                              ].map((spec, i) => (
                                <div key={i} className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-3 border border-white/5 group-hover:border-cyan-500/30 transition-all duration-500">
                                  <spec.icon className="w-4 h-4 text-cyan-400 mb-2" />
                                  <span className="block text-[8px] uppercase font-black text-zinc-600 tracking-wider mb-1">{spec.label}</span>
                                  <span className="text-[11px] font-bold text-white">{spec.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="pt-6">
                            <div className={`relative w-full h-14 rounded-xl overflow-hidden group-hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all duration-500`}>
                              <div className={`absolute inset-0 bg-gradient-to-r ${gradient} animate-gradient-x`} />
                              <div className="absolute inset-[1px] bg-zinc-950 rounded-xl flex items-center justify-center gap-2 group-hover:bg-transparent transition-all duration-500">
                                <span className="font-black text-base uppercase tracking-wider text-white">
                                  Rent Now
                                </span>
                                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

    </section>
  );
}
