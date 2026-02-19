'use client';

import { useState, useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import Link from 'next/link';
import {
  Menu,
  X,
  ArrowRight,
  User,
  Zap,
  Command,
  Tractor,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function FuturisticHeader() {
  const { user, profile, isLoading, signOut } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Mouse tracking for glow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const glowX = useTransform(mouseX, [0, 1], [0, 100]);
  const glowY = useTransform(mouseY, [0, 1], [0, 100]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    }
  };

  const navLinks = [
    { href: '/equipment', label: 'Equipment', icon: Zap },
    { href: '/labour', label: 'Labor', icon: User },
    { href: '/about', label: 'About', icon: Command },
    { href: '/contact', label: 'Contact', icon: ArrowRight },
  ];

  return (
    <>
      <motion.header
        ref={headerRef}
        onMouseMove={handleMouseMove}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 right-0 top-0 z-50 w-full max-w-full px-4 py-4 sm:px-6 lg:px-8"
      >
        {/* Main Container - Fresh Green Styling */}
        <motion.div
          className={`relative mx-auto max-w-7xl overflow-hidden transition-all duration-500 ease-out
            ${isScrolled ? 'rounded-2xl backdrop-blur-2xl' : 'bg-transparent'}`}
          style={{
            backgroundColor: isScrolled ? 'rgba(10, 15, 12, 0.9)' : 'transparent',
            border: isScrolled ? '1px solid rgba(34, 197, 94, 0.2)' : 'none',
            boxShadow: isScrolled
              ? '0 4px 30px rgba(34, 197, 94, 0.15), inset 0 1px 0 0 rgba(34, 197, 94, 0.1)'
              : 'none',
          }}
        >
          {/* Subtle Border Glow - Fresh Green */}
          {isScrolled && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.15), transparent)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['200% 0%', '-200% 0%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}

          {/* Cursor Glow Effect - Fresh Green */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: useTransform(
                [glowX, glowY],
                ([x, y]) =>
                  `radial-gradient(400px circle at ${x}% ${y}%, rgba(34, 197, 94, 0.1), transparent 50%)`
              ),
            }}
          />

          <nav className="relative z-10 flex h-16 items-center justify-between px-6">
            {/* Logo Section */}
            <Link href="/" className="group flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                {/* Warm Glow */}
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-400/40 via-yellow-400/40 to-amber-400/40 opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-90" />

                {/* Logo Container */}
                <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-900 via-slate-900 to-amber-950 shadow-2xl">
                  {/* Golden Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-yellow-500/20" />

                  {/* Wheat Stalks - Left */}
                  <svg
                    className="absolute bottom-2 left-1 h-8 w-4 text-amber-400/60"
                    viewBox="0 0 24 48"
                    fill="none"
                  >
                    <motion.path
                      d="M12 48V24M12 24C12 24 8 20 8 16M12 24C12 24 16 20 16 16M12 32C12 32 6 28 6 22M12 32C12 32 18 28 18 22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                    />
                    <motion.circle
                      cx="8"
                      cy="14"
                      r="2"
                      fill="currentColor"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                    />
                    <motion.circle
                      cx="16"
                      cy="14"
                      r="2"
                      fill="currentColor"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                    />
                  </svg>

                  {/* Wheat Stalks - Right */}
                  <svg
                    className="absolute bottom-2 right-1 h-8 w-4 text-amber-400/60"
                    viewBox="0 0 24 48"
                    fill="none"
                  >
                    <motion.path
                      d="M12 48V24M12 24C12 24 8 20 8 16M12 24C12 24 16 20 16 16M12 32C12 32 6 28 6 22M12 32C12 32 18 28 18 22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.2, ease: 'easeInOut' }}
                    />
                    <motion.circle
                      cx="8"
                      cy="14"
                      r="2"
                      fill="currentColor"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 }}
                    />
                    <motion.circle
                      cx="16"
                      cy="14"
                      r="2"
                      fill="currentColor"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 }}
                    />
                  </svg>

                  {/* Tractor Icon - Center */}
                  <motion.div
                    className="relative z-10"
                    animate={{
                      y: [0, -1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Tractor className="h-7 w-7 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                  </motion.div>

                  {/* Decorative Grain Elements */}
                  <motion.div
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute left-3 top-3 h-1 w-1 rounded-full bg-yellow-400"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                  />

                  {/* Corner Wheat Accents */}
                  <div className="absolute left-0 top-0 h-4 w-4 rounded-tl-xl border-l-2 border-t-2 border-amber-400/60" />
                  <div className="absolute right-0 top-0 h-4 w-4 rounded-tr-xl border-r-2 border-t-2 border-amber-400/60" />
                </div>
              </motion.div>

              {/* Brand Text - Fresh Green Typography */}
              <div className="flex flex-col">
                <motion.span
                  className="text-2xl font-bold tracking-[0.05em]"
                  whileHover={{ scale: 1.02 }}
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  <span style={{ color: '#ffffff' }}>Agri</span>
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #14b8a6 100%)',
                    }}
                  >
                    Serve
                  </span>
                </motion.span>
                <motion.div
                  className="mt-1 h-[2px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #22c55e 0%, #34d399 50%, #22c55e 100%)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>
            </Link>

            {/* Desktop Navigation - Fresh Green */}
            <div
              className="hidden items-center gap-1 rounded-full px-2 py-1.5 lg:flex"
              style={{
                backgroundColor: 'rgba(10, 15, 12, 0.6)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setActiveLink(link.label)}
                    onMouseLeave={() => setActiveLink(null)}
                    className="group relative px-5 py-2.5 text-sm font-medium transition-colors duration-200"
                    style={{
                      fontFamily: '"Inter", system-ui, sans-serif',
                      fontWeight: 500,
                      color: activeLink === link.label ? '#ffffff' : '#86efac',
                    }}
                  >
                    {/* Active Background - Fresh Green */}
                    <AnimatePresence>
                      {activeLink === link.label && (
                        <motion.span
                          layoutId="nav-glow"
                          className="absolute inset-0 rounded-full border"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(20, 184, 166, 0.1) 100%)',
                            borderColor: 'rgba(34, 197, 94, 0.3)',
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                    </AnimatePresence>

                    <span className="relative z-10 flex items-center gap-2">
                      <Icon
                        className="h-4 w-4 transition-opacity"
                        style={{
                          color: activeLink === link.label ? '#22c55e' : '#86efac',
                          opacity: activeLink === link.label ? 1 : 0.7,
                        }}
                      />
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="hidden h-12 w-36 animate-pulse rounded-xl bg-white/5 sm:block" />
              ) : user && profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="hidden items-center gap-3 rounded-xl border border-emerald-500/20 bg-white/5 px-4 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/10 sm:flex"
                    >
                      <Avatar src={profile.profile_image} name={profile.name} size="sm" />
                      <span className="text-sm font-medium text-white/90">
                        {profile.name || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-white/50" />
                    </motion.button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-64 rounded-2xl border border-white/10 bg-[#0a0f0c]/95 p-2 shadow-2xl backdrop-blur-2xl"
                  >
                    <DropdownMenuLabel className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">
                            {profile.name || 'User'}
                          </span>
                          <span className="text-xs text-white/50">{profile.phone}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="my-2 bg-white/10" />

                    <DropdownMenuItem
                      asChild
                      className="mx-1 my-1 cursor-pointer rounded-xl text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      <Link href="/dashboard" className="flex items-center gap-3 py-2.5">
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
              ) : (
                <Link href="/login" className="hidden sm:block">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-xl px-7 py-3 text-sm font-semibold tracking-wide transition-all duration-300"
                    style={{
                      fontFamily: '"Inter", system-ui, sans-serif',
                      background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />

                    <span className="relative z-10 flex items-center gap-2">
                      <span style={{ letterSpacing: '0.02em' }}>Sign In</span>
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </span>
                  </motion.button>
                </Link>
              )}

              {/* Mobile Menu Button - Fresh Green */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-xl border p-3 transition-colors lg:hidden"
                style={{
                  backgroundColor: 'rgba(10, 15, 12, 0.6)',
                  borderColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#86efac',
                }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </nav>

          {/* Scroll Progress - Fresh Green */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
            style={{
              scaleX,
              background: 'linear-gradient(90deg, #22c55e 0%, #34d399 50%, #22c55e 100%)',
            }}
          />
        </motion.div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-xl lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[320px] flex-col border-l border-emerald-500/20 bg-[#0A0F0C] p-8 lg:hidden"
            >
              {/* Header */}
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-wider text-white">
                    <span className="text-emerald-400">MENU</span>
                  </h2>
                  <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-emerald-400 to-teal-500" />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl border border-white/10 bg-slate-900 p-3 text-slate-400 transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-1 flex-col gap-2">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group flex items-center gap-4 rounded-xl border border-transparent px-4 py-4 text-slate-400 transition-all duration-200 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-white"
                      >
                        <Icon className="h-5 w-5 text-emerald-400 transition-transform group-hover:scale-110" />
                        <span className="text-lg font-medium">{link.label}</span>
                        <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-white/10 pt-6">
                {user && profile ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
                      <Avatar src={profile.profile_image} name={profile.name} size="sm" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{profile.name}</span>
                        <span className="text-xs text-white/50">{profile.phone}</span>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-6 font-semibold text-white hover:from-emerald-400 hover:to-teal-500">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
