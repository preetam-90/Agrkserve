'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized, user } = useAuthStore();

  useEffect(() => {
    if (!isInitialized && !user) {
      initialize();
    }
  }, [initialize, isInitialized, user]);

  return <>{children}</>;
}
