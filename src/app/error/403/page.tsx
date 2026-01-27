import { Metadata } from 'next';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { ErrorPageTemplate } from '@/components/system-pages/ErrorPageTemplate';
import { ErrorIllustration } from '@/components/system-pages/illustrations';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.error403);

/**
 * 403 Forbidden Page
 * Displayed when user doesn't have permission to access a resource
 */
export default function Forbidden403Page() {
  return (
    <SystemPageLayout>
      <ErrorPageTemplate
        errorCode="403"
        title="पहुंच अस्वीकृत | Access Denied"
        description="आपको इस पृष्ठ को देखने की अनुमति नहीं है। यदि आपको लगता है कि यह गलती है तो सहायता से संपर्क करें। | You do not have permission to view this page. Please contact support if you think this is a mistake."
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
