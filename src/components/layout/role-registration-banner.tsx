'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { X, Tractor, Briefcase, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RoleRegistrationBanner() {
  const router = useRouter();
  const { roles } = useAuthStore();
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('role-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('role-banner-dismissed', 'true');
  };

  const handleRegister = () => {
    router.push('/settings/roles');
  };

  // Don't show if user has all roles or banner is dismissed
  if (!mounted || isDismissed || roles.length >= 3) {
    return null;
  }

  const availableRoles = [];
  if (!roles.includes('provider')) {
    availableRoles.push({ name: 'Provider', icon: Tractor, color: 'emerald' });
  }
  if (!roles.includes('labour')) {
    availableRoles.push({ name: 'Labour', icon: Briefcase, color: 'amber' });
  }

  if (availableRoles.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative overflow-hidden border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/50 via-emerald-900/30 to-emerald-950/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <p className="text-sm font-semibold text-white">
                  Unlock More Features!
                </p>
                <p className="text-xs text-emerald-300 sm:text-sm">
                  Register as {availableRoles.map((r, i) => (
                    <span key={r.name}>
                      {i > 0 && (i === availableRoles.length - 1 ? ' or ' : ', ')}
                      <span className="font-semibold">{r.name}</span>
                    </span>
                  ))} to access more opportunities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleRegister}
                className="bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Register Now
              </Button>
              <button
                onClick={handleDismiss}
                className="rounded-full p-1 text-emerald-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
