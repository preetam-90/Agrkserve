'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Users, Wrench, Sprout } from 'lucide-react';
import Link from 'next/link';

interface LabourSectionProps {
  stats?: {
    totalLabour: number;
  };
}

function LabourSection({ stats }: LabourSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const categories = [
    {
      icon: Sprout,
      title: 'Harvesting',
      workers: '500+',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Wrench,
      title: 'Land Preparation',
      workers: '350+',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Zap,
      title: 'Sowing & Planting',
      workers: '400+',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'General Farm Work',
      workers: '600+',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-[#0A0F0C] py-32">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.08),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <motion.span className="mb-6 inline-block rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-[0.3em] text-blue-400">
            Labour Marketplace
          </motion.span>
          <h2 className="mb-6 text-5xl font-black tracking-tighter text-white md:text-7xl">
            Skilled{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Farm Workers
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            Connect with experienced agricultural workers ready to help you succeed
          </p>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <div className="relative overflow-hidden rounded-[40px] border border-white/20 bg-white/5 p-12 text-center backdrop-blur-xl">
            {/* Glow effects */}
            <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-3">
                <Users className="h-12 w-12 text-blue-400" />
                <div className="text-left">
                  <div className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-6xl font-black tracking-tighter text-transparent md:text-7xl">
                    {stats?.totalLabour || 800}+
                  </div>
                  <p className="text-lg font-semibold text-gray-400">Certified Farm Workers</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-4 py-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">Available Now</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-4 py-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-300">Fast Hiring</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-2">
                  <Wrench className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">Skilled & Verified</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/10">
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${category.gradient} mb-4 flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <category.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="mb-2 text-xl font-bold text-white">{category.title}</h3>
                <p
                  className={`bg-gradient-to-r text-lg font-semibold ${category.gradient} bg-clip-text text-transparent`}
                >
                  {category.workers} Workers
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link href="/labour">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition-shadow hover:shadow-blue-500/50"
            >
              Find Workers →
            </motion.button>
          </Link>
          <Link href="/worker/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl border-2 border-blue-500/40 px-8 py-4 text-lg font-semibold text-blue-300 backdrop-blur-sm transition-all hover:border-blue-400 hover:bg-blue-500/10"
            >
              List Your Skills
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
