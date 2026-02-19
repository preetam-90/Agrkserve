'use client';

import { useEffect, useRef, useLayoutEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { BackButton } from '@/components/ui/back-button';
import type { ServerDashboardData } from '@/app/dashboard/actions';
import type { User } from '@supabase/supabase-js';
import type { UserProfile, UserRole } from '@/lib/types';

// Code splitting: Load dashboard components dynamically
const ProviderDashboardView = lazy(() =>
  import('@/components/dashboard/ProviderDashboardView').then((mod) => ({
    default: mod.ProviderDashboardView,
  }))
);
const EnhancedRenterDashboard = lazy(() =>
  import('@/components/dashboard/EnhancedRenterDashboard').then((mod) => ({
    default: mod.EnhancedRenterDashboard,
  }))
);
const LabourDashboardView = lazy(() =>
  import('@/components/dashboard/LabourDashboardView').then((mod) => ({
    default: mod.LabourDashboardView,
  }))
);

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
          user: { id: serverData.user.id, email: serverData.user.email } as User,
          profile: serverData.profile as UserProfile | null,
          roles: serverData.roles as UserRole[],
          activeRole: serverData.activeRole as UserRole | null,
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
  }, []);  

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
      <Suspense fallback={<div className="p-8 text-center">Loading dashboard...</div>}>
        {role === 'provider' ? (
          <ProviderDashboardView
            initialData={
              serverData
                ? {
                    equipment: serverData.equipment,
                    bookings: serverData.bookings,
                    labourBookings: serverData.labourBookings,
                  }
                : undefined
            }
          />
        ) : role === 'labour' ? (
          <LabourDashboardView
            initialData={
              serverData
                ? {
                    equipment: serverData.equipment,
                    bookings: serverData.bookings,
                    labourBookings: serverData.labourBookings,
                  }
                : undefined
            }
          />
        ) : (
          <EnhancedRenterDashboard
            initialData={
              serverData
                ? {
                    equipment: serverData.equipment,
                    bookings: serverData.bookings,
                    labourBookings: serverData.labourBookings,
                  }
                : undefined
            }
          />
        )}
      </Suspense>
    </>
  );
}
