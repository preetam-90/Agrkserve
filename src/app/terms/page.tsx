"use client";

import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Scale,
  ChevronDown,
  ChevronUp,
  Search,
  Clock,
  Shield,
  Users,
  DollarSign,
  Gavel,
  AlertOctagon,
  History,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useState } from 'react';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { cn } from '@/lib/utils';

// Terms data structure
const termsSections = [
  {
    id: 'intro',
    title: 'परिचय | Introduction',
    icon: FileText,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          AgriServe का उपयोग करके, आप इन नियमों और शर्तों से सहमत होते हैं। कृपया ध्यान से पढ़ें।
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          By using AgriServe, you agree to these terms and conditions. Please read carefully.
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">
              आपकी सहमति के लिए धन्यवाद! | Thank you for your consent!
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'use-of-service',
    title: 'सेवा का उपयोग | Use of Service',
    icon: Shield,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          AgriServe एक कृषि उपकरण किराया मंच है। आप सहमत हैं कि:
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          AgriServe is an agricultural equipment rental platform. You agree that:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 dark:text-gray-300">
          <li>आप 18 वर्ष या उससे अधिक आयु के हैं | You are 18 years or older</li>
          <li>आप सही जानकारी प्रदान करेंगे | You will provide accurate information</li>
          <li>आप अपने खाते की सुरक्षा के लिए जिम्मेदार हैं | You are responsible for your account security</li>
          <li>आप कानूनी उद्देश्यों के लिए सेवा का उपयोग करेंगे | You will use the service for legal purposes</li>
        </ul>
      </div>
    )
  },
  {
    id: 'bookings-payments',
    title: 'बुकिंग और भुगतान | Bookings and Payments',
    icon: DollarSign,
    content: (
      <div className="space-y-6">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-3">
            किराएदार के लिए | For Renters:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 dark:text-gray-300">
            <li>बुकिंग पुष्टि के बाद भुगतान करें | Pay after booking confirmation</li>
            <li>उपकरण को अच्छी स्थिति में रखें | Keep equipment in good condition</li>
            <li>समय पर उपकरण वापस करें | Return equipment on time</li>
            <li>किसी भी क्षति की रिपोर्ट करें | Report any damage</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-3">
            उपकरण मालिकों के लिए | For Equipment Owners:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 dark:text-gray-300">
            <li>सही उपकरण विवरण प्रदान करें | Provide accurate equipment details</li>
            <li>उपकरण अच्छी कार्य स्थिति में हो | Equipment must be in good working condition</li>
            <li>समय पर उपकरण उपलब्ध कराएं | Provide equipment on time</li>
            <li>उचित मूल्य निर्धारण करें | Set fair pricing</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'cancellation-refunds',
    title: 'रद्दीकरण और रिफंड | Cancellation and Refunds',
    icon: Clock,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 font-medium">रद्दीकरण नीति | Cancellation Policy:</p>
        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              24 घंटे पहले रद्द करने पर 100% रिफंड | 100% refund if cancelled 24 hours before
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-gray-700 dark:text-gray-300">
              12-24 घंटे पहले रद्द करने पर 50% रिफंड | 50% refund if cancelled 12-24 hours before
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-gray-700 dark:text-gray-300">
              12 घंटे से कम समय पर कोई रिफंड नहीं | No refund if cancelled less than 12 hours
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          रिफंड 5-7 कार्य दिवसों में | Refunds within 5-7 business days
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          विस्तृत रिफंड नीति के लिए, <a href="/refund-policy" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline">यहां क्लिक करें</a>।
        </p>
      </div>
    )
  },
  {
    id: 'liability',
    title: 'जिम्मेदारी और देयता | Responsibility and Liability',
    icon: AlertOctagon,
    content: (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">महत्वपूर्ण | Important:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>AgriServe केवल एक मंच है, उपकरण का मालिक नहीं | AgriServe is only a platform, not equipment owner</li>
                <li>उपकरण की गुणवत्ता मालिक की जिम्मेदारी है | Equipment quality is owner's responsibility</li>
                <li>किराएदार उपकरण क्षति के लिए जिम्मेदार है | Renter is responsible for equipment damage</li>
                <li>दुर्घटना या चोट के लिए AgriServe जिम्मेदार नहीं | AgriServe not liable for accidents or injuries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'prohibited-activities',
    title: 'निषिद्ध गतिविधियां | Prohibited Activities',
    icon: Gavel,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          निम्नलिखित गतिविधियां निषिद्ध हैं | The following activities are prohibited:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { text: 'झूठी जानकारी प्रदान करना | Providing false information', icon: XCircle },
            { text: 'धोखाधड़ी या घोटाला | Fraud or scam', icon: XCircle },
            { text: 'अवैध गतिविधियां | Illegal activities', icon: XCircle },
            { text: 'दूसरों को परेशान करना | Harassing others', icon: XCircle },
            { text: 'मंच का दुरुपयोग | Platform misuse', icon: XCircle },
            { text: 'स्पैम या अवांछित संदेश | Spam or unwanted messages', icon: XCircle },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <item.icon className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'account-suspension',
    title: 'खाता निलंबन | Account Suspension',
    icon: Users,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          हम निम्नलिखित स्थितियों में खाता निलंबित कर सकते हैं:
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          We may suspend accounts in the following situations:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 dark:text-gray-300">
          <li>नियमों का उल्लंघन | Violation of terms</li>
          <li>धोखाधड़ी की गतिविधि | Fraudulent activity</li>
          <li>कई शिकायतें | Multiple complaints</li>
          <li>भुगतान विफलता | Payment failure</li>
          <li>अनुचित व्यवहार | Inappropriate behavior</li>
        </ul>
      </div>
    )
  },
  {
    id: 'dispute-resolution',
    title: 'विवाद समाधान | Dispute Resolution',
    icon: Scale,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          विवाद की स्थिति में | In case of disputes:
        </p>
        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700 dark:text-gray-300">
          <li>पहले दूसरे पक्ष से बात करें | First talk to the other party</li>
          <li>AgriServe सहायता से संपर्क करें | Contact AgriServe support</li>
          <li>हम मध्यस्थता करने का प्रयास करेंगे | We will try to mediate</li>
          <li>यदि आवश्यक हो तो कानूनी कार्रवाई | Legal action if necessary</li>
        </ol>
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-blue-800 dark:text-blue-200">
            सभी विवाद भारतीय कानून के अधीन होंगे। | All disputes will be subject to Indian law.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'changes-to-terms',
    title: 'नियमों में बदलाव | Changes to Terms',
    icon: History,
    content: (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <History className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                हम किसी भी समय इन नियमों को बदल सकते हैं। महत्वपूर्ण बदलावों के बारे में हम आपको सूचित करेंगे।
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We may change these terms at any time. We will notify you of significant changes.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                सेवा का निरंतर उपयोग नए नियमों की स्वीकृति माना जाएगा। | Continued use of the service will be considered acceptance of new terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

// Client component for accordion sections
function TermsAccordionSection({ 
  section, 
  isOpen, 
  onToggle,
  index 
}: { 
  section: typeof termsSections[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-green-900/10">
      <button
        onClick={onToggle}
        className={cn(
          "w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-300",
          isOpen 
            ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10" 
            : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300",
            isOpen 
              ? "bg-green-100 dark:bg-green-900/30" 
              : "bg-gray-100 dark:bg-gray-700"
          )}>
            <section.icon className={cn(
              "h-5 w-5 transition-colors duration-300",
              isOpen ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-300"
            )} />
          </div>
          <div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              0{index + 1}
            </span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {section.title}
            </h2>
          </div>
        </div>
        <ChevronDown className={cn(
          "h-5 w-5 text-gray-400 transition-transform duration-300",
          isOpen && "rotate-180"
        )} />
      </button>
      
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100">
          {section.content}
        </div>
      </div>
    </div>
  );
}

// Searchable Table of Contents
function TableOfContents({ 
  activeId, 
  onNavigate 
}: { 
  activeId: string | null;
  onNavigate: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = termsSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sticky top-32">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Table of Contents
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
      
      <nav className="space-y-1">
        {filteredSections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2",
              activeId === section.id
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <span className="text-green-600 dark:text-green-400 font-mono">0{index + 1}.</span>
            <span className="truncate">{section.title.split('|')[1]?.trim() || section.title.split('|')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Hero Section Component
function TermsHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-teal-900/10 rounded-2xl p-8 md:p-12 mb-8">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 dark:bg-green-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 dark:bg-teal-800/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-lg">
          <Scale className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          नियम और शर्तें | Terms & Conditions
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          अंतिम अपडेट: जनवरी 2026 | Last Updated: January 2026
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
            ✓ बाध्यकारी | Binding
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
            ✓ कानूनी | Legal
          </span>
          <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
            ✓ अद्यतन | Updated
          </span>
        </div>
      </div>
    </div>
  );
}

// Contact Card Component
function ContactCard() {
  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-4">संपर्क करें | Contact Us</h3>
      <p className="text-green-100 mb-4">
        नियमों से संबंधित प्रश्नों के लिए: | For questions about terms:
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Mail className="h-5 w-5" />
          </div>
          <span>legal@agriserve.in</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Phone className="h-5 w-5" />
          </div>
          <span>+91 1800-XXX-XXXX</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <MapPin className="h-5 w-5" />
          </div>
          <span>AgriServe Technologies, Bangalore, India</span>
        </div>
      </div>
    </div>
  );
}

// Main Page Component with client-side interactivity
export default function TermsPage() {
  const [openSection, setOpenSection] = useState<string | null>('intro');
  const [activeId, setActiveId] = useState<string | null>('intro');

  const handleNavigate = (id: string) => {
    setOpenSection(id);
    setActiveId(id);
  };

  return (
    <SystemPageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <TermsHero />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sidebar */}
          <div className="lg:col-span-1">
            <TableOfContents activeId={activeId} onNavigate={handleNavigate} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {termsSections.map((section, index) => (
              <TermsAccordionSection
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
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                ये नियम अंतिम बार जनवरी 2026 में अपडेट किए गए थे। | These terms were last updated in January 2026.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SystemPageLayout>
  );
}
