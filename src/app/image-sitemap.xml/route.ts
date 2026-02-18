import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSiteUrl } from '@/lib/seo/site-url';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_RESULTS = 500;
const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;

export async function GET() {
  const baseUrl = getSiteUrl();
  const currentDate = new Date().toISOString();

  const imageEntries: {
    pageUrl: string;
    images: { url: string; title?: string; caption?: string }[];
    videos: { url: string; title?: string; description?: string; thumbnail?: string }[];
  }[] = [];

  const staticImages = {
    pageUrl: `${baseUrl}/`,
    images: [
      { url: `${baseUrl}/favicon.ico`, title: 'AgriServe Favicon' },
      { url: `${baseUrl}/logo.png`, title: 'AgriServe Logo' },
      { url: `${baseUrl}/logo.webp`, title: 'AgriServe Logo' },
      { url: `${baseUrl}/logo.avif`, title: 'AgriServe Logo' },
      { url: `${baseUrl}/logo-original.png`, title: 'AgriServe Logo' },
      { url: `${baseUrl}/og-image.jpg`, title: 'AgriServe - Farm Equipment Rental Platform' },
      { url: `${baseUrl}/twitter-card.jpg`, title: 'AgriServe - Agricultural Marketplace' },
      { url: `${baseUrl}/android-chrome-192x192.png`, title: 'AgriServe App Icon' },
      { url: `${baseUrl}/android-chrome-512x512.png`, title: 'AgriServe App Icon' },
      { url: `${baseUrl}/apple-touch-icon.png`, title: 'AgriServe App Icon' },
      { url: `${baseUrl}/Landingpagevideo-poster.jpg`, title: 'AgriServe Landing Page' },
    ],
    videos: [],
  };
  imageEntries.push(staticImages);

  try {
    const imageResult = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(MAX_RESULTS)
      .execute();

    if (imageResult.resources && imageResult.resources.length > 0) {
      const groupedImages = new Map<string, { url: string; title: string }[]>();

      for (const img of imageResult.resources) {
        const publicId = img.public_id as string;
        const secureUrl = img.secure_url as string;
        const folder = publicId.split('/')[0] || 'other';

        let pagePath = '/';
        let title = 'AgriServe Image';

        if (publicId.includes('/equipment/') || folder === 'equipment') {
          const parts = publicId.split('/');
          const equipmentId = parts.length > 2 ? parts[1] : null;
          pagePath = equipmentId ? `/equipment/${equipmentId}` : '/equipment';
          title =
            img.context?.custom?.alt ||
            img.context?.custom?.caption ||
            `Equipment - ${publicId.split('/').pop()}`;
        } else if (publicId.includes('/labour/') || folder === 'labour') {
          const parts = publicId.split('/');
          const labourId = parts.length > 2 ? parts[1] : null;
          pagePath = labourId ? `/labour/${labourId}` : '/labour';
          title =
            img.context?.custom?.alt ||
            img.context?.custom?.caption ||
            `Labour - ${publicId.split('/').pop()}`;
        } else if (publicId.includes('/profile') || folder === 'users' || folder === 'profiles') {
          const parts = publicId.split('/');
          const userId = parts.length > 1 ? parts[1] : null;
          pagePath = userId ? `/user/${userId}` : '/';
          title = 'User Profile Image';
        } else if (folder === 'blog' || publicId.includes('/blog/')) {
          pagePath = '/blog';
          title = img.context?.custom?.alt || 'Blog Image';
        }

        const fullPageUrl = `${baseUrl}${pagePath}`;
        if (!groupedImages.has(fullPageUrl)) {
          groupedImages.set(fullPageUrl, []);
        }
        groupedImages.get(fullPageUrl)!.push({ url: secureUrl, title });
      }

      for (const [pageUrl, images] of groupedImages) {
        const existing = imageEntries.find((e) => e.pageUrl === pageUrl);
        if (existing) {
          existing.images.push(...images);
        } else {
          imageEntries.push({ pageUrl, images, videos: [] });
        }
      }
    }
  } catch (error) {
    console.error('[ImageSitemap] Error fetching images from Cloudinary:', error);
  }

  try {
    const videoResult = await cloudinary.search
      .expression('resource_type:video')
      .sort_by('created_at', 'desc')
      .max_results(MAX_RESULTS)
      .execute();

    if (videoResult.resources && videoResult.resources.length > 0) {
      for (const video of videoResult.resources) {
        const publicId = video.public_id as string;
        const secureUrl = video.secure_url as string;
        const thumbnail = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${publicId}.jpg`;

        let pagePath = '/';
        let title = 'AgriServe Video';
        let description = 'Agricultural equipment and farming video';

        if (publicId.includes('/equipment/') || publicId.includes('equipment')) {
          pagePath = '/equipment';
          title = video.context?.custom?.title || 'Equipment Video';
          description = video.context?.custom?.description || 'Farm equipment rental video';
        } else if (publicId.includes('/labour/') || publicId.includes('labour')) {
          pagePath = '/labour';
          title = video.context?.custom?.title || 'Labour Video';
          description = video.context?.custom?.description || 'Agricultural labour video';
        } else if (publicId.includes('landing') || publicId.includes('hero')) {
          pagePath = '/';
          title = 'AgriServe - Farm Equipment Platform';
          description = 'Overview of AgriServe agricultural marketplace';
        }

        const pageUrl = `${baseUrl}${pagePath}`;
        const existing = imageEntries.find((e) => e.pageUrl === pageUrl);
        if (existing) {
          existing.videos.push({ url: secureUrl, title, description, thumbnail });
        } else {
          imageEntries.push({
            pageUrl,
            images: [],
            videos: [{ url: secureUrl, title, description, thumbnail }],
          });
        }
      }
    }
  } catch (error) {
    console.error('[ImageSitemap] Error fetching videos from Cloudinary:', error);
  }

  const urlElements = imageEntries
    .map((entry) => {
      const imageTags = entry.images
        .map(
          (img) => `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ''}
    </image:image>`
        )
        .join('\n');

      const videoTags = entry.videos
        .map(
          (vid) => `    <video:video>
      <video:thumbnail_loc>${escapeXml(vid.thumbnail || vid.url)}</video:thumbnail_loc>
      <video:title>${escapeXml(vid.title || 'AgriServe Video')}</video:title>
      <video:description>${escapeXml(vid.description || 'Agricultural video')}</video:description>
      <video:content_loc>${escapeXml(vid.url)}</video:content_loc>
    </video:video>`
        )
        .join('\n');

      const content = [imageTags, videoTags].filter(Boolean).join('\n');

      if (!content) return '';

      return `  <url>
    <loc>${escapeXml(entry.pageUrl)}</loc>
    <lastmod>${currentDate}</lastmod>
${content}
  </url>`;
    })
    .filter(Boolean)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
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
