'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bell, Menu, ChevronDown, LogOut, User, Settings, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  profile_image?: string;
  name?: string;
}

interface User {
  profile?: UserProfile;
  email?: string;
  name?: string;
}

interface AdminHeaderProps {
  onMenuClick: () => void;
  user: User | null;
}

export default function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="bg-[var(--admin-bg-elevated)]/80 sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[var(--admin-border)] px-6 backdrop-blur-xl lg:px-8">
      {/* Holographic top border */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--admin-primary)] to-transparent opacity-50"
        style={{
          boxShadow: '0 0 10px var(--admin-primary-glow)',
        }}
      />

      {/* Left: Mobile Menu + Search */}
      <div className="flex flex-1 items-center gap-6">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-[var(--admin-text-secondary)] transition-all hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* System Status Indicator */}
        <div className="bg-[var(--admin-bg-card)]/50 hidden items-center gap-2 rounded-lg border border-[var(--admin-border)] px-3 py-1.5 lg:flex">
          <div className="admin-status-pulse text-[var(--admin-success)]" />
          <span className="font-['Fira_Code'] text-xs font-medium text-[var(--admin-text-secondary)]">
            ONLINE
          </span>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="group relative rounded-xl p-2 text-[var(--admin-text-secondary)] transition-all hover:bg-white/5 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--admin-primary)] ring-2 ring-[var(--admin-bg-elevated)] transition-transform group-hover:scale-110"
              style={{
                boxShadow: '0 0 8px var(--admin-primary-glow)',
              }}
            />
            <span className="absolute right-2 top-2 h-2 w-2 animate-ping rounded-full bg-[var(--admin-primary)]" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[rgba(26,26,36,0.95)] shadow-2xl backdrop-blur-2xl"
                >
                  <div className="from-[var(--admin-primary)]/10 border-b border-[var(--admin-border)] bg-gradient-to-br to-transparent p-4">
                    <p className="font-['Fira_Code'] text-sm font-semibold text-white">
                      NOTIFICATIONS
                    </p>
                    <p className="mt-1 text-xs text-[var(--admin-text-secondary)]">
                      You have 3 new alerts
                    </p>
                  </div>
                  <div className="admin-scrollbar max-h-96 overflow-y-auto p-2">
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[var(--admin-text-secondary)] transition-all hover:bg-white/5">
                      <div className="flex items-start gap-3">
                        <div className="bg-[var(--admin-warning)]/10 mt-1 flex h-8 w-8 items-center justify-center rounded-lg">
                          <Zap className="h-4 w-4 text-[var(--admin-warning)]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">New booking pending</p>
                          <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                            5 minutes ago
                          </p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[var(--admin-text-secondary)] transition-all hover:bg-white/5">
                      <div className="flex items-start gap-3">
                        <div className="bg-[var(--admin-secondary)]/10 mt-1 flex h-8 w-8 items-center justify-center rounded-lg">
                          <User className="h-4 w-4 text-[var(--admin-secondary)]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">User verification required</p>
                          <p className="mt-1 text-xs text-[var(--admin-text-muted)]">1 hour ago</p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[var(--admin-text-secondary)] transition-all hover:bg-white/5">
                      <div className="flex items-start gap-3">
                        <div className="bg-[var(--admin-success)]/10 mt-1 flex h-8 w-8 items-center justify-center rounded-lg">
                          <Shield className="h-4 w-4 text-[var(--admin-success)]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">Security scan completed</p>
                          <p className="mt-1 text-xs text-[var(--admin-text-muted)]">2 hours ago</p>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="border-t border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-2">
                    <Link
                      href="/admin/settings"
                      className="hover:bg-[var(--admin-primary)]/10 flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm text-[var(--admin-primary)] transition-all"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-[var(--admin-divider)]" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="group flex items-center gap-3 rounded-xl border border-transparent py-1.5 pl-2 pr-3 transition-all hover:border-[var(--admin-border)] hover:bg-white/5"
          >
            <div className="relative">
              {/* Animated glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--admin-primary)] to-[var(--admin-secondary)] opacity-50 blur-md transition-opacity group-hover:opacity-75" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--admin-primary)] to-[var(--admin-secondary)] text-white shadow-lg">
                {user?.profile?.profile_image ? (
                  <Image
                    src={user.profile.profile_image}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                    sizes="32px"
                  />
                ) : (
                  <span className="font-['Fira_Code'] text-sm font-bold">A</span>
                )}
              </div>
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold leading-none text-white">
                {user?.profile?.name || 'Admin'}
              </p>
              <p className="mt-1 font-['Fira_Code'] text-[10px] font-medium uppercase tracking-wide text-[var(--admin-primary)]">
                Super Admin
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-[var(--admin-text-muted)] transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[rgba(26,26,36,0.95)] shadow-2xl backdrop-blur-2xl"
                >
                  {/* Header */}
                  <div className="from-[var(--admin-primary)]/10 border-b border-[var(--admin-border)] bg-gradient-to-br to-transparent p-4">
                    <p className="font-['Fira_Code'] text-sm font-semibold text-white">
                      ADMIN ACCOUNT
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--admin-text-secondary)]">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1 p-2">
                    <Link
                      href="/admin/settings"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--admin-text-secondary)] transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--admin-text-secondary)] transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-2">
                    <button
                      onClick={handleLogout}
                      className="hover:bg-[var(--admin-danger)]/10 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--admin-danger)] transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
