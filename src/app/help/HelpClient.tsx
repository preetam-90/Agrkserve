'use client';

import { useRef, useState, useEffect } from 'react';
import { Mail, Phone, Users, ChevronDown, Sparkles, Tractor, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { BackButton } from '@/components/ui/back-button';

// FAQPage JSON-LD for SEO
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  name: 'Help Center - Frequently Asked Questions',
  description:
    "Find answers to common questions about AgriServe's agricultural equipment rental and labor hiring services in India.",
  url: 'https://agriserve.in/help',
  inLanguage: 'en-IN',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is AgriServe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "AgriServe is India's leading platform connecting farmers with equipment providers and agricultural laborers. List your tractors, harvesters, tools or offer your services as agricultural labor.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is AgriServe free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Creating an account, browsing listings, and listing equipment/labor is completely free. We charge a small service fee (5-10%) only on successful bookings to maintain the platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which areas do you cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We operate across all major agricultural regions in India including Punjab, Haryana, UP, Maharashtra, Karnataka, and more. You can search for equipment and labor in your specific location.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I rent equipment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Search for equipment (tractor, harvester, sprayer, etc.), select dates, check availability, and book directly. You can message the owner before booking to discuss details.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I hire agricultural labor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Browse labour profiles, check their skills (harvesting, planting, irrigation, etc.), view ratings and reviews, then book them for your required dates. Communication is direct through our messaging system.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do payments work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pay securely through UPI, cards, or net banking. Payment is held in escrow and released to the provider only after successful completion. Refunds are automatic for cancelled bookings.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel a booking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Free cancellation 24+ hours before booking start. Within 24 hours, 50% fee applies. Provider cancellations are penalized to protect renters.',
      },
    },
  ],
  about: {
    '@type': 'Thing',
    name: 'Agricultural Equipment Rental Platform',
    description:
      "India's trusted platform for renting tractors, harvesters, and hiring skilled agricultural labor",
  },
  audience: {
    '@type': 'Audience',
    audienceType: ['Farmers', 'Equipment Owners', 'Agricultural Workers'],
    geographicArea: {
      '@type': 'Place',
      name: 'India',
    },
  },
};

const faqCategories = [
  {
    id: 'general',
    title: 'General',
    titleHi: 'सामान्य',
    questions: [
      {
        q: 'What is AgriServe?',
        qHi: 'AgriServe क्या है?',
        a: "AgriServe is India's leading platform connecting farmers with equipment providers and agricultural laborers. List your tractors, harvesters, tools or offer your services as agricultural labor.",
        aHi: 'AgriServe भारत का अग्रणी मंच है जो किसानों को उपकरण प्रदाताओं और कृषि श्रमिकों से जोड़ता है। अपने ट्रैक्टर, हार्वेस्टर, उपकरण सूचीबद्ध करें या कृषि श्रमिक के रूप में अपनी सेवाएं प्रदान करें।',
      },
      {
        q: 'Is AgriServe free to use?',
        qHi: 'क्या AgriServe उपयोग करने के लिए मुफ्त है?',
        a: 'Yes! Creating an account, browsing listings, and listing equipment/labor is completely free. We charge a small service fee (5-10%) only on successful bookings to maintain the platform.',
        aHi: 'हां! खाता बनाना, सूची देखना और उपकरण/श्रम सूचीबद्ध करना पूरी तरह से मुफ्त है। प्लेटफ़ॉर्म को बनाए रखने के लिए हम केवल सफल बुकिंग पर एक छोटा सेवा शुल्क (5-10%) लेते हैं।',
      },
      {
        q: 'Which areas do you cover?',
        qHi: 'आप कौन से क्षेत्रों को कवर करते हैं?',
        a: 'We operate across all major agricultural regions in India including Punjab, Haryana, UP, Maharashtra, Karnataka, and more. You can search for equipment and labor in your specific location.',
        aHi: 'हम पंजाब, हरियाणा, यूपी, महाराष्ट्र, कर्नाटक और अधिक सहित भारत के सभी प्रमुख कृषि क्षेत्रों में काम करते हैं। आप अपने विशिष्ट स्थान पर उपकरण और श्रम खोज सकते हैं।',
      },
    ],
  },
  {
    id: 'equipment',
    title: 'Equipment Rental',
    titleHi: 'उपकरण किराया',
    questions: [
      {
        q: 'How do I rent equipment?',
        qHi: 'मैं उपकरण कैसे किराए पर लूं?',
        a: 'Search for equipment (tractor, harvester, sprayer, etc.), select dates, check availability, and book directly. You can message the owner before booking to discuss details.',
        aHi: 'उपकरण (ट्रैक्टर, हार्वेस्टर, स्प्रेयर, आदि) खोजें, तारीखें चुनें, उपलब्धता जांचें और सीधे बुक करें। विवरण पर चर्चा करने के लिए आप बुकिंग से पहले मालिक को संदेश भेज सकते हैं।',
      },
      {
        q: 'How do I list my equipment?',
        qHi: 'मैं अपना उपकरण कैसे सूचीबद्ध करूं?',
        a: 'Go to Provider Dashboard → My Equipment → Add New. Upload photos, add specifications, set your rental price per day/hour, and publish. Your listing will be visible immediately.',
        aHi: 'प्रदाता डैशबोर्ड → मेरा उपकरण → नया जोड़ें पर जाएं। फोटो अपलोड करें, विनिर्देश जोड़ें, प्रति दिन/घंटे किराया मूल्य निर्धारित करें और प्रकाशित करें। आपकी सूची तुरंत दिखाई देगी।',
      },
      {
        q: 'What types of equipment can I list?',
        qHi: 'मैं किस प्रकार के उपकरण सूचीबद्ध कर सकता हूं?',
        a: 'Tractors, harvesters, tillers, seeders, sprayers, ploughs, cultivators, and any other agricultural machinery. Each category has specific fields to help buyers find exactly what they need.',
        aHi: 'ट्रैक्टर, हार्वेस्टर, टिलर, सीडर, स्प्रेयर, हल, कल्टीवेटर और कोई अन्य कृषि मशीनरी। प्रत्येक श्रेणी में विशिष्ट फ़ील्ड हैं जो खरीदारों को वही खोजने में मदद करती हैं जो उन्हें चाहिए।',
      },
    ],
  },
  {
    id: 'labour',
    title: 'Labour Services',
    titleHi: 'श्रमिक सेवाएं',
    questions: [
      {
        q: 'How do I hire agricultural labor?',
        qHi: 'मैं कृषि श्रमिक कैसे नियुक्त करूं?',
        a: 'Browse labour profiles, check their skills (harvesting, planting, irrigation, etc.), view ratings and reviews, then book them for your required dates. Communication is direct through our messaging system.',
        aHi: 'श्रमिक प्रोफाइल देखें, उनके कौशल (कटाई, रोपण, सिंचाई, आदि) की जांच करें, रेटिंग और समीक्षा देखें, फिर उन्हें अपनी आवश्यक तारीखों के लिए बुक करें। हमारी संदेश प्रणाली के माध्यम से संचार सीधा है।',
      },
      {
        q: 'How do I register as labour?',
        qHi: 'मैं श्रमिक के रूप में कैसे पंजीकरण करूं?',
        a: 'Create a profile, list your agricultural skills, set your daily/hourly rate, add your location and availability. Farmers in your area can then find and book you for work.',
        aHi: 'एक प्रोफ़ाइल बनाएं, अपने कृषि कौशल सूचीबद्ध करें, अपनी दैनिक/प्रति घंटा दर निर्धारित करें, अपना स्थान और उपलब्धता जोड़ें। आपके क्षेत्र के किसान आपको काम के लिए खोज और बुक कर सकते हैं।',
      },
      {
        q: 'What safety measures are in place?',
        qHi: 'कौन से सुरक्षा उपाय हैं?',
        a: 'All users are verified through phone OTP. We have a rating system, dispute resolution process, and secure payment escrow to protect both labour and farmers.',
        aHi: 'सभी उपयोगकर्ता फोन OTP के माध्यम से सत्यापित होते हैं। हमारे पास रेटिंग प्रणाली, विवाद समाधान प्रक्रिया और सुरक्षित भुगतान एस्क्रो है जो श्रम और किसानों दोनों की रक्षा करता है।',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Bookings',
    titleHi: 'भुगतान और बुकिंग',
    questions: [
      {
        q: 'How do payments work?',
        qHi: 'भुगतान कैसे काम करता है?',
        a: 'Pay securely through UPI, cards, or net banking. Payment is held in escrow and released to the provider only after successful completion. Refunds are automatic for cancelled bookings (as per policy).',
        aHi: 'UPI, कार्ड या नेट बैंकिंग के माध्यम से सुरक्षित रूप से भुगतान करें। भुगतान एस्क्रो में रखा जाता है और सफल समापन के बाद ही प्रदाता को जारी किया जाता है। रद्द की गई बुकिंग के लिए रिफंड स्वचालित है (नीति के अनुसार)।',
      },
      {
        q: 'When do providers get paid?',
        qHi: 'प्रदाताओं को भुगतान कब मिलता है?',
        a: 'Equipment owners and labour get paid within 24-48 hours after the service is marked as "Completed". Payments go directly to your linked bank account or UPI.',
        aHi: 'उपकरण मालिकों और श्रमिकों को सेवा को "पूर्ण" के रूप में चिह्नित करने के बाद 24-48 घंटों के भीतर भुगतान मिलता है। भुगतान सीधे आपके लिंक किए गए बैंक खाते या UPI में जाता है।',
      },
      {
        q: 'Can I cancel a booking?',
        qHi: 'क्या मैं बुकिंग रद्द कर सकता हूं?',
        a: 'Yes. Free cancellation 24+ hours before booking start. Within 24 hours, 50% fee applies. Provider cancellations are penalized to protect renters. Check detailed policy in Terms & Conditions.',
        aHi: 'हां। बुकिंग शुरू होने से 24+ घंटे पहले मुफ्त रद्दीकरण। 24 घंटे के भीतर, 50% शुल्क लागू होता है। किराएदारों की रक्षा के लिए प्रदाता रद्दीकरण पर दंड लगाया जाता है। नियम और शर्तों में विस्तृत नीति देखें।',
      },
    ],
  },
];

function FaqItem({
  question,
  questionHi,
  answer,
  answerHi,
}: {
  question: string;
  questionHi: string;
  answer: string;
  answerHi: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between rounded-lg px-2 py-5 text-left font-medium transition-all hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <div className="pr-8 text-base transition-transform duration-200 group-hover:translate-x-1">
          <div className="mb-1 text-white">{questionHi}</div>
          <div className="text-sm text-gray-400">{question}</div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-gray-500 transition-all duration-300',
            isOpen && 'rotate-180 scale-110 text-emerald-400'
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pb-5 pl-2 pr-8 text-sm leading-relaxed">
              <p className="text-gray-400">{answerHi}</p>
              <p className="text-gray-500">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);

  // Fix hydration: Generate particles only on client
  useEffect(() => {
     
    setMounted(true);
  }, []);

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 50]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0]);

  const helpCards = [
    {
      icon: Tractor,
      title: 'Equipment Guide',
      titleHi: 'उपकरण गाइड',
      description: 'Learn how to list and rent tractors, harvesters, and farm machinery.',
      descriptionHi: 'ट्रैक्टर, हार्वेस्टर और कृषि मशीनरी को सूचीबद्ध और किराए पर लेना सीखें।',
    },
    {
      icon: Users,
      title: 'Labour Services',
      titleHi: 'श्रमिक सेवाएं',
      description: 'Find skilled agricultural workers or register as labour for hire.',
      descriptionHi: 'कुशल कृषि श्रमिक खोजें या किराए के लिए श्रमिक के रूप में पंजीकरण करें।',
    },
    {
      icon: IndianRupee,
      title: 'Pricing & Payments',
      titleHi: 'मूल्य निर्धारण और भुगतान',
      description: 'Understand our transparent pricing and secure payment system.',
      descriptionHi: 'हमारी पारदर्शी मूल्य निर्धारण और सुरक्षित भुगतान प्रणाली को समझें।',
    },
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  // Static particle positions (fix hydration)
  const particles = [
    { x: 23, y: 81 },
    { x: 31, y: 54 },
    { x: 4, y: 69 },
    { x: 4, y: 22 },
    { x: 33, y: 100 },
    { x: 50, y: 62 },
    { x: 70, y: 12 },
    { x: 68, y: 95 },
    { x: 93, y: 75 },
    { x: 41, y: 71 },
    { x: 86, y: 82 },
    { x: 38, y: 28 },
    { x: 19, y: 18 },
    { x: 98, y: 80 },
    { x: 61, y: 6 },
  ];

  return (
    <SystemPageLayout className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div ref={containerRef} className="relative min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="pointer-events-none fixed inset-0">
          <motion.div style={{ y: y1 }} className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#22c55e10,transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_100%,#22c55e10,transparent)]" />
          </motion.div>
        </div>

        {/* Floating Particles - Only animate after mount */}
        {mounted &&
          particles.map((particle, i) => (
            <motion.div
              key={`particle-${i}`}
              className="pointer-events-none absolute"
              initial={{ x: `${particle.x}%`, y: `${particle.y}%` }}
              animate={{
                y: [`${particle.y}%`, `${(particle.y + 20) % 100}%`],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + (i % 4),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="h-1 w-1 rounded-full bg-emerald-400/40" />
            </motion.div>
          ))}

        <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-12 lg:py-16">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton variant="minimal" />
          </div>

          {/* Hero Section */}
          <motion.div
            style={{ opacity: opacity1 }}
            className="mb-16 text-center md:mb-20"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 20px rgba(34, 197, 94, 0.1)',
                  '0 0 30px rgba(34, 197, 94, 0.2)',
                  '0 0 20px rgba(34, 197, 94, 0.1)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">Help Center | सहायता केंद्र</span>
            </motion.div>

            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              <motion.span
                className="gradient-text"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                हम आपकी कैसे मदद कर सकते हैं?
              </motion.span>
            </h1>

            <motion.p
              className="mx-auto mb-2 max-w-2xl text-lg text-gray-400 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              How can we help you?
            </motion.p>

            <motion.p
              className="mx-auto mb-16 max-w-2xl text-gray-500 md:mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Find answers about equipment rental, labour services, and bookings
            </motion.p>
          </motion.div>

          {/* Quick Access Cards */}
          <motion.div
            className="mb-16 grid grid-cols-1 gap-6 md:mb-20 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            {helpCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={scaleIn}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="glass relative h-full overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] md:p-8">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <motion.div
                        className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="h-7 w-7 text-emerald-400" />
                      </motion.div>
                      <h3 className="mb-2 text-xl font-bold text-white">
                        <span className="gradient-text">{card.titleHi}</span>
                      </h3>
                      <h3 className="mb-3 text-lg font-semibold text-gray-400">{card.title}</h3>
                      <p className="mb-1 text-sm leading-relaxed text-gray-500">
                        {card.descriptionHi}
                      </p>
                      <p className="text-sm leading-relaxed text-gray-600">{card.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="mb-16 md:mb-20"
          >
            <motion.div variants={fadeInUp} className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
                <span className="gradient-text">अक्सर पूछे जाने वाले प्रश्न</span>
              </h2>
              <p className="text-lg text-gray-400">Frequently Asked Questions</p>
            </motion.div>

            {faqCategories.length > 0 ? (
              <div className="space-y-6">
                {faqCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    variants={scaleIn}
                    className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] md:p-8"
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-1 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          <span className="gradient-text">{category.titleHi}</span>
                        </h3>
                        <p className="text-gray-400">{category.title}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {category.questions.map((item, index) => (
                        <FaqItem
                          key={index}
                          question={item.q}
                          questionHi={item.qHi}
                          answer={item.a}
                          answerHi={item.aHi}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="glass rounded-2xl border-2 border-dashed border-gray-800 py-20 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-2 text-lg font-medium text-gray-400">All FAQs</p>
                <p className="text-gray-500">Browse through our frequently asked questions</p>
              </motion.div>
            )}
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={scaleIn}
          >
            <motion.div
              className="glass relative overflow-hidden rounded-2xl p-8 text-center md:p-10"
              whileHover={{ scale: 1.01 }}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
              <div className="relative z-10">
                <motion.h2
                  className="gradient-text mb-4 text-2xl font-bold md:text-3xl"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  फिर भी मदद चाहिए? | Still need help?
                </motion.h2>
                <p className="mx-auto mb-2 max-w-xl text-gray-400">
                  हमारी सहायता टीम सोमवार से शनिवार, सुबह 9:00 बजे से शाम 6:00 बजे IST तक उपलब्ध है।
                </p>
                <p className="mx-auto mb-8 max-w-xl text-gray-500">
                  Our support team is available Monday to Saturday, 9:00 AM to 6:00 PM IST.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <motion.a
                    href="mailto:support@agriserve.in"
                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mail className="h-5 w-5" />
                    Email Support
                  </motion.a>
                  <motion.a
                    href="tel:+911800XXXXXX"
                    className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-emerald-500/30 bg-white/5 px-8 py-4 font-semibold text-emerald-400 transition-all duration-300 hover:border-emerald-500/50 hover:bg-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Phone className="h-5 w-5" />
                    +91 1800-123-4567
                  </motion.a>
                </div>
                <motion.p
                  className="mt-8 border-t border-gray-800 pt-6 text-sm text-gray-500"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  औसत प्रतिक्रिया समय:{' '}
                  <span className="font-semibold text-emerald-400">2 घंटे के अंदर</span> | Average
                  response time:{' '}
                  <span className="font-semibold text-emerald-400">Under 2 hours</span>
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SystemPageLayout>
  );
}
