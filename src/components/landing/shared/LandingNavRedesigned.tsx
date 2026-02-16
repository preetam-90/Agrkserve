'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Menu, X, Phone, Tractor, Users, Wrench } from 'lucide-react';

const navLinks = [
  {
    label: 'Mission',
    href: '#problem',
    description: 'Why AgriServe exists',
  },
  {
    label: 'Platform',
    href: '#features',
    description: 'Core capabilities',
  },
  {
    label: 'Provider Network',
    href: '#provider-network',
    description: 'Supply-side growth model',
  },
  {
    label: 'Workforce Layer',
    href: '#labour-network',
    description: 'Skilled labour coverage',
  },
  {
    label: 'Execution',
    href: '#how-it-works',
    description: 'Operational flow',
  },
];

const primaryCTAs = [
  { label: 'Book Equipment Instantly', href: '/equipment', icon: Tractor },
  { label: 'List Equipment', href: '/provider/equipment', icon: Wrench },
  { label: 'Hire Labour', href: '/labour', icon: Users },
];

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? '+911234567890';

/**
 * Landing Navigation - Redesigned
 *
 * Features:
 * 1. Scroll state change (transparent → solid on scroll)
 * 2. Mobile menu with bottom-sheet pattern
 * 3. Keyboard navigation support
 * 4. Focus visible states
 * 5. Skip-to-content link
 */
export function LandingNavRedesigned() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll state detection
  useEffect(() => {
    let raf = 0;

    const handleScroll = () => {
      if (raf) {
        return;
      }

      raf = window.requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 50;
        setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
        raf = 0;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Focus trap + escape close for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const menuNode = mobileMenuRef.current;
    if (!menuNode) {
      return;
    }

    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusableElements = Array.from(menuNode.querySelectorAll<HTMLElement>(focusableSelector));
    const mobileToggleNode = mobileToggleRef.current;
    focusableElements[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab' || focusableElements.length === 0) {
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previousActiveElement) {
        previousActiveElement.focus();
      } else {
        mobileToggleNode?.focus();
      }
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <motion.header
        ref={navRef}
        initial={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed inset-x-0 top-0 z-[130] px-4 py-3 transition-all duration-300 md:px-6 lg:px-8 ${
          isScrolled
            ? 'bg-[#020603]/68 shadow-[0_18px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl'
            : 'bg-transparent'
        }`}
        role="banner"
      >
        <nav
          className={`relative mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 ${
            isScrolled
              ? 'border border-emerald-100/20 bg-[#07120d]/70 backdrop-blur-2xl'
              : 'border-emerald-100/12 bg-[#07120d]/36 border backdrop-blur-xl'
          }`}
          role="navigation"
          aria-label="Main navigation"
        >
          <span className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-100/10" />

          {/* Logo */}
          <Link
            href="/"
            className="landing-touch flex items-center gap-2 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-80"
            aria-label="AgriServe - Home"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100/30 bg-gradient-to-br from-emerald-400/35 via-emerald-500/15 to-cyan-300/20 shadow-[0_10px_32px_rgba(74,222,128,0.35)]">
              <svg viewBox="0 0 32 32" className="h-6 w-6 text-emerald-100" aria-hidden>
                <path
                  d="M6 22c5-.3 9-2.8 12-7.5 1.2-1.8 2.1-4 2.6-6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M7 26c3.6-1.5 7.7-2.3 12.5-2.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="24.8"
                  cy="21.8"
                  r="3.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M16.8 18.5h5.4m-3.2-8.8c0-1.6 1.1-2.9 2.7-3.3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="hidden text-sm font-semibold uppercase tracking-[0.14em] text-white sm:inline">
              AGRISERVE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="landing-touch text-white/72 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-emerald-300/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Support phone for rural users */}
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              aria-label="Call support"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden xl:inline">Support</span>
            </a>

            <Link
              href="/login?mode=signup"
              className="landing-touch rounded-full border border-emerald-100/20 bg-gradient-to-r from-emerald-400 to-lime-300 px-5 py-2.5 text-sm font-black uppercase tracking-[0.1em] text-[#052817] shadow-[0_12px_36px_rgba(74,222,128,0.35)] transition-all hover:shadow-[0_18px_48px_rgba(74,222,128,0.45)]"
              data-magnetic
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileToggleRef}
            onClick={toggleMobileMenu}
            className="landing-touch flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-100/20 bg-black/35 text-white transition-colors hover:bg-emerald-300/10 lg:hidden"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu - Bottom Sheet Pattern */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Bottom Sheet */}
            <motion.div
              ref={mobileMenuRef}
              id="mobile-menu"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[145] max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-emerald-100/20 bg-[#06100c]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Handle */}
              <div className="sticky top-0 z-10 flex justify-center bg-[#06100c]/95 pb-2 pt-3 backdrop-blur-xl">
                <div className="h-1 w-10 rounded-full bg-white/20" />
              </div>

              {/* Mobile Menu Content */}
              <div className="px-6 pb-8 pt-2">
                {/* Navigation Links */}
                <div className="mb-6 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col gap-0.5 rounded-xl px-4 py-3 transition-colors hover:bg-white/5"
                    >
                      <span className="text-base font-semibold text-white">{link.label}</span>
                      <span className="text-xs text-white/50">{link.description}</span>
                    </Link>
                  ))}
                </div>

                {/* Divider */}
                <div className="mb-6 h-px bg-white/10" />

                {/* Primary CTAs */}
                <div className="mb-6 space-y-2">
                  <p className="px-1 text-xs font-medium uppercase tracking-wider text-white/40">
                    Quick Actions
                  </p>
                  {primaryCTAs.map((cta) => (
                    <Link
                      key={cta.label}
                      href={cta.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="border-white/12 flex items-center gap-3 rounded-xl border bg-black/35 px-4 py-3 transition-colors hover:bg-emerald-300/10"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                        <cta.icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <span className="font-semibold text-white">{cta.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Support */}
                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300 transition-colors hover:bg-emerald-500/20"
                >
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Call Support: {SUPPORT_PHONE}</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default LandingNavRedesigned;
