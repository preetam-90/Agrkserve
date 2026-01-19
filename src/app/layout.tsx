import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgriServe - Agricultural Equipment Marketplace',
  description: 'India\'s leading hyperlocal agricultural marketplace. Rent equipment, hire skilled labour, and grow your farming business.',
  keywords: ['agriculture', 'farming', 'equipment rental', 'tractor rental', 'India', 'agricultural marketplace'],
  authors: [{ name: 'AgriServe' }],
  openGraph: {
    title: 'AgriServe - Agricultural Equipment Marketplace',
    description: 'India\'s leading hyperlocal agricultural marketplace.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'AgriServe',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
