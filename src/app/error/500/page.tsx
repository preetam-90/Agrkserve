import { Metadata } from 'next';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { ErrorPageTemplate } from '@/components/system-pages/ErrorPageTemplate';
import { ErrorIllustration } from '@/components/system-pages/illustrations';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.error500);

/**
 * 500 Internal Server Error Page
 * Displayed when there's a server-side error
 */
export default function InternalServerError500Page() {
  return (
    <SystemPageLayout>
      <ErrorPageTemplate
        errorCode="500"
        title="कुछ गलत हो गया | Something Went Wrong"
        description="हमें तकनीकी समस्या हो रही है। हमारी टीम इसे ठीक कर रही है। कृपया बाद में पुनः प्रयास करें। | We are experiencing technical difficulties. Our team is working to fix this. Please try again later."
        illustration={<ErrorIllustration className="w-full h-full" />}
        primaryAction={{
          label: "होम पर जाएं | Go Home",
          href: "/",
        }}
        secondaryAction={{
          label: "सहायता से संपर्क करें | Contact Support",
          href: "/help",
        }}
      />
    </SystemPageLayout>
  );
}
