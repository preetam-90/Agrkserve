'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const navLinks = [
  { label: 'Problem', href: '#problem' },
  { label: 'Equipment', href: '#equipment-universe' },
  { label: 'Network', href: '#provider-network' },
  { label: 'How It Works', href: '#how-it-works' },
];

export function LandingNav() {
  return (
    <motion.header
      initial={{ y: -36, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-[100] px-4 py-4 md:px-8"
    >
      <div className="border-white/12 bg-[#08100d]/72 mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-2xl md:px-6">
        <Link href="/" className="text-lg font-semibold tracking-[-0.02em] text-white">
          AgriServe
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-200/90 transition hover:text-cyan-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/auth/register"
          className="rounded-xl border border-emerald-300/35 bg-emerald-500/15 px-4 py-2 text-xs uppercase tracking-[0.13em] text-emerald-100 transition hover:bg-emerald-500/25"
        >
          Join Platform
        </Link>
      </div>
    </motion.header>
  );
}
