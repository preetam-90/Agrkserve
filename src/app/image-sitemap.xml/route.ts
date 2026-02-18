import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/seo/site-url';

export async function GET() {
  const baseUrl = getSiteUrl();
  const currentDate = new Date().toISOString();

  const imageEntries: { pageUrl: string; images: string[] }[] = [];

  imageEntries.push({
    pageUrl: `${baseUrl}/`,
    images: [
      `${baseUrl}/favicon.ico`,
      `${baseUrl}/logo.png`,
      `${baseUrl}/logo.webp`,
      `${baseUrl}/logo.avif`,
      `${baseUrl}/logo-original.png`,
      `${baseUrl}/og-image.jpg`,
      `${baseUrl}/twitter-card.jpg`,
      `${baseUrl}/android-chrome-192x192.png`,
      `${baseUrl}/android-chrome-512x512.png`,
      `${baseUrl}/apple-touch-icon.png`,
      `${baseUrl}/images/avatar-anita.png`,
      `${baseUrl}/images/avatar-anita.avif`,
      `${baseUrl}/images/avatar-rajesh.png`,
      `${baseUrl}/images/avatar-rajesh.avif`,
      `${baseUrl}/images/avatar-vikram.png`,
      `${baseUrl}/images/avatar-vikram.avif`,
      `${baseUrl}/Landingpagevideo-poster.jpg`,
    ],
  });

  try {
    const supabase = await createClient();
    const { data: equipment } = await supabase
      .from('equipment')
      .select('id, images')
      .eq('status', 'available')
      .not('images', 'is', null)
      .limit(1000);

    if (equipment) {
      for (const item of equipment) {
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
          const imageUrls = item.images.filter((url): url is string => typeof url === 'string');
          if (imageUrls.length > 0) {
            imageEntries.push({
              pageUrl: `${baseUrl}/equipment/${item.id}`,
              images: imageUrls,
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn('[ImageSitemap] Could not fetch equipment from database:', error);
  }

  try {
    const supabase = await createClient();
    const { data: labour } = await supabase
      .from('labour')
      .select('id, images')
      .eq('status', 'available')
      .not('images', 'is', null)
      .limit(500);

    if (labour) {
      for (const item of labour) {
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
          const imageUrls = item.images.filter((url): url is string => typeof url === 'string');
          if (imageUrls.length > 0) {
            imageEntries.push({
              pageUrl: `${baseUrl}/labour/${item.id}`,
              images: imageUrls,
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn('[ImageSitemap] Could not fetch labour from database:', error);
  }

  try {
    const supabase = await createClient();
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, profile_image')
      .eq('is_public', true)
      .not('profile_image', 'is', null)
      .limit(500);

    if (profiles) {
      for (const profile of profiles) {
        if (profile.profile_image) {
          imageEntries.push({
            pageUrl: `${baseUrl}/user/${profile.id}`,
            images: [profile.profile_image],
          });
        }
      }
    }
  } catch (error) {
    console.warn('[ImageSitemap] Could not fetch profiles from database:', error);
  }

  const urlElements = imageEntries
    .map((entry) => {
      const imageTags = entry.images
        .map(
          (img) => `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
    </image:image>`
        )
        .join('\n');

      return `  <url>
    <loc>${escapeXml(entry.pageUrl)}</loc>
    <lastmod>${currentDate}</lastmod>
${imageTags}
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlElements}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
