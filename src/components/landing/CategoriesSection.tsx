'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
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

  // Generate floating shapes for depth - deterministic for SSR
  const floatingShapes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${(i * 12.5) % 100}%`,
      top: `${(i * 11.11 + 10) % 100}%`,
      size: 50 + (i * 15),
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
    <section ref={ref} className="relative py-32 w-full max-w-full overflow-hidden">
      {/* Seamless continuation from StatsSection (#0A0F0C) */}
      <div className="absolute inset-0 bg-[#0A0F0C]" />
      
      {/* Animated Texture Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {textureWaves.map((wave) => (
          <motion.div
            key={wave.id}
            className="absolute w-[200%] h-[200%] left-[-50%] top-[-50%]"
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {neonLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute w-[180%] h-[1px] left-[-40%]"
            style={{
              top: `${20 + line.id * 15}%`,
              transform: `rotate(${line.angle}deg)`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)',
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
          className="absolute top-1/3 left-1/5 w-[500px] h-[500px] rounded-full"
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
          className="absolute bottom-1/3 right-1/5 w-[400px] h-[400px] rounded-full"
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
          className="absolute border border-emerald-500/10 rounded-full"
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
        className="absolute inset-0 opacity-[0.012] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent" />

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
