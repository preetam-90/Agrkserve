'use client';

import { useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ProviderDashboardView } from '@/components/dashboard/ProviderDashboardView';
import { EnhancedRenterDashboard } from '@/components/dashboard/EnhancedRenterDashboard';
import { LabourDashboardView } from '@/components/dashboard/LabourDashboardView';
import { BackButton } from '@/components/ui/back-button';
import type { ServerDashboardData } from '@/app/dashboard/actions';

interface DashboardClientProps {
  serverData: ServerDashboardData | null;
}

// Seed Zustand store in useLayoutEffect so it runs before AuthInitializer's useEffect
// but NOT during render (avoids "Cannot update component while rendering" error)
function useSeedAuthStore(serverData: ServerDashboardData | null) {
  const seeded = useRef(false);
  useLayoutEffect(() => {
    if (!seeded.current && serverData?.user) {
      const store = useAuthStore.getState();
      if (!store.isInitialized || !store.user) {
        useAuthStore.setState({
          user: { id: serverData.user.id, email: serverData.user.email } as any,
          profile: serverData.profile as any,
          roles: serverData.roles as any[],
          activeRole: serverData.activeRole as any,
          isLoading: false,
          isInitialized: true,
        });
      }
      seeded.current = true;
    }
  }, [serverData]);
}

export default function DashboardClient({ serverData }: DashboardClientProps) {
  const router = useRouter();
  const {
    initialize,
    isInitialized,
    isLoading: authLoading,
    activeRole: storeRole,
  } = useAuthStore();

  // Seed store in layoutEffect (fires before regular useEffects)
  useSeedAuthStore(serverData);

  useEffect(() => {
    if (!serverData?.user) {
      // No server session – kick off client-side init as fallback
      if (!isInitialized && !authLoading) {
        initialize();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect logic
  useEffect(() => {
    if (!serverData?.user) {
      router.push('/login');
      return;
    }
    if (storeRole === 'admin' || serverData?.activeRole === 'admin') {
      router.push('/admin');
      return;
    }
  }, [serverData, router, storeRole]);

  // Use Zustand store role (updated by role switcher) over server-determined role
  const role = storeRole || serverData?.activeRole || 'renter';

  return (
    <>
      <div className="mb-4">
        <BackButton variant="minimal" />
      </div>
      {role === 'provider' ? (
        <ProviderDashboardView initialData={serverData} />
      ) : role === 'labour' ? (
        <LabourDashboardView initialData={serverData} />
      ) : (
        <EnhancedRenterDashboard initialData={serverData} />
      )}
    </>
  );
}
