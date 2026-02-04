'use client';

import { Header, Footer, Sidebar } from '@/components/layout';
import { EnhancedProviderDashboard } from '@/components/dashboard/EnhancedProviderDashboard';
import { BackButton } from '@/components/ui/back-button';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function ProviderDashboard() {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />

      <div className="flex">
        <Sidebar role="provider" />

        <main
          className={cn(
            "flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8",
            sidebarOpen && "lg:ml-64"
          )}
        >
          <div className="mb-4">
            <BackButton variant="minimal" />
          </div>
          <EnhancedProviderDashboard />
        </main>
      </div>

      <Footer />
    </div>
  );
}
