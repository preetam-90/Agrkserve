'use client';

import { useEffect } from 'react';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { ErrorPageTemplate } from '@/components/system-pages/ErrorPageTemplate';
import { ErrorIllustration } from '@/components/system-pages/illustrations';
import { logError, sanitizeErrorMessage } from '@/lib/system-pages/error-logger';

/**
 * Global Error Page
 * Catches unhandled errors in the application
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error without exposing stack trace to user
    logError('500', sanitizeErrorMessage(error), {
      digest: error.digest,
      name: error.name,
    });
  }, [error]);

  return (
    <SystemPageLayout>
      <ErrorPageTemplate
        errorCode="500"
        title="कुछ गलत हो गया | Something Went Wrong"
        description="हमें तकनीकी समस्या हो रही है। हमारी टीम इसे ठीक कर रही है। कृपया बाद में पुनः प्रयास करें। | We are experiencing technical difficulties. Our team is working to fix this. Please try again later."
        illustration={<ErrorIllustration className="w-full h-full" />}
        primaryAction={{
          label: "पुनः प्रयास करें | Try Again",
          onClick: () => reset(),
        }}
        secondaryAction={{
          label: "होम पर जाएं | Go Home",
          href: "/",
        }}
      />
    </SystemPageLayout>
  );
}
