import { RenterDashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function RenterDashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />
      <main className="px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        <RenterDashboardSkeleton />
      </main>
      <Footer />
    </div>
  );
}
