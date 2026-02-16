import { Metadata } from 'next';
import EquipmentClient from './EquipmentClient';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

export const metadata: Metadata = {
  title: 'Rent Farm Equipment | Tractors, Harvesters & Agricultural Machinery | AgriServe',
  description:
    'Rent tractors, harvesters, seed drills, and farm equipment across India. Find verified equipment providers in Punjab, Haryana, UP, Maharashtra and more. Free listing for equipment owners.',
  keywords: [
    'rent farm equipment',
    'tractor rental',
    'harvester rental',
    'agricultural machinery hire',
    'farm equipment India',
    'tractor on rent',
    'harvester on rent',
    'agricultural equipment rental',
    'farm machinery hire Punjab',
    'tractor rental Haryana',
    'equipment for farming',
    'rent agriculture machine',
    'खेती के उपकरण किराया',
    'ट्रैक्टर किराया',
  ],
  openGraph: {
    title: 'Rent Farm Equipment | Tractors, Harvesters & Agricultural Machinery | AgriServe',
    description:
      'Rent tractors, harvesters, seed drills, and farm equipment across India. Find verified equipment providers near you.',
    type: 'website',
    images: [`${BASE_URL}/og-image.jpg`],
    locale: 'en_IN',
    siteName: 'AgriServe',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rent Farm Equipment | AgriServe',
    description: 'Rent tractors, harvesters, and farm equipment across India.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: `${BASE_URL}/equipment`,
    languages: {
      en: `${BASE_URL}/equipment`,
      'en-IN': `${BASE_URL}/equipment`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function EquipmentPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AgriServe - Farm Equipment Rental',
    description: 'Rent tractors, harvesters, and agricultural machinery across India',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/equipment?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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
    serviceType: 'Equipment Rental',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EquipmentClient />
    </>
  );
}
