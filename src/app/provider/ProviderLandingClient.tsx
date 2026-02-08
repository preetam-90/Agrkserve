'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui';

export default function ProviderRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );
}
