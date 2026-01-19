'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Spinner } from '@/components/ui';

export default function DashboardRedirect() {
  const router = useRouter();
  const { profile, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!profile) {
      router.push('/login');
      return;
    }

    // Redirect based on role
    const activeRole = profile.roles?.[0];
    
    switch (activeRole) {
      case 'provider':
        router.push('/provider/dashboard');
        break;
      case 'labour':
        router.push('/labour/dashboard');
        break;
      case 'admin':
        router.push('/admin/dashboard');
        break;
      default:
        router.push('/renter/dashboard');
    }
  }, [profile, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
