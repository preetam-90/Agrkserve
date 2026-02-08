'use client';

import {
  Shield,
  Lock,
  Eye,
  UserCheck,
  FileText,
  ChevronDown,
  Search,
  Mail,
  Phone,
  MapPin,
  Database,
  Globe,
  ShieldCheck,
  Hand,
} from 'lucide-react';
import { useState } from 'react';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { cn } from '@/lib/utils';

// PrivacyPolicy JSON-LD for SEO
const privacyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  description:
    'AgriServe Privacy Policy - Learn how we collect, use, and protect your personal information. Your privacy is our priority.',
  url: 'https://agriserve.in/privacy',
  inLanguage: 'en-IN',
  datePublished: '2025-01-01',
  dateModified: '2026-01-01',
  author: {
    '@type': 'Organization',
    name: 'AgriServe',
    url: 'https://agriserve.in',
  },
  publisher: {
    '@type': 'Organization',
    name: 'AgriServe',
    logo: {
      '@type': 'ImageObject',
      url: 'https://agriserve.in/logo.png',
    },
  },
  about: {
    '@type': 'Thing',
    name: 'Data Privacy',
    description: 'Personal data collection, usage, and protection practices',
  },
  mainEntity: {
    '@type': 'PrivacyPolicy',
    name: 'AgriServe Privacy Policy',
    url: 'https://agriserve.in/privacy',
    datePublished: '2025-01-01',
    dateModified: '2026-01-01',
    author: {
      '@type': 'Organization',
      name: 'AgriServe',
    },
    about: [
      'Information Collection',
      'Information Usage',
      'Data Sharing',
      'Data Security',
      'User Rights',
      'Cookies and Tracking',
      'International Data Transfers',
    ],
  },
};

// Privacy policy data structure
const privacySections = [
  {
    id: 'intro',
    title: 'परिचय | Introduction',
    icon: Shield,
    content: (
      <div className="space-y-4">
        <div className="rounded-r-lg border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                AgriServe में, हम आपकी गोपनीयता का सम्मान करते हैं। यह नीति बताती है कि हम आपकी
                जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                At AgriServe, we respect your privacy. This policy explains how we collect, use, and
                protect your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'collection',
    title: 'जानकारी संग्रह | Information Collection',
    icon: Database,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">हम निम्नलिखित जानकारी एकत्र करते हैं:</p>
        <p className="text-gray-700 dark:text-gray-300">We collect the following information:</p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { text: 'नाम, फोन नंबर, और ईमेल | Name, phone number, and email', icon: FileText },
            { text: 'पता और स्थान | Address and location', icon: MapPin },
            { text: 'उपकरण और बुकिंग विवरण | Equipment and booking details', icon: Database },
            { text: 'भुगतान जानकारी | Payment information', icon: Lock },
            { text: 'उपयोग डेटा और लॉग | Usage data and logs', icon: Eye },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'usage',
    title: 'जानकारी का उपयोग | Information Usage',
    icon: Eye,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">हम आपकी जानकारी का उपयोग करते हैं:</p>
        <p className="text-gray-700 dark:text-gray-300">We use your information to:</p>
        <div className="grid gap-3">
          {[
            { text: 'सेवाएं प्रदान करने के लिए | Provide services', icon: Shield },
            { text: 'बुकिंग प्रबंधित करने के लिए | Manage bookings', icon: Database },
            { text: 'भुगतान प्रक्रिया के लिए | Process payments', icon: Lock },
            { text: 'ग्राहक सहायता के लिए | Customer support', icon: Hand },
            { text: 'सेवा सुधार के लिए | Improve services', icon: Eye },
            { text: 'महत्वपूर्ण अपडेट भेजने के लिए | Send important updates', icon: Mail },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20"
            >
              <item.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'sharing',
    title: 'जानकारी साझाकरण | Information Sharing',
    icon: UserCheck,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">हम आपकी जानकारी साझा नहीं करते, सिवाय:</p>
        <p className="text-gray-700 dark:text-gray-300">
          We do not share your information, except:
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              text: 'बुकिंग पूरी करने के लिए उपकरण मालिकों के साथ | With equipment owners to complete bookings',
              icon: UserCheck,
            },
            { text: 'भुगतान प्रक्रिया के लिए | For payment processing', icon: Lock },
            { text: 'कानूनी आवश्यकताओं के लिए | For legal requirements', icon: Shield },
            { text: 'आपकी सहमति से | With your consent', icon: Hand },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20"
            >
              <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="rounded-r-lg border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">
              हम आपकी जानकारी कभी भी तीसरे पक्ष को नहीं बेचते। | We never sell your information to
              third parties.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'security',
    title: 'डेटा सुरक्षा | Data Security',
    icon: Lock,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          हम आपके डेटा की सुरक्षा के लिए उद्योग-मानक उपाय करते हैं:
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          We use industry-standard measures to protect your data:
        </p>
        <div className="grid gap-3">
          {[
            {
              text: 'एन्क्रिप्टेड डेटा ट्रांसमिशन (SSL/TLS) | Encrypted data transmission (SSL/TLS)',
              icon: Lock,
            },
            { text: 'सुरक्षित सर्वर और डेटाबेस | Secure servers and databases', icon: Database },
            { text: 'नियमित सुरक्षा ऑडिट | Regular security audits', icon: Shield },
            { text: 'सीमित कर्मचारी पहुंच | Limited employee access', icon: UserCheck },
            { text: 'दो-कारक प्रमाणीकरण | Two-factor authentication', icon: ShieldCheck },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20"
            >
              <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'rights',
    title: 'आपके अधिकार | Your Rights',
    icon: Hand,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">आपके पास निम्नलिखित अधिकार हैं:</p>
        <p className="text-gray-700 dark:text-gray-300">You have the following rights:</p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { text: 'अपनी जानकारी देखने का अधिकार | Right to view your information', icon: Eye },
            { text: 'जानकारी सुधारने का अधिकार | Right to correct information', icon: FileText },
            { text: 'डेटा हटाने का अधिकार | Right to delete data', icon: Hand },
            { text: 'डेटा पोर्टेबिलिटी का अधिकार | Right to data portability', icon: Database },
            {
              text: 'मार्केटिंग से ऑप्ट-आउट करने का अधिकार | Right to opt-out of marketing',
              icon: Shield,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20"
            >
              <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-blue-800 dark:text-blue-200">
            इन अधिकारों का उपयोग करने के लिए, हमसे संपर्क करें। | To exercise these rights, contact
            us.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'cookies',
    title: 'कुकीज़ और ट्रैकिंग | Cookies and Tracking',
    icon: Globe,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          हम वेबसाइट सुधार के लिए कुकीज़ का उपयोग करते हैं:
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          We use cookies to improve website experience:
        </p>
        <div className="grid gap-3">
          {[
            { text: 'आवश्यक कुकीज़ | Essential cookies', icon: Shield },
            { text: 'प्रदर्शन कुकीज़ | Performance cookies', icon: Eye },
            { text: 'कार्यात्मक कुकीज़ | Functional cookies', icon: Database },
            { text: 'विज्ञापन कुकीज़ | Advertising cookies', icon: ShieldCheck },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          आप अपने ब्राउज़र सेटिंग्स में कुकीज़ अक्षम कर सकते हैं। | You can disable cookies in your
          browser settings.
        </p>
      </div>
    ),
  },
  {
    id: 'international',
    title: 'अंतर्राष्ट्रीय डेटा स्थानांतरण | International Data Transfers',
    icon: Globe,
    content: (
      <div className="space-y-4">
        <div className="rounded-r-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div className="space-y-2">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                महत्वपूर्ण | Important:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>
                  आपकी जानकारी भारत में संग्रहीत की जाती है | Your information is stored in India
                </li>
                <li>
                  हम डेटा स्थानांतरण के लिए सुरक्षा उपाय करते हैं | We ensure security measures for
                  data transfers
                </li>
                <li>हम कानूनी आवश्यकताओं का पालन करते हैं | We comply with legal requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

// Client component for accordion sections
function PrivacyAccordionSection({
  section,
  isOpen,
  onToggle,
  index,
}: {
  section: (typeof privacySections)[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:hover:shadow-xl dark:hover:shadow-green-900/10">
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-300',
          isOpen
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10'
            : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300',
              isOpen ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            <section.icon
              className={cn(
                'h-5 w-5 transition-colors duration-300',
                isOpen ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'
              )}
            />
          </div>
          <div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              0{index + 1}
            </span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-gray-400 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="border-t border-gray-100 bg-white p-6 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
          {section.content}
        </div>
      </div>
    </div>
  );
}

// Searchable Table of Contents
function TableOfContents({
  activeId,
  onNavigate,
}: {
  activeId: string | null;
  onNavigate: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = privacySections.filter((section) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sticky top-32 rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Table of Contents
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search privacy policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <nav className="space-y-1">
        {filteredSections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200',
              activeId === section.id
                ? 'bg-green-100 font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
            )}
          >
            <span className="font-mono text-green-600 dark:text-green-400">0{index + 1}.</span>
            <span className="truncate">
              {section.title.split('|')[1]?.trim() || section.title.split('|')[0]}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Hero Section Component
function PrivacyHero() {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 md:p-12 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-teal-900/10">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-green-200/30 blur-3xl dark:bg-green-800/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-800/20" />
      </div>

      <div className="relative z-10 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
          गोपनीयता नीति | Privacy Policy
        </h1>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          अंतिम अपडेट: जनवरी 2026 | Last Updated: January 2026
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            ✓ सुरक्षित | Secure
          </span>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            ✓ कानूनी | Legal
          </span>
          <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            ✓ पारदर्शी | Transparent
          </span>
        </div>
      </div>
    </div>
  );
}

// Contact Card Component
function ContactCard() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
      <h3 className="mb-4 text-xl font-bold">संपर्क करें | Contact Us</h3>
      <p className="mb-4 text-green-100">
        गोपनीयता से संबंधित प्रश्नों के लिए: | For privacy-related questions:
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Mail className="h-5 w-5" />
          </div>
          <span>privacy@agriserve.in</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Phone className="h-5 w-5" />
          </div>
          <span>+91 1800-XXX-XXXX</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <MapPin className="h-5 w-5" />
          </div>
          <span>AgriServe Technologies, Bangalore, India</span>
        </div>
      </div>
    </div>
  );
}

// Main Page Component with client-side interactivity
export default function PrivacyPolicyPage() {
  const [openSection, setOpenSection] = useState<string | null>('intro');
  const [activeId, setActiveId] = useState<string | null>('intro');

  const handleNavigate = (id: string) => {
    setOpenSection(id);
    setActiveId(id);
  };

  return (
    <SystemPageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
      />
      <div className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <PrivacyHero />

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Table of Contents - Sidebar */}
          <div className="lg:col-span-1">
            <TableOfContents activeId={activeId} onNavigate={handleNavigate} />
          </div>

          {/* Main Content */}
          <div className="space-y-6 lg:col-span-3">
            {privacySections.map((section, index) => (
              <PrivacyAccordionSection
                key={section.id}
                section={section}
                index={index}
                isOpen={openSection === section.id}
                onToggle={() => setOpenSection(openSection === section.id ? null : section.id)}
              />
            ))}

            {/* Contact Section */}
            <div className="mt-8">
              <ContactCard />
            </div>

            {/* Last Updated */}
            <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                यह नीति अंतिम बार जनवरी 2026 में अपडेट की गई थी। | This policy was last updated in
                January 2026.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SystemPageLayout>
  );
}
