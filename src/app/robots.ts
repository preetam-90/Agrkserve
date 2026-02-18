import { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/seo/site-url';

const baseUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/provider/',
          '/renter/',
          '/dashboard/',
          '/settings/',
          '/messages/',
          '/bookings/',
          '/api/',
          '/auth/',
          '/onboarding/',
          '/notifications/',
          '/profile/',
          '/phone-setup/',
          '/offline/',
          '/error/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/equipment/', '/labour/', '/about', '/contact', '/help', '/gallery', '/user/'],
        disallow: ['/admin/', '/provider/', '/renter/', '/api/', '/auth/'],
      },
      {
        // Allow Google Images to crawl image URLs
        userAgent: 'Googlebot-Image',
        allow: ['/'],
        disallow: ['/admin/', '/api/', '/auth/', '/dashboard/', '/settings/'],
      },
      {
        // Allow Googlebot for indexing
        userAgent: 'Googlebot',
        allow: ['/'],
        crawlDelay: 1,
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/image-sitemap.xml`],
    host: baseUrl,
  };
}
