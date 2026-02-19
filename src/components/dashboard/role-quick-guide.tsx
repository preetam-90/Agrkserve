'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Tractor, Briefcase, ArrowRight, Sparkles, RefreshCw, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function RoleQuickGuide() {
  const router = useRouter();
  const { roles } = useAuthStore();
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role-guide-dismissed') === 'true';
    }
    return false;
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('role-guide-dismissed', 'true');
  };

  const handleSwitchRole = () => {
    // Scroll to top where role switcher is
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Optionally highlight the role switcher
  };

  const handleRegisterRole = () => {
    router.push('/settings/roles');
  };

  // Don't show if dismissed or user has all roles
  if (isDismissed || roles.length >= 3) {
    return null;
  }

  const hasMultipleRoles = roles.length > 1;
  const availableRoles = [];

  if (!roles.includes('provider')) {
    availableRoles.push({
      name: 'Provider',
      icon: Tractor,
      description: 'List equipment for rent',
    });
  }
  if (!roles.includes('labour')) {
    availableRoles.push({ name: 'Labour', icon: Briefcase, description: 'Offer your services' });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-emerald-900/10">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Quick Guide</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Maximize your AgriServe experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Switch Roles Section */}
            {hasMultipleRoles && (
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Switch Roles</h3>
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 bg-blue-500/10 text-blue-400"
                  >
                    {roles.length} roles
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-slate-400">
                  You have multiple roles! Click the role button in the header (top right) to switch
                  between them.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSwitchRole}
                  className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  Show Me Where
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Register New Roles Section */}
            {availableRoles.length > 0 && (
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-semibold text-white">Unlock More Features</h3>
                </div>
                <p className="mb-3 text-sm text-slate-400">
                  Register for additional roles to access more opportunities:
                </p>
                <div className="mb-3 space-y-2">
                  {availableRoles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <div
                        key={role.name}
                        className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/30 p-2"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                          <Icon className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{role.name}</p>
                          <p className="text-xs text-slate-500">{role.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  onClick={handleRegisterRole}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Register for New Role
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Help Text */}
            <p className="text-center text-xs text-slate-500">
              Need help? Check out the{' '}
              <button
                onClick={() => router.push('/help')}
                className="text-emerald-400 hover:underline"
              >
                Help Center
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
