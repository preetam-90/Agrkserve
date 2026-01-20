'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell, MessageSquare, ChevronDown, LogOut, User, Settings, Tractor } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { cn, formatStatus } from '@/lib/utils';

const publicNav = [
  { href: '/', label: 'Home' },
  { href: '/equipment', label: 'Equipment' },
  { href: '/labour', label: 'Labour' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, roles, activeRole, switchRole, signOut, isLoading } = useAuthStore();

  // Close mobile menu on route change
  useEffect(() => {
    // Close the menu when the pathname changes
    // This is intentionally setting state based on external navigation
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  const getDashboardLink = () => {
    if (!activeRole) return '/dashboard';
    switch (activeRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'provider':
        return '/provider/dashboard';
      default:
        return '/renter/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600">
              <Tractor className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">AgriServe</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-green-600',
                  pathname === item.href ? 'text-green-600' : 'text-gray-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-10 w-24 animate-pulse bg-gray-200 rounded-lg" />
            ) : user ? (
              <>
                {/* Notifications */}
                <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="h-5 w-5" />
                  {/* TODO: Add notification count badge */}
                </Link>

                {/* Messages */}
                <Link href="/messages" className="relative p-2 text-gray-600 hover:text-gray-900">
                  <MessageSquare className="h-5 w-5" />
                  {/* TODO: Add message count badge */}
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <Avatar src={profile?.profile_image} name={profile?.name} size="sm" />
                      <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {profile?.name || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{profile?.name || 'User'}</span>
                        <span className="text-xs text-gray-500">{profile?.phone}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Role Switcher */}
                    {roles.length > 1 && (
                      <>
                        <DropdownMenuLabel className="text-xs text-gray-500">
                          Switch Role
                        </DropdownMenuLabel>
                        {roles.map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => switchRole(role)}
                            className={cn(
                              activeRole === role && 'bg-green-50 text-green-700'
                            )}
                          >
                            {formatStatus(role)}
                            {activeRole === role && (
                              <Badge variant="default" className="ml-auto text-xs">
                                Active
                              </Badge>
                            )}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-[#5C5C5C] hover:text-[#1B5E20] hover:bg-[#1B5E20]/5" asChild>
                  <Link href="/login">साइन इन</Link>
                </Button>
                <Button className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white" asChild>
                  <Link href="/login">शुरू करें</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-[#5C5C5C] hover:text-[#1B5E20]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-[#FAFAF5]">
            <nav className="flex flex-col gap-2">
              {publicNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-[#1B5E20]/10 text-[#1B5E20]'
                      : 'text-[#5C5C5C] hover:bg-[#1B5E20]/5'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="px-4 py-3 text-sm font-medium text-[#5C5C5C] hover:bg-[#1B5E20]/5 rounded-lg"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/bookings"
                    className="px-4 py-3 text-sm font-medium text-[#5C5C5C] hover:bg-[#1B5E20]/5 rounded-lg"
                  >
                    My Bookings
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
