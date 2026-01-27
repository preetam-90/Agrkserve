import { Metadata } from 'next';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';
import { Tractor, Users, Target, Heart, Award, TrendingUp } from 'lucide-react';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.about);

/**
 * About Us Page
 * Information about AgriServe platform, mission, and team
 */
export default function AboutPage() {
  return (
    <SystemPageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            हमारे बारे में | About Us
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            भारत का अग्रणी कृषि उपकरण किराया मंच
          </p>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            India's Leading Agricultural Equipment Rental Platform
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-green-50 rounded-lg p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                हमारा मिशन | Our Mission
              </h2>
              <p className="text-gray-700 mb-3">
                AgriServe का मिशन है भारतीय किसानों को आधुनिक कृषि उपकरण और तकनीक तक आसान पहुंच प्रदान करना। हम किसानों की आय बढ़ाने और खेती को अधिक लाभदायक बनाने के लिए प्रतिबद्ध हैं।
              </p>
              <p className="text-gray-700">
                AgriServe's mission is to provide Indian farmers with easy access to modern agricultural equipment and technology. We are committed to increasing farmers' income and making farming more profitable.
              </p>
            </div>
          </div>
        </div>

        {/* What We Do */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            हम क्या करते हैं | What We Do
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Tractor className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                उपकरण किराया | Equipment Rental
              </h3>
              <p className="text-gray-600">
                ट्रैक्टर, हार्वेस्टर, और अन्य कृषि उपकरण किफायती दरों पर किराए पर उपलब्ध।
              </p>
              <p className="text-gray-600 mt-2">
                Tractors, harvesters, and other agricultural equipment available at affordable rates.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Users className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                श्रमिक सेवाएं | Labour Services
              </h3>
              <p className="text-gray-600">
                कुशल कृषि श्रमिकों को आसानी से खोजें और काम पर रखें।
              </p>
              <p className="text-gray-600 mt-2">
                Easily find and hire skilled agricultural workers.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Heart className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                किसान-केंद्रित | Farmer-Centric
              </h3>
              <p className="text-gray-600">
                सरल, भरोसेमंद और किसानों के लिए बनाया गया प्लेटफॉर्म।
              </p>
              <p className="text-gray-600 mt-2">
                Simple, trustworthy platform built for farmers.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <TrendingUp className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                आय वृद्धि | Income Growth
              </h3>
              <p className="text-gray-600">
                उपकरण मालिकों को अपने उपकरण से अतिरिक्त आय अर्जित करने में मदद।
              </p>
              <p className="text-gray-600 mt-2">
                Help equipment owners earn extra income from their equipment.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 mb-12 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            हमारी उपलब्धियां | Our Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-sm md:text-base opacity-90">किसान | Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">5,000+</div>
              <div className="text-sm md:text-base opacity-90">उपकरण | Equipment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">50,000+</div>
              <div className="text-sm md:text-base opacity-90">बुकिंग | Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">100+</div>
              <div className="text-sm md:text-base opacity-90">शहर | Cities</div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            हमारे मूल्य | Our Values
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">विश्वास | Trust</h3>
                <p className="text-gray-600 text-sm">
                  हम पारदर्शिता और ईमानदारी में विश्वास करते हैं। | We believe in transparency and honesty.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">सरलता | Simplicity</h3>
                <p className="text-gray-600 text-sm">
                  हम तकनीक को सरल और सुलभ बनाते हैं। | We make technology simple and accessible.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">समर्थन | Support</h3>
                <p className="text-gray-600 text-sm">
                  हम हमेशा किसानों की मदद के लिए तैयार हैं। | We are always ready to help farmers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            हमसे जुड़ें | Get In Touch
          </h2>
          <p className="text-gray-600 mb-6">
            कोई सवाल? हम मदद के लिए यहां हैं। | Any questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              संपर्क करें | Contact Us
            </a>
            <a
              href="/help"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 font-medium rounded-lg border-2 border-green-600 hover:bg-green-50 transition-colors"
            >
              सहायता केंद्र | Help Center
            </a>
          </div>
        </div>
      </div>
    </SystemPageLayout>
  );
}
