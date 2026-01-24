'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Tractor, Users, Wrench, Star } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface StatsSectionProps {
  stats: {
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
      value: stats.totalEquipment || 0,
      suffix: '+',
      label: 'Equipment Listings',
      color: 'from-emerald-400 to-teal-400',
    },
    {
      icon: Users,
      value: stats.totalUsers || 0,
      suffix: '+',
      label: 'Farmers',
      color: 'from-amber-400 to-orange-400',
    },
    {
      icon: Wrench,
      value: stats.totalLabour || 0,
      suffix: '+',
      label: 'Skilled Workers',
      color: 'from-blue-400 to-cyan-400',
    },
    {
      icon: Star,
      value: stats.totalBookings || 0,
      suffix: '+',
      label: 'Bookings Completed',
      color: 'from-purple-400 to-pink-400',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-950/50 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-400">
            Join India's fastest-growing agricultural community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Glassmorphic Card */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-emerald-500/30">
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`} />
                
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={isInView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                  className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Counter */}
                <div className="mb-2">
                  {isInView && (
                    <AnimatedCounter
                      end={stat.value}
                      suffix={stat.suffix}
                      className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                    />
                  )}
                </div>

                {/* Label */}
                <p className="text-gray-400 text-lg font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
