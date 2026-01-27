import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { NetworkStatus } from '@/components/system-pages/NetworkStatus';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgriServe - Agricultural Equipment Marketplace',
  description: 'India\'s leading hyperlocal agricultural marketplace. Rent equipment, hire skilled labour, and grow your farming business.',
  keywords: ['agriculture', 'farming', 'equipment rental', 'tractor rental', 'India', 'agricultural marketplace'],
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
      { rel: 'mask-icon', url: '/favicon.svg', color: '#14b8a6' },
    ],
  },
  openGraph: {
    title: 'AgriServe - Agricultural Equipment Marketplace',
    description: 'India\'s leading hyperlocal agricultural marketplace.',
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
  themeColor: '#14b8a6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <NetworkStatus />
          {children}
        </Providers>
      </body>
    </html>
  );
}
