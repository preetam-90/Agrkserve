'use client';

import { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Moon,
  Sun,
  Command,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminHeaderProps {
  onMenuClick: () => void;
  user: any;
}

export default function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(true); // Always dark for admin
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#262626] bg-[#0f0f0f]/80 px-6 backdrop-blur-xl lg:px-8">
      {/* Left: Mobile Menu */}
      <div className="flex flex-1 items-center gap-6">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 transition-colors hover:bg-white/5 lg:hidden"
        >
          <Menu className="h-5 w-5 text-neutral-400" />
        </button>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="group relative rounded-xl p-2 text-neutral-400 transition-all hover:bg-white/5 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#0f0f0f] transition-transform group-hover:scale-110" />
            <span className="absolute right-2 top-2 h-2 w-2 animate-ping rounded-full bg-emerald-500" />
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
                  className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-[#262626] bg-[#1a1a1a] shadow-2xl"
                >
                  <div className="border-b border-[#262626] bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <p className="mt-1 text-xs text-neutral-500">You have 3 new notifications</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2">
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-neutral-400 transition-all hover:bg-white/5">
                      <p className="font-medium text-white">New booking pending</p>
                      <p className="mt-1 text-xs text-neutral-500">5 minutes ago</p>
                    </button>
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-neutral-400 transition-all hover:bg-white/5">
                      <p className="font-medium text-white">User verification required</p>
                      <p className="mt-1 text-xs text-neutral-500">1 hour ago</p>
                    </button>
                    <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-neutral-400 transition-all hover:bg-white/5">
                      <p className="font-medium text-white">New review posted</p>
                      <p className="mt-1 text-xs text-neutral-500">2 hours ago</p>
                    </button>
                  </div>
                  <div className="border-t border-[#262626] bg-[#161616] p-2">
                    <Link
                      href="/admin/settings"
                      className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm text-emerald-400 transition-all hover:bg-emerald-500/10"
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
        <div className="h-8 w-px bg-[#262626]" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="group flex items-center gap-3 rounded-xl border border-transparent py-1.5 pl-2 pr-3 transition-all hover:border-[#262626] hover:bg-white/5"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 opacity-50 blur-md transition-opacity group-hover:opacity-75"></div>
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white shadow-lg">
                {user?.profile?.profile_image ? (
                  <img
                    src={user.profile.profile_image}
                    className="h-full w-full rounded-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <span className="text-sm font-bold">A</span>
                )}
              </div>
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold leading-none text-white">
                {user?.profile?.name || 'Admin'}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-emerald-500">
                Super Admin
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
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
                  className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-[#262626] bg-[#1a1a1a] shadow-2xl"
                >
                  {/* Header */}
                  <div className="border-b border-[#262626] bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
                    <p className="text-sm font-semibold text-white">Admin Account</p>
                    <p className="mt-1 truncate text-xs text-neutral-500">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1 p-2">
                    <Link
                      href="/admin/settings"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-400 transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-400 transition-all hover:bg-white/5 hover:text-white"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-[#262626] bg-[#161616] p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
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
