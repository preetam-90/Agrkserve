'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MagneticButton } from '../shared/MagneticButton';

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#040805] px-5 pb-32 pt-20 md:px-8 md:pb-40 md:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(34,197,94,0.34),transparent_38%),radial-gradient(circle_at_78%_72%,rgba(6,182,212,0.28),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px -12% 0px' }}
        transition={{ duration: 0.75 }}
        className="relative mx-auto max-w-5xl rounded-[2.2rem] border border-white/15 bg-white/10 p-8 text-center backdrop-blur-2xl md:p-14"
      >
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">Chapter 07</p>
        <h2 className="mx-auto mt-5 max-w-4xl text-[clamp(2.4rem,5.2vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-white">
          Start your farming revolution today.
        </h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton className="rounded-2xl border border-emerald-200/35 bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-sm font-medium uppercase tracking-[0.08em] text-white shadow-[0_0_46px_rgba(34,197,94,0.56)] transition hover:shadow-[0_0_68px_rgba(34,197,94,0.74)]">
            <Link href="/equipment">Start Booking</Link>
          </MagneticButton>

          <Link
            href="/auth/register"
            className="rounded-2xl border border-white/20 px-8 py-4 text-sm uppercase tracking-[0.08em] text-zinc-100 backdrop-blur"
          >
            Become a Provider
          </Link>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
    </section>
  );
}
