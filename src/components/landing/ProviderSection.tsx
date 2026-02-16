'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import { Users, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ProviderSectionProps {
  stats: {
    totalEquipment: number;
    totalUsers: number;
    totalBookings: number;
  };
}

export function ProviderSection({ stats }: ProviderSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // GSAP: Counter animation
  useGSAPAnimation(
    (gsap) => {
      const counters = document.querySelectorAll('.provider-counter');
      counters.forEach((el) => {
        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const counter = { val: 0 };

        gsap.to(counter, {
          val: target,
          duration: 2.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top center+=100',
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

  const providers = [
    {
      name: 'Rajesh Kumar',
      location: 'Ludhiana, Punjab',
      equipment: '12 Tractors',
      rating: 4.9,
      image: '/api/placeholder/80/80',
    },
    {
      name: 'Amit Singh',
      location: 'Rohtak, Haryana',
      equipment: '8 Harvesters',
      rating: 4.8,
      image: '/api/placeholder/80/80',
    },
    {
      name: 'Suresh Patel',
      location: 'Indore, MP',
      equipment: '15 Implements',
      rating: 4.7,
      image: '/api/placeholder/80/80',
    },
  ];

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-[#0A0F0C] py-32">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <motion.span className="mb-6 inline-block rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
            Provider Network
          </motion.span>
          <h2 className="mb-6 text-5xl font-black tracking-tighter text-white md:text-7xl">
            Trusted{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Equipment Providers
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            Join thousands of verified providers earning by renting their equipment
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              value: stats.totalEquipment || 1500,
              suffix: '+',
              label: 'Vehicles Listed',
              color: 'from-emerald-400 to-teal-400',
            },
            {
              icon: Users,
              value: stats.totalUsers || 5000,
              suffix: '+',
              label: 'Trusted Providers',
              color: 'from-teal-400 to-cyan-400',
            },
            {
              icon: ShieldCheck,
              value: stats.totalBookings || 3000,
              suffix: '+',
              label: 'Successful Bookings',
              color: 'from-cyan-400 to-blue-400',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              <div className="relative h-full rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/10">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-[32px] opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
                />

                <stat.icon
                  className={`mb-6 h-12 w-12 bg-gradient-to-br ${stat.color} rounded-xl p-2`}
                />

                <div
                  className={`provider-counter bg-gradient-to-r text-5xl font-black tracking-tighter md:text-6xl ${stat.color} mb-2 bg-clip-text text-transparent`}
                  data-target={stat.value}
                  data-suffix={stat.suffix}
                >
                  0{stat.suffix}
                </div>

                <p className="text-lg font-semibold text-gray-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Provider Cards */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
              className="group relative"
            >
              <div className="relative h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/10">
                {/* Avatar */}
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-2xl font-bold text-white">
                    {provider.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{provider.name}</h3>
                    <p className="text-sm text-gray-400">{provider.location}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="mb-4 space-y-2">
                  <p className="font-semibold text-emerald-400">{provider.equipment}</p>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-white">{provider.rating}</span>
                    <span className="text-sm text-gray-400">(200+ bookings)</span>
                  </div>
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Verified Provider</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center"
        >
          <Link href="/provider/equipment">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 transition-shadow hover:shadow-emerald-500/50"
            >
              Become a Provider →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
