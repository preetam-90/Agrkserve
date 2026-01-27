'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Tractor, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PremiumHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const navLinks = [
    { href: '/equipment', label: 'Equipment' },
    { href: '/labour', label: 'Labor' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-6 pointer-events-none"
    >
      <div
        className={`mx-auto max-w-7xl relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-auto group
          ${isScrolled
            ? 'bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]'
            : 'bg-transparent px-4'
          }`}
      >
        {/* Cursor Spotlight Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.08), transparent 40%)`
          }}
        />

        <nav className="flex items-center justify-between h-16 sm:h-20 relative z-10">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-[var(--primary-green)] rounded-xl blur-md group-hover:blur-xl transition-all opacity-40 group-hover:opacity-70" />
              <div className="relative w-full h-full bg-gradient-to-br from-[var(--primary-green)] to-[var(--primary-green-dark)] rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                <Tractor className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-300 bg-clip-text text-transparent tracking-tight">
                AgriGo
              </span>
              <motion.div
                className="h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 w-full mt-1"
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center bg-white/5 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 shadow-inner">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.label)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative block px-6 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:text-white"
                >
                  {hoveredLink === link.label && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-500/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <Link href="/equipment">
                <Button className="group relative overflow-hidden bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white px-8 py-2.5 rounded-full transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-white/10">
                  <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
                    Rent Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    whileHover={{ scale: 1.1 }}
                  />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-gray-300 hover:text-emerald-400 transition-colors bg-white/5 rounded-2xl border border-white/10 active:scale-95"
            >
              <AnimatePresence mode='wait'>
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--primary-green-light)] to-transparent origin-left opacity-30"
          style={{ scaleX }}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40 lg:hidden pointer-events-auto"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-4 top-4 bottom-4 w-[320px] bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-50 p-8 flex flex-col gap-10 lg:hidden pointer-events-auto shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">AgriGo</h2>
                  <p className="text-sm text-gray-500 font-medium">Navigation</p>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <ul className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="text-xl font-semibold text-gray-300 hover:text-emerald-400 hover:translate-x-2 transition-all block py-3 border-b border-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto">
                <Link href="/equipment" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full h-16 bg-[var(--primary-green)] hover:bg-[var(--primary-green-dark)] text-white rounded-[1.5rem] text-lg font-bold shadow-lg shadow-emerald-900/20">
                    Rent Now
                  </Button>
                </Link>
                <p className="text-center text-gray-500 text-xs mt-6 font-medium uppercase tracking-widest">Premium farm rentals</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
