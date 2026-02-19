'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tractor,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Leaf,
  Sprout,
  Wheat,
  Shield,
  Clock,
  CheckCircle,
  Send,
} from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

const equipmentLinks = [
  { label: 'Tractors', href: '/equipment?category=tractors' },
  { label: 'Harvesters', href: '/equipment?category=harvesters' },
  { label: 'Tillers', href: '/equipment?category=tillers' },
  { label: 'Trucks & Trailers', href: '/equipment?category=trucks-trailers' },
];

const serviceLinks = [
  { label: 'Equipment Rental', href: '/equipment' },
  { label: 'Labour Hiring', href: '/labour' },
  { label: 'Provider Network', href: '/providers' },
  { label: 'How It Works', href: '#how-it-works' },
];

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: '/blog' },
];

const supportLinks = [
  { label: 'Help Center', href: '/help' },
  { label: 'FAQs', href: '/help#faq' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/agriserve', icon: FaFacebookF },
  { label: 'Twitter', href: 'https://twitter.com/agriserve', icon: FaTwitter },
  { label: 'Instagram', href: 'https://instagram.com/agriserve', icon: FaInstagram },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/agriserve', icon: FaLinkedinIn },
  { label: 'YouTube', href: 'https://youtube.com/@agriserve', icon: FaYoutube },
];

const trustBadges = [
  { icon: Shield, label: 'Verified Providers' },
  { icon: CheckCircle, label: 'Secure Payments' },
  { icon: MapPin, label: 'Pan-India Network' },
  { icon: Clock, label: '24/7 Support' },
];

const currentYear = new Date().getFullYear();

export function LandingPageFooter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-20 overflow-hidden border-t border-white/10 bg-[#020503]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[var(--landing-max-width)] px-[var(--landing-padding-x)] py-12 md:py-16 lg:py-20">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-12 lg:pb-12">
          <div className="lg:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100/30 bg-gradient-to-br from-emerald-400/35 via-emerald-500/15 to-cyan-300/20 shadow-[0_10px_32px_rgba(74,222,128,0.25)] transition-all group-hover:shadow-[0_14px_42px_rgba(74,222,128,0.35)]">
                <svg viewBox="0 0 32 32" className="h-7 w-7 text-emerald-100" aria-hidden>
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
              <div className="flex flex-col">
                <span className="text-lg font-bold uppercase tracking-[0.12em] text-white">
                  AgriServe
                </span>
                <span className="text-[10px] tracking-[0.2em] text-emerald-400/80">
                  Agriculture. Reimagined.
                </span>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              India&apos;s premier agri-tech marketplace connecting farmers with verified equipment
              providers and skilled agricultural workers across the nation.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="mailto:support@agriserve.in"
                className="flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-emerald-400"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                  <Mail className="h-4 w-4 text-emerald-400" />
                </div>
                <span>support@agriserve.in</span>
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-emerald-400"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                  <Phone className="h-4 w-4 text-emerald-400" />
                </div>
                <span>+91 12345 67890</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-white/60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                </div>
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Tractor className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Equipment
              </h4>
            </div>
            <ul className="space-y-2.5">
              {equipmentLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm text-white/50 transition-all hover:translate-x-1 hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Services
              </h4>
            </div>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm text-white/50 transition-all hover:translate-x-1 hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Wheat className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Company
              </h4>
            </div>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm text-white/50 transition-all hover:translate-x-1 hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Support
              </h4>
            </div>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm text-white/50 transition-all hover:translate-x-1 hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-b border-white/10 pb-10 pt-10 lg:pb-12 lg:pt-12">
          <AnimatePresence mode="wait">
            {!isSubscribed ? (
              <motion.div
                key="subscribe-form"
                initial={{ opacity: 1, height: 'auto' }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: { duration: 0.5, ease: 'easeInOut' },
                }}
                className="grid gap-8 lg:grid-cols-2 lg:items-center"
              >
                <div>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/70">
                    Stay Updated
                  </h4>
                  <p className="max-w-md text-sm text-white/50">
                    Get the latest updates on new equipment, provider expansions, and exclusive
                    offers for the farming community.
                  </p>
                </div>
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white transition-all placeholder:text-white/40 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_12px_32px_rgba(16,185,129,0.4)]"
                  >
                    <Send className="h-4 w-4" />
                    Subscribe
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, delay: 0.2, ease: 'easeOut' },
                }}
                className="flex flex-col items-center justify-center gap-4 py-4 lg:flex-row"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20"
                >
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                </motion.div>
                <div className="text-center lg:text-left">
                  <p className="text-lg font-semibold text-emerald-400">
                    Thank you for subscribing!
                  </p>
                  <p className="text-sm text-white/60">
                    You&apos;ll hear from us soon. Stay tuned for exclusive updates.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pb-6 pt-10 lg:pb-8 lg:pt-12">
          <h4 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white/50 lg:text-left">
            Trusted by Farmers Across India
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:justify-start">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2"
              >
                <badge.icon className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-white/60">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-6 lg:flex-row">
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </motion.a>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 text-xs text-white/40 sm:flex-row">
            <span>© {currentYear} AgriServe. All rights reserved.</span>
            <span className="hidden sm:inline">|</span>
            <Link href="/terms" className="transition-colors hover:text-emerald-400">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-emerald-400">
              Privacy
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2"
          >
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-orange-300">
              Made in India
            </span>
            <Leaf className="h-3.5 w-3.5 text-orange-400" />
          </motion.div>
        </div>

        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-[0_8px_32px_rgba(16,185,129,0.3)] backdrop-blur-xl transition-all hover:scale-110 hover:bg-emerald-500/30"
              aria-label="Back to top"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </footer>
  );
}

export default LandingPageFooter;
