'use client';

import { motion } from 'framer-motion';
import { useParallax } from '@/hooks/useParallax';
import { AnimatedCounter } from './AnimatedCounter';
import { Tractor, Sprout, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  stats: {
    totalUsers: number;
    totalEquipment: number;
  };
}

export function HeroSection({ stats }: HeroSectionProps) {
  const y = useParallax(0.5);
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-amber-50">
      {/* Animated Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(132,204,22,0.1),transparent_50%)]" />
      </motion.div>
      
      {/* Floating Equipment Visuals */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 right-10 opacity-10 hidden lg:block"
      >
        <Tractor className="w-64 h-64 text-green-600" />
      </motion.div>
      
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-20 left-10 opacity-10 hidden lg:block"
      >
        <Sprout className="w-48 h-48 text-green-600" />
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Logo/Brand Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-block"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-xl">
              <Tractor className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          {/* Headline with Staggered Animation */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3,
                },
              },
            }}
            className="space-y-4"
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
            >
              Rent Farm Equipment.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-lime-500">
                Grow Faster.
              </span>
            </motion.h1>
            
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
            >
              Affordable, on-demand agricultural machinery for modern farmers
            </motion.p>
          </motion.div>
          
          {/* Live Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 py-8"
          >
            <div className="flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="text-left">
                <AnimatedCounter end={stats.totalUsers} suffix="+" label="Active Farmers" />
                <p className="text-sm text-gray-600 mt-1">Active Farmers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100">
              <div className="w-3 h-3 bg-lime-500 rounded-full animate-pulse" />
              <div className="text-left">
                <AnimatedCounter end={stats.totalEquipment} suffix="+" label="Equipment Listed" />
                <p className="text-sm text-gray-600 mt-1">Equipment Listed</p>
              </div>
            </div>
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/equipment">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all min-h-[44px] min-w-[44px]"
              >
                Rent Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/provider/equipment">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-green-600 text-green-700 hover:bg-green-50 px-8 py-6 text-lg rounded-xl min-h-[44px] min-w-[44px]"
              >
                List Your Equipment
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-green-200 shadow-sm"
          >
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">Verified & Trusted Platform</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
