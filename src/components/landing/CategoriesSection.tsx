'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Tractor, Truck, Users, ArrowRight } from 'lucide-react';

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

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            What Do You Need?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose from our comprehensive range of agricultural solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link href={category.href} className="group block h-full">
                <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-emerald-500/30">
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 ${category.image} opacity-50`} />
                  
                  {/* Hover Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                  {/* 3D Tilt Effect Container */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className={`w-20 h-20 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-3xl transition-shadow`}
                    >
                      <category.icon className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-400 text-lg mb-8 flex-grow">
                      {category.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-4 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>

                  {/* Border Glow Animation */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${category.gradient} blur-xl opacity-20`} />
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
