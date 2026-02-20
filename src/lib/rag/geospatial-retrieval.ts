import { createAdminClient } from '@/lib/supabase/admin';

export interface GeoCoords {
  latitude: number;
  longitude: number;
}

export interface NearbyEquipment {
  id: string;
  name: string;
  category: string | null;
  brand: string | null;
  price_per_day: number;
  location_name: string | null;
  rating: number | null;
  is_available: boolean;
  distance_km: number;
}

export interface GeoRetrievalResult {
  items: NearbyEquipment[];
  radiusKm: number;
  coords: GeoCoords;
}

const DEFAULT_RADIUS_KM = 50;
const MAX_RESULTS = 20;

export async function findNearbyEquipment(
  coords: GeoCoords,
  radiusKm = DEFAULT_RADIUS_KM
): Promise<GeoRetrievalResult> {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc('equipment_within_radius', {
    lat: coords.latitude,
    lng: coords.longitude,
    radius_km: radiusKm,
    max_results: MAX_RESULTS,
  });

  if (error) {
    console.error('[geospatial-retrieval] RPC failed, falling back to empty result:', error.message);
    return { items: [], radiusKm, coords };
  }

  const items: NearbyEquipment[] = (data ?? []).map(
    (row: {
      id: string;
      name: string;
      category: string | null;
      brand: string | null;
      price_per_day: number;
      location_name: string | null;
      rating: number | null;
      is_available: boolean;
      distance_km: number;
    }) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      brand: row.brand,
      price_per_day: row.price_per_day,
      location_name: row.location_name,
      rating: row.rating,
      is_available: row.is_available,
      distance_km: Math.round(row.distance_km * 10) / 10,
    })
  );

  return { items, radiusKm, coords };
}

export function formatGeoContext(result: GeoRetrievalResult): string {
  if (result.items.length === 0) {
    return `No equipment found within ${result.radiusKm} km of your location.`;
  }

  const header = `📍 Equipment within ${result.radiusKm} km (${result.items.length} found):`;
  const rows = result.items.map(
    (item, i) =>
      `${i + 1}. ${item.name} (${item.category ?? 'N/A'}) — ₹${item.price_per_day}/day — ${item.distance_km} km away — ${item.is_available ? '✅ Available' : '❌ Unavailable'}`
  );
  return [header, ...rows].join('\n');
}
