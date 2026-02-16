'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';

interface Stats {
  totalEquipment: number;
  totalUsers: number;
  totalLabour: number;
  totalBookings: number;
}

interface Props {
  stats: Stats;
}

export function ExplosiveStats({ stats }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP: Explosive counter animations
  useGSAPAnimation(
    (gsap) => {
      const counters = [
        { el: '.stat-1', target: stats.totalEquipment || 1500 },
        { el: '.stat-2', target: stats.totalUsers || 25000 },
        { el: '.stat-3', target: stats.totalLabour || 5000 },
        { el: '.stat-4', target: stats.totalBookings || 50000 },
      ];

      counters.forEach(({ el, target }) => {
        const element = document.querySelector(el);
        if (!element) return;

        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            toggleActions: 'play none none none',
          },
          onUpdate: () => {
            element.textContent = Math.floor(counter.value).toLocaleString('en-IN');
          },
        });
      });

      // Pulse effect on stat cards
      gsap.from('.stat-card', {
        scale: 0.5,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center+=100',
          toggleActions: 'play none none none',
        },
      });
    },
    [stats]
  );

  return (
    <section ref={sectionRef} className="relative bg-black py-40">
      {/* Radial gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#10b98120_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="mb-6 text-6xl font-black uppercase tracking-tighter text-white lg:text-8xl">
            By The{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Numbers
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-2xl text-gray-400">
            Real impact. Real results. Real revolution.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { class: 'stat-1', label: 'Equipment', suffix: '+', color: 'emerald' },
            { class: 'stat-2', label: 'Farmers', suffix: '+', color: 'cyan' },
            { class: 'stat-3', label: 'Workers', suffix: '+', color: 'amber' },
            { class: 'stat-4', label: 'Bookings', suffix: '+', color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-12 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Gradient glow on hover */}
              <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent blur-2xl`}
                />
              </div>

              <div className="relative">
                <div className={`mb-4 text-8xl font-black text-${stat.color}-400`}>
                  <span className={stat.class}>0</span>
                  <span className="text-6xl">{stat.suffix}</span>
                </div>
                <div className="text-xl font-bold uppercase tracking-wider text-gray-400">
                  {stat.label}
                </div>
              </div>

              {/* Animated corner accent */}
              <motion.div
                className={`absolute bottom-0 right-0 h-20 w-20 rounded-tl-full bg-${stat.color}-500/20`}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
