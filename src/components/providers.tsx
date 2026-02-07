'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { AuthProvider } from '@/lib/supabase/auth-context';
import { SmoothScroll } from '@/components/providers/SmoothScroll';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized, user } = useAuthStore();

  useEffect(() => {
    // Skip if already initialized (e.g. seeded by SSR data from DashboardClient)
    if (!isInitialized && !user) {
      initialize();
    }
  }, [initialize, isInitialized, user]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthInitializer>
          <SmoothScroll>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </SmoothScroll>
        </AuthInitializer>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
