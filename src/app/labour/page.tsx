import { Metadata } from 'next';
import LabourClient from './LabourClient';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

export const metadata: Metadata = {
  title: 'Hire Agricultural Labour | Farm Workers for Rent - AgriServe',
  description:
    'Find skilled agricultural labour for planting, harvesting, and tractor operation. Verified farm workers available in Punjab, Haryana, UP, Maharashtra and across India. Book daily wage farm workers.',
  keywords: [
    'farm labour',
    'agricultural workers',
    'hire tractor driver',
    'paddy planting labour',
    'harvest labour India',
    'manual farm labour',
    'skilled farm workers',
    'agricultural employment',
    'daily wage farm workers',
    'farm help near me',
    'hire farm labour Punjab',
    'agricultural worker Haryana',
    'farm labour contractor India',
    'खेती मजदूर',
    'कृषि मजदूर किराया',
    'ट्रैक्टर चालक',
  ],
  openGraph: {
    title: 'Hire Agricultural Labour | Farm Workers for Rent - AgriServe',
    description:
      'Find skilled agricultural labour for planting, harvesting, and tractor operation. Verified farm workers available near you.',
    type: 'website',
    images: [`${BASE_URL}/og-image.jpg`],
    locale: 'en_IN',
    siteName: 'AgriServe',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hire Agricultural Labour | Farm Workers - AgriServe',
    description: 'Find skilled agricultural labour for farming. Verified farm workers available across India.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: `${BASE_URL}/labour`,
    languages: {
      en: `${BASE_URL}/labour`,
      'en-IN': `${BASE_URL}/labour`,
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

export default function LabourPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Agricultural Labour Hiring',
    description:
      'Platform to connect farmers with skilled agricultural labourers for various farm tasks.',
    provider: {
      '@type': 'Organization',
      name: 'AgriServe',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    serviceType: 'Agricultural Employment',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: '0', // Platform is free to search? Or varies.
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LabourClient />
    </>
  );
}
