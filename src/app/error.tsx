'use client';

import { useEffect, useState } from 'react';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { ErrorPageTemplate } from '@/components/system-pages/ErrorPageTemplate';
import { logError } from '@/lib/system-pages/error-logger';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Log the error for debugging
    console.error('Unhandled Application Error:', error);

    // Log to system pages error logger
    logError('500', error.message || 'Unknown error', {
      digest: error.digest,
      stack: error.stack,
    });

    // Delay showing the error page to avoid "immediate" flash on transient errors
    // and give the system a small window to potentially recover or for the user to not notice a flicker
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, [error]);

  // While waiting, show a simple loading state or nothing to prevent the "immediate" error display
  if (!isMounted) {
    return (
      <SystemPageLayout>
        <div className="flex min-h-[400px] animate-pulse flex-col items-center justify-center">
          <div className="mb-4 h-12 w-12 rounded-full bg-gray-100" />
          <div className="mb-2 h-4 w-48 rounded bg-gray-100" />
          <div className="h-3 w-32 rounded bg-gray-50" />
        </div>
      </SystemPageLayout>
    );
  }

  return (
    <SystemPageLayout>
      <ErrorPageTemplate
        errorCode="500"
        title="Something went wrong!"
        description="An unexpected error occurred. Our team has been notified and is working to fix it."
        illustration={
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-24 w-24 text-red-500" />
          </div>
        }
        primaryAction={{
          label: 'Try Again',
          onClick: () => reset(),
        }}
        secondaryAction={{
          label: 'Go Home',
          href: '/',
        }}
      />
    </SystemPageLayout>
  );
}
