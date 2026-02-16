import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import { LandingPageRedesigned } from '@/components/landing/LandingPageRedesigned';

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
  title: 'AgriServe | Rent Farm Equipment & Hire Labour in India',
  description:
    "India's #1 farm equipment marketplace. Rent tractors, harvesters & agricultural machinery. Hire skilled farm workers. Verified providers, transparent pricing, instant booking.",
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

export default function HomePage() {
  return (
    <LandingPageRedesigned 
      fontClassName={`${spaceGrotesk.variable} ${inter.variable}`} 
    />
  );
}
