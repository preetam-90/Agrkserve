'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import { MagneticButton } from '@/components/ui/MagneticButton';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  images: string[] | null;
  price_per_day: number;
  location_name: string | null;
  is_available: boolean;
  rating?: number | null;
  category: string | null;
}

interface Props {
  equipment: Equipment[];
}

function ImmersiveShowcase({ equipment }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP: Horizontal scroll takeover
  useGSAPAnimation(
    (gsap) => {
      if (!sectionRef.current) return;

      const cards = gsap.utils.toArray('.showcase-card');
      const container = sectionRef.current.querySelector('.showcase-container');

      if (!container || cards.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const scrollWidth = (container as HTMLElement).scrollWidth - window.innerWidth;

        gsap.to(container, {
          x: -scrollWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${scrollWidth + window.innerHeight * 1.5}`,
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Each card gets 3D tilt reveal
        cards.forEach((card, i) => {
          gsap.from(card as HTMLElement, {
            rotateY: 45,
            opacity: 0,
            scale: 0.7,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: () => `top+=${i * 100} top`,
              end: () => `top+=${i * 100 + 300} top`,
              scrub: 2,
            },
          });
        });
      });

      // Mobile: vertical reveal
      mm.add('(max-width: 1023px)', () => {
        gsap.from(cards, {
          opacity: 0,
          y: 150,
          scale: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            toggleActions: 'play none none none',
          },
        });
      });

      return () => mm.revert();
    },
    [equipment]
  );

  if (equipment.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-black py-32 lg:h-screen">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#10b98115_0%,transparent_60%)]" />

      {/* Section header */}
      <div className="relative z-10 mb-20 px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl"
        >
          <h2 className="mb-6 text-6xl font-black uppercase tracking-tighter text-white lg:text-8xl">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Premium Fleet
            </span>
          </h2>
          <p className="text-2xl text-gray-400 lg:text-3xl">
            Cutting-edge machinery at your fingertips
          </p>
        </motion.div>
      </div>

      {/* Horizontal scroll container */}
      <div className="showcase-container flex gap-8 px-6 lg:gap-12 lg:px-8">
        {equipment.map((item) => (
          <MagneticButton key={item.id} strength={0.2}>
            <Link href={`/equipment/item/${item.id}`}>
              <motion.div
                className="showcase-card group relative h-[600px] w-[400px] shrink-0 overflow-hidden rounded-[3rem] bg-gradient-to-br from-zinc-900 to-black lg:h-[700px] lg:w-[500px]"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Image */}
                <div className="relative h-[60%] w-full overflow-hidden">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 400px, 500px"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-emerald-900/20 to-cyan-900/20" />
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Availability badge */}
                  <div className="absolute right-6 top-6">
                    <div
                      className={`rounded-full border px-4 py-2 backdrop-blur-xl ${
                        item.is_available
                          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                          : 'border-red-500/50 bg-red-500/20 text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${item.is_available ? 'animate-pulse bg-emerald-400' : 'bg-red-400'}`}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {item.is_available ? 'Available' : 'Booked'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative flex h-[40%] flex-col justify-between p-8">
                  <div>
                    <div className="mb-2 text-sm uppercase tracking-widest text-emerald-400">
                      {item.category || 'Equipment'}
                    </div>
                    <h3 className="mb-4 text-4xl font-black uppercase leading-tight text-white">
                      {item.name}
                    </h3>
                    {item.location_name && <p className="text-gray-400">{item.location_name}</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1 text-xs text-gray-500">Per Day</div>
                      <div className="text-3xl font-black text-emerald-400">
                        ₹{item.price_per_day.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <motion.div
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="h-6 w-6" />
                    </motion.div>
                  </div>
                </div>

                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 rounded-[3rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-2xl" />
                </div>
              </motion.div>
            </Link>
          </MagneticButton>
        ))}

        {/* CTA card at the end */}
        <motion.div className="showcase-card flex h-[600px] w-[400px] shrink-0 items-center justify-center rounded-[3rem] border-4 border-dashed border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl lg:h-[700px] lg:w-[500px]">
          <div className="text-center">
            <Zap className="mx-auto mb-6 h-20 w-20 text-emerald-400" />
            <h3 className="mb-4 text-3xl font-black text-white">Explore More</h3>
            <Link href="/equipment">
              <motion.button
                className="rounded-2xl bg-emerald-500 px-8 py-4 font-bold text-black transition-all hover:bg-emerald-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Equipment
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
