import type { UserRole } from '@/lib/types';

export type ContextualSidebarRole = 'renter' | 'provider';

const exactHiddenRoutes = new Set([
  '/',
  '/renter',
  '/provider',
  '/about',
  '/contact',
  '/help',
  '/terms',
  '/privacy',
  '/gallery',
]);

const hiddenRoutePrefixes = [
  '/admin',
  '/api',
  '/auth',
  '/login',
  '/forgot-password',
  '/onboarding',
  '/phone-setup',
  '/offline',
  '/error',
] as const;

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isContextualSidebarHiddenPath(pathname: string): boolean {
  if (exactHiddenRoutes.has(pathname)) {
    return true;
  }

  return hiddenRoutePrefixes.some((prefix) => matchesRoutePrefix(pathname, prefix));
}

export function resolveContextualSidebarRole(
  pathname: string,
  activeRole?: UserRole | null,
  roles: UserRole[] = []
): ContextualSidebarRole | null {
  if (matchesRoutePrefix(pathname, '/renter')) {
    return 'renter';
  }

  if (matchesRoutePrefix(pathname, '/provider')) {
    return 'provider';
  }

  if (activeRole === 'provider' || activeRole === 'labour') {
    return 'provider';
  }

  if (activeRole === 'renter') {
    return 'renter';
  }

  if (roles.includes('provider') || roles.includes('labour')) {
    return 'provider';
  }

  if (roles.includes('renter')) {
    return 'renter';
  }

  return null;
}

export function shouldShowContextualSidebar(pathname: string, isAuthenticated: boolean): boolean {
  if (!isAuthenticated) {
    return false;
  }

  return !isContextualSidebarHiddenPath(pathname);
}
