'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Spinner } from '@/components/ui';

export default function BookingsRedirect() {
  const router = useRouter();
  const { user, activeRole, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Redirect based on active role
    switch (activeRole) {
      case 'provider':
        router.push('/provider/bookings');
        break;
      case 'labour':
        router.push('/labour/bookings');
        break;
      case 'admin':
        router.push('/admin/bookings');
        break;
      default:
        router.push('/renter/bookings');
    }
  }, [user, activeRole, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
