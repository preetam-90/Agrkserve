'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit,
  Heart,
  IndianRupee,
  LayoutDashboard,
  Leaf,
  Menu,
  MessageSquare,
  PackageSearch,
  Settings,
  UserRound,
  Plus,
  Star,
  Tractor,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContextualSidebarRole } from '@/lib/utils/contextual-sidebar';

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  activeMatch?: string[];
  exact?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface ContextualSidebarProps {
  pathname: string;
  role: ContextualSidebarRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const renterSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/renter/dashboard',
        icon: LayoutDashboard,
        activeMatch: ['/dashboard'],
      },
      { label: 'My Bookings', href: '/renter/bookings', icon: CalendarDays },
      { label: 'Labour Bookings', href: '/labour/bookings', icon: Users },
      { label: 'Bookings Hub', href: '/bookings', icon: CalendarDays },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { label: 'Browse Equipment', href: '/equipment', icon: PackageSearch },
      { label: 'Browse Labour', href: '/renter/labour', icon: Leaf, activeMatch: ['/labour'] },
      { label: 'Favorites', href: '/renter/favorites', icon: Heart },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        label: 'Messages',
        href: '/messages',
        icon: MessageSquare,
        activeMatch: ['/renter/messages', '/provider/messages'],
      },
      { label: 'Notifications', href: '/notifications', icon: Bell, exact: true },
      {
        label: 'Notification Preferences',
        href: '/notifications/preferences',
        icon: Bell,
      },
      { label: 'My Reviews', href: '/renter/reviews', icon: Star },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: '/profile', icon: UserRound },
      { label: 'Settings', href: '/settings', icon: Settings, exact: true },
      { label: 'Role Management', href: '/settings/roles', icon: UserRound },
      { label: 'Notification Settings', href: '/settings/notifications', icon: Bell },
    ],
  },
];

const providerSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Provider Dashboard',
        href: '/provider/dashboard',
        icon: LayoutDashboard,
        activeMatch: ['/dashboard'],
      },
      { label: 'Earnings', href: '/earnings', icon: IndianRupee },
      { label: 'Bookings Hub', href: '/bookings', icon: CalendarDays },
    ],
  },
  {
    title: 'Listings',
    items: [
      { label: 'My Equipment', href: '/provider/equipment', icon: Tractor },
      { label: 'Add Equipment', href: '/provider/equipment/new', icon: Plus },
      { label: 'Labour Services', href: '/provider/labour', icon: Users },
      { label: 'Create Labour Service', href: '/provider/labour/create', icon: Plus },
      { label: 'Edit Labour Service', href: '/provider/labour/edit', icon: Edit },
      { label: 'Provider Reviews', href: '/provider/reviews', icon: Star },
    ],
  },
  {
    title: 'Operational',
    items: [
      {
        label: 'Incoming Bookings',
        href: '/provider/bookings',
        icon: CalendarDays,
        activeMatch: ['/bookings'],
      },
      {
        label: 'Messages',
        href: '/messages',
        icon: MessageSquare,
        activeMatch: ['/provider/messages', '/renter/messages'],
      },
      { label: 'Notifications', href: '/notifications', icon: Bell, exact: true },
      {
        label: 'Notification Preferences',
        href: '/notifications/preferences',
        icon: Bell,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: '/profile', icon: UserRound },
      { label: 'Settings', href: '/settings', icon: Settings, exact: true },
      { label: 'Role Management', href: '/settings/roles', icon: UserRound },
      { label: 'Notification Settings', href: '/settings/notifications', icon: Bell },
    ],
  },
];

function isActivePath(pathname: string, href: string, activeMatch: string[] = [], exact = false) {
  const routesToMatch = [href, ...activeMatch];

  if (exact) {
    return routesToMatch.some((route) => pathname === route);
  }

  return routesToMatch.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function ContextualSidebar({
  pathname,
  role,
  isCollapsed,
  onToggleCollapse,
}: ContextualSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sections = role === 'renter' ? renterSections : providerSections;
  const roleLabel = role === 'renter' ? 'Renter' : 'Provider';

  const onToggleMobile = () => setIsMobileOpen((prev) => !prev);
  const onCloseMobile = () => setIsMobileOpen(false);
  
  // Determine if sidebar should appear expanded due to hover
  const isActuallyExpanded = isHovered || !isCollapsed;
  
  // Effect to handle hover state affecting main content area
  useEffect(() => {
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;
    
    if (isHovered && isCollapsed) {
      // When sidebar is hovered and currently collapsed, expand the margin
      mainContent.classList.add('hover-expanded');
    } else {
      // Otherwise, remove the hover-expanded class to use the default margin
      mainContent.classList.remove('hover-expanded');
    }
    
    // Cleanup function
    return () => {
      if (mainContent) {
        mainContent.classList.remove('hover-expanded');
      }
    };
  }, [isHovered, isCollapsed]);

  return (
    <>
      <button
        type="button"
        onClick={onToggleMobile}
        className="fixed left-4 top-20 z-[70] inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#365844] bg-[#0c1a13] text-emerald-100 shadow-lg transition-colors hover:bg-[#12241b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:hidden"
        aria-label={isMobileOpen ? 'Close sidebar navigation' : 'Open sidebar navigation'}
        aria-expanded={isMobileOpen}
        aria-controls="contextual-sidebar"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <button
        type="button"
        onClick={onCloseMobile}
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden',
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-label="Close sidebar overlay"
      />

      <aside
        id="contextual-sidebar"
        className={cn(
          'fixed bottom-0 left-0 top-0 z-[60] border-r border-[#284436] bg-gradient-to-b from-[#07110c]/95 via-[#0b1812]/95 to-[#0e1f17]/95 text-slate-100 backdrop-blur lg:z-40',
          isActuallyExpanded ? 'contextual-sidebar-expanded' : 'contextual-sidebar-collapsed',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label={`${roleLabel} contextual sidebar`}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-[#284436] px-3">
            <Link
              href={role === 'renter' ? '/renter/dashboard' : '/provider/dashboard'}
              className={cn(
                'flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-emerald-50 transition-colors hover:bg-[#163427]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                isCollapsed && 'lg:justify-center lg:px-0'
              )}
              onClick={onCloseMobile}
            >
              <span className="rounded-md bg-emerald-500/15 p-1.5 text-emerald-300">
                {role === 'renter' ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <Tractor className="h-4 w-4" />
                )}
              </span>
              <span
                className={cn(
                  'truncate text-sm font-semibold transition-opacity duration-200',
                  !isActuallyExpanded && 'lg:w-0 lg:overflow-hidden lg:opacity-0'
                )}
                aria-hidden={!isActuallyExpanded}
              >
                {roleLabel} Workspace
              </span>
            </Link>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="ml-auto hidden h-8 w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-[#163427]/70 hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:inline-flex"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-controls="contextual-sidebar"
              aria-expanded={!isCollapsed}
            >
              {!isActuallyExpanded ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav
            className="flex-1 space-y-5 overflow-y-auto px-2 py-4"
            aria-label={`${roleLabel} primary navigation`}
          >
            {sections.map((section) => (
              <section key={section.title} aria-labelledby={`${role}-section-${section.title}`}>
                <h2
                  id={`${role}-section-${section.title}`}
                  className={cn(
                    'px-3 text-xs font-semibold uppercase tracking-wide text-emerald-300/70 transition-opacity duration-200',
                    !isActuallyExpanded && 'lg:pointer-events-none lg:opacity-0'
                  )}
                >
                  {section.title}
                </h2>

                <ul className="mt-2 space-y-1" role="list">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(
                      pathname,
                      item.href,
                      item.activeMatch,
                      item.exact
                    );

                    return (
                      <li key={item.href} className="group relative">
                        <Link
                          href={item.href}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={item.label}
                          className={cn(
                            'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                            !isActuallyExpanded ? 'lg:justify-center' : 'gap-3',
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-100'
                              : 'text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-100'
                          )}
                          onClick={onCloseMobile}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span
                            className={cn(
                              'truncate transition-opacity duration-200',
                              !isActuallyExpanded && 'lg:w-0 lg:overflow-hidden lg:opacity-0'
                            )}
                            aria-hidden={!isActuallyExpanded}
                          >
                            {item.label}
                          </span>
                        </Link>

                        {!isActuallyExpanded && (
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-emerald-500/30 bg-[#08150f] px-2 py-1 text-xs text-emerald-100 opacity-0 shadow-md transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
                          >
                            {item.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
