'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import { MagneticButton } from '@/components/ui/MagneticButton';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CinematicCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP: Dramatic reveal
  useGSAPAnimation((gsap) => {
    gsap.from('.cta-content', {
      opacity: 0,
      scale: 0.8,
      y: 100,
      duration: 1.5,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top center',
        toggleActions: 'play none none none',
      },
    });

    // Floating glow orbs
    gsap.to('.glow-orb', {
      y: 'random(-30, 30)',
      x: 'random(-30, 30)',
      scale: 'random(0.8, 1.2)',
      duration: 'random(3, 5)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: {
        amount: 1,
        from: 'random',
      },
    });
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-black py-40">
      {/* Background chaos */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Massive gradient orbs */}
        <div className="glow-orb absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/30 blur-[150px]" />
        <div className="glow-orb absolute right-1/4 top-1/2 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="glow-orb absolute bottom-1/4 left-1/2 h-[700px] w-[700px] rounded-full bg-teal-500/25 blur-[180px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="cta-content relative overflow-hidden rounded-[4rem] border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 via-black/50 to-cyan-950/50 p-16 backdrop-blur-2xl lg:p-24">
          {/* Noise texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Content */}
          <div className="relative text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 backdrop-blur-xl"
            >
              <Sparkles className="h-5 w-5 animate-pulse text-emerald-400" />
              <span className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                Join The Revolution
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mb-8 text-6xl font-black uppercase leading-[0.9] tracking-tighter lg:text-9xl"
            >
              <span className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                Ready To
              </span>
              <br />
              <span className="text-emerald-400">Transform?</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mx-auto mb-16 max-w-3xl text-2xl text-gray-300 lg:text-3xl"
            >
              Join thousands of farmers revolutionizing agriculture with cutting-edge technology and
              premium equipment.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="flex flex-col items-center justify-center gap-6 sm:flex-row"
            >
              <MagneticButton strength={0.5}>
                <Link href="/equipment">
                  <motion.button
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-16 py-8 text-2xl font-black uppercase tracking-wider text-white shadow-[0_0_80px_rgba(16,185,129,0.6)] transition-all hover:shadow-[0_0_120px_rgba(16,185,129,0.8)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Get Started Now
                      <ArrowRight className="h-7 w-7 transition-transform group-hover:translate-x-2" />
                    </span>
                    {/* Shine effect */}
                    <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                  </motion.button>
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.3}>
                <Link href="/contact">
                  <motion.button
                    className="rounded-3xl border-4 border-emerald-500/50 bg-black/50 px-16 py-8 text-2xl font-black uppercase tracking-wider text-emerald-400 backdrop-blur-xl transition-all hover:border-emerald-400 hover:bg-emerald-500/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Contact Sales
                  </motion.button>
                </Link>
              </MagneticButton>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm uppercase tracking-widest text-gray-500"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Instant Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                <span>Verified Providers</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
