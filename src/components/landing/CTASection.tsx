'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-32 bg-[#050505] overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(46,125,50,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(46,125,50,0.05)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary-green/20 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-golden-accent/10 blur-[180px] rounded-full"
        />
      </div>

      <div className="container-custom relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 inline-block px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <span className="text-white/80 text-sm font-bold tracking-[0.2em] uppercase">Ready to elevate?</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none"
        >
          Transform Your <span className="text-primary-green">Harvest</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-2xl text-stone-300 max-w-3xl mx-auto mb-16 leading-relaxed font-medium"
        >
          Join 10,000+ forward-thinking farmers optimizing their agricultural potential today with AgriGo's elite platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-8 justify-center items-center"
        >
          <Link href="/auth/signup">
            <Button size="lg" className="h-20 px-12 text-2xl font-black bg-primary-green hover:bg-white text-white hover:text-black rounded-2xl transition-all duration-500 hover:scale-105 shadow-[0_0_50px_rgba(46,125,50,0.3)] group border-0">
              Get Started Now
              <ArrowRight className="ml-3 w-8 h-8 transition-transform group-hover:translate-x-2" />
            </Button>
          </Link>

          <Link href="/contact">
            <Button size="lg" variant="outline" className="h-20 px-12 text-2xl font-bold border-2 border-white/20 bg-white/5 text-white hover:bg-white hover:text-black hover:border-white rounded-2xl transition-all duration-500 backdrop-blur-xl">
              Contact Sales
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
