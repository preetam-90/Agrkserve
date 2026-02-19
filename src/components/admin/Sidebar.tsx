'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Tractor,
  CalendarDays,
  Briefcase,
  Settings,
  X,
  Database,
  ShieldCheck,
  HardDrive,
  Zap,
  Image,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Activity,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { type: 'divider', label: 'Management' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Tractor, label: 'Equipment', href: '/admin/equipment' },
  { icon: CalendarDays, label: 'Bookings', href: '/admin/bookings' },
  { icon: Briefcase, label: 'Labour', href: '/admin/labour' },
  { icon: Star, label: 'Reviews', href: '/admin/reviews' },
  { type: 'divider', label: 'System' },
  { icon: Image, label: 'Media', href: '/admin/media/cloudinary' },
  { icon: HardDrive, label: 'Storage', href: '/admin/storage' },
  { icon: ShieldCheck, label: 'Audit Logs', href: '/admin/logs' },
  { icon: Database, label: 'Database', href: '/admin/database' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 280 }}
        className={cn(
          'fixed bottom-0 left-0 top-0 z-50 lg:translate-x-0',
          'bg-[var(--admin-bg-elevated)]/80 border-r border-[var(--admin-border)] backdrop-blur-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        initial={false}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Holographic Border Effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-r-2xl border-r-2 border-[var(--admin-primary)] opacity-20"
          style={{
            boxShadow: '0 0 20px var(--admin-primary-glow)',
          }}
        />

        <div className="relative flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center justify-between border-b border-[var(--admin-border)] px-6">
            {!isCollapsed ? (
              <Link href="/admin" className="group flex items-center gap-3">
                <div className="relative">
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-secondary)] opacity-50 blur-lg transition-opacity group-hover:opacity-75" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-secondary)] shadow-lg">
                    <Zap className="h-5 w-5 text-[var(--admin-bg-base)]" />
                  </div>
                </div>
                <div>
                  <h1 className="font-['Fira_Code'] text-lg font-bold tracking-tight text-white">
                    AGRI<span className="text-[var(--admin-primary)]">ADMIN</span>
                  </h1>
                  <p className="font-['Fira_Code'] text-[9px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    Control Center
                  </p>
                </div>
              </Link>
            ) : (
              <Link href="/admin" className="group mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-secondary)] opacity-50 blur-lg transition-opacity group-hover:opacity-75" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-secondary)] shadow-lg">
                    <Zap className="h-5 w-5 text-[var(--admin-bg-base)]" />
                  </div>
                </div>
              </Link>
            )}

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[var(--admin-text-secondary)] transition-all hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden rounded-lg p-2 text-[var(--admin-text-secondary)] transition-all hover:bg-white/5 hover:text-white lg:block"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="admin-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-6">
            {menuItems.map((item, idx) => {
              if (item.type === 'divider') {
                if (isCollapsed) {
                  return <div key={idx} className="my-3 border-t border-[var(--admin-border)]" />;
                }
                return (
                  <div key={idx} className="mt-4 px-3 py-4 first:mt-0">
                    <p className="font-['Fira_Code'] text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-muted)]">
                      {item.label}
                    </p>
                  </div>
                );
              }

              const isActive = pathname === item.href;
              const Icon = item.icon as React.ComponentType<{ className?: string }>;

              return (
                <Link
                  key={idx}
                  href={item.href || '#'}
                  title={isCollapsed ? item.label : undefined}
                >
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isCollapsed ? 'justify-center' : '',
                      isActive
                        ? 'from-[var(--admin-primary)]/10 to-[var(--admin-secondary)]/5 bg-gradient-to-r text-[var(--admin-primary)]'
                        : 'text-[var(--admin-text-secondary)] hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {/* Active indicator line */}
                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 h-8 w-1 rounded-r-full bg-gradient-to-b from-[var(--admin-primary)] to-[var(--admin-secondary)]"
                        style={{
                          boxShadow: '0 0 10px var(--admin-primary-glow)',
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isActive
                          ? 'text-[var(--admin-primary)]'
                          : 'text-[var(--admin-text-muted)] group-hover:text-[var(--admin-text-secondary)]'
                      )}
                    />

                    {!isCollapsed && (
                      <>
                        <span className="font-['Fira_Sans']">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="active-dot"
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--admin-primary)]"
                            style={{
                              boxShadow: '0 0 8px var(--admin-primary-glow)',
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </>
                    )}

                    {isCollapsed && isActive && (
                      <div
                        className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-gradient-to-b from-[var(--admin-primary)] to-[var(--admin-secondary)]"
                        style={{
                          boxShadow: '0 0 10px var(--admin-primary-glow)',
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Footer Status Card */}
          {!isCollapsed && (
            <div className="border-t border-[var(--admin-border)] p-4">
              <div className="admin-glass-card group relative overflow-hidden rounded-2xl p-4">
                {/* Decorative icon */}
                <div className="absolute right-2 top-2 opacity-5 transition-opacity group-hover:opacity-10">
                  <Activity className="h-16 w-16 rotate-12" />
                </div>

                <div className="relative z-10">
                  <p className="mb-2 font-['Fira_Code'] text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    System Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="admin-status-pulse text-[var(--admin-success)]" />
                    <span className="text-sm font-semibold text-white">All Systems Online</span>
                  </div>
                  <div className="mt-3 border-t border-[var(--admin-divider)] pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--admin-text-secondary)]">Uptime</span>
                      <span className="font-['Fira_Code'] font-semibold text-[var(--admin-primary)]">
                        99.9%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed Footer - Just Status Indicator */}
          {isCollapsed && (
            <div className="border-t border-[var(--admin-border)] p-4">
              <div className="flex justify-center" title="All Systems Online">
                <div className="admin-status-pulse text-[var(--admin-success)]" />
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
