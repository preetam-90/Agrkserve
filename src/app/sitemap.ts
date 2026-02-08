import { MetadataRoute } from 'next';
import { INDIA_STATES, getAllCitySlugs } from '@/data/india-locations';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';
  const currentDate = new Date();

  // ─── Static routes ───────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/equipment`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/labour`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // ─── Geo: State landing pages (equipment + labour) ───────────────
  const stateRoutes: MetadataRoute.Sitemap = INDIA_STATES.flatMap((state) => [
    {
      url: `${baseUrl}/equipment/${state.slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/labour/${state.slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
  ]);

  // ─── Geo: City landing pages (equipment + labour) ────────────────
  const allCities = getAllCitySlugs();
  const cityRoutes: MetadataRoute.Sitemap = allCities.flatMap(({ stateSlug, citySlug }) => [
    {
      url: `${baseUrl}/equipment/${stateSlug}/${citySlug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/labour/${stateSlug}/${citySlug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    },
  ]);

  // ─── Dynamic: Individual equipment pages from database ───────────
  let equipmentRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: equipment } = await supabase
      .from('equipment')
      .select('id, updated_at')
      .eq('status', 'available')
      .order('updated_at', { ascending: false })
      .limit(500);

    if (equipment) {
      equipmentRoutes = equipment.map((item) => ({
        url: `${baseUrl}/equipment/${item.id}`,
        lastModified: new Date(item.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Silently fail if DB is unavailable during build
    console.warn('[Sitemap] Could not fetch equipment from database');
  }

  // ─── Dynamic: Individual user profile pages ──────────────────────
  let userRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: users } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(200);

    if (users) {
      userRoutes = users.map((user) => ({
        url: `${baseUrl}/user/${user.id}`,
        lastModified: new Date(user.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }));
    }
  } catch {
    console.warn('[Sitemap] Could not fetch user profiles from database');
  }

  return [...staticRoutes, ...stateRoutes, ...cityRoutes, ...equipmentRoutes, ...userRoutes];
}
