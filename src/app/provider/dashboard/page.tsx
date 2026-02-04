'use client';

import { Header, Footer } from '@/components/layout';
import { EnhancedProviderDashboard } from '@/components/dashboard/EnhancedProviderDashboard';
import { BackButton } from '@/components/ui/back-button';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function ProviderDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header />

      <div className="flex">
        <main className="flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
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
