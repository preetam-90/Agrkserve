import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BackButton } from '@/components/ui/back-button';
import { EnhancedProviderDashboard } from '@/components/dashboard/EnhancedProviderDashboard';
import { InitialData } from '@/lib/types';
import { ProviderDashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Provider Dashboard - AgriServe',
  description: 'Manage your farm equipment rentals, bookings, and earnings.',
};

// Force dynamic rendering since this page uses cookies for authentication
export const dynamic = 'force-dynamic';

async function getProviderDashboardData() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    const userId = session.user.id;

    // Fetch all provider data in parallel
    const [equipmentResult, bookingsResult, labourBookingsResult] = await Promise.all([
      supabase
        .from('equipment')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('bookings')
        .select('*, equipment:equipment!inner(id, name, images, category, price_per_day, owner_id)')
        .eq('equipment.owner_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('labour_bookings')
        .select('*')
        .eq('employer_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    return {
      equipment: equipmentResult.data || [],
      bookings: bookingsResult.data || [],
      labourBookings: labourBookingsResult.data || [],
    };
  } catch (error) {
    console.error('Error fetching provider dashboard data:', error);
    return null;
  }
}

async function ProviderDashboardResolver({
  dataPromise,
}: {
  dataPromise: Promise<InitialData | null | undefined>;
}) {
  const data = await dataPromise;
  return <EnhancedProviderDashboard initialData={data} />;
}

export default function ProviderDashboardPage() {
  const dataPromise = getProviderDashboardData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />
      <main className="px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        <BackButton />
        <Suspense fallback={<ProviderDashboardSkeleton />}>
          <ProviderDashboardResolver dataPromise={dataPromise} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
