'use client';

import { motion } from 'framer-motion';

function FutureVision() {
  return (
    <section className="relative overflow-hidden bg-[#040805] px-5 py-24 md:px-8 md:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(34,197,94,0.33),transparent_42%),radial-gradient(circle_at_82%_76%,rgba(6,182,212,0.3),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-6xl text-center"
      >
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-cyan-300/90">Chapter 06</p>
        <h2 className="mx-auto max-w-5xl text-[clamp(2.9rem,7vw,6.4rem)] font-semibold leading-[0.9] tracking-[-0.02em] text-white">
          This is the future of agriculture.
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-200 md:text-2xl">
          Built for farmers. Powered by technology.
        </p>
      </motion.div>
    </section>
  );
}
