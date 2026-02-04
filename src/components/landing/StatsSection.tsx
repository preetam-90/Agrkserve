'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { Tractor, Users, Wrench, Star } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

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
      left: `${(i * 12.5) + 6}%`,
      top: `${(i * 10) + 10}%`,
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
      shadow: 'shadow-emerald-500/20'
    },
    {
      icon: Users,
      value: stats?.totalUsers || 5000,
      suffix: '+',
      label: 'Elite Partners',
      color: 'from-amber-400 to-orange-400',
      shadow: 'shadow-amber-500/20'
    },
    {
      icon: Wrench,
      value: stats?.totalLabour || 800,
      suffix: '+',
      label: 'Certified Experts',
      color: 'from-blue-400 to-cyan-400',
      shadow: 'shadow-blue-500/20'
    },
    {
      icon: Star,
      value: stats?.totalBookings || 3000,
      suffix: '+',
      label: 'Succesful Missions',
      color: 'from-purple-400 to-pink-400',
      shadow: 'shadow-purple-500/20'
    },
  ];

  return (
    <section ref={ref} className="relative py-32 w-full max-w-full overflow-hidden">
      {/* Seamless continuation from Hero (#0A0F0C) */}
      <div className="absolute inset-0 bg-[#0A0F0C]" />
      
      {/* Neon Tilted Grid Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Horizontal grid lines with perspective */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-[1px]"
            style={{
              top: `${15 + i * 14}%`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.3) 50%, transparent 100%)',
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
            className="absolute top-0 bottom-0 w-[1px]"
            style={{
              left: `${10 + i * 20}%`,
              background: 'linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.25) 50%, transparent 100%)',
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
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: point.left,
              top: point.top,
              background: 'radial-gradient(circle, rgba(34, 197, 94, 1) 0%, rgba(34, 197, 94, 0) 70%)',
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
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
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
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
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
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_40%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <motion.span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-[0.3em] text-emerald-400 uppercase bg-emerald-500/20 rounded-full">
            The Impact
          </motion.span>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Scaling <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-blue-300">Global</span> Agriculture
          </h2>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
            Join the most technologically advanced agricultural network in existence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group hover-trigger relative"
            >
              {/* Ultra-Premium Glass Card */}
              <div className={`relative h-full bg-white/[0.05] backdrop-blur-3xl border border-white/20 rounded-[40px] p-10 hover:bg-white/[0.08] transition-all duration-700 hover:-translate-y-4 hover:border-white/30 active:scale-95 ${stat.shadow}`}>
                {/* Dynamic Inner Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-[40px] transition-opacity duration-700`} />

                {/* Animated Icon Container */}
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-3xl flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[10deg]`}
                >
                  <stat.icon className="w-10 h-10 text-white" />
                </motion.div>

                {/* Counter with Superior Type */}
                <div className="mb-4">
                  {isInView && (
                    <AnimatedCounter
                      end={stat.value}
                      suffix={stat.suffix}
                      className={`text-6xl font-black tracking-tighter bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                    />
                  )}
                </div>

                {/* Sub-label */}
                <p className="text-white/70 text-lg font-bold tracking-tight uppercase group-hover:text-white transition-colors duration-500">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
