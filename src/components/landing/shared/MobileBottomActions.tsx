'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Tractor, Users, Wrench, Phone, ChevronUp, X } from 'lucide-react';

interface QuickActionButton {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const quickActions: QuickActionButton[] = [
  {
    label: 'Book Equipment',
    href: '/equipment',
    Icon: Tractor,
    color: 'bg-emerald-500',
  },
  {
    label: 'Hire Labour',
    href: '/labour',
    Icon: Users,
    color: 'bg-cyan-500',
  },
  {
    label: 'List Equipment',
    href: '/provider/equipment',
    Icon: Wrench,
    color: 'bg-violet-500',
  },
];

export function MobileBottomActions() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Restore dismissed state on scroll to top
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (isDismissed && window.scrollY < 100) {
        clearTimeout(timeout);
        timeout = setTimeout(() => setIsDismissed(false), 500);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, [isDismissed]);

  const handleDismiss = useCallback(() => {
    setIsExpanded(false);
    setIsDismissed(true);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={
            prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }
          }
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] px-3 pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              // Expanded Panel
              <motion.div
                key="expanded"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', damping: 30, stiffness: 400 }
                }
                className="bg-[#0a0f0c]/98 pointer-events-auto w-full overflow-hidden rounded-t-2xl border-t border-white/10 backdrop-blur-2xl"
              >
                {/* Handle & Close */}
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <div className="h-1 w-10 rounded-full bg-white/20" />
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white"
                    aria-label="Close quick actions"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2 p-4">
                  {quickActions.map((action) => {
                    const ActionIcon = action.Icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-white/5"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color} text-white transition-transform group-hover:scale-110`}
                        >
                          <ActionIcon className="h-6 w-6" />
                        </div>
                        <span className="text-center text-xs font-medium leading-tight text-white/80">
                          {action.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Support */}
                <div className="px-4 pb-4">
                  <a
                    href="tel:+911234567890"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-emerald-300 transition-colors hover:bg-emerald-500/20"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Call Support</span>
                  </a>
                </div>
              </motion.div>
            ) : (
              // Mini Bar
              <motion.div
                key="mini"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="scrollbar-hide pointer-events-auto flex items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-[#0a0f0c]/90 px-2 py-1.5 backdrop-blur-xl"
              >
                {/* Expand Button */}
                <button
                  onClick={toggleExpand}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform hover:scale-105"
                  aria-label="Show quick actions"
                  aria-expanded={false}
                >
                  <ChevronUp className="h-5 w-5" />
                </button>

                {/* Quick Action Links */}
                {quickActions.map((action) => {
                  const ActionIcon = action.Icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex flex-shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <ActionIcon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{action.label}</span>
                    </Link>
                  );
                })}

                {/* Support Link */}
                <a
                  href="tel:+911234567890"
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Support</span>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileBottomActions;
