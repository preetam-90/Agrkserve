import { Metadata } from 'next';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale } from 'lucide-react';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.terms);

/**
 * Terms & Conditions Page
 * Platform rules and user obligations
 */
export default function TermsPage() {
  return (
    <SystemPageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Scale className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            नियम और शर्तें | Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600">
            अंतिम अपडेट: जनवरी 2026 | Last Updated: January 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-700 mb-2">
                AgriServe का उपयोग करके, आप इन नियमों और शर्तों से सहमत होते हैं। कृपया ध्यान से पढ़ें।
              </p>
              <p className="text-gray-700">
                By using AgriServe, you agree to these terms and conditions. Please read carefully.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. सेवा का उपयोग | Use of Service
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                AgriServe एक कृषि उपकरण किराया मंच है। आप सहमत हैं कि:
              </p>
              <p>
                AgriServe is an agricultural equipment rental platform. You agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>आप 18 वर्ष या उससे अधिक आयु के हैं | You are 18 years or older</li>
                <li>आप सही जानकारी प्रदान करेंगे | You will provide accurate information</li>
                <li>आप अपने खाते की सुरक्षा के लिए जिम्मेदार हैं | You are responsible for your account security</li>
                <li>आप कानूनी उद्देश्यों के लिए सेवा का उपयोग करेंगे | You will use the service for legal purposes</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. बुकिंग और भुगतान | Bookings and Payments
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-medium">किराएदार के लिए | For Renters:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>बुकिंग पुष्टि के बाद भुगतान करें | Pay after booking confirmation</li>
                <li>उपकरण को अच्छी स्थिति में रखें | Keep equipment in good condition</li>
                <li>समय पर उपकरण वापस करें | Return equipment on time</li>
                <li>किसी भी क्षति की रिपोर्ट करें | Report any damage</li>
              </ul>
              <p className="font-medium mt-4">उपकरण मालिकों के लिए | For Equipment Owners:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>सही उपकरण विवरण प्रदान करें | Provide accurate equipment details</li>
                <li>उपकरण अच्छी कार्य स्थिति में हो | Equipment must be in good working condition</li>
                <li>समय पर उपकरण उपलब्ध कराएं | Provide equipment on time</li>
                <li>उचित मूल्य निर्धारण करें | Set fair pricing</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. रद्दीकरण और रिफंड | Cancellation and Refunds
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>रद्दीकरण नीति | Cancellation Policy:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>24 घंटे पहले रद्द करने पर 100% रिफंड | 100% refund if cancelled 24 hours before</li>
                <li>12-24 घंटे पहले रद्द करने पर 50% रिफंड | 50% refund if cancelled 12-24 hours before</li>
                <li>12 घंटे से कम समय पर कोई रिफंड नहीं | No refund if cancelled less than 12 hours</li>
                <li>रिफंड 5-7 कार्य दिवसों में | Refunds within 5-7 business days</li>
              </ul>
              <p className="mt-3">
                विस्तृत रिफंड नीति के लिए, <a href="/refund-policy" className="text-green-600 hover:text-green-700 underline">यहां क्लिक करें</a>।
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. जिम्मेदारी और देयता | Responsibility and Liability
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-2">महत्वपूर्ण | Important:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>AgriServe केवल एक मंच है, उपकरण का मालिक नहीं | AgriServe is only a platform, not equipment owner</li>
                      <li>उपकरण की गुणवत्ता मालिक की जिम्मेदारी है | Equipment quality is owner's responsibility</li>
                      <li>किराएदार उपकरण क्षति के लिए जिम्मेदार है | Renter is responsible for equipment damage</li>
                      <li>दुर्घटना या चोट के लिए AgriServe जिम्मेदार नहीं | AgriServe not liable for accidents or injuries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. निषिद्ध गतिविधियां | Prohibited Activities
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>निम्नलिखित गतिविधियां निषिद्ध हैं | The following activities are prohibited:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">झूठी जानकारी प्रदान करना | Providing false information</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">धोखाधड़ी या घोटाला | Fraud or scam</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">अवैध गतिविधियां | Illegal activities</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">दूसरों को परेशान करना | Harassing others</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">मंच का दुरुपयोग | Platform misuse</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">स्पैम या अवांछित संदेश | Spam or unwanted messages</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. खाता निलंबन | Account Suspension
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                हम निम्नलिखित स्थितियों में खाता निलंबित कर सकते हैं:
              </p>
              <p>
                We may suspend accounts in the following situations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>नियमों का उल्लंघन | Violation of terms</li>
                <li>धोखाधड़ी की गतिविधि | Fraudulent activity</li>
                <li>कई शिकायतें | Multiple complaints</li>
                <li>भुगतान विफलता | Payment failure</li>
                <li>अनुचित व्यवहार | Inappropriate behavior</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. विवाद समाधान | Dispute Resolution
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>विवाद की स्थिति में | In case of disputes:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>पहले दूसरे पक्ष से बात करें | First talk to the other party</li>
                <li>AgriServe सहायता से संपर्क करें | Contact AgriServe support</li>
                <li>हम मध्यस्थता करने का प्रयास करेंगे | We will try to mediate</li>
                <li>यदि आवश्यक हो तो कानूनी कार्रवाई | Legal action if necessary</li>
              </ol>
              <p className="mt-3">
                सभी विवाद भारतीय कानून के अधीन होंगे।
              </p>
              <p>
                All disputes will be subject to Indian law.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. नियमों में बदलाव | Changes to Terms
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                हम किसी भी समय इन नियमों को बदल सकते हैं। महत्वपूर्ण बदलावों के बारे में हम आपको सूचित करेंगे।
              </p>
              <p>
                We may change these terms at any time. We will notify you of significant changes.
              </p>
              <p className="mt-3">
                सेवा का निरंतर उपयोग नए नियमों की स्वीकृति माना जाएगा।
              </p>
              <p>
                Continued use of the service will be considered acceptance of new terms.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                संपर्क करें | Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                नियमों से संबंधित प्रश्नों के लिए:
              </p>
              <p className="text-gray-700 mb-4">
                For questions about terms:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>📧 Email: legal@agriserve.in</p>
                <p>📞 Phone: +91 1800-XXX-XXXX</p>
                <p>📍 Address: AgriServe Technologies, Bangalore, India</p>
              </div>
            </div>
          </section>
        </div>

        {/* Last Updated */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>ये नियम अंतिम बार जनवरी 2026 में अपडेट किए गए थे।</p>
          <p>These terms were last updated in January 2026.</p>
        </div>
      </div>
    </SystemPageLayout>
  );
}
