'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import { MagneticButton } from '@/components/ui/MagneticButton';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const PARTICLE_COUNT = 12;

const particlePosition = (index: number) => ({
  left: `${(index * 37.111 + 13.7) % 100}%`,
  top: `${(index * 61.73 + 29.3) % 100}%`,
});

function HeroRevolution() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Extreme parallax effects
  const y1 = useTransform(scrollY, [0, 1000], [0, 400]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.3]);

  // GSAP: Ultra-dramatic entrance
  useGSAPAnimation((gsap) => {
    const tl = gsap.timeline({ delay: 0.2 });

    // Headline reveal with explosive scale
    tl.from('.hero-char', {
      opacity: 0,
      scale: 0.3,
      y: 200,
      rotationX: -90,
      stagger: {
        amount: 0.8,
        from: 'random',
      },
      duration: 1.5,
      ease: 'power4.out',
    });

    // Sub-elements cascade
    tl.from(
      '.hero-subtitle',
      {
        opacity: 0,
        y: 100,
        duration: 1,
        ease: 'power3.out',
      },
      '-=0.8'
    );

    tl.from(
      '.hero-cta',
      {
        opacity: 0,
        scale: 0.5,
        y: 50,
        stagger: 0.1,
        duration: 0.8,
        ease: 'back.out(2)',
      },
      '-=0.5'
    );

    // Ambient particles
    gsap.to('.ambient-particle', {
      y: -30,
      x: 'random(-20, 20)',
      rotation: 'random(-180, 180)',
      opacity: 0.8,
      stagger: {
        amount: 2,
        repeat: -1,
        yoyo: true,
      },
      duration: 'random(3, 6)',
      ease: 'sine.inOut',
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black"
    >
      {/* Layered Background Chaos */}
      <div className="absolute inset-0">
        {/* Massive gradient orbs */}
        <motion.div
          style={{ scale, y: y1 }}
          className="absolute -left-1/4 top-0 h-[800px] w-[800px] rounded-full bg-emerald-500/20 blur-[150px]"
        />
        <motion.div
          style={{ scale, y: y2 }}
          className="absolute -right-1/4 top-1/3 h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[120px]"
        />

        {/* Dynamic grid that breaks apart */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]" />

        {/* Floating particles */}
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <div
            key={i}
            className="ambient-particle absolute h-1 w-1 rounded-full bg-emerald-400/40"
            style={particlePosition(i)}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8"
      >
        {/* Insanely Large Headline */}
        <h1 className="mb-12 font-black uppercase leading-[0.8] tracking-tighter">
          <div className="text-[12vw] lg:text-[15rem]">
            {'THE FUTURE'.split('').map((char, i) => (
              <span
                key={i}
                className="hero-char inline-block bg-gradient-to-br from-white via-emerald-200 to-emerald-500 bg-clip-text text-transparent"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
          <div className="text-[10vw] text-emerald-400 lg:text-[12rem]">
            {'OF FARMING'.split('').map((char, i) => (
              <span key={i} className="hero-char inline-block">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        </h1>

        {/* Glowing subtitle */}
        <p className="hero-subtitle mx-auto mb-16 max-w-4xl text-2xl font-light leading-relaxed text-gray-300 lg:text-4xl">
          Revolutionary equipment rental and labour marketplace.{' '}
          <span className="font-bold text-emerald-400">Powered by technology.</span>{' '}
          <span className="font-bold text-cyan-400">Built for farmers.</span>
        </p>

        {/* Massive CTAs */}
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <MagneticButton strength={0.4}>
            <Link href="/equipment">
              <motion.button
                className="hero-cta group relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-16 py-8 text-2xl font-black uppercase tracking-wider text-white shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all hover:shadow-[0_0_100px_rgba(16,185,129,0.7)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Explore Now
                  <ArrowRight className="h-8 w-8 transition-transform group-hover:translate-x-2" />
                </span>
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
              </motion.button>
            </Link>
          </MagneticButton>

          <MagneticButton strength={0.3}>
            <Link href="/about">
              <motion.button
                className="hero-cta rounded-3xl border-4 border-emerald-500/50 bg-black/50 px-16 py-8 text-2xl font-black uppercase tracking-wider text-emerald-400 backdrop-blur-xl transition-all hover:border-emerald-400 hover:bg-emerald-500/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </Link>
          </MagneticButton>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-8 text-sm uppercase tracking-widest text-gray-500"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>10,000+ Equipment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500" />
            <span>5,000+ Workers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>All India Coverage</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-16 w-10 rounded-full border-2 border-emerald-500/50"
        >
          <motion.div
            animate={{ y: [0, 24, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mx-auto mt-2 h-3 w-3 rounded-full bg-emerald-500"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
