'use client';

import { useQuery } from '@tanstack/react-query';
import { equipmentKeys, statsKeys } from './query-keys';
import { equipmentService } from '@/lib/services';
import { createClient } from '@/lib/supabase/client';

/**
 * Fetch featured equipment list
 */
function useFeaturedEquipment(limit = 6) {
  return useQuery({
    queryKey: equipmentKeys.featured(limit),
    queryFn: async () => {
      const result = await equipmentService.getEquipment({ limit });
      return result.data;
    },
  });
}

/**
 * Fetch equipment by ID
 */
function useEquipment(id: string) {
  return useQuery({
    queryKey: equipmentKeys.detail(id),
    queryFn: () => equipmentService.getById(id),
    enabled: !!id,
  });
}

/**
 * Fetch equipment categories
 */
function useEquipmentCategories() {
  return useQuery({
    queryKey: equipmentKeys.categories(),
    queryFn: () => equipmentService.getCategories(),
    staleTime: 5 * 60 * 1000, // categories rarely change
  });
}

/**
 * Fetch home page stats (total counts for equipment, providers, bookings, categories)
 */
function useHomeStats() {
  return useQuery({
    queryKey: statsKeys.home(),
    queryFn: async () => {
      const supabase = createClient();
      const [equipmentCount, providerCount, bookingCount, categoryCount] = await Promise.all([
        supabase.from('equipment').select('*', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'provider'),
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),
        supabase.from('equipment_categories').select('*', { count: 'exact', head: true }),
      ]);
      return {
        totalEquipment: equipmentCount.count || 0,
        totalProviders: providerCount.count || 0,
        completedBookings: bookingCount.count || 0,
        totalCategories: categoryCount.count || 0,
      };
    },
    staleTime: 2 * 60 * 1000, // stats don't change every second
  });
}
