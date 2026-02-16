import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { preload } from 'react-dom';
import { Space_Grotesk, Inter } from 'next/font/google';
import { LandingPageRedesigned } from '@/components/landing/LandingPageRedesigned';
import { CriticalCSS } from '@/components/landing/CriticalCSS';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'AgriServe | Rent Farm Equipment & Hire Labour in India',
  description:
    "India's #1 farm equipment marketplace. Rent tractors, harvesters & agricultural machinery. Hire skilled farm workers. Verified providers, transparent pricing, instant booking.",
  keywords: [
    'farm equipment rental India',
    'tractor rental',
    'agricultural machinery',
    'harvester rental',
    'farm labour hiring',
    'agriculture marketplace India',
  ],
  openGraph: {
    title: 'AgriServe | Rent Farm Equipment & Hire Labour in India',
    description:
      "India's #1 farm equipment marketplace. Rent tractors, harvesters & agricultural machinery. Hire skilled farm workers. Verified providers, transparent pricing, instant booking.",
    url: siteUrl,
    type: 'website',
    locale: 'en_IN',
    siteName: 'AgriServe',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AgriServe - Farm Equipment Rental Platform India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriServe | Rent Farm Equipment & Hire Labour in India',
    description:
      "India's #1 farm equipment marketplace. Rent tractors, harvesters & agricultural machinery.",
  },
};

function isMobileUserAgent(userAgent: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
}

export default async function HomePage() {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get('user-agent') ?? '';
  const initialIsMobile = isMobileUserAgent(userAgent);

  // Preload critical hero assets for sub-1s FCP
  // Poster image serves as immediate visual while video loads
  preload('/Landingpagevideo-poster.jpg', { as: 'image', fetchPriority: 'high' });

  return (
    <>
      {/* Critical CSS for above-the-fold content - enables sub-1s FCP */}
      <CriticalCSS />

      {/* High-priority preload for hero video background - desktop only */}
      {/* Video should be <3MB for optimal performance */}
      {!initialIsMobile && (
        <link rel="preload" href="/Landingpagevideo.webm" as="video" fetchPriority="high" />
      )}
      {/* Mobile-optimized video preload */}
      {initialIsMobile && (
        <link rel="preload" href="/Landingpagevideo-mobile.webm" as="video" fetchPriority="high" />
      )}
      <LandingPageRedesigned
        initialIsMobile={initialIsMobile}
        fontClassName={`${spaceGrotesk.variable} ${inter.variable}`}
      />
    </>
  );
}
