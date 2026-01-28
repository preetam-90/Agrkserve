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
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useState, useEffect } from 'react';

interface SidebarProps {
  role: 'renter' | 'provider' | 'admin';
}

const renterNavItems = [
  { href: '/renter', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/equipment', label: 'Find Equipment', icon: Search },
  { href: '/renter/labour', label: 'Find Labour', icon: Users },
  { href: '/renter/bookings', label: 'My Bookings', icon: CalendarDays },
  { href: '/renter/labour/bookings', label: 'Labour Bookings', icon: CalendarDays },
  { href: '/renter/messages', label: 'Messages', icon: MessageSquare },
  { href: '/renter/favorites', label: 'Favorites', icon: Heart },
  { href: '/renter/reviews', label: 'My Reviews', icon: Star },
];

const providerNavItems = [
  { href: '/provider', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/provider/equipment', label: 'My Equipment', icon: Tractor },
  { href: '/provider/labour', label: 'Labour Profile', icon: Users },
  { href: '/provider/bookings', label: 'Booking Requests', icon: CalendarDays },
  { href: '/provider/earnings', label: 'Earnings', icon: CreditCard },
  { href: '/provider/reviews', label: 'Reviews', icon: Star },
];

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/equipment', label: 'Equipment', icon: Package },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems = role === 'admin'
    ? adminNavItems
    : role === 'provider'
    ? providerNavItems
    : renterNavItems;

  return (
    <>
      {/* Sidebar Toggle Button (visible when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-600">
            <Tractor className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">AgriServe</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
          <Avatar src={profile?.profile_image} name={profile?.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = isClient && (pathname === item.href || pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-green-600' : 'text-gray-400')} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 p-4 space-y-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <item.icon className="h-5 w-5 text-gray-400" />
            {item.label}
          </Link>
        ))}
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
    </>
  );
}
