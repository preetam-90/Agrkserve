'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  LogOut,
  User,
  Settings,
  Tractor,
  Leaf,
  ArrowRight,
  LayoutDashboard,
  Sprout,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useReducedMotion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { Avatar, Button, Badge } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { MessageBadge } from '@/components/messages';
import { getRoleDisplayName, getRoleIcon } from '@/lib/navigation';
import { RoleSwitcher } from '@/components/layout/role-switcher';

const publicNav = [
  { href: '/', label: 'Home', icon: Sprout },
  { href: '/equipment', label: 'Equipment', icon: Tractor },
  { href: '/labour', label: 'Labour', icon: User },
  { href: '/about', label: 'About', icon: Leaf },
  { href: '/contact', label: 'Contact', icon: ArrowRight },
];

// Magnetic button hook for desktop
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useMagneticButton(strength: number = 0.3) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      x.set(distanceX * strength);
      y.set(distanceY * strength);
    },
    [x, y, strength]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { x, y, handleMouseMove, handleMouseLeave };
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { user, profile, roles, activeRole, switchRole, signOut, isLoading } = useAuthStore();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax glow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useTransform(mouseX, [0, 1], [-100, 100]);
  const glowY = useTransform(mouseY, [0, 1], [-100, 100]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {

// eslint-disable-next-line react-hooks/set-state-in-effect
        setMobileMenuOpen(false);
  }, [pathname]);

  const getDashboardLink = useCallback(() => {
    if (activeRole === 'admin') return '/admin';
    return '/dashboard';
  }, [activeRole]);

  // Spring config for smooth animations
  const springConfig = { type: 'spring', stiffness: 400, damping: 30 };

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-0 z-50 w-full"
    >
      {/* Ambient Glow Layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(74, 124, 90, 0.4) 0%, transparent 70%)',
            x: glowX,
            y: glowY,
            translateX: '-50%',
            translateY: '-50%',
          }}
        />
      </div>

      <div
        className={cn(
          'relative border-b transition-all duration-700 ease-out',
          isScrolled
            ? 'border-white/10 bg-[#0a1f15]/80 shadow-2xl backdrop-blur-2xl'
            : 'border-white/5 bg-gradient-to-b from-[#0d1f15]/90 to-[#0d1f15]/60 backdrop-blur-xl'
        )}
      >
        {/* Gradient Mesh Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(74,124,90,0.15),transparent_50%)]" />
          <motion.div
            className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[128px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-green-600/10 blur-[128px]"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* Floating Particles */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          suppressHydrationWarning
        >
          {[...Array(5)].map((_, i) => {
            const startX = (i * 20 + 10) % 100;
            const animateX = ((i * 10 + 45) % 60) + 20;
            return (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: `${startX}%`,
                  y: '120%',
                  rotate: 0,
                }}
                animate={{
                  y: '-20%',
                  rotate: 360,
                  x: `${animateX}%`,
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  delay: i * 3,
                  ease: 'linear',
                }}
              >
                <Leaf className="h-4 w-4 text-emerald-500/20" />
              </motion.div>
            );
          })}
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left Side: Logo */}
            <div className="flex items-center gap-3">
              {/* Enhanced Logo */}
              <Link href="/" className="group relative flex items-center gap-3">
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05, rotate: -2 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  className="relative"
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-emerald-500/40 via-green-500/40 to-emerald-500/40 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Logo Container */}
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 shadow-xl backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-green-600/20" />

                    {/* Animated Tractor Icon */}
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Tractor className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    </motion.div>

                    {/* Corner Accents */}
                    <div className="absolute left-1 top-1 h-2 w-2 rounded-tl-lg border-l-2 border-t-2 border-emerald-400/50" />
                    <div className="absolute right-1 top-1 h-2 w-2 rounded-tr-lg border-r-2 border-t-2 border-emerald-400/50" />
                    <div className="absolute bottom-1 left-1 h-2 w-2 rounded-bl-lg border-b-2 border-l-2 border-emerald-400/50" />
                    <div className="absolute bottom-1 right-1 h-2 w-2 rounded-br-lg border-b-2 border-r-2 border-emerald-400/50" />
                  </div>
                </motion.div>

                <div className="flex flex-col">
                  <motion.span
                    className="text-2xl font-bold tracking-tight"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    <span className="text-white/90">Agri</span>
                    <span className="animate-gradient-x bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                      Serve
                    </span>
                  </motion.span>
                  <motion.div
                    className="h-0.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Glassmorphism Pill */}
            <nav className="hidden items-center md:flex">
              <div className="relative flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 shadow-inner backdrop-blur-md">
                {publicNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onMouseEnter={() => setHoveredLink(item.label)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      {hoveredLink === item.label && !isActive && (
                        <motion.span
                          layoutId="nav-hover"
                          className="absolute inset-0 rounded-full bg-white/10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={springConfig}
                        />
                      )}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-green-500/20"
                          transition={springConfig}
                        />
                      )}
                      <span
                        className={cn(
                          'relative z-10 flex items-center gap-2 transition-colors duration-200',
                          isActive ? 'text-emerald-300' : 'text-white/70 hover:text-white'
                        )}
                      >
                        <item.icon className="h-4 w-4 opacity-70" />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="h-10 w-32 animate-pulse rounded-full bg-white/5" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  {/* Role Switcher */}
                  <RoleSwitcher />

                  {/* Notification Icon */}
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                    className="group relative"
                  >
                    <NotificationBell />
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-emerald-500/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
                  </motion.div>

                  {/* Messages Icon */}
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                    className="relative"
                  >
                    <button className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10">
                      <MessageBadge iconOnly />
                    </button>
                  </motion.div>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10"
                      >
                        <div className="relative">
                          <Avatar src={profile?.profile_image} name={profile?.name} size="sm" />
                          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d1f15] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="hidden max-w-[100px] truncate text-sm font-medium text-white/90 sm:block">
                            {profile?.name || 'User'}
                          </span>
                          {roles && roles.length > 1 && (
                            <Badge
                              variant="secondary"
                              className="border border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300"
                            >
                              {roles.length} roles
                            </Badge>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-white/50 transition-colors group-hover:text-emerald-400" />
                      </motion.button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-80 rounded-2xl border border-white/10 bg-[#0d1f15]/95 p-2 shadow-2xl backdrop-blur-2xl"
                    >
                      {/* User Info Header */}
                      <DropdownMenuLabel className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">
                              {profile?.name || 'User'}
                            </span>
                            <span className="text-xs text-white/50">{profile?.phone}</span>
                          </div>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator className="my-2 bg-white/10" />

                      {/* Role Switching */}
                      {roles && roles.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/40">
                            {roles.length > 1 ? 'Switch Role' : 'Your Role'}
                          </div>
                          <div className="mx-1 my-1 space-y-1">
                            {roles.map((role) => {
                              const RoleIcon = getRoleIcon(role);
                              return (
                                <DropdownMenuItem
                                  key={role}
                                  onClick={() => switchRole(role)}
                                  disabled={roles.length === 1}
                                  className={cn(
                                    'mx-0 my-0 cursor-pointer rounded-xl transition-all duration-200',
                                    activeRole === role
                                      ? 'border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300'
                                      : 'text-white/70 hover:bg-white/5 hover:text-white',
                                    roles.length === 1 && 'cursor-not-allowed opacity-70'
                                  )}
                                >
                                  <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={cn(
                                          'rounded-lg p-1.5',
                                          activeRole === role
                                            ? 'bg-emerald-500/30 text-emerald-300'
                                            : 'bg-white/10 text-white/70'
                                        )}
                                      >
                                        <RoleIcon className="h-3.5 w-3.5" />
                                      </div>
                                      {getRoleDisplayName(role)}
                                    </div>
                                    {activeRole === role && (
                                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </div>
                          {roles.length > 1 && (
                            <DropdownMenuSeparator className="my-2 bg-white/10" />
                          )}
                        </>
                      )}

                      {/* Menu Items */}
                      <DropdownMenuItem
                        asChild
                        className="mx-1 my-1 cursor-pointer rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                      >
                        <Link href={getDashboardLink()} className="flex items-center gap-3 py-2.5">
                          <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="mx-1 my-1 cursor-pointer rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                      >
                        <Link href="/profile" className="flex items-center gap-3 py-2.5">
                          <User className="h-4 w-4 text-emerald-400" />
                          Profile
                        </Link>
                      </DropdownMenuItem>

                      {/* Manage Roles - Prominent */}
                      <DropdownMenuItem
                        asChild
                        className="mx-1 my-1 cursor-pointer rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
                      >
                        <Link href="/settings/roles" className="flex items-center gap-3 py-2.5">
                          <Tractor className="h-4 w-4 text-emerald-400" />
                          <div className="flex flex-1 items-center justify-between">
                            <span>Manage Roles</span>
                            {roles.length < 3 && (
                              <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                                NEW
                              </span>
                            )}
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        asChild
                        className="mx-1 my-1 cursor-pointer rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                      >
                        <Link href="/settings" className="flex items-center gap-3 py-2.5">
                          <Settings className="h-4 w-4 text-emerald-400" />
                          Settings
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="my-2 bg-white/10" />

                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="mx-1 my-1 cursor-pointer rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      className="hidden rounded-full border border-white/10 bg-white/5 px-6 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white sm:flex"
                      asChild
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  >
                    <Button
                      className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-emerald-500/40"
                      asChild
                    >
                      <Link href="/login" className="relative z-10 flex items-center gap-2">
                        Get Started
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 top-full h-screen bg-black/60 backdrop-blur-sm md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Menu Panel */}
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute left-0 right-0 top-full overflow-hidden border-b border-white/10 bg-[#0d1f15]/95 backdrop-blur-2xl md:hidden"
              >
                <nav className="container mx-auto flex flex-col gap-2 px-4 py-6">
                  {publicNav.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200',
                          pathname === item.href
                            ? 'border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}

                  {user && (
                    <>
                      <div className="my-2 h-px bg-white/10" />
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white"
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          Dashboard
                        </Link>
                      </motion.div>
                    </>
                  )}

                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 flex flex-col gap-3"
                    >
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                        asChild
                      >
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button
                        className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                        asChild
                      >
                        <Link href="/login">Get Started</Link>
                      </Button>
                    </motion.div>
                  )}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Scroll Progress */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500"
          style={{
            scaleX,
            backgroundSize: '200% 100%',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    </motion.header>
  );
}
