'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Users, MapPin, Star, Clock, BadgeCheck } from 'lucide-react';

interface TrustBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  delay?: number;
}

function TrustBadge({ icon, label, value, sublabel, delay = 0 }: TrustBadgeProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xl"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wider text-white/60">{label}</span>
        <span className="text-sm font-bold text-white">{value}</span>
        {sublabel && <span className="text-xs text-white/50">{sublabel}</span>}
      </div>
    </motion.div>
  );
}

interface TrustLayerProps {
  variant?: 'hero' | 'inline' | 'footer';
  className?: string;
}

/**
 * Trust Layer Component
 *
 * Displays real trust signals for Indian rural/urban users:
 * - Verified providers count
 * - Geographic coverage
 * - User reviews/ratings
 * - Response time
 * - Certifications
 */
export function TrustLayer({ variant = 'hero', className = '' }: TrustLayerProps) {
  const prefersReducedMotion = useReducedMotion();

  // Trust signals - these should come from API in production
  const trustSignals = {
    providers: '2,500+',
    farmers: '50,000+',
    states: '28 States',
    rating: '4.8/5',
    responseTime: '< 2 hours',
    verified: '100%',
  };

  if (variant === 'hero') {
    return (
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className={`flex flex-wrap items-center justify-center gap-3 md:gap-4 ${className}`}
      >
        <TrustBadge
          icon={<Shield className="h-4 w-4" />}
          label="Verified Providers"
          value={trustSignals.providers}
          delay={0}
        />
        <TrustBadge
          icon={<Users className="h-4 w-4" />}
          label="Active Farmers"
          value={trustSignals.farmers}
          delay={0.1}
        />
        <TrustBadge
          icon={<MapPin className="h-4 w-4" />}
          label="Pan-India"
          value={trustSignals.states}
          delay={0.2}
        />
        <TrustBadge
          icon={<Star className="h-4 w-4" />}
          label="Average Rating"
          value={trustSignals.rating}
          delay={0.3}
        />
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-4 md:gap-6 ${className}`}>
        {[
          { icon: <BadgeCheck className="h-5 w-5" />, label: 'ISI Certified Equipment' },
          { icon: <Clock className="h-5 w-5" />, label: `${trustSignals.responseTime} Response` },
          { icon: <Shield className="h-5 w-5" />, label: `${trustSignals.verified} Verified` },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-center gap-2 text-white/70"
          >
            <span className="text-emerald-400">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  // Footer variant - compact horizontal
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-6 text-xs text-white/50 ${className}`}
    >
      <span className="flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5 text-emerald-500" />
        Verified Providers
      </span>
      <span className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-cyan-500" />
        All India Coverage
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-amber-500" />
        24/7 Support
      </span>
    </div>
  );
}

/**
 * Support CTA Component
 * Prominent phone/chat support for rural users
 */
export function SupportCTA({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <a
        href="tel:+911234567890"
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        aria-label="Call support"
      >
        <span className="flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Call Support: +91 12345 67890
      </a>
    </div>
  );
}
