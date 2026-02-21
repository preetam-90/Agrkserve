'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Tractor, Briefcase, Shield, ChevronDown, Check, Settings, X } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const roleConfig = {
  renter: {
    label: 'Renter',
    icon: User,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    hoverBg: 'hover:bg-blue-500/20',
    description: 'Rent equipment & hire labour',
    dashboard: '/dashboard',
  },
  provider: {
    label: 'Provider',
    icon: Tractor,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    hoverBg: 'hover:bg-emerald-500/20',
    description: 'List equipment for rent',
    dashboard: '/provider/dashboard',
  },
  labour: {
    label: 'Labour',
    icon: Briefcase,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    hoverBg: 'hover:bg-amber-500/20',
    description: 'Offer your services',
    dashboard: '/dashboard',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    hoverBg: 'hover:bg-red-500/20',
    description: 'Manage platform',
    dashboard: '/admin',
  },
};

export function RoleSwitcher() {
  const router = useRouter();
  const { roles, activeRole, switchRole } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!activeRole || roles.length === 0) {
    return null;
  }

  const currentRoleConfig = roleConfig[activeRole];
  const CurrentIcon = currentRoleConfig.icon;

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);

    const targetDashboard = roleConfig[role].dashboard;
    router.push(targetDashboard);
  };

  if (roles.length === 1) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'flex items-center gap-2 border px-3 py-1.5',
          currentRoleConfig.bgColor,
          currentRoleConfig.borderColor,
          currentRoleConfig.color
        )}
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="font-semibold">{currentRoleConfig.label}</span>
      </Badge>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 border transition-all duration-200',
          currentRoleConfig.bgColor,
          currentRoleConfig.borderColor,
          'hover:shadow-lg hover:shadow-black/20'
        )}
      >
        <CurrentIcon className={cn('h-4 w-4', currentRoleConfig.color)} />
        <span className={cn('font-semibold', currentRoleConfig.color)}>
          {currentRoleConfig.label}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-white/60 transition-transform duration-200', isOpen && 'rotate-180')} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full z-[100] mt-2 min-w-[300px] max-w-[85vw] w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1f15]/98 p-2 shadow-2xl backdrop-blur-xl"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Switch Role
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-white/30 hover:bg-white/10 hover:text-white/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {roles.map((role) => {
                const config = roleConfig[role];
                const Icon = config.icon;
                const isActive = role === activeRole;

                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 transition-all duration-200',
                      isActive
                        ? 'border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-green-500/10'
                        : config.hoverBg,
                      'hover:border-white/10 hover:bg-white/5'
                    )}
                  >
                    <div className={cn('flex shrink-0 items-center justify-center rounded-lg p-2', config.bgColor)}>
                      <Icon className={cn('h-5 w-5', config.color)} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className={cn('font-semibold', isActive ? config.color : 'text-white/90')}>
                          {config.label}
                        </span>
                        {isActive && (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50">{config.description}</p>
                    </div>
                    {isActive && (
                      <Check className={cn('h-4 w-4 shrink-0', config.color)} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="my-2 h-px bg-white/10" />

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/settings/roles');
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-white/60 transition-all hover:border hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              <Settings className="h-4 w-4" />
              <span className="font-medium">Manage Roles</span>
              {roles.length < 3 && (
                <span className="ml-auto rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  NEW
                </span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
