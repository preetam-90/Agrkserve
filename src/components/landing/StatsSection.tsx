'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
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
    <section ref={ref} className="relative py-32 overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
      {/* Dynamic Background Noise/Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-blue-950/20" />

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
