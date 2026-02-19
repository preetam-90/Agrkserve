'use client';

import { useQuery } from '@tanstack/react-query';
import { labourKeys } from './query-keys';
import { labourService } from '@/lib/services';

/**
 * Fetch labour profile for a user
 */
export function useLabourProfile(userId: string | undefined) {
  return useQuery({
    queryKey: labourKeys.profile(userId!),
    queryFn: () => labourService.getByUserId(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch labour bookings for a user
 */
export function useLabourBookings(userId: string | undefined, role: 'labour' | 'employer') {
  return useQuery({
    queryKey: labourKeys.bookings(userId!, role),
    queryFn: async () => {
      const result = await labourService.getBookings(userId!, role);
      return result;
    },
    enabled: !!userId,
  });
}

/**
 * Fetch featured labour profiles
 */
function useFeaturedLabour(limit = 6) {
  return useQuery({
    queryKey: labourKeys.featured(limit),
    queryFn: () => labourService.getFeatured(limit),
  });
}
