'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { Search, Calendar, Truck, CheckCircle, Star } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Browse thousands of equipment listings across India',
    color: 'from-emerald-400 to-teal-400',
  },
  {
    icon: Calendar,
    title: 'Book',
    description: 'Select dates and confirm your rental instantly',
    color: 'from-teal-400 to-cyan-400',
  },
  {
    icon: Truck,
    title: 'Deliver',
    description: 'Equipment delivered to your farm on time',
    color: 'from-cyan-400 to-blue-400',
  },
  {
    icon: CheckCircle,
    title: 'Work',
    description: 'Use premium equipment to boost productivity',
    color: 'from-blue-400 to-purple-400',
  },
  {
    icon: Star,
    title: 'Rate',
    description: 'Share your experience and help the community',
    color: 'from-purple-400 to-pink-400',
  },
];

export function TimelineSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Generate floating shapes for depth - deterministic for SSR
  const floatingShapes = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: `${(i * 16.67) % 100}%`,
      top: `${(i * 14.29 + 8) % 100}%`,
      size: 40 + (i * 15),
      delay: (i * 0.8) % 5,
      duration: 15 + (i % 10),
    }));
  }, []);

  // Generate animated texture waves
  const textureWaves = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      delay: i * 2,
      duration: 10 + i * 3,
    }));
  }, []);

  // Generate neon grid lines
  const neonLines = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      angle: -15 + i * 10,
      delay: i * 0.5,
    }));
  }, []);

  return (
    <section ref={ref} className="relative py-32 w-full max-w-full overflow-hidden">
      {/* Seamless continuation from FeaturedEquipmentSection (#0A0F0C) */}
      <div className="absolute inset-0 bg-[#0A0F0C]" />

      {/* Animated Texture Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {textureWaves.map((wave) => (
          <motion.div
            key={wave.id}
            className="absolute w-[200%] h-[200%] left-[-50%] top-[-50%]"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, rgba(20, 184, 166, ${0.03 + wave.id * 0.01}) 0%, transparent 50%)`,
            }}
            animate={{
              rotate: [0, -360],
              scale: [1, 1.15, 1],
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
              top: `${25 + line.id * 16}%`,
              transform: `rotate(${line.angle}deg)`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(20, 184, 166, 0.3) 50%, transparent 100%)',
              boxShadow: '0 0 12px rgba(20, 184, 166, 0.5)',
            }}
            animate={{
              x: ['-40%', '40%', '-40%'],
              opacity: [0.3, 0.55, 0.3],
            }}
            transition={{
              duration: 10 + line.id,
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
          className="absolute top-1/3 left-1/4 w-[450px] h-[450px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.06) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            y: [0, 20, 0],
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
          className="absolute border border-teal-500/10 rounded-full"
          style={{
            left: shape.left,
            top: shape.top,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [0, -35, 0],
            rotate: [0, 180, 0],
            opacity: [0.08, 0.15, 0.08],
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
        className="absolute inset-0 opacity-[0.01] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-950/5 via-transparent to-teal-950/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get started in minutes with our simple 5-step process
          </p>
        </motion.div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 origin-left"
          />

          <div className="grid grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                {/* Step Number */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {index + 1}
                </div>

                {/* Card */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mt-16 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                    className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg mx-auto`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm text-center">
                    {step.description}
                  </p>

                  {/* Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 hover:opacity-10 rounded-3xl transition-opacity duration-300`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative flex gap-6"
            >
              {/* Timeline Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-purple-500" />
              )}

              {/* Step Number */}
              <div className={`relative z-10 w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0`}>
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <step.icon className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
