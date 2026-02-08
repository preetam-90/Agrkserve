'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageSquare, Sparkles } from 'lucide-react';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { useContactInfo } from '@/lib/hooks/useContactInfo';

// LocalBusiness JSON-LD for SEO
const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'AgriServe',
  description:
    "India's leading agricultural equipment rental and labor hiring platform. Rent tractors, harvesters, and farm machinery or hire skilled agricultural workers.",
  url: 'https://agriserve.in',
  telephone: '+91-1800-XXX-XXXX',
  email: 'support@agriserve.in',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'AgriServe Technologies',
    addressLocality: 'Bangalore',
    addressRegion: 'Karnataka',
    postalCode: '560001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '12.9716',
    longitude: '77.5946',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '17:00',
    },
  ],
  areaServed: [
    { '@type': 'Country', name: 'India' },
    { '@type': 'AdministrativeArea', name: 'Maharashtra' },
    { '@type': 'AdministrativeArea', name: 'Karnataka' },
    { '@type': 'AdministrativeArea', name: 'Tamil Nadu' },
    { '@type': 'AdministrativeArea', name: 'Gujarat' },
    { '@type': 'AdministrativeArea', name: 'Punjab' },
    { '@type': 'AdministrativeArea', name: 'Haryana' },
    { '@type': 'AdministrativeArea', name: 'Uttar Pradesh' },
  ],
  serviceType: [
    'Agricultural Equipment Rental',
    'Farm Machinery Hire',
    'Tractor Rental',
    'Harvester Rental',
    'Agricultural Labor Hiring',
    'Farm Worker Booking',
  ],
  priceRange: '₹₹₹',
  paymentAccepted: 'Cash, UPI, Credit Card, Net Banking',
  currenciesAccepted: 'INR',
};

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const { contactInfo } = useContactInfo();
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      initialX: number;
      initialY: number;
      animateY: [number, number];
      duration: number;
    }>
  >([]);

  // Generate particle data only on client to avoid hydration mismatch
  useEffect(() => {
    // Generate particles after mount
    const newParticles = [...Array(15)].map((_, i) => ({
      id: i,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      animateY: [Math.random() * 100, Math.random() * 100] as [number, number],
      duration: 4 + Math.random() * 4,
    }));
    // Defer state updates to avoid cascading renders warning
    setTimeout(() => {
      setParticles(newParticles);
      setMounted(true);
    }, 0);
  }, []);

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 50]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
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

  return (
    <SystemPageLayout className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
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

        {/* Floating Particles - Only render on client to avoid hydration mismatch */}
        {mounted &&
          particles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              className="pointer-events-none absolute"
              initial={{
                x: `${particle.initialX}%`,
                y: `${particle.initialY}%`,
              }}
              animate={{
                y: [`${particle.animateY[0]}%`, `${particle.animateY[1]}%`],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="h-1 w-1 rounded-full bg-emerald-400/40" />
            </motion.div>
          ))}

        <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-12 lg:py-16">
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
              <span className="text-sm text-emerald-300">We&apos;re Here To Help</span>
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
                संपर्क करें | Contact Us
              </motion.span>
            </h1>
            <motion.p
              className="mx-auto max-w-2xl text-lg text-gray-400 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              हम आपकी मदद के लिए यहां हैं। किसी भी सवाल के लिए हमसे संपर्क करें।
            </motion.p>
            <motion.p
              className="mx-auto max-w-2xl text-lg text-gray-400 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              We&apos;re here to help. Contact us for any questions.
            </motion.p>
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="mb-16 md:mb-20"
          >
            <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">
              {[
                {
                  icon: Phone,
                  hi: 'फोन',
                  en: 'Phone',
                  actionHi: 'हमें कॉल करें',
                  actionEn: 'Call us',
                  value: contactInfo.phone,
                  link: `tel:${contactInfo.phone.replace(/\s/g, '')}`,
                  extraHi: 'टोल-फ्री',
                  extraEn: 'Toll-free',
                },
                {
                  icon: Mail,
                  hi: 'ईमेल',
                  en: 'Email',
                  actionHi: 'हमें लिखें',
                  actionEn: 'Write to us',
                  value: contactInfo.email,
                  link: `mailto:${contactInfo.email}`,
                  extraHi: '24 घंटे में जवाब',
                  extraEn: 'Reply within 24 hours',
                },
                {
                  icon: MessageSquare,
                  hi: 'WhatsApp',
                  en: 'WhatsApp',
                  actionHi: 'त्वरित सहायता',
                  actionEn: 'Quick support',
                  value: contactInfo.whatsapp || contactInfo.phone,
                  link: `https://wa.me/${(contactInfo.whatsapp || contactInfo.phone).replace(/[^0-9]/g, '')}`,
                  extraHi: 'सोमवार - शनिवार',
                  extraEn: 'Mon - Sat',
                  external: true,
                },
                {
                  icon: MapPin,
                  hi: 'कार्यालय',
                  en: 'Office',
                  actionHi: 'हमसे मिलें',
                  actionEn: 'Visit us',
                  value: contactInfo.address,
                  link: '',
                  extraHi: '',
                  extraEn: '',
                },
              ].map((method, index) => (
                <motion.div key={index} variants={scaleIn} whileHover={{ y: -5 }} className="group">
                  <motion.div
                    className="glass relative h-full overflow-hidden rounded-2xl p-6 md:p-8"
                    whileHover={{
                      boxShadow: '0 0 40px rgba(34, 197, 94, 0.15)',
                    }}
                  >
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <method.icon className="h-7 w-7 text-emerald-400" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-semibold text-white">
                            <span className="gradient-text">{method.hi}</span>
                          </h3>
                          <h3 className="mb-2 text-lg font-semibold text-white">{method.en}</h3>
                          <p className="mb-2 text-gray-400">{method.actionHi}</p>
                          <p className="mb-2 text-gray-400">{method.actionEn}</p>
                          {method.link ? (
                            method.external ? (
                              <a
                                href={method.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                              >
                                {method.value}
                              </a>
                            ) : (
                              <a
                                href={method.link}
                                className="inline-block break-all font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                              >
                                {method.value}
                              </a>
                            )
                          ) : (
                            <address className="whitespace-pre-line not-italic text-gray-300">
                              {method.value}
                            </address>
                          )}
                          {method.extraHi && (
                            <>
                              <p className="mt-2 text-sm text-gray-500">{method.extraHi}</p>
                              <p className="text-sm text-gray-500">{method.extraEn}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Business Hours */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInLeft}
            className="mb-16 md:mb-20"
          >
            <motion.div className="glass rounded-2xl p-6 md:p-8" whileHover={{ scale: 1.01 }}>
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                >
                  <Clock className="h-6 w-6 text-emerald-400" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="mb-4 text-xl font-semibold text-white">
                    <span className="gradient-text">कार्य समय | Business Hours</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        hi: 'सोमवार - शुक्रवार',
                        en: 'Monday - Friday',
                        time: contactInfo.hours.weekday,
                      },
                      {
                        hi: 'शनिवार',
                        en: 'Saturday',
                        time: contactInfo.hours.saturday,
                      },
                      {
                        hi: 'रविवार',
                        en: 'Sunday',
                        time: contactInfo.hours.sunday,
                        isClosed:
                          contactInfo.hours.sunday.toLowerCase().includes('closed') ||
                          contactInfo.hours.sunday.toLowerCase().includes('बंद'),
                      },
                    ].map((schedule, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center justify-between rounded-lg p-3 ${
                          schedule.isClosed ? 'bg-red-500/10' : 'bg-white/5'
                        }`}
                        whileHover={{ x: 5 }}
                      >
                        <div>
                          <span className="text-gray-300">{schedule.hi}</span>
                          <span className="ml-2 text-gray-400">{schedule.en}</span>
                        </div>
                        <span
                          className={`font-medium ${
                            schedule.isClosed ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {schedule.time}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.p
                    className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-gray-400"
                    animate={{
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  >
                    * आपातकालीन सहायता 24/7 उपलब्ध | Emergency support available 24/7
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* FAQ Link */}
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
                <motion.h3
                  className="gradient-text mb-4 text-2xl font-semibold md:text-3xl"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  अक्सर पूछे जाने वाले प्रश्न | Frequently Asked Questions
                </motion.h3>
                <p className="mx-auto mb-8 max-w-xl text-gray-400">
                  शायद आपका जवाब पहले से ही हमारे FAQ में है।
                </p>
                <p className="mx-auto mb-8 max-w-xl text-gray-400">
                  Your answer might already be in our FAQ.
                </p>
                <motion.a
                  href="/help"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  FAQ देखें | View FAQ
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SystemPageLayout>
  );
}
