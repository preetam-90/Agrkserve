'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { LandingEntryLoader } from '@/components/root/LandingEntryLoader';

const Analytics = dynamic(() => import('@vercel/analytics/next').then((mod) => mod.Analytics), {
  ssr: false,
});

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false }
);

const Providers = dynamic(() => import('@/components/providers').then((mod) => mod.Providers), {
  ssr: false,
});

const NetworkStatus = dynamic(
  () => import('@/components/system-pages/NetworkStatus').then((mod) => mod.NetworkStatus),
  { ssr: false }
);

const AuthenticatedLayout = dynamic(
  () => import('@/components/layout').then((mod) => mod.AuthenticatedLayout),
  { ssr: false }
);

const EnhancedSmoothScroll = dynamic(
  () => import('@/components/EnhancedSmoothScroll').then((mod) => mod.EnhancedSmoothScroll),
  { ssr: false }
);

const GSAPProvider = dynamic(
  () => import('@/lib/animations/gsap-context').then((mod) => mod.GSAPProvider),
  { ssr: false }
);

const FPSMonitor = dynamic(
  () => import('@/lib/animations/performance-monitor').then((mod) => mod.FPSMonitor),
  { ssr: false }
);

export function RootAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingRoute = pathname === '/';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const showDevPerfOverlay =
    isDevelopment && process.env.NEXT_PUBLIC_SHOW_DEV_PERF_OVERLAY === 'true';
  const analyticsEnabled =
    process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

  if (isLandingRoute) {
    return (
      <>
        <LandingEntryLoader />
        {children}
        {analyticsEnabled && <Analytics />}
        {analyticsEnabled && <SpeedInsights />}
        {showDevPerfOverlay && <FPSMonitor show={true} />}
      </>
    );
  }

  return (
    <>
      <LandingEntryLoader />
      <NetworkStatus />
      <GSAPProvider>
        <EnhancedSmoothScroll>
          <Providers>
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
          </Providers>
          {analyticsEnabled && <Analytics />}
          {analyticsEnabled && <SpeedInsights />}
        </EnhancedSmoothScroll>
      </GSAPProvider>
      {showDevPerfOverlay && <FPSMonitor show={true} />}
    </>
  );
}
