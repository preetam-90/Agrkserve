import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function imageSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app';
  const currentDate = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sitemapEntries: any[] = [];

  // ─── Static Site Images ───────────────────────────────────────────
  // Favicon
  sitemapEntries.push({
    url: `${baseUrl}/`,
    lastModified: currentDate,
    images: [`${baseUrl}/favicon.ico`],
  });

  // Logos
  sitemapEntries.push({
    url: `${baseUrl}/`,
    lastModified: currentDate,
    images: [
      `${baseUrl}/logo.png`,
      `${baseUrl}/logo.webp`,
      `${baseUrl}/logo.avif`,
      `${baseUrl}/logo-original.png`,
    ],
  });

  // Social/OG images
  sitemapEntries.push({
    url: `${baseUrl}/`,
    lastModified: currentDate,
    images: [`${baseUrl}/og-image.jpg`, `${baseUrl}/twitter-card.jpg`],
  });

  // PWA icons
  sitemapEntries.push({
    url: `${baseUrl}/`,
    lastModified: currentDate,
    images: [
      `${baseUrl}/android-chrome-192x192.png`,
      `${baseUrl}/android-chrome-512x512.png`,
      `${baseUrl}/apple-touch-icon.png`,
    ],
  });

  // Avatar images
  sitemapEntries.push({
    url: `${baseUrl}/`,
    lastModified: currentDate,
    images: [
      `${baseUrl}/images/avatar-anita.png`,
      `${baseUrl}/images/avatar-anita.avif`,
      `${baseUrl}/images/avatar-rajesh.png`,
      `${baseUrl}/images/avatar-rajesh.avif`,
      `${baseUrl}/images/avatar-vikram.png`,
      `${baseUrl}/images/avatar-vikram.avif`,
    ],
  });

  // Video poster
  sitemapEntries.push({
    url: `${baseUrl}/`,
    lastModified: currentDate,
    images: [`${baseUrl}/Landingpagevideo-poster.jpg`],
  });

  // ─── Dynamic: Equipment Images from Database ──────────────────────
  try {
    const supabase = await createClient();
    
    // Fetch equipment with images
    const { data: equipment } = await supabase
      .from('equipment')
      .select('id, name, images')
      .eq('status', 'available')
      .not('images', 'is', null)
      .limit(1000);

    if (equipment) {
      for (const item of equipment) {
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
          const imageUrls = item.images.filter((url): url is string => typeof url === 'string');
          
          if (imageUrls.length > 0) {
            sitemapEntries.push({
              url: `${baseUrl}/equipment/${item.id}`,
              lastModified: currentDate,
              images: imageUrls,
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn('[ImageSitemap] Could not fetch equipment from database:', error);
  }

  // ─── Dynamic: Labour/Worker Images from Database ──────────────────
  try {
    const supabase = await createClient();
    
    // Fetch labour profiles with images
    const { data: labour } = await supabase
      .from('labour')
      .select('id, name, images')
      .eq('status', 'available')
      .not('images', 'is', null)
      .limit(500);

    if (labour) {
      for (const item of labour) {
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
          const imageUrls = item.images.filter((url): url is string => typeof url === 'string');
          
          if (imageUrls.length > 0) {
            sitemapEntries.push({
              url: `${baseUrl}/labour/${item.id}`,
              lastModified: currentDate,
              images: imageUrls,
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn('[ImageSitemap] Could not fetch labour from database:', error);
  }

  // ─── Dynamic: User Profile Images ─────────────────────────────────
  try {
    const supabase = await createClient();
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, profile_image')
      .eq('is_public', true)
      .not('profile_image', 'is', null)
      .limit(500);

    if (profiles) {
      for (const profile of profiles) {
        if (profile.profile_image) {
          sitemapEntries.push({
            url: `${baseUrl}/user/${profile.id}`,
            lastModified: currentDate,
            images: [profile.profile_image],
          });
        }
      }
    }
  } catch (error) {
    console.warn('[ImageSitemap] Could not fetch profiles from database:', error);
  }

  return sitemapEntries as MetadataRoute.Sitemap;
}
