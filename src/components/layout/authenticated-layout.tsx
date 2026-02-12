'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore, useAuthStore } from '@/lib/store';
import { ContextualSidebar } from '@/components/sidebar/contextual-sidebar';
import { AppNavbar } from './app-navbar';
import { shouldShowGlobalAppNavbar } from '@/lib/utils/app-navbar';
import {
  resolveContextualSidebarRole,
  shouldShowContextualSidebar,
} from '@/lib/utils/contextual-sidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const { user, activeRole, roles } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  const role = resolveContextualSidebarRole(pathname, activeRole, roles);
  const shouldShowSidebar = shouldShowContextualSidebar(pathname, Boolean(user)) && role !== null;
  const shouldShowNavbar = shouldShowGlobalAppNavbar(pathname);

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
      {shouldShowSidebar && role && (
        <ContextualSidebar
          key={pathname}
          pathname={pathname}
          role={role}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      <div
        className={cn(
          'flex-1 w-full max-w-full overflow-x-hidden transition-[margin-left] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          shouldShowSidebar && (sidebarCollapsed ? 'lg:ml-[64px]' : 'lg:ml-[240px]')
        )}
        id="main-content-area"
      >
        {shouldShowNavbar && <AppNavbar />}
        {children}
      </div>
    </div>
  );
}
