'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { Tractor, Users, Wrench, Star } from 'lucide-react';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';

interface StatsSectionProps {
  stats?: {
    totalEquipment: number;
    totalUsers: number;
    totalLabour: number;
    totalBookings: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // GSAP: Stagger stat cards on scroll
  useGSAPAnimation((gsap) => {
    gsap.from('.stat-card', {
      opacity: 0,
      y: 50,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.stats-grid',
        start: 'top center+=100',
        toggleActions: 'play none none none',
      },
    });
  }, []);

  // GSAP: Counter animation
  useGSAPAnimation(
    (gsap) => {
      const counterElements = document.querySelectorAll('.stat-counter');
      counterElements.forEach((el) => {
        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const counter = { val: 0 };

        gsap.to(counter, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top center+=150',
            toggleActions: 'play none none none',
          },
          onUpdate: () => {
            el.textContent = Math.floor(counter.val).toLocaleString('en-IN') + suffix;
          },
        });
      });
    },
    [isInView]
  );

  // Generate floating particles for depth - deterministic for SSR
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${(i * 8.33) % 100}%`,
      top: `${(i * 7.69 + 5) % 100}%`,
      size: 2 + (i % 3),
      delay: (i * 0.4) % 5,
      duration: 15 + (i % 10),
    }));
  }, []);

  // Generate neon grid intersection points
  const neonPoints = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${i * 12.5 + 6}%`,
      top: `${i * 10 + 10}%`,
      delay: i * 0.3,
    }));
  }, []);

  const displayStats = [
    {
      icon: Tractor,
      value: stats?.totalEquipment || 1500,
      suffix: '+',
      label: 'Machinery Fleet',
      color: 'from-emerald-400 to-teal-400',
      shadow: 'shadow-emerald-500/20',
    },
    {
      icon: Users,
      value: stats?.totalUsers || 5000,
      suffix: '+',
      label: 'Elite Partners',
      color: 'from-amber-400 to-orange-400',
      shadow: 'shadow-amber-500/20',
    },
    {
      icon: Wrench,
      value: stats?.totalLabour || 800,
      suffix: '+',
      label: 'Certified Experts',
      color: 'from-blue-400 to-cyan-400',
      shadow: 'shadow-blue-500/20',
    },
    {
      icon: Star,
      value: stats?.totalBookings || 3000,
      suffix: '+',
      label: 'Succesful Missions',
      color: 'from-purple-400 to-pink-400',
      shadow: 'shadow-purple-500/20',
    },
  ];

  return (
    <section ref={ref} className="relative w-full max-w-full overflow-hidden py-32">
      {/* Seamless continuation from Hero (#0A0F0C) */}
      <div className="absolute inset-0 bg-[#0A0F0C]" />

      {/* Neon Tilted Grid Lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Horizontal grid lines with perspective */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-[1px]"
            style={{
              top: `${15 + i * 14}%`,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.3) 50%, transparent 100%)',
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleX: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Vertical grid lines with perspective */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="absolute bottom-0 top-0 w-[1px]"
            style={{
              left: `${10 + i * 20}%`,
              background:
                'linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.25) 50%, transparent 100%)',
              boxShadow: '0 0 8px rgba(20, 184, 166, 0.4)',
            }}
            animate={{
              opacity: [0.25, 0.5, 0.25],
              scaleY: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 5 + i * 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Neon intersection points */}
        {neonPoints.map((point) => (
          <motion.div
            key={point.id}
            className="absolute h-2 w-2 rounded-full"
            style={{
              left: point.left,
              top: point.top,
              background:
                'radial-gradient(circle, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0) 70%)',
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.4)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: point.delay,
            }}
          />
        ))}
      </div>

      {/* Animated radial gradient for depth */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.06) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Floating particles for depth */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-emerald-400/20"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, 0],
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

      {/* Refined noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_40%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24 text-center"
        >
          <motion.span className="mb-6 inline-block rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
            The Impact
          </motion.span>
          <h2 className="mb-6 text-5xl font-black tracking-tighter text-white md:text-7xl">
            Scaling{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">
              Global
            </span>{' '}
            Agriculture
          </h2>
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-300">
            Join the most technologically advanced agricultural network in existence.
          </p>
        </motion.div>

        <div className="stats-grid grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="hover-trigger stat-card group relative"
            >
              {/* Ultra-Premium Glass Card */}
              <div
                className={`relative h-full rounded-[40px] border border-white/20 bg-white/[0.05] p-10 backdrop-blur-3xl transition-all duration-700 hover:-translate-y-4 hover:border-white/30 hover:bg-white/[0.08] active:scale-95 ${stat.shadow}`}
              >
                {/* Dynamic Inner Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-[40px] opacity-0 transition-opacity duration-700 group-hover:opacity-10`}
                />

                {/* Animated Icon Container */}
                <motion.div
                  className={`h-20 w-20 bg-gradient-to-br ${stat.color} mb-8 flex items-center justify-center rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-700 group-hover:rotate-[10deg] group-hover:scale-110`}
                >
                  <stat.icon className="h-10 w-10 text-white" />
                </motion.div>

                {/* Counter with GSAP */}
                <div className="mb-4">
                  <div
                    className={`stat-counter bg-gradient-to-r text-6xl font-black tracking-tighter ${stat.color} bg-clip-text text-transparent`}
                    data-target={stat.value}
                    data-suffix={stat.suffix}
                  >
                    0{stat.suffix}
                  </div>
                </div>

                {/* Sub-label */}
                <p className="text-lg font-bold uppercase tracking-tight text-white/70 transition-colors duration-500 group-hover:text-white">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
