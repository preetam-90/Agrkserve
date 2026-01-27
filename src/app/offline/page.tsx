'use client';

import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { ErrorPageTemplate } from '@/components/system-pages/ErrorPageTemplate';
import { OfflineIllustration } from '@/components/system-pages/illustrations';

/**
 * Offline Page
 * Displayed when the user has no internet connection
 */
export default function OfflinePage() {
  const handleRetry = () => {
    // Check if online and reload
    if (navigator.onLine) {
      window.location.reload();
    } else {
      alert('अभी भी ऑफ़लाइन हैं। कृपया अपना इंटरनेट कनेक्शन जांचें। | Still offline. Please check your internet connection.');
    }
  };

  return (
    <SystemPageLayout>
      <ErrorPageTemplate
        errorCode="📡"
        title="इंटरनेट कनेक्शन नहीं | No Internet Connection"
        description="आप वर्तमान में ऑफ़लाइन हैं। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें। | You are currently offline. Please check your internet connection and try again."
        illustration={<OfflineIllustration className="w-full h-full" />}
        primaryAction={{
          label: "पुनः प्रयास करें | Retry",
          onClick: handleRetry,
        }}
        secondaryAction={{
          label: "होम पर जाएं | Go Home",
          href: "/",
        }}
      />
      
      {/* Cached data hint */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          💡 कुछ पहले देखी गई सामग्री अभी भी उपलब्ध हो सकती है
        </p>
        <p className="text-sm text-gray-500">
          💡 Some previously viewed content may still be available
        </p>
      </div>
    </SystemPageLayout>
  );
}
