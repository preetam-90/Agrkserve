import { Metadata } from 'next';
import LabourClient from './LabourClient';

export const metadata: Metadata = {
  title: 'Hire Agricultural Labour | Farm Workers for Rent - AgriServe',
  description:
    'Find skilled agricultural labour for planting, harvesting, and tractor operation. Verified farm workers available in Punjab, Haryana, UP, and across India.',
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
  ],
  openGraph: {
    title: 'Hire Agricultural Labour | Farm Workers for Rent - AgriServe',
    description:
      'Find skilled agricultural labour for planting, harvesting, and tractor operation. Verified farm workers available near you.',
    type: 'website',
    images: ['/og-labour.jpg'], // Assuming a generic or specific image exists, or fallback to default
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app'}/labour`,
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
