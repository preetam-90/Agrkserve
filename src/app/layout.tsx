import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { NetworkStatus } from '@/components/system-pages/NetworkStatus';
import { AuthenticatedLayout } from '@/components/layout';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

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

export const metadata: Metadata = {
  title: 'AgriServe - Rent Farm Equipment | India\'s Trusted Agricultural Platform',
  description: 'Rent quality tractors, harvesters, and agricultural equipment from verified providers across India. Trusted by 50,000+ farmers for fair prices and reliable service.',
  keywords: ['farm equipment rental', 'tractor rental India', 'agricultural machinery', 'farm tools', 'harvester rental', 'agriculture marketplace'],
  authors: [{ name: 'AgriServe' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#D4A853' },
    ],
  },
  openGraph: {
    title: 'AgriServe - Rent Farm Equipment | India\'s Trusted Platform',
    description: 'Rent quality tractors, harvesters, and agricultural equipment from verified providers across India.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'AgriServe',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgriServe',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0F0C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth overflow-x-hidden">
      <head>
        <meta name="google-site-verification" content="GhdPRhFhjOdtX1XTMrvsexiyCYFHD8KPTtKhOyZWlDM" />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="c6c9d3b1-c5c8-4c49-a9f6-1ca368cc92d0"
        />
        <script
          defer
          src="https://umami-analytics-pk.up.railway.app/script.js"
          data-website-id="a2a1c58a-8322-46dd-a7f3-2944863a2740"
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased overflow-x-hidden`}>
        <Providers>
          <NetworkStatus />
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
