import { Metadata } from 'next';
import { Suspense } from 'react';
import { getDashboardData } from './actions';
import dynamic from 'next/dynamic';

const DashboardClient = dynamic(() => import('./DashboardClient'));

export const metadata: Metadata = {
  title: 'Dashboard - AgriServe',
  description: 'View your activity, bookings, and performance overview.',
};

export const revalidate = 60; // Enable ISR, revalidate every 60 seconds

import { Header, Footer } from '@/components/layout';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';

/**
 * Server Component — streams dashboard data.
 *
 * The data promise is passed to <DashboardResolver> which suspends,
 * allowing <Suspense> to show the skeleton until data resolves.
 * This means the HTML with skeleton is sent instantly to the browser.
 */
export default function DashboardPage() {
  // Start fetching but do NOT await — let Suspense handle the wait
  const dataPromise = getDashboardData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />
      <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardResolver dataPromise={dataPromise} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

/**
 * Async Server Component that awaits the data promise.
 * React will suspend this component, showing the skeleton fallback above.
 */
async function DashboardResolver({
  dataPromise,
}: {
  dataPromise: ReturnType<typeof getDashboardData>;
}) {
  const serverData = await dataPromise;
  return <DashboardClient serverData={serverData} />;
}
