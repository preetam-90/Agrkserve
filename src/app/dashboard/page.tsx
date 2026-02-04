'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Spinner } from '@/components/ui';
import { ProviderDashboardView } from '@/components/dashboard/ProviderDashboardView';
import { EnhancedRenterDashboard } from '@/components/dashboard/EnhancedRenterDashboard';
import { LabourDashboardView } from '@/components/dashboard/LabourDashboardView';
import { Header, Footer } from '@/components/layout';
import { BackButton } from '@/components/ui/back-button';

export default function DashboardPage() {
  const router = useRouter();
  const { profile, roles, activeRole, isLoading, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initialize();
    }
  }, [isInitialized, isLoading, initialize]);

  useEffect(() => {
    if (isLoading) return;

    if (!profile) {
      router.push('/login');
      return;
    }

    // Admin users should go to /admin
    if (activeRole === 'admin') {
      router.push('/admin');
      return;
    }

    // Redirect to appropriate dashboard based on active role
    if (activeRole === 'provider') {
      router.push('/provider/dashboard');
      return;
    }
  }, [profile, roles, activeRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 font-medium text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine which role to use (activeRole or first role)
  const role = activeRole || roles?.[0];

  // Render appropriate sidebar based on role
  const sidebarRole = role === 'provider' ? 'provider' : role === 'labour' ? 'renter' : 'renter';

  // Render dashboard view based on role
  const renderDashboardView = () => {
    switch (role) {
      case 'provider':
        return <ProviderDashboardView />;
      case 'labour':
        return <LabourDashboardView />;
      case 'renter':
      default:
        return <EnhancedRenterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />

      <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        <div className="mb-4">
          <BackButton variant="minimal" />
        </div>
        {renderDashboardView()}
      </main>

      <Footer />
    </div>
  );
}
