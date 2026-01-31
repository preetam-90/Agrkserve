import {
  LayoutDashboard,
  Search,
  CalendarDays,
  MessageSquare,
  Settings,
  Wallet,
  User,
  Tractor,
  Package,
  Users,
  BarChart3,
  CreditCard,
  AlertTriangle,
  Star,
  Wrench,
  Heart,
  History,
  Clock,
  MapPin,
  ToggleLeft,
  TrendingUp,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  requiredRoles?: UserRole[];
  excludedRoles?: UserRole[];
  badge?: string | number;
  children?: NavItem[];
}

// Universal navigation items (visible to all authenticated users)
const universalNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: AlertTriangle,
    badge: 'unreadCount',
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: MessageSquare,
    badge: 'unreadMessages',
  },
  {
    href: '/wallet',
    label: 'Wallet',
    icon: Wallet,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

// Equipment Provider navigation items
const equipmentProviderNavItems: NavItem[] = [
  {
    href: '/provider/equipment',
    label: 'My Equipment',
    icon: Package,
    requiredRoles: ['provider'],
  },
  {
    href: '/provider/equipment/new',
    label: 'Add Equipment',
    icon: Tractor,
    requiredRoles: ['provider'],
  },
  {
    href: '/provider/bookings',
    label: 'Booking Requests',
    icon: CalendarDays,
    requiredRoles: ['provider'],
  },
  {
    href: '/provider/earnings',
    label: 'Earnings Analytics',
    icon: TrendingUp,
    requiredRoles: ['provider'],
  },
  {
    href: '/provider/maintenance',
    label: 'Maintenance Logs',
    icon: Wrench,
    requiredRoles: ['provider'],
  },
  {
    href: '/provider/availability',
    label: 'Availability Calendar',
    icon: CalendarDays,
    requiredRoles: ['provider'],
  },
  {
    href: '/provider/reviews',
    label: 'Reviews',
    icon: Star,
    requiredRoles: ['provider'],
  },
];

// Labour Provider navigation items
const labourProviderNavItems: NavItem[] = [
  {
    href: '/provider/labour',
    label: 'Job Requests',
    icon: Users,
    requiredRoles: ['labour'],
  },
  {
    href: '/provider/labour/schedule',
    label: 'Work Schedule',
    icon: CalendarDays,
    requiredRoles: ['labour'],
  },
  {
    href: '/provider/labour/availability',
    label: 'Availability Toggle',
    icon: ToggleLeft,
    requiredRoles: ['labour'],
  },
  {
    href: '/provider/earnings',
    label: 'Earnings',
    icon: CreditCard,
    requiredRoles: ['labour'],
  },
  {
    href: '/provider/labour/reviews',
    label: 'Ratings',
    icon: Star,
    requiredRoles: ['labour'],
  },
];

// Renter navigation items
const renterNavItems: NavItem[] = [
  {
    href: '/equipment',
    label: 'Find Equipment',
    icon: Search,
    excludedRoles: ['admin'],
  },
  {
    href: '/renter/bookings',
    label: 'My Rentals',
    icon: CalendarDays,
    requiredRoles: ['renter'],
  },
  {
    href: '/renter/bookings/history',
    label: 'Booking History',
    icon: History,
    requiredRoles: ['renter'],
  },
  {
    href: '/renter/favorites',
    label: 'Saved Equipment',
    icon: Heart,
    requiredRoles: ['renter'],
  },
  {
    href: '/renter/orders',
    label: 'Active Orders',
    icon: Clock,
    requiredRoles: ['renter'],
  },
  {
    href: '/renter/payments',
    label: 'Payment History',
    icon: CreditCard,
    requiredRoles: ['renter'],
  },
  {
    href: '/renter/labour',
    label: 'Find Labour',
    icon: Users,
    excludedRoles: ['admin'],
  },
  {
    href: '/renter/labour/bookings',
    label: 'Labour Bookings',
    icon: CalendarDays,
    requiredRoles: ['renter'],
  },
  {
    href: '/renter/reviews',
    label: 'My Reviews',
    icon: Star,
    requiredRoles: ['renter'],
  },
];

// Admin navigation items
const adminNavItems: NavItem[] = [
  {
    href: '/admin/users',
    label: 'Users',
    icon: Users,
    requiredRoles: ['admin'],
  },
  {
    href: '/admin/equipment',
    label: 'Equipment',
    icon: Package,
    requiredRoles: ['admin'],
  },
  {
    href: '/admin/bookings',
    label: 'Bookings',
    icon: CalendarDays,
    requiredRoles: ['admin'],
  },
  {
    href: '/admin/disputes',
    label: 'Disputes',
    icon: AlertTriangle,
    requiredRoles: ['admin'],
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    requiredRoles: ['admin'],
  },
];

/**
 * Filter navigation items based on user roles
 */
export function filterNavItems(
  items: NavItem[],
  userRoles: UserRole[],
  activeRole?: UserRole | null
): NavItem[] {
  return items
    .filter((item) => {
      // Check if item requires specific roles
      if (item.requiredRoles && item.requiredRoles.length > 0) {
        // If activeRole is set, item must match active role
        if (activeRole) {
          return item.requiredRoles.includes(activeRole);
        }
        // Otherwise, user must have at least one of the required roles
        return item.requiredRoles.some((role) => userRoles.includes(role));
      }

      // Check if item is excluded for certain roles
      if (item.excludedRoles && item.excludedRoles.length > 0) {
        // If activeRole is set, check if it's excluded
        if (activeRole) {
          return !item.excludedRoles.includes(activeRole);
        }
        // Otherwise, exclude if user has any of the excluded roles
        return !item.excludedRoles.some((role) => userRoles.includes(role));
      }

      // Item is universal, show it
      return true;
    })
    .map((item) => {
      // Recursively filter children if they exist
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterNavItems(item.children, userRoles, activeRole),
        };
      }
      return item;
    })
    .filter((item) => {
      // Remove items with empty children arrays after filtering
      if (item.children && item.children.length === 0) {
        return false;
      }
      return true;
    });
}

/**
 * Get navigation items for sidebar based on user roles
 */
export function getSidebarNavItems(userRoles: UserRole[], activeRole?: UserRole | null): NavItem[] {
  const allItems = [
    ...universalNavItems,
    ...equipmentProviderNavItems,
    ...labourProviderNavItems,
    ...renterNavItems,
    ...adminNavItems,
  ];

  // Remove duplicates and filter
  const uniqueItems = Array.from(new Map(allItems.map((item) => [item.href, item])).values());

  return filterNavItems(uniqueItems, userRoles, activeRole);
}

/**
 * Get grouped navigation items for organized sidebar
 */
export function getGroupedNavItems(
  userRoles: UserRole[],
  activeRole?: UserRole | null
): { section: string; items: NavItem[] }[] {
  const navItems = getSidebarNavItems(userRoles, activeRole);

  const groups: { section: string; items: NavItem[] }[] = [
    {
      section: 'Overview',
      items: navItems.filter(
        (item) =>
          item.href === '/dashboard' || item.href === '/notifications' || item.href === '/messages'
      ),
    },
    {
      section: 'Equipment',
      items: navItems.filter(
        (item) =>
          item.href.includes('/equipment') ||
          item.href.includes('/provider/bookings') ||
          item.href.includes('/provider/maintenance') ||
          item.href.includes('/provider/availability') ||
          item.href.includes('/provider/earnings')
      ),
    },
    {
      section: 'Labour',
      items: navItems.filter((item) => item.href.includes('/labour')),
    },
    {
      section: 'Account',
      items: navItems.filter(
        (item) => item.href === '/wallet' || item.href === '/profile' || item.href === '/settings'
      ),
    },
  ];

  return groups.filter((group) => group.items.length > 0);
}

/**
 * Check if user has access to a specific route
 */
export function hasAccessToRoute(
  href: string,
  userRoles: UserRole[],
  activeRole?: UserRole | null
): boolean {
  const navItems = getSidebarNavItems(userRoles, activeRole);
  return navItems.some((item) => item.href === href);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    renter: 'Farmer / Renter',
    provider: 'Equipment Provider',
    labour: 'Labour Provider',
    admin: 'Admin',
  };
  return roleNames[role] || role;
}

/**
 * Get role icon
 */
export function getRoleIcon(role: UserRole): any {
  const roleIcons: Record<UserRole, any> = {
    renter: User,
    provider: Tractor,
    labour: Users,
    admin: LayoutDashboard,
  };
  return roleIcons[role];
}
