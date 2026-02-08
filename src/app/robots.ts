import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

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
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
