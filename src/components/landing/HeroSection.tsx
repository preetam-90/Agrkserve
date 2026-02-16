'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import { useDeviceCapability } from '@/lib/animations/device-capability';
import { LazyThreeScene } from '@/components/three/LazyThreeScene';
import { MagneticButton } from '@/components/ui/MagneticButton';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const { capability } = useDeviceCapability();

  // Parallax transforms
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.1]);
  const textY = useTransform(scrollY, [0, 500], [0, 150]);

  // GSAP: Headline word stagger reveal
  useGSAPAnimation((gsap) => {
    gsap.from('.hero-headline-word', {
      opacity: 0,
      y: 120,
      rotationX: -90,
      stagger: 0.15,
      duration: 1.2,
      ease: 'power4.out',
      delay: 0.3,
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full max-w-full overflow-hidden bg-[#0A0F0C]"
    >
      {/* 3D Tractor Background (High-end devices only) */}
      {capability === 'high' && (
        <div className="absolute inset-0 z-0 opacity-30">
          <LazyThreeScene
            componentPath="@/components/three/TractorModel"
            componentProps={{}}
            notSupportedFallback={
              <div className="h-full w-full bg-gradient-to-br from-emerald-900/10 via-teal-900/5 to-cyan-900/10" />
            }
          />
        </div>
      )}

      {/* Video Background with Parallax (Medium/Low devices) */}
      {capability !== 'high' && (
        <motion.div style={{ scale }} className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-40"
            onError={(e) => {
              const video = e.currentTarget;
              video.style.display = 'none';
            }}
          >
            <source src="/Landingpagevideo.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F0C]/80 via-[#0A0F0C]/60 to-[#0A0F0C]" />
        </motion.div>
      )}

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 z-10 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#22c55e15,transparent)]" />
      </div>

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-30 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
            India&apos;s #1 AgriTech Platform
          </span>
        </motion.div>

        {/* Ultra-Large Cinematic Headline */}
        <div className="mb-12">
          <h1
            className="text-[3rem] font-black uppercase leading-[0.85] tracking-tighter sm:text-[4rem] md:text-[6rem] lg:text-[8rem] xl:text-[10rem]"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <span className="hero-headline-word block bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent opacity-0">
              Book Equipment.
            </span>
            <span className="hero-headline-word block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent opacity-0">
              Hire Labour.
            </span>
            <span
              className="hero-headline-word mt-4 block text-[1.5rem] font-normal normal-case tracking-normal text-emerald-200/80 opacity-0 sm:text-[2rem] md:text-[3rem] lg:text-[4rem]"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              Power Your Farm.
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mb-12 max-w-3xl text-lg leading-relaxed text-emerald-100/60 md:text-xl lg:text-2xl"
        >
          Connecting you with{' '}
          <span className="font-semibold text-emerald-400">quality farm equipment</span> and{' '}
          <span className="font-semibold text-cyan-400">skilled agricultural workers</span> at fair
          prices.
        </motion.p>

        {/* CTA Buttons with Magnetic Effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="flex flex-col gap-4 sm:flex-row sm:gap-6"
        >
          <MagneticButton>
            <Link href="/equipment">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl px-10 py-5 text-lg font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #10b981 100%)',
                  boxShadow: '0 20px 60px rgba(34, 197, 94, 0.4)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2 text-white">
                  Book Equipment
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link href="/labour">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group rounded-2xl border-2 border-cyan-500/50 bg-cyan-500/10 px-10 py-5 text-lg font-bold text-cyan-300 backdrop-blur-xl transition-all hover:border-cyan-400 hover:bg-cyan-500/20"
              >
                <span className="flex items-center gap-2">
                  Hire Labour
                  <ArrowRight className="h-5 w-5" />
                </span>
              </motion.button>
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link href="/provider/equipment">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group rounded-2xl border-2 border-emerald-500/40 px-10 py-5 text-lg font-bold text-emerald-300 backdrop-blur-xl transition-all hover:border-emerald-400 hover:bg-emerald-500/10"
              >
                List Your Equipment
              </motion.button>
            </Link>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Corner Decorations */}
      <div className="absolute left-8 top-8 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="h-20 w-20 rounded-tl-3xl border-l-2 border-t-2 border-emerald-500/30"
        />
      </div>
      <div className="absolute right-8 top-8 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.1, duration: 0.5 }}
          className="h-20 w-20 rounded-tr-3xl border-r-2 border-t-2 border-emerald-500/30"
        />
      </div>
    </section>
  );
}
