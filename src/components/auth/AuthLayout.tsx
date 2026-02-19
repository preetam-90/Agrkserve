'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tractor } from 'lucide-react';
import { AuthBackground } from './AuthBackground';

/**
 * AuthLayout - Reusable layout wrapper for auth pages
 * Eliminates ~30+ lines of duplicated header/footer code per auth page
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900">
      <AuthBackground />

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="group flex w-fit items-center gap-3">
          <motion.div whileHover={{ scale: 1.05, rotate: -5 }} className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 opacity-50 blur-md transition-opacity group-hover:opacity-70" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/20 bg-gradient-to-br from-stone-900 to-emerald-950">
              <Tractor className="h-6 w-6 text-amber-400" />
            </div>
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-stone-100">
            Agri<span className="text-amber-500">Serve</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-stone-500">
          © {currentYear} AgriServe. Cultivating connections.
        </p>
      </footer>
    </div>
  );
}
