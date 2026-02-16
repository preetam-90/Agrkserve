import { Metadata } from 'next';
import GalleryClient from './GalleryClient';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

export const metadata: Metadata = {
  title: 'Gallery - AgriServe | Farm Equipment & Vehicle Photos India',
  description:
    'View photos of farm equipment, tractors, harvesters, cultivators, trucks, and agricultural labour on AgriServe. See our fleet of farming machinery and vehicles available for rent across India.',
  keywords: [
    'farm equipment photos India',
    'tractor rental gallery',
    'agricultural machinery images',
    'harvester photos',
    'cultivator images',
    'farming equipment India',
    'truck photos India',
    'vehicle gallery',
    'krishi upkaran photos',
    'ट्रैक्टर फोटो',
    'कृषि उपकरण फोटो',
    'agriserve gallery',
    'agricultural vehicles images',
  ],
  openGraph: {
    title: 'Gallery - AgriServe | Farm Equipment & Vehicle Photos',
    description:
      'Browse photos of farm equipment, tractors, harvesters, trucks and agricultural services on AgriServe across India.',
    url: `${BASE_URL}/gallery`,
    type: 'website',
    locale: 'en_IN',
    siteName: 'AgriServe',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'AgriServe - Farm Equipment Gallery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery - AgriServe Farm Equipment Photos',
    description: 'View farm equipment, tractors, harvesters and vehicles available for rent in India.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: `${BASE_URL}/gallery`,
    languages: {
      en: `${BASE_URL}/gallery`,
      'en-IN': `${BASE_URL}/gallery`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function GalleryPage() {
  // Image Gallery structured data for Google Images
  const imageGalleryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'AgriServe Farm Equipment & Vehicle Gallery',
    description: 'Browse photos of tractors, harvesters, farm equipment and vehicles available for rent across India on AgriServe.',
    url: `${BASE_URL}/gallery`,
    publisher: {
      '@type': 'Organization',
      name: 'AgriServe',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGalleryJsonLd) }}
      />
      <GalleryClient />
    </>
  );
}
