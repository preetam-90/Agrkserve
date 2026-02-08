'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useContactInfo } from '@/lib/hooks/useContactInfo';
import {
  Tractor,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Leaf,
  Wheat,
  Sprout,
  ChevronRight,
} from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleOnHover = {
  scale: 1.05,
  transition: { duration: 0.3, ease: 'easeOut' },
};

export function PremiumFooter() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { contactInfo } = useContactInfo();

  const footerLinks = {
    product: [
      { id: 'equipment', label: 'Equipment', href: '/equipment' },
      { id: 'labor', label: 'Labor', href: '/labour' },
      { id: 'bookings', label: 'Bookings', href: '/bookings' },
      { id: 'gallery', label: 'Gallery', href: '/gallery' },
    ],
    company: [
      { id: 'about', label: 'About Us', href: '/about' },
      { id: 'contact', label: 'Contact', href: '/contact' },
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'profile', label: 'Profile', href: '/profile' },
    ],
    support: [
      { id: 'help', label: 'Help Center', href: '/help' },
      { id: 'terms', label: 'Terms of Service', href: '/terms' },
      { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { id: 'settings', label: 'Settings', href: '/settings' },
    ],
  };

  const socialLinks = [
    {
      icon: FaFacebook,
      href: contactInfo.social.facebook || 'https://facebook.com/agriserve',
      label: 'Facebook',
      color: '#1877F2',
    },
    {
      icon: FaTwitter,
      href: contactInfo.social.twitter || 'https://twitter.com/agriserve',
      label: 'Twitter',
      color: '#1DA1F2',
    },
    {
      icon: FaInstagram,
      href: contactInfo.social.instagram || 'https://instagram.com/agriserve',
      label: 'Instagram',
      color: '#E4405F',
    },
    {
      icon: FaLinkedin,
      href: contactInfo.social.linkedin || 'https://linkedin.com/company/agriserve',
      label: 'LinkedIn',
      color: '#0A66C2',
    },
  ];

  return (
    <footer className="relative w-full max-w-full overflow-hidden bg-[#0A0F0C]">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -right-40 -top-40 h-96 w-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Floating Agricultural Icons */}
        <motion.div
          className="absolute left-[10%] top-20 text-green-500/10"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Leaf className="h-16 w-16" />
        </motion.div>
        <motion.div
          className="absolute right-[15%] top-40 text-green-500/10"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        >
          <Wheat className="h-20 w-20" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-[20%] text-green-500/10"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        >
          <Sprout className="h-14 w-14" />
        </motion.div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Footer Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Brand Column */}
          <motion.div className="lg:col-span-4" variants={fadeInUp}>
            <Link href="/" className="group mb-6 flex items-center gap-3">
              <motion.div
                className="relative flex h-14 w-14 items-center justify-center rounded-xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' }}
                whileHover={scaleOnHover}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Tractor className="h-7 w-7 text-white" />
                </motion.div>
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-green-500/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              </motion.div>
              <span
                className="bg-gradient-to-r from-white via-green-100 to-green-400 bg-clip-text text-2xl font-bold text-transparent"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                AgriServe
              </span>
            </Link>
            <p
              className="mb-8 max-w-sm leading-relaxed text-green-200/80"
              style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
            >
              India&apos;s trusted platform for renting agricultural equipment and hiring skilled
              labor. Empowering farmers across the nation with quality machinery at fair prices.
            </p>

            {/* Contact Info */}
            <div className="space-y-4" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
              {[
                { icon: Mail, text: contactInfo.email, href: `mailto:${contactInfo.email}` },
                {
                  icon: Phone,
                  text: contactInfo.phone,
                  href: `tel:${contactInfo.phone.replace(/\s/g, '')}`,
                },
                { icon: MapPin, text: contactInfo.address, href: null },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="group flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                >
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                  >
                    <item.icon className="h-5 w-5 text-green-400" />
                  </motion.div>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-green-200/70 transition-colors duration-300 group-hover:text-green-400"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-green-200/70">{item.text}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div className="lg:col-span-2" variants={fadeInUp}>
            <h3
              className="mb-6 flex items-center gap-2 text-lg font-bold text-white"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              <span className="h-px w-8 bg-gradient-to-r from-green-500 to-transparent" />
              Product
            </h3>
            <ul className="space-y-3" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
              {footerLinks.product.map((link, index) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-green-200/70 transition-all duration-300 hover:text-green-400"
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <motion.span
                      className="h-px w-0 bg-green-400 transition-all duration-300 group-hover:w-4"
                      initial={false}
                      animate={{ width: hoveredLink === link.id ? 16 : 0 }}
                    />
                    <span>{link.label}</span>
                    <ChevronRight className="h-3 w-3 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div className="lg:col-span-2" variants={fadeInUp}>
            <h3
              className="mb-6 flex items-center gap-2 text-lg font-bold text-white"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              <span className="h-px w-8 bg-gradient-to-r from-green-500 to-transparent" />
              Company
            </h3>
            <ul className="space-y-3" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
              {footerLinks.company.map((link, index) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-green-200/70 transition-all duration-300 hover:text-green-400"
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <motion.span
                      className="h-px w-0 bg-green-400 transition-all duration-300 group-hover:w-4"
                      initial={false}
                      animate={{ width: hoveredLink === link.id ? 16 : 0 }}
                    />
                    <span>{link.label}</span>
                    <ChevronRight className="h-3 w-3 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div className="lg:col-span-2" variants={fadeInUp}>
            <h3
              className="mb-6 flex items-center gap-2 text-lg font-bold text-white"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              <span className="h-px w-8 bg-gradient-to-r from-green-500 to-transparent" />
              Support
            </h3>
            <ul className="space-y-3" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
              {footerLinks.support.map((link, index) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-green-200/70 transition-all duration-300 hover:text-green-400"
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <motion.span
                      className="h-px w-0 bg-green-400 transition-all duration-300 group-hover:w-4"
                      initial={false}
                      animate={{ width: hoveredLink === link.id ? 16 : 0 }}
                    />
                    <span>{link.label}</span>
                    <ChevronRight className="h-3 w-3 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Access */}
          <motion.div className="lg:col-span-2" variants={fadeInUp}>
            <h3
              className="mb-6 flex items-center gap-2 text-lg font-bold text-white"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              <span className="h-px w-8 bg-gradient-to-r from-green-500 to-transparent" />
              Quick Access
            </h3>
            <ul className="space-y-3" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
              {[
                { id: 'messages', label: 'Messages', href: '/messages' },
                { id: 'notifications', label: 'Notifications', href: '/notifications' },
                { id: 'provider', label: 'Provider Portal', href: '/provider' },
                { id: 'renter', label: 'Renter Portal', href: '/renter' },
              ].map((link, index) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-green-200/70 transition-all duration-300 hover:text-green-400"
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <motion.span
                      className="h-px w-0 bg-green-400 transition-all duration-300 group-hover:w-4"
                      initial={false}
                      animate={{ width: hoveredLink === link.id ? 16 : 0 }}
                    />
                    <span>{link.label}</span>
                    <ChevronRight className="h-3 w-3 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-16 border-t border-green-500/10 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            {/* Copyright */}
            <motion.p
              className="flex items-center gap-2 text-sm text-green-200/50"
              style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
              whileHover={{ color: 'rgba(134, 239, 172, 0.8)' }}
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />©{' '}
              {new Date().getFullYear()} AgriServe. All rights reserved.
            </motion.p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl"
                  style={{
                    background: 'rgba(34, 197, 94, 0.05)',
                    border: '1px solid rgba(34, 197, 94, 0.15)',
                  }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                >
                  {/* Hover Background */}
                  <motion.div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${social.color}20 0%, ${social.color}40 100%)`,
                    }}
                  />
                  <social.icon
                    className="relative h-5 w-5 text-green-400/70 transition-colors duration-300 group-hover:text-white"
                    style={{ color: social.color }}
                  />
                </motion.a>
              ))}
            </div>

            {/* Back to Top */}
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2 transition-all duration-300 hover:border-green-500/40 hover:bg-green-500/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm text-green-200/60 transition-colors group-hover:text-green-400">
                Back to top
              </span>
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-4 w-4 rotate-[-90deg] text-green-400" />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-green-200/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Secure Payments
          </span>
          <span className="h-1 w-1 rounded-full bg-green-500/30" />
          <span className="flex items-center gap-1">
            <Leaf className="h-3 w-3" />
            Eco-Friendly
          </span>
          <span className="h-1 w-1 rounded-full bg-green-500/30" />
          <span className="flex items-center gap-1">
            <Sprout className="h-3 w-3" />
            Farmer First
          </span>
          <span className="h-1 w-1 rounded-full bg-green-500/30" />
          <span className="flex items-center gap-1">
            <Wheat className="h-3 w-3" />
            Made in India
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
