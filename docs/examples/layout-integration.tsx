/**
 * Root Layout Integration Example
 *
 * Shows how to integrate animation providers into Next.js app
 */

import { GSAPProvider } from '@/lib/animations/gsap-context';
import { EnhancedSmoothScroll } from '@/components/EnhancedSmoothScroll';
import { FPSMonitor } from '@/lib/animations/performance-monitor';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GSAPProvider>
          <EnhancedSmoothScroll>
            {children}

            {/* Enable FPS monitor in development */}
            <FPSMonitor show={process.env.NODE_ENV === 'development'} />
          </EnhancedSmoothScroll>
        </GSAPProvider>
      </body>
    </html>
  );
}
