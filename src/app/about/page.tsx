'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Tractor, Users, Target, Heart, Award, TrendingUp, Sparkles } from 'lucide-react';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';

/**
 * About Us Page
 * Information about AgriServe platform, mission, and team
 */
export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 50]);
  const y2 = useTransform(scrollY, [0, 500], [0, 100]);
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

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
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
      <div ref={containerRef} className="relative min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="pointer-events-none fixed inset-0">
          <motion.div style={{ y: y1 }} className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#22c55e10,transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_100%,#22c55e10,transparent)]" />
          </motion.div>
        </div>

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="pointer-events-none absolute"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
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
              <span className="text-sm text-emerald-300">India's Leading AgTech Platform</span>
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
                हमारे बारे में | About Us
              </motion.span>
            </h1>
            <motion.p
              className="mx-auto max-w-2xl text-lg text-gray-400 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              भारत का अग्रणी कृषि उपकरण किराया मंच
            </motion.p>
            <motion.p
              className="mx-auto max-w-2xl text-lg text-gray-400 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              India's Leading Agricultural Equipment Rental Platform
            </motion.p>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={scaleIn}
            className="mb-16 md:mb-20"
          >
            <motion.div
              className="glass group relative overflow-hidden rounded-2xl p-8 md:p-10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row">
                <motion.div
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Target className="h-8 w-8 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
                    <span className="gradient-text">हमारा मिशन | Our Mission</span>
                  </h2>
                  <p className="mb-3 leading-relaxed text-gray-300">
                    AgriServe का मिशन है भारतीय किसानों को आधुनिक कृषि उपकरण और तकनीक तक आसान पहुंच
                    प्रदान करना। हम किसानों की आय बढ़ाने और खेती को अधिक लाभदायक बनाने के लिए
                    प्रतिबद्ध हैं।
                  </p>
                  <p className="leading-relaxed text-gray-400">
                    AgriServe's mission is to provide Indian farmers with easy access to modern
                    agricultural equipment and technology. We are committed to increasing farmers'
                    income and making farming more profitable.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* What We Do */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="mb-16 md:mb-20"
          >
            <motion.h2
              variants={fadeInUp}
              className="mb-10 text-center text-3xl font-bold text-white md:text-4xl"
            >
              <span className="gradient-text">हम क्या करते हैं | What We Do</span>
            </motion.h2>
            <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">
              {[
                {
                  icon: Tractor,
                  hi: 'उपकरण किराया',
                  en: 'Equipment Rental',
                  descHi:
                    'ट्रैक्टर, हार्वेस्टर, और अन्य कृषि उपकरण किफायती दरों पर किराए पर उपलब्ध।',
                  descEn:
                    'Tractors, harvesters, and other agricultural equipment available at affordable rates.',
                },
                {
                  icon: Users,
                  hi: 'श्रमिक सेवाएं',
                  en: 'Labour Services',
                  descHi: 'कुशल कृषि श्रमिकों को आसानी से खोजें और काम पर रखें।',
                  descEn: 'Easily find and hire skilled agricultural workers.',
                },
                {
                  icon: Heart,
                  hi: 'किसान-केंद्रित',
                  en: 'Farmer-Centric',
                  descHi: 'सरल, भरोसेमंद और किसानों के लिए बनाया गया प्लेटफॉर्म।',
                  descEn: 'Simple, trustworthy platform built for farmers.',
                },
                {
                  icon: TrendingUp,
                  hi: 'आय वृद्धि',
                  en: 'Income Growth',
                  descHi: 'उपकरण मालिकों को अपने उपकरण से अतिरिक्त आय अर्जित करने में मदद।',
                  descEn: 'Help equipment owners earn extra income from their equipment.',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="group"
                >
                  <motion.div
                    className="glass relative h-full overflow-hidden rounded-2xl p-6 md:p-8"
                    whileHover={{
                      boxShadow: '0 0 40px rgba(34, 197, 94, 0.15)',
                    }}
                  >
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative z-10">
                      <motion.div
                        className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <item.icon className="h-7 w-7 text-emerald-400" />
                      </motion.div>
                      <h3 className="mb-3 text-xl font-semibold text-white">
                        <span className="gradient-text">{item.hi}</span>
                      </h3>
                      <h3 className="mb-3 text-xl font-semibold text-white">{item.en}</h3>
                      <p className="mb-2 text-gray-400">{item.descHi}</p>
                      <p className="text-sm text-gray-500">{item.descEn}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="mb-16 md:mb-20"
          >
            <motion.div
              variants={scaleIn}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-600 p-8 md:p-10"
            >
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              />
              <div className="relative z-10">
                <motion.h2 className="mb-10 text-center text-3xl font-bold text-white md:text-4xl">
                  हमारी उपलब्धियां | Our Achievements
                </motion.h2>
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-2 gap-6 md:grid-cols-4"
                >
                  {[
                    { value: '10,000+', label: 'किसान', en: 'Farmers' },
                    { value: '5,000+', label: 'उपकरण', en: 'Equipment' },
                    { value: '50,000+', label: 'बुकिंग', en: 'Bookings' },
                    { value: '100+', label: 'शहर', en: 'Cities' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      variants={scaleIn}
                      className="group text-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div
                        className="mb-2 text-4xl font-bold text-white md:text-5xl"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="text-white/90">{stat.label}</div>
                      <div className="text-sm text-white/70">{stat.en}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="mb-16 md:mb-20"
          >
            <motion.h2
              variants={fadeInUp}
              className="mb-10 text-center text-3xl font-bold text-white md:text-4xl"
            >
              <span className="gradient-text">हमारे मूल्य | Our Values</span>
            </motion.h2>
            <motion.div variants={containerVariants} className="space-y-4">
              {[
                {
                  hi: 'विश्वास',
                  en: 'Trust',
                  descHi: 'हम पारदर्शिता और ईमानदारी में विश्वास करते हैं।',
                  descEn: 'We believe in transparency and honesty.',
                },
                {
                  hi: 'सरलता',
                  en: 'Simplicity',
                  descHi: 'हम तकनीक को सरल और सुलभ बनाते हैं।',
                  descEn: 'We make technology simple and accessible.',
                },
                {
                  hi: 'समर्थन',
                  en: 'Support',
                  descHi: 'हम हमेशा किसानों की मदद के लिए तैयार हैं।',
                  descEn: 'We are always ready to help farmers.',
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ x: 10 }}
                  className="group"
                >
                  <motion.div
                    className="glass relative flex items-start gap-5 overflow-hidden rounded-xl p-5 md:p-6"
                    whileHover={{
                      backgroundColor: 'rgba(34, 197, 94, 0.05)',
                    }}
                  >
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <motion.div
                      className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                    >
                      <Award className="h-6 w-6 text-emerald-400" />
                    </motion.div>
                    <div className="relative z-10">
                      <h3 className="mb-1 font-semibold text-white">
                        <span className="gradient-text">{value.hi}</span>
                      </h3>
                      <h3 className="mb-1 font-semibold text-white">{value.en}</h3>
                      <p className="text-sm text-gray-400">{value.descHi}</p>
                      <p className="text-sm text-gray-500">{value.descEn}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Contact Section */}
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
                  हमसे जुड़ें | Get In Touch
                </motion.h2>
                <p className="mx-auto mb-8 max-w-xl text-gray-400">
                  कोई सवाल? हम मदद के लिए यहां हैं। | Any questions? We're here to help.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <motion.a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    संपर्क करें | Contact Us
                  </motion.a>
                  <motion.a
                    href="/help"
                    className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-500/30 bg-white/5 px-8 py-4 font-semibold text-emerald-400 transition-all duration-300 hover:border-emerald-500/50 hover:bg-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    सहायता केंद्र | Help Center
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SystemPageLayout>
  );
}
