'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  // Parallax transforms
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.15]);
  const textY = useTransform(scrollY, [0, 400], [0, 100]);

  // Mouse glow effect
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    setIsMounted(true);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Spotlight gradient based on mouse position
  const spotlightGradient = useMotionTemplate`radial-gradient(600px circle at ${mouseX}% ${mouseY}%, rgba(34, 197, 94, 0.15), transparent 40%)`;

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#0A0F0C]">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#22c55e10,transparent)]" />
      </div>

      {/* Mouse Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ background: spotlightGradient }}
      />

      {/* Video Background with Parallax Scale */}
      <motion.div style={{ scale }} className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-60 transition-opacity duration-1000"
          style={{ filter: 'contrast(1.1) saturate(1.2)' }}
        >
          <source src="/Landingpagevideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F0C]/90 via-[#0A0F0C]/50 to-[#0A0F0C]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,15,12,0.9)_100%)]" />
      </motion.div>

      {/* Floating Particles */}
      {isMounted && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-emerald-400/30"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Premium Content Overlay */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-30 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
      >
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 backdrop-blur-xl"
        >
          <motion.span
            className="relative flex h-2.5 w-2.5"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </motion.span>
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium uppercase tracking-wider text-emerald-300">
            India's Trusted Farm Equipment Network
          </span>
        </motion.div>

        {/* Animated Headline */}
        <div className="mb-10">
          <motion.h1
            className="text-[2.5rem] font-bold uppercase leading-[0.9] tracking-tight sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem]"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            {/* Staggered Word Animations with 3D effect */}
            <motion.span
              initial={{ opacity: 0, rotateX: -90, y: 50 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #dcfce7 50%, #86efac 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 80px rgba(34, 197, 94, 0.3)',
              }}
            >
              Rent Equipment.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, rotateX: -90, y: 50 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 block"
              style={{
                background:
                  'linear-gradient(135deg, #22c55e 0%, #10b981 30%, #14b8a6 60%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Grow Better.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 block text-[1.25rem] font-normal normal-case tracking-normal sm:text-[1.5rem] md:text-[2rem] lg:text-[2.5rem]"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              <span className="text-emerald-200/80">Trusted by farmers</span>
            </motion.span>
          </motion.h1>
        </div>

        {/* Animated Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 max-w-3xl text-base leading-relaxed text-emerald-100/70 md:text-xl lg:text-2xl"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          Connecting you with{' '}
          <motion.span
            className="font-medium text-emerald-400"
            animate={{
              textShadow: [
                '0 0 0px rgba(34, 197, 94, 0)',
                '0 0 20px rgba(34, 197, 94, 0.5)',
                '0 0 0px rgba(34, 197, 94, 0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            quality farm equipment
          </motion.span>{' '}
          at fair prices.
        </motion.p>

        {/* Animated CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 sm:flex-row sm:gap-6"
        >
          <Link href="/equipment">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 50px rgba(34, 197, 94, 0.4)',
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-2xl px-8 py-4 text-base font-semibold transition-all duration-500 md:text-lg"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #10b981 100%)',
                boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
              }}
            >
              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center gap-2 text-white">
                Find Equipment Near You
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          </Link>

          <Link href="/auth/signup">
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderColor: 'rgba(34, 197, 94, 0.6)',
              }}
              whileTap={{ scale: 0.98 }}
              className="group rounded-2xl border-2 px-8 py-4 text-base font-semibold backdrop-blur-xl transition-all duration-300 md:text-lg"
              style={{
                backgroundColor: 'transparent',
                color: '#4ade80',
                borderColor: 'rgba(34, 197, 94, 0.4)',
              }}
            >
              <span className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                List Your Equipment
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Animated Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-4"
      >
        <motion.span
          className="text-sm uppercase tracking-[0.2em] text-emerald-400/60"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll to Explore
        </motion.span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <ChevronDown className="relative z-10 h-6 w-6 text-emerald-400" />
        </motion.div>
      </motion.div>

      {/* Corner Decorations */}
      <div className="absolute left-8 top-8 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="h-16 w-16 rounded-tl-3xl border-l-2 border-t-2 border-emerald-500/30"
        />
      </div>
      <div className="absolute right-8 top-8 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="h-16 w-16 rounded-tr-3xl border-r-2 border-t-2 border-emerald-500/30"
        />
      </div>
    </section>
  );
}
