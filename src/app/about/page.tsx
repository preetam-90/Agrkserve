import type { Metadata } from 'next';
import AboutPage from './AboutClient';
import { getSiteUrl } from '@/lib/seo/site-url';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: "About AgriServe - India's Trusted Agricultural Equipment & Labour Platform",
  description:
    "Learn about AgriServe — India's leading platform for renting farm equipment and hiring agricultural labour. " +
    'Serving farmers across Punjab, Haryana, Uttar Pradesh, Rajasthan, Madhya Pradesh, Bihar, Maharashtra, and 20+ states. ' +
    'किसानों के लिए कृषि उपकरण किराया और मजदूर बुकिंग प्लेटफॉर्म।',
  keywords: [
    'about AgriServe',
    'agricultural platform India',
    'farm equipment rental company',
    'tractor rental India',
    'harvester rental India',
    'agricultural labour hiring',
    'कृषि सेवा प्लेटफॉर्म',
    'किसान सेवा',
    'AgriServe team',
    'farming technology India',
    'rural India agriculture',
    'krishi seva company',
    'agricultural marketplace',
    'farm machinery rental',
    'labour booking platform',
  ],
  openGraph: {
    title: "About AgriServe - India's Trusted Agricultural Equipment & Labour Platform",
    description:
      "Learn about AgriServe — India's leading agricultural platform connecting farmers with equipment providers and labour across 20+ Indian states.",
    url: `${BASE_URL}/about`,
    siteName: 'AgriServe',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'About AgriServe - Agricultural Platform for Indian Farmers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "About AgriServe - India's Agricultural Equipment & Labour Platform",
    description:
      'Discover how AgriServe empowers Indian farmers with easy access to tractors, harvesters, cultivators, and skilled agricultural labour.',
    images: [`${BASE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
    languages: {
      'en-IN': `${BASE_URL}/about`,
      'hi-IN': `${BASE_URL}/about?lang=hi`,
    },
  },
};

// About page JSON-LD structured data
const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About AgriServe',
  description: "India's leading hyperlocal agricultural marketplace platform",
  url: `${BASE_URL}/about`,
  mainEntity: {
    '@type': 'Organization',
    name: 'AgriServe',
    url: BASE_URL,
    logo: `${BASE_URL}/agriserveLogo.png`,
    description:
      'AgriServe is a technology-driven platform that connects Indian farmers with agricultural equipment providers and skilled labour across 20+ states.',
    foundingDate: '2024',
    founders: [
      { '@type': 'Person', name: 'Anubhav', jobTitle: 'CEO & Co-Founder' },
      { '@type': 'Person', name: 'Nancy', jobTitle: 'COO & Co-Founder' },
      { '@type': 'Person', name: 'Saurabh', jobTitle: 'CTO & Co-Founder' },
      { '@type': 'Person', name: 'Kuldeep', jobTitle: 'Head of Operations' },
    ],
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'State', name: 'Punjab' },
      { '@type': 'State', name: 'Haryana' },
      { '@type': 'State', name: 'Uttar Pradesh' },
      { '@type': 'State', name: 'Rajasthan' },
      { '@type': 'State', name: 'Madhya Pradesh' },
      { '@type': 'State', name: 'Bihar' },
      { '@type': 'State', name: 'Uttarakhand' },
      { '@type': 'State', name: 'Himachal Pradesh' },
      { '@type': 'State', name: 'Jharkhand' },
      { '@type': 'State', name: 'Chhattisgarh' },
      { '@type': 'State', name: 'Maharashtra' },
      { '@type': 'State', name: 'Gujarat' },
      { '@type': 'State', name: 'Karnataka' },
      { '@type': 'State', name: 'Tamil Nadu' },
      { '@type': 'State', name: 'Andhra Pradesh' },
      { '@type': 'State', name: 'Telangana' },
      { '@type': 'State', name: 'Kerala' },
      { '@type': 'State', name: 'West Bengal' },
      { '@type': 'State', name: 'Odisha' },
      { '@type': 'State', name: 'Assam' },
      { '@type': 'AdministrativeArea', name: 'Delhi NCR' },
      { '@type': 'AdministrativeArea', name: 'Chandigarh' },
      { '@type': 'AdministrativeArea', name: 'Jammu & Kashmir' },
    ],
    sameAs: ['https://twitter.com/agriserve_in'],
  },
};

export default function AboutPageWrapper() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <AboutPage />
    </>
  );
}
