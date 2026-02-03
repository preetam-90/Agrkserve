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
  LogOut,
  X,
  Database,
  ShieldCheck,
  HardDrive,
  Sparkles,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { type: 'divider', label: 'Management' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Tractor, label: 'Equipment', href: '/admin/equipment' },
  { icon: CalendarDays, label: 'Bookings', href: '/admin/bookings' },
  { icon: Briefcase, label: 'Labour', href: '/admin/labour' },
  { type: 'divider', label: 'System' },
  { icon: Image, label: 'Media', href: '/admin/media/cloudinary' },
  { icon: HardDrive, label: 'Storage', href: '/admin/storage' },
  { icon: ShieldCheck, label: 'Audit Logs', href: '/admin/logs' },
  { icon: Database, label: 'Database', href: '/admin/database' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        className={cn(
          'fixed bottom-0 left-0 top-0 z-50 w-[280px] lg:static lg:translate-x-0',
          'border-r border-[#262626] bg-[#0f0f0f]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        initial={false}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center border-b border-[#262626] bg-gradient-to-r from-emerald-500/5 to-transparent px-6">
            <Link href="/admin" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-50 blur-md transition-opacity group-hover:opacity-75"></div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Agri<span className="gradient-text-admin">Admin</span>
                </h1>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
                  Control Center
                </p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-2 text-neutral-400 transition-all hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="admin-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-6">
            {menuItems.map((item, idx) => {
              if (item.type === 'divider') {
                return (
                  <div key={idx} className="mt-4 px-3 py-4 first:mt-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                      {item.label}
                    </p>
                  </div>
                );
              }

              const isActive = pathname === item.href;
              const Icon = item.icon as any;

              return (
                <Link key={idx} href={item.href || '#'}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 text-emerald-400'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 h-8 w-1 rounded-r-full bg-gradient-to-b from-emerald-400 to-emerald-600"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isActive
                          ? 'text-emerald-400'
                          : 'text-neutral-500 group-hover:text-neutral-300'
                      )}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-dot"
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Footer Status Card */}
          <div className="border-t border-[#262626] p-4">
            <div className="group relative overflow-hidden rounded-2xl border border-[#262626] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-4 transition-all duration-300 hover:border-emerald-500/30">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

              {/* Decorative icon */}
              <div className="absolute right-2 top-2 opacity-5 transition-opacity group-hover:opacity-10">
                <ShieldCheck className="h-16 w-16 rotate-12" />
              </div>

              <div className="relative z-10">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                  System Status
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></div>
                    <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-sm font-semibold text-white">All Systems Operational</span>
                </div>
                <div className="mt-3 border-t border-[#262626] pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Uptime</span>
                    <span className="font-mono font-semibold text-emerald-400">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
