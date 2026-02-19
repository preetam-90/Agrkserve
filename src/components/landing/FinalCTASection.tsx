'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';

function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // GSAP: Parallax glow orbs
  useGSAPAnimation((gsap) => {
    gsap.to('.cta-glow-1', {
      x: 50,
      y: -30,
      scale: 1.2,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to('.cta-glow-2', {
      x: -50,
      y: 30,
      scale: 1.3,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1,
    });
  }, []);

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-[#0A0F0C] py-32">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Glow orbs */}
        <div className="cta-glow-1 absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="cta-glow-2 absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Massive Glassmorphic Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1 }}
          className="relative overflow-hidden rounded-[48px] border-2 border-white/20 bg-white/5 p-12 text-center backdrop-blur-3xl md:p-16 lg:p-20"
        >
          {/* Internal glow */}
          <div className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 rounded-[48px] bg-gradient-to-b from-emerald-500/10 via-transparent to-cyan-500/10" />

          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-5 py-2"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                Join 50,000+ Farmers
              </span>
            </motion.div>

            {/* Huge Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="mb-6 text-4xl font-black leading-[1.1] tracking-tighter text-white md:text-6xl lg:text-7xl xl:text-8xl"
            >
              Ready to Transform
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Your Farm?
              </span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="mx-auto mb-12 max-w-3xl text-xl text-gray-300 md:text-2xl"
            >
              Start renting premium equipment and hiring skilled workers today. India&apos;s most
              trusted agricultural marketplace.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="mb-12 flex flex-col justify-center gap-6 sm:flex-row"
            >
              <MagneticButton strength={0.4}>
                <Link href="/equipment">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-2xl px-12 py-6 text-xl font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #16a34a, #22c55e, #10b981)',
                      boxShadow: '0 25px 70px rgba(34, 197, 94, 0.5)',
                    }}
                  >
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative flex items-center gap-2">
                      Get Started Now
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </span>
                  </motion.button>
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.3}>
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-2xl border-2 border-cyan-500/50 bg-cyan-500/10 px-12 py-6 text-xl font-bold text-cyan-300 backdrop-blur-xl transition-all hover:border-cyan-400 hover:bg-cyan-500/20"
                  >
                    Talk to Sales
                  </motion.button>
                </Link>
              </MagneticButton>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap justify-center gap-8 text-gray-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold">No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold">Verified Providers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold">Instant Booking</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
