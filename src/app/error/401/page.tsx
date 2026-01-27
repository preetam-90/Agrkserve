import { Metadata } from 'next';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { ErrorPageTemplate } from '@/components/system-pages/ErrorPageTemplate';
import { ErrorIllustration } from '@/components/system-pages/illustrations';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.error401);

/**
 * 401 Unauthorized Page
 * Displayed when user needs to login to access a resource
 */
export default function Unauthorized401Page() {
  return (
    <SystemPageLayout>
      <ErrorPageTemplate
        errorCode="401"
        title="लॉगिन आवश्यक | Login Required"
        description="इस पृष्ठ को देखने के लिए आपको लॉगिन करना होगा। कृपया लॉगिन करें या नया खाता बनाएं। | You need to login to access this page. Please login or create a new account."
        illustration={<ErrorIllustration className="w-full h-full" />}
        primaryAction={{
          label: "लॉगिन करें | Login",
          href: "/login",
        }}
        secondaryAction={{
          label: "रजिस्टर करें | Register",
          href: "/login",
        }}
      />
    </SystemPageLayout>
  );
}
