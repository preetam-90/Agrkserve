import { Metadata } from 'next';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';
import { Shield, Lock, Eye, UserCheck, FileText, AlertCircle } from 'lucide-react';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.privacy);

/**
 * Privacy Policy Page
 * Data protection and privacy information
 */
export default function PrivacyPolicyPage() {
  return (
    <SystemPageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            गोपनीयता नीति | Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            अंतिम अपडेट: जनवरी 2026 | Last Updated: January 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-700 mb-2">
                AgriServe में, हम आपकी गोपनीयता का सम्मान करते हैं। यह नीति बताती है कि हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।
              </p>
              <p className="text-gray-700">
                At AgriServe, we respect your privacy. This policy explains how we collect, use, and protect your information.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            विषय-सूची | Table of Contents
          </h2>
          <nav className="space-y-2">
            <a href="#collection" className="block text-green-600 hover:text-green-700">
              1. जानकारी संग्रह | Information Collection
            </a>
            <a href="#usage" className="block text-green-600 hover:text-green-700">
              2. जानकारी का उपयोग | Information Usage
            </a>
            <a href="#sharing" className="block text-green-600 hover:text-green-700">
              3. जानकारी साझाकरण | Information Sharing
            </a>
            <a href="#security" className="block text-green-600 hover:text-green-700">
              4. डेटा सुरक्षा | Data Security
            </a>
            <a href="#rights" className="block text-green-600 hover:text-green-700">
              5. आपके अधिकार | Your Rights
            </a>
            <a href="#contact" className="block text-green-600 hover:text-green-700">
              6. संपर्क करें | Contact Us
            </a>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section id="collection">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  1. जानकारी संग्रह | Information Collection
                </h2>
                <p className="text-gray-700 mb-3">
                  हम निम्नलिखित जानकारी एकत्र करते हैं:
                </p>
                <p className="text-gray-700 mb-3">
                  We collect the following information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>नाम, फोन नंबर, और ईमेल | Name, phone number, and email</li>
                  <li>पता और स्थान | Address and location</li>
                  <li>उपकरण और बुकिंग विवरण | Equipment and booking details</li>
                  <li>भुगतान जानकारी | Payment information</li>
                  <li>उपयोग डेटा और लॉग | Usage data and logs</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="usage">
            <div className="flex items-start gap-3 mb-4">
              <Eye className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  2. जानकारी का उपयोग | Information Usage
                </h2>
                <p className="text-gray-700 mb-3">
                  हम आपकी जानकारी का उपयोग करते हैं:
                </p>
                <p className="text-gray-700 mb-3">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>सेवाएं प्रदान करने के लिए | Provide services</li>
                  <li>बुकिंग प्रबंधित करने के लिए | Manage bookings</li>
                  <li>भुगतान प्रक्रिया के लिए | Process payments</li>
                  <li>ग्राहक सहायता के लिए | Customer support</li>
                  <li>सेवा सुधार के लिए | Improve services</li>
                  <li>महत्वपूर्ण अपडेट भेजने के लिए | Send important updates</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="sharing">
            <div className="flex items-start gap-3 mb-4">
              <UserCheck className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  3. जानकारी साझाकरण | Information Sharing
                </h2>
                <p className="text-gray-700 mb-3">
                  हम आपकी जानकारी साझा नहीं करते, सिवाय:
                </p>
                <p className="text-gray-700 mb-3">
                  We do not share your information, except:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>बुकिंग पूरी करने के लिए उपकरण मालिकों के साथ | With equipment owners to complete bookings</li>
                  <li>भुगतान प्रक्रिया के लिए | For payment processing</li>
                  <li>कानूनी आवश्यकताओं के लिए | For legal requirements</li>
                  <li>आपकी सहमति से | With your consent</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  हम आपकी जानकारी कभी भी तीसरे पक्ष को नहीं बेचते।
                </p>
                <p className="text-gray-700">
                  We never sell your information to third parties.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="security">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  4. डेटा सुरक्षा | Data Security
                </h2>
                <p className="text-gray-700 mb-3">
                  हम आपके डेटा की सुरक्षा के लिए उद्योग-मानक उपाय करते हैं:
                </p>
                <p className="text-gray-700 mb-3">
                  We use industry-standard measures to protect your data:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>एन्क्रिप्टेड डेटा ट्रांसमिशन (SSL/TLS) | Encrypted data transmission (SSL/TLS)</li>
                  <li>सुरक्षित सर्वर और डेटाबेस | Secure servers and databases</li>
                  <li>नियमित सुरक्षा ऑडिट | Regular security audits</li>
                  <li>सीमित कर्मचारी पहुंच | Limited employee access</li>
                  <li>दो-कारक प्रमाणीकरण | Two-factor authentication</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="rights">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  5. आपके अधिकार | Your Rights
                </h2>
                <p className="text-gray-700 mb-3">
                  आपके पास निम्नलिखित अधिकार हैं:
                </p>
                <p className="text-gray-700 mb-3">
                  You have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>अपनी जानकारी देखने का अधिकार | Right to view your information</li>
                  <li>जानकारी सुधारने का अधिकार | Right to correct information</li>
                  <li>डेटा हटाने का अधिकार | Right to delete data</li>
                  <li>डेटा पोर्टेबिलिटी का अधिकार | Right to data portability</li>
                  <li>मार्केटिंग से ऑप्ट-आउट करने का अधिकार | Right to opt-out of marketing</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  इन अधिकारों का उपयोग करने के लिए, हमसे संपर्क करें।
                </p>
                <p className="text-gray-700">
                  To exercise these rights, contact us.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="contact">
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                6. संपर्क करें | Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                गोपनीयता से संबंधित प्रश्नों के लिए:
              </p>
              <p className="text-gray-700 mb-4">
                For privacy-related questions:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>📧 Email: privacy@agriserve.in</p>
                <p>📞 Phone: +91 1800-XXX-XXXX</p>
                <p>📍 Address: AgriServe Technologies, Bangalore, India</p>
              </div>
            </div>
          </section>
        </div>

        {/* Last Updated */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>यह नीति अंतिम बार जनवरी 2026 में अपडेट की गई थी।</p>
          <p>This policy was last updated in January 2026.</p>
        </div>
      </div>
    </SystemPageLayout>
  );
}
