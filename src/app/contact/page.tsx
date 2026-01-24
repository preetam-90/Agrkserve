import { Metadata } from 'next';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.contact);

/**
 * Contact Us Page
 * Contact information and support options
 */
export default function ContactPage() {
  return (
    <SystemPageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            संपर्क करें | Contact Us
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            हम आपकी मदद के लिए यहां हैं। किसी भी सवाल के लिए हमसे संपर्क करें।
          </p>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help. Contact us for any questions.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Phone */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  फोन | Phone
                </h3>
                <p className="text-gray-600 mb-2">
                  हमें कॉल करें | Call us
                </p>
                <a
                  href="tel:+911800XXXXXX"
                  className="text-green-600 font-medium hover:text-green-700"
                >
                  +91 1800-XXX-XXXX
                </a>
                <p className="text-sm text-gray-500 mt-2">
                  टोल-फ्री | Toll-free
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ईमेल | Email
                </h3>
                <p className="text-gray-600 mb-2">
                  हमें लिखें | Write to us
                </p>
                <a
                  href="mailto:support@agriserve.in"
                  className="text-green-600 font-medium hover:text-green-700 break-all"
                >
                  support@agriserve.in
                </a>
                <p className="text-sm text-gray-500 mt-2">
                  24 घंटे में जवाब | Reply within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  WhatsApp
                </h3>
                <p className="text-gray-600 mb-2">
                  त्वरित सहायता | Quick support
                </p>
                <a
                  href="https://wa.me/911800XXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-medium hover:text-green-700"
                >
                  +91 1800-XXX-XXXX
                </a>
                <p className="text-sm text-gray-500 mt-2">
                  सोमवार - शनिवार | Mon - Sat
                </p>
              </div>
            </div>
          </div>

          {/* Office */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  कार्यालय | Office
                </h3>
                <p className="text-gray-600 mb-2">
                  हमसे मिलें | Visit us
                </p>
                <address className="text-gray-700 not-italic">
                  AgriServe Technologies<br />
                  Bangalore, Karnataka<br />
                  India - 560001
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-green-50 rounded-lg p-6 mb-12">
          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                कार्य समय | Business Hours
              </h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>सोमवार - शुक्रवार | Monday - Friday:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>शनिवार | Saturday:</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>रविवार | Sunday:</span>
                  <span className="font-medium text-red-600">बंद | Closed</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                * आपातकालीन सहायता 24/7 उपलब्ध | Emergency support available 24/7
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            अक्सर पूछे जाने वाले प्रश्न | Frequently Asked Questions
          </h3>
          <p className="text-gray-600 mb-6">
            शायद आपका जवाब पहले से ही हमारे FAQ में है।
          </p>
          <p className="text-gray-600 mb-6">
            Your answer might already be in our FAQ.
          </p>
          <a
            href="/help"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            FAQ देखें | View FAQ
          </a>
        </div>
      </div>
    </SystemPageLayout>
  );
}
