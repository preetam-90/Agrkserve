'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingKeys } from './query-keys';
import { bookingService } from '@/lib/services';
import type { BookingStatus } from '@/lib/types';

/**
 * Fetch current user's bookings (renter-side)
 */
export function useMyBookings() {
  return useQuery({
    queryKey: bookingKeys.myBookings(),
    queryFn: () => bookingService.getMyBookings(),
  });
}

/**
 * Fetch bookings for a renter
 */
export function useRenterBookings(renterId: string, status?: BookingStatus | BookingStatus[]) {
  return useQuery({
    queryKey: bookingKeys.renter(renterId, status as string | undefined),
    queryFn: async () => {
      const result = await bookingService.getRenterBookings(renterId, status);
      return result.data || [];
    },
    enabled: !!renterId,
  });
}

/**
 * Fetch a single booking by ID
 */
export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  });
}

/**
 * Fetch booking stats for a user
 */
export function useBookingStats(userId: string, role: 'renter' | 'owner') {
  return useQuery({
    queryKey: bookingKeys.stats(userId, role),
    queryFn: () => bookingService.getStats(userId, role),
    enabled: !!userId,
  });
}

/**
 * Update booking status mutation
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: BookingStatus; notes?: string }) =>
      bookingService.updateStatus(id, status, notes),
    onSuccess: () => {
      // Invalidate all booking lists to refetch
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}
