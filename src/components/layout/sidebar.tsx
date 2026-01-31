'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  MessageSquare,
  Heart,
  Settings,
  LogOut,
  Tractor,
  Package,
  Users,
  BarChart3,
  CreditCard,
  HelpCircle,
  AlertTriangle,
  Star,
  X,
  Menu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { getGroupedNavItems, getRoleDisplayName, getRoleIcon } from '@/lib/navigation';

interface SidebarProps {
  role: 'renter' | 'provider' | 'admin';
}

const accountNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { profile, roles, activeRole, signOut } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const [isClient, setIsClient] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Overview', 'Equipment', 'Labour', 'Account'])
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const groupedNavItems = getGroupedNavItems(roles || [], activeRole);

  return (
    <>
      {/* Sidebar Toggle Button (visible when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 rounded-lg border border-gray-700/50 bg-gray-800/80 p-2 shadow-lg backdrop-blur-xl transition-all hover:bg-gray-800 hover:shadow-emerald-500/20"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5 text-white/90" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-gray-800/50 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-800/50 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <div className="absolute inset-0 rounded-lg bg-emerald-400/20 blur-xl"></div>
              <Tractor className="relative h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AgriServe</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1.5 transition-colors hover:bg-gray-800/50"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* User Profile Card with Role Badges */}
        <div className="border-b border-gray-800/50 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-800/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3">
              <Avatar src={profile?.profile_image} name={profile?.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{profile?.name || 'User'}</p>
              </div>
            </div>

            {/* Role Badges */}
            {roles && roles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <Badge
                    key={r}
                    variant={activeRole === r ? 'default' : 'secondary'}
                    className={cn(
                      'cursor-pointer border text-xs',
                      activeRole === r
                        ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                        : 'border-gray-700/50 bg-gray-800/50 text-gray-400'
                    )}
                  >
                    {getRoleDisplayName(r)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation with Grouped Sections */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {groupedNavItems.map((group) => (
              <div key={group.section} className="space-y-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(group.section)}
                  className="flex w-full items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-400"
                >
                  <span>{group.section}</span>
                  {expandedSections.has(group.section) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {/* Section Items */}
                {expandedSections.has(group.section) && (
                  <div className="mt-1 space-y-1">
                    {group.items.map((item) => {
                      const isActive =
                        isClient &&
                        (pathname === item.href || pathname.startsWith(`${item.href}/`));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300',
                            isActive
                              ? 'border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400'
                              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                          )}
                        >
                          <item.icon
                            className={cn(
                              'h-5 w-5',
                              isActive ? 'text-emerald-400' : 'text-gray-500'
                            )}
                          />
                          {item.label}
                          {item.badge && typeof item.badge === 'number' && (
                            <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg shadow-red-500/20">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="space-y-1 border-t border-gray-800/50 p-4">
          {accountNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all duration-300 hover:bg-gray-800/50 hover:text-white"
            >
              <item.icon className="h-5 w-5 text-gray-500" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
