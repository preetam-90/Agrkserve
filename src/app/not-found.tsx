'use client';

import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { ErrorPageTemplate } from '@/components/system-pages/ErrorPageTemplate';
import { ErrorIllustration } from '@/components/system-pages/illustrations';

/**
 * 404 Not Found Page
 * Displayed when a user navigates to a non-existent page
 */
export default function NotFoundPage() {
  return (
    <SystemPageLayout>
      <ErrorPageTemplate
        errorCode="404"
        title="पृष्ठ नहीं मिला | Page Not Found"
        description="आप जो पृष्ठ खोज रहे हैं वह मौजूद नहीं है या हटा दिया गया है। | The page you are looking for does not exist or has been moved."
        illustration={<ErrorIllustration className="w-full h-full" />}
        primaryAction={{
          label: "होम पर जाएं | Go Home",
          href: "/",
        }}
        showSearchBar={true}
        showPopularCategories={true}
      />
    </SystemPageLayout>
  );
}
