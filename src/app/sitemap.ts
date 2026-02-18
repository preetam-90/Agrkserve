import { MetadataRoute } from 'next';
import { INDIA_STATES, getAllCitySlugs } from '@/data/india-locations';
import { createClient } from '@/lib/supabase/server';
import { getAllBlogPosts } from '@/lib/seo/blog-content';
import { getSiteUrl } from '@/lib/seo/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
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

  // (Video entry added later in videoRoutes)

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
      .select('id, updated_at, images')
      .eq('status', 'available')
      .order('updated_at', { ascending: false })
      .limit(500);

    if (equipment) {
      equipmentRoutes = equipment.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const route: any = {
          url: `${baseUrl}/equipment/${item.id}`,
          lastModified: new Date(item.updated_at),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        };
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
          route.images = item.images.map((img: string) => ({ url: img }));
        }
        return route;
      });
    }
  } catch {
    // Silently fail if DB is unavailable during build
    console.warn('[Sitemap] Could not fetch equipment from database');
  }

  // ─── Dynamic: Individual labour pages from database ──────────────
  let labourRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: labour } = await supabase
      .from('labour')
      .select('id, updated_at, images')
      .eq('status', 'available')
      .order('updated_at', { ascending: false })
      .limit(500);

    if (labour) {
      labourRoutes = labour.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const route: any = {
          url: `${baseUrl}/labour/${item.id}`,
          lastModified: new Date(item.updated_at),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        };
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
          route.images = item.images.map((img: string) => ({ url: img }));
        }
        return route;
      });
    }
  } catch {
    console.warn('[Sitemap] Could not fetch labour from database');
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

  // ─── Blog posts (from local content) ────────────────────────────
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = getAllBlogPosts();
    blogRoutes = posts.map((p) => ({
      url: `${baseUrl}/blog/${p.id}`,
      lastModified: new Date(p.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.warn('[Sitemap] Could not load blog posts', e);
  }

  // ─── Video / landing page entry (include thumbnail) ────────────
  const videoRoutes: any[] = [];
  try {
    const poster = `${baseUrl}/Landingpagevideo-poster.jpg`;
    // push as any to avoid strict type errors for sitemap video extensions
    videoRoutes.push({
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
      images: [
        {
          url: poster,
          title: 'AgriServe Landing Video',
        },
      ],
      // include video metadata under a custom key; sitemap libraries may pick this up
      video: {
        thumbnailUrl: poster,
        title: 'AgriServe — Equipment & Labour for Farmers',
        description:
          'Overview video: rent farm equipment and hire agricultural labour across India via AgriServe.',
      } as any,
    } as any);
  } catch (e) {
    console.warn('[Sitemap] Could not create video entry', e);
  }

  // combine all routes; cast to MetadataRoute.Sitemap to satisfy return type
  const all: any[] = [
    ...staticRoutes,
    ...videoRoutes,
    ...stateRoutes,
    ...cityRoutes,
    ...equipmentRoutes,
    ...labourRoutes,
    ...userRoutes,
    ...blogRoutes,
  ];

  return all as MetadataRoute.Sitemap;
}
