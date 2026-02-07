import { Header, Footer } from '@/components/layout';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';

/**
 * Next.js loading.tsx — shown instantly on navigation to /dashboard
 * while the server component (page.tsx) streams data.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />
      <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        <DashboardSkeleton />
      </main>
      <Footer />
    </div>
  );
}
