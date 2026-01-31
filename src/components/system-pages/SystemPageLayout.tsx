'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

export interface SystemPageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * SystemPageLayout Component
 * Consistent layout wrapper for all system pages
 *
 * Features:
 * - Semantic HTML structure (header, main, footer)
 * - Responsive container with mobile-first breakpoints
 * - Consistent header/footer integration
 * - Accessibility landmarks
 * - SEO-friendly structure
 */
export function SystemPageLayout({
  children,
  showHeader = true,
  showFooter = true,
  className,
}: SystemPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      {showHeader && <Header />}

      {/* Main Content */}
      <main className={cn('w-full flex-1', showHeader && 'pt-28', className)} role="main">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">{children}</div>
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}
