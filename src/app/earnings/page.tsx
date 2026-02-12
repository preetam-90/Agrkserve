'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EarningsDashboard from '@/components/earnings/EarningsDashboard';
import { useAuthStore } from '@/lib/store';

export default function EarningsPage() {
  const router = useRouter();
  const { activeRole, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !activeRole) {
      router.push('/dashboard');
    }
  }, [activeRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050b07]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!activeRole) {
    return null;
  }

  if (activeRole !== 'provider' && activeRole !== 'labour') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050b07]">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white">Access Denied</h1>
          <p className="mt-2 text-gray-400">
            Earnings are only available for providers and labour.
          </p>
        </div>
      </div>
    );
  }

  return <EarningsDashboard role={activeRole} />;
}
