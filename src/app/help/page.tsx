import { Metadata } from 'next';
import HelpClient from './HelpClient';

const helpFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I rent farm equipment on AgriServe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Browse our equipment catalog, select the tractor, harvester, or cultivator you need, choose your rental dates, and book instantly. We serve all Indian states including Punjab, Haryana, Uttar Pradesh, Rajasthan, Madhya Pradesh, Bihar, and more.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I hire agricultural labour through AgriServe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Visit our Labour section to browse verified agricultural workers for harvesting, planting, irrigation, crop spraying, and other farm tasks. Book labour for your farm in any city across India.',
      },
    },
    {
      '@type': 'Question',
      name: 'What areas does AgriServe cover in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AgriServe operates across all of India with strong coverage in Northern states: Punjab, Haryana, Uttar Pradesh, Rajasthan, Madhya Pradesh, Bihar, Uttarakhand, Himachal Pradesh, Jharkhand, Chhattisgarh, Delhi NCR, and expanding to Maharashtra, Gujarat, Karnataka, Tamil Nadu, Andhra Pradesh, Telangana, Kerala, West Bengal, Odisha, Assam, and Jammu & Kashmir.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the cost of renting a tractor on AgriServe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tractor rental prices on AgriServe vary by model, location, and duration. Prices start from ₹500/day for basic models. Browse our equipment catalog for real-time pricing in your area.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is AgriServe available in Hindi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, AgriServe supports Hindi-speaking farmers. Our platform is designed to serve farmers across Hindi-speaking Northern Indian states. हां, एग्रीसर्व हिंदी भाषी किसानों की सेवा करता है।',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Help Center - AgriServe | Farm Equipment & Labour Booking FAQ India',
  description:
    'Find answers about renting farm equipment, hiring agricultural labour, booking tractors, harvesters, and other farming machinery on AgriServe. Available across all Indian states. कृषि उपकरण किराये और श्रमिक बुकिंग सहायता।',
  keywords: [
    'agriserve help',
    'farm equipment rental FAQ',
    'agricultural labour booking help',
    'tractor rental guide india',
    'how to rent farm equipment',
    'krishi upkaran kiraya sahayata',
    'कृषि उपकरण सहायता',
    'किसान मदद',
    'farming equipment booking FAQ',
    'agriserve FAQ',
  ],
  openGraph: {
    title: 'Help Center - AgriServe | Farm Equipment & Labour FAQ',
    description:
      'Find answers about renting farm equipment and hiring agricultural labour on AgriServe across India.',
    url: 'https://agriserve.in/help',
    type: 'website',
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://agriserve.in/help',
  },
};

export default function HelpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(helpFaqJsonLd) }}
      />
      <HelpClient />
    </>
  );
}
