'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useRef, useEffect } from 'react';
import {
  CalendarDays,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Tractor,
  Users,
  X,
  Bell,
  Home,
  UserRound,
  ChevronDown,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { shouldShowGlobalAppNavbar } from '@/lib/utils/app-navbar';
import { useNotifications } from '@/lib/services/notifications';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matches?: string[];
}

function isActivePath(pathname: string, href: string, matches: string[] = []) {
  const routes = [href, ...matches];
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

const roleConfig = {
  renter: { label: 'Renter', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  provider: { label: 'Provider', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  labour: { label: 'Labour', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  admin: { label: 'Admin', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export function AppNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, activeRole, roles, profile, signOut, switchRole } = useAuthStore();
  const shouldShowNavbar = shouldShowGlobalAppNavbar(pathname);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const recentNotifications = notifications.slice(0, 6);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString).getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const dashboardHref =
    activeRole === 'provider' || activeRole === 'labour' ? '/provider/dashboard' : '/renter/dashboard';

  const navItems = useMemo<NavItem[]>(
    () =>
      user
        ? [
          {
            href: dashboardHref,
            label: 'Dashboard',
            icon: LayoutDashboard,
            matches: ['/dashboard', '/renter/dashboard', '/provider/dashboard'],
          },
          { href: '/equipment', label: 'Equipment', icon: Tractor },
          { href: '/labour', label: 'Labour', icon: Users },
          {
            href: '/bookings',
            label: 'Bookings',
            icon: CalendarDays,
            matches: ['/renter/bookings', '/provider/bookings'],
          },
          {
            href: '/messages',
            label: 'Messages',
            icon: MessageSquare,
            matches: ['/renter/messages', '/provider/messages'],
          },
        ]
        : [
          { href: '/equipment', label: 'Equipment', icon: Tractor },
          { href: '/labour', label: 'Labour', icon: Users },
          { href: '/about', label: 'About', icon: Home },
          { href: '/contact', label: 'Contact', icon: MessageSquare },
        ],
    [dashboardHref, user]
  );

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (!shouldShowNavbar) {
    return null;
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        isScrolled
          ? 'border-[#224033]/60 bg-[#06110c]/98 backdrop-blur-md shadow-lg'
          : 'border-[#224033]/40 bg-[#06110c]/95'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand - Left */}
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all hover:bg-white/5"
            aria-label="AGRIRENTAL Home"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30">
              <Tractor className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white/90">AGRI</span>
              <span className="text-emerald-400">RENTAL</span>
            </span>
          </Link>

          {/* Desktop Navigation - Center/Left-Center */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href, item.matches);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-emerald-300'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className={cn('h-4 w-4', active && 'text-emerald-400')} />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side - User Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Role Badge */}
                {activeRole && roles.length > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'hidden items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold lg:flex',
                      roleConfig[activeRole]?.color
                    )}
                  >
                    <span>{roleConfig[activeRole]?.label}</span>
                  </Badge>
                )}

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-10 w-10 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <>
                          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-black">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className="w-[420px] rounded-2xl border border-[#2b4d3e] bg-[#0a1510]/98 p-0 shadow-2xl shadow-black/40 backdrop-blur-xl"
                  >
                    <DropdownMenuLabel className="flex items-center justify-between border-b border-[#224033]/60 px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-white">Notifications</p>
                        <p className="text-xs text-slate-400">Latest updates from your account</p>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">
                        {unreadCount} unread
                      </Badge>
                    </DropdownMenuLabel>

                    <div className="max-h-[440px] overflow-y-auto p-2">
                      {recentNotifications.length > 0 ? (
                        recentNotifications.map((notification) => (
                          <DropdownMenuItem key={notification.id} asChild className="p-0">
                            <Link
                              href={notification.action_url || '/notifications'}
                              onClick={() => {
                                if (!notification.is_read) {
                                  void markAsRead(notification.id);
                                }
                              }}
                              className={cn(
                                'mb-1.5 flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-all',
                                notification.is_read
                                  ? 'border-[#224033]/50 bg-white/[0.02] hover:bg-white/[0.05]'
                                  : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
                              )}
                            >
                              <div
                                className={cn(
                                  'mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full',
                                  notification.is_read ? 'bg-slate-500/60' : 'bg-emerald-400'
                                )}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-start justify-between gap-2">
                                  <p className="line-clamp-1 text-sm font-semibold text-white">
                                    {notification.title}
                                  </p>
                                  <span className="whitespace-nowrap text-[11px] text-slate-400">
                                    {getRelativeTime(notification.created_at)}
                                  </span>
                                </div>
                                <p className="line-clamp-2 text-xs text-slate-300/90">
                                  {notification.message}
                                </p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                          <Bell className="mb-2 h-8 w-8 text-slate-500" />
                          <p className="text-sm font-medium text-slate-300">No notifications yet</p>
                          <p className="text-xs text-slate-500">We’ll show updates here when something happens.</p>
                        </div>
                      )}
                    </div>

                    <DropdownMenuSeparator className="bg-[#224033]/60" />
                    <DropdownMenuItem asChild className="rounded-none p-0">
                      <Link
                        href="/notifications"
                        className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/10"
                      >
                        View all notifications
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="group flex h-11 items-center gap-2 rounded-xl border border-transparent bg-white/[0.02] px-2.5 py-1.5 transition-all hover:border-emerald-500/20 hover:bg-white/5"
                      aria-label="User menu"
                    >
                      <Avatar
                        src={profile?.profile_image}
                        name={profile?.name || 'User'}
                        size="sm"
                        className="border-2 border-emerald-500/30 ring-2 ring-transparent transition-all group-hover:ring-emerald-500/20"
                      />
                      <div className="hidden flex-col items-start lg:flex">
                        <span className="max-w-[130px] truncate text-sm font-semibold text-white">
                          {profile?.name || 'User'}
                        </span>
                        <span className="text-xs text-slate-400">Account menu</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className="w-72 rounded-2xl border border-[#2b4d3e] bg-[#0a1510]/98 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
                  >
                    <DropdownMenuLabel className="mb-1 rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={profile?.profile_image}
                          name={profile?.name || 'User'}
                          size="md"
                          className="border-2 border-emerald-400/30"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {profile?.name || 'User'}
                          </p>
                          <p className="truncate text-xs text-slate-300/80">
                            {profile?.phone || 'No phone number'}
                          </p>
                          {activeRole && (
                            <Badge
                              variant="outline"
                              className={cn(
                                'mt-2 h-5 rounded-md border px-1.5 text-[10px] font-semibold',
                                roleConfig[activeRole]?.color
                              )}
                            >
                              {roleConfig[activeRole]?.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="my-2 bg-[#224033]/60" />

                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-200 transition-colors hover:bg-white/5"
                      >
                        <UserRound className="h-4 w-4 text-emerald-400" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-200 transition-colors hover:bg-white/5"
                      >
                        <Settings className="h-4 w-4 text-emerald-400" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {roles.length > 1 && (
                      <>
                        <DropdownMenuSeparator className="my-2 bg-[#224033]/60" />
                        <DropdownMenuLabel className="px-2 pb-1 pt-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Switch Role
                        </DropdownMenuLabel>
                        {roles.map((role) => (
                          <DropdownMenuItem
                            key={role}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-2 py-2',
                              activeRole === role
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'text-slate-200 hover:bg-white/5'
                            )}
                            onClick={() => switchRole(role)}
                          >
                            <Sparkles className="h-4 w-4 text-emerald-400" />
                            <span>{roleConfig[role]?.label}</span>
                            {activeRole === role && (
                              <Badge
                                variant="outline"
                                className="ml-auto border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-300"
                              >
                                Active
                              </Badge>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}

                    <DropdownMenuSeparator className="my-2 bg-[#224033]/60" />

                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hidden items-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/30 sm:flex"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-[#224033]/50 bg-[#08140f]/98 backdrop-blur-md lg:hidden overflow-hidden"
          >
            <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1" aria-label="Mobile navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href, item.matches);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all',
                      active
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', active && 'text-emerald-400')} />
                    {item.label}
                  </Link>
                );
              })}

              {user ? (
                <>
                  <div className="border-t border-[#224033]/50 pt-4 mt-4">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <Avatar
                        src={profile?.profile_image}
                        name={profile?.name || 'User'}
                        size="md"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{profile?.name || 'User'}</p>
                        <p className="text-xs text-slate-400">{profile?.phone || 'No phone'}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    <Bell className="h-5 w-5" />
                    Notifications
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    <UserRound className="h-5 w-5" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="border-t border-[#224033]/50 pt-4 mt-4 space-y-2">
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-3 text-base font-medium text-emerald-300 hover:bg-emerald-500/30"
                  >
                    <LogIn className="h-5 w-5" />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-transparent px-4 py-3 text-base font-medium text-emerald-300 hover:bg-emerald-500/10"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
