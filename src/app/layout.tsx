import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { RootAppShell } from '@/components/root/RootAppShell';
import { rootJsonLd } from '@/lib/seo/schemas';
import { getSiteUrl } from '@/lib/seo/site-url';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AgriServe - Rent Farm Equipment | India's Trusted Agricultural Platform",
    template: '%s | AgriServe India',
  },
  description:
    'Rent quality tractors, harvesters, and agricultural equipment from verified providers across India. Book skilled farm labour for harvesting, sowing, and land preparation. Trusted by 50,000+ farmers in Punjab, Haryana, UP, Rajasthan, Bihar, MP & all Indian states.',
  keywords: [
    // Core keywords
    'farm equipment rental',
    'tractor rental India',
    'agricultural machinery',
    'farm tools rental',
    'harvester rental',
    'agriculture marketplace',
    'krishi yantra kiraya',
    'agricultural labour hiring',
    'farm labour booking',
    'khet majdoor',
    // Hindi keywords for bilingual SEO
    'ट्रैक्टर किराया',
    'खेती उपकरण किराया',
    'कृषि मशीनरी',
    'हार्वेस्टर किराये पर',
    'भारत में खेती उपकरण',
    'कृषि मजदूर',
    'खेत मजदूर बुकिंग',
    'फसल कटाई मजदूर',
    // Northern India state keywords
    'tractor rental Punjab',
    'tractor rental Haryana',
    'tractor rental Uttar Pradesh',
    'tractor rental Rajasthan',
    'tractor rental Madhya Pradesh',
    'tractor rental Bihar',
    'tractor rental Uttarakhand',
    'tractor rental Himachal Pradesh',
    'tractor rental Jharkhand',
    'tractor rental Chhattisgarh',
    'farm equipment rental Delhi NCR',
    'tractor rental Maharashtra',
    'tractor rental Gujarat',
    // Equipment-specific
    'mini tractor rental',
    'cultivator rental',
    'rotavator rental',
    'plough rental',
    'seed drill rental',
    'sprayer rental India',
    'harvester booking online',
    // Labour-specific
    'agricultural labour near me',
    'farm workers for hire India',
    'harvesting labour booking',
    'crop cutting workers',
    'sowing labour hire',
    'land preparation workers',
    // Service intent
    'rent farm equipment near me',
    'agricultural equipment on rent',
    'cheap tractor rental India',
    'verified farm equipment providers',
    'book farm labour online',
    'agriculture vehicle rental',
    'krishi equipment kiraya',
  ],
  authors: [{ name: 'AgriServe', url: siteUrl }],
  applicationName: 'AgriServe',
  creator: 'AgriServe',
  publisher: 'AgriServe',
  manifest: '/site.webmanifest',
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#D4A853' }],
  },
  openGraph: {
    title: "AgriServe - Rent Farm Equipment | India's Trusted Platform",
    description:
      'Rent quality tractors, harvesters, and agricultural equipment from verified providers across India. Available in all major agricultural states.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'AgriServe',
    url: siteUrl,
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
    title: "AgriServe - Rent Farm Equipment | India's Trusted Platform",
    description:
      'Rent tractors, harvesters & farm equipment from verified providers. Trusted by 50,000+ farmers across India.',
    site: '@agriserve_in',
    creator: '@agriserve_in',
    images: ['/twitter-card.jpg'],
  },
  // facebook: {
  //   appId: 'YOUR_FACEBOOK_APP_ID', // Add when obtained
  // },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgriServe',
  },
  other: {
    'geo.region': 'IN',
    'geo.placename': 'India',
    'geo.position': '20.5937;78.9629',
    ICBM: '20.5937, 78.9629',
    'og:locality': 'India',
    'og:country-name': 'India',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-IN': siteUrl,
      'hi-IN': `${siteUrl}?lang=hi`,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0F0C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const analyticsEnabled =
    process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <meta
          name="google-site-verification"
          content="GhdPRhFhjOdtX1XTMrvsexiyCYFHD8KPTtKhOyZWlDM"
        />
        {/* Bing and Yandex verification - add when obtained */}
        {/* <meta name="msvalidate.01" content="YOUR_BING_META_TAG" /> */}
        {/* <meta name="yandex-verification" content="YOUR_YANDEX_TAG" /> */}
        {/* <meta name="facebook-domain-verification" content="YOUR_FB_DOMAIN_VERIFICATION" /> */}
        {/* Geo Targeting */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />
        <link rel="alternate" hrefLang="en-IN" href={siteUrl} />
        <link rel="alternate" hrefLang="hi-IN" href={`${siteUrl}?lang=hi`} />
        <link rel="alternate" hrefLang="x-default" href={siteUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
        {analyticsEnabled && (
          <Script
            id="umami-cloud"
            src="https://cloud.umami.is/script.js"
            data-website-id="c6c9d3b1-c5c8-4c49-a9f6-1ca368cc92d0"
            strategy="lazyOnload"
          />
        )}
        {analyticsEnabled && (
          <Script
            id="umami-railway"
            src="https://umami-analytics-pk.up.railway.app/script.js"
            data-website-id="a2a1c58a-8322-46dd-a7f3-2944863a2740"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className={`${inter.variable} ${playfair.variable} overflow-x-hidden antialiased`}>
        <RootAppShell>{children}</RootAppShell>
      </body>
    </html>
  );
}
