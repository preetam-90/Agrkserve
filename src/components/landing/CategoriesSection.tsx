'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import Link from 'next/link';
import { Tractor, Truck, Users, ArrowRight } from 'lucide-react';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import { useDeviceCapability } from '@/lib/animations/device-capability';

const categories = [
  {
    icon: Tractor,
    title: 'Equipment',
    description: 'Tractors, harvesters, tillers, and more premium machinery',
    href: '/equipment',
    gradient: 'from-emerald-500 to-teal-500',
    image: 'bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.3),transparent)]',
  },
  {
    icon: Truck,
    title: 'Vehicles',
    description: 'Trucks, trailers, and transport solutions for your farm',
    href: '/equipment?category=vehicles',
    gradient: 'from-amber-500 to-orange-500',
    image: 'bg-[radial-gradient(circle_at_70%_50%,rgba(245,158,11,0.3),transparent)]',
  },
  {
    icon: Users,
    title: 'Labor',
    description: 'Skilled workers, operators, and agricultural experts',
    href: '/labour',
    gradient: 'from-blue-500 to-cyan-500',
    image: 'bg-[radial-gradient(circle_at_50%_70%,rgba(59,130,246,0.3),transparent)]',
  },
];

export function CategoriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const deviceInfo = useDeviceCapability();

  // GSAP: Stagger category cards
  useGSAPAnimation((gsap) => {
    gsap.from('.category-card', {
      opacity: 0,
      y: 70,
      rotateX: -15,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.categories-grid',
        start: 'top center+=100',
        toggleActions: 'play none none none',
      },
    });
  }, []);

  // GSAP: Magnetic hover effect (high-end devices only)
  useGSAPAnimation(
    (gsap) => {
      if (deviceInfo.capability !== 'high') return;

      const cards = document.querySelectorAll('.category-card');

      cards.forEach((card) => {
        const handleMouseMove = (e: Event) => {
          const mouseEvent = e as unknown as MouseEvent;
          const rect = card.getBoundingClientRect();
          const x = (mouseEvent.clientX - rect.left - rect.width / 2) * 0.15;
          const y = (mouseEvent.clientY - rect.top - rect.height / 2) * 0.15;

          gsap.to(card, {
            x,
            y,
            duration: 0.4,
            ease: 'power2.out',
          });

          // Also animate icon
          const icon = card.querySelector('.category-icon');
          if (icon) {
            gsap.to(icon, {
              scale: 1.2,
              rotate: 8,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
          });

          const icon = card.querySelector('.category-icon');
          if (icon) {
            gsap.to(icon, {
              scale: 1,
              rotate: 0,
              duration: 0.4,
              ease: 'power2.out',
            });
          }
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
      });
    },
    [deviceInfo.capability]
  );

  // Generate floating shapes for depth - deterministic for SSR
  const floatingShapes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${(i * 12.5) % 100}%`,
      top: `${(i * 11.11 + 10) % 100}%`,
      size: 50 + i * 15,
      delay: (i * 0.5) % 4,
      duration: 12 + (i % 8),
      rotation: i * 45,
    }));
  }, []);

  // Generate animated texture waves
  const textureWaves = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      delay: i * 1.5,
      duration: 8 + i * 2,
    }));
  }, []);

  // Generate neon grid lines
  const neonLines = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      angle: -20 + i * 10,
      delay: i * 0.6,
    }));
  }, []);

  return (
    <section ref={ref} className="relative w-full max-w-full overflow-hidden py-32">
      {/* Seamless continuation from StatsSection (#0A0F0C) */}
      <div className="absolute inset-0 bg-[#0A0F0C]" />

      {/* Animated Texture Waves */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {textureWaves.map((wave) => (
          <motion.div
            key={wave.id}
            className="absolute left-[-50%] top-[-50%] h-[200%] w-[200%]"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, rgba(34, 197, 94, ${0.03 + wave.id * 0.01}) 0%, transparent 50%)`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: wave.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: wave.delay,
            }}
          />
        ))}
      </div>

      {/* Neon Tilted Grid Lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {neonLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute left-[-40%] h-[1px] w-[180%]"
            style={{
              top: `${20 + line.id * 15}%`,
              transform: `rotate(${line.angle}deg)`,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
            }}
            animate={{
              x: ['-40%', '40%', '-40%'],
              opacity: [0.25, 0.5, 0.25],
            }}
            transition={{
              duration: 12 + line.id,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: line.delay,
            }}
          />
        ))}
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        <motion.div
          className="left-1/5 absolute top-1/3 h-[500px] w-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="right-1/5 absolute bottom-1/3 h-[400px] w-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
      </div>

      {/* Floating geometric shapes */}
      {floatingShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full border border-emerald-500/10"
          style={{
            left: shape.left,
            top: shape.top,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [0, -40, 0],
            rotate: [0, shape.rotation, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Refined noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h2 className="mb-6 text-5xl font-bold text-white md:text-6xl">What Do You Need?</h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            Choose from our comprehensive range of agricultural solutions
          </p>
        </motion.div>

        <div className="categories-grid grid grid-cols-1 gap-8 lg:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="category-card"
            >
              <Link href={category.href} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-emerald-500/30 hover:bg-white/10">
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 ${category.image} opacity-50`} />

                  {/* Hover Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
                  />

                  {/* 3D Tilt Effect Container */}
                  <div className="relative z-10 flex h-full flex-col">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${category.gradient} group-hover:shadow-3xl category-icon shadow-2xl transition-shadow`}
                    >
                      <category.icon className="h-10 w-10 text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="mb-4 text-3xl font-bold text-white transition-colors group-hover:text-emerald-400">
                      {category.title}
                    </h3>
                    <p className="mb-8 flex-grow text-lg text-gray-400">{category.description}</p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 font-semibold text-emerald-400 transition-all group-hover:gap-4">
                      <span>Explore</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>

                  {/* Border Glow Animation */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${category.gradient} opacity-20 blur-xl`}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
