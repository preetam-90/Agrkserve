/**
 * Page Metadata Generation Utility
 * Generates SEO-friendly metadata for system pages
 */

import { Metadata } from 'next';

interface SystemPageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  noindex?: boolean; // For error pages
  canonical?: string;
}

/**
 * Generates metadata for system pages
 */
export function generateSystemPageMetadata(config: SystemPageMetadata): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://agriServe.com';

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    robots: config.noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: config.ogTitle,
      description: config.ogDescription,
      images: config.ogImage ? [{ url: config.ogImage }] : undefined,
      type: 'website',
      siteName: 'AgriServe',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.ogTitle,
      description: config.ogDescription,
      images: config.ogImage ? [config.ogImage] : undefined,
    },
    alternates: {
      canonical: config.canonical ? `${baseUrl}${config.canonical}` : undefined,
    },
  };
}

/**
 * Metadata configurations for different page types
 */
export const metadataConfigs = {
  // Error pages
  error400: {
    title: 'गलत अनुरोध - AgriServe | Bad Request - AgriServe',
    description:
      'आपका अनुरोध सही नहीं है। कृपया पुनः प्रयास करें। | Your request is invalid. Please try again.',
    keywords: ['error', 'bad request', 'त्रुटि'],
    ogTitle: 'गलत अनुरोध | Bad Request',
    ogDescription: 'कृपया पुनः प्रयास करें | Please try again',
    noindex: true,
  },
  error401: {
    title: 'लॉगिन आवश्यक - AgriServe | Login Required - AgriServe',
    description: 'कृपया जारी रखने के लिए लॉगिन करें। | Please login to continue.',
    keywords: ['login', 'authentication', 'लॉगिन'],
    ogTitle: 'लॉगिन आवश्यक | Login Required',
    ogDescription: 'कृपया अपने खाते में लॉगिन करें | Please login to your account',
    noindex: true,
  },
  error403: {
    title: 'पहुंच अस्वीकृत - AgriServe | Access Denied - AgriServe',
    description:
      'आपको इस पृष्ठ तक पहुंचने की अनुमति नहीं है। | You do not have permission to access this page.',
    keywords: ['forbidden', 'access denied', 'अस्वीकृत'],
    ogTitle: 'पहुंच अस्वीकृत | Access Denied',
    ogDescription: 'आपको यह करने की अनुमति नहीं है | You are not authorized',
    noindex: true,
  },
  error404: {
    title: 'पृष्ठ नहीं मिला - AgriServe | Page Not Found - AgriServe',
    description:
      'यह पृष्ठ मौजूद नहीं है। उपकरण खोजें या होम पर जाएं। | This page does not exist. Search equipment or go home.',
    keywords: ['not found', 'missing page', 'नहीं मिला'],
    ogTitle: 'पृष्ठ नहीं मिला | Page Not Found',
    ogDescription: 'यह पृष्ठ मौजूद नहीं है | This page does not exist',
    noindex: true,
  },
  error408: {
    title: 'समय समाप्त - AgriServe | Request Timeout - AgriServe',
    description:
      'आपका कनेक्शन धीमा है। कृपया पुनः प्रयास करें। | Your connection is slow. Please try again.',
    keywords: ['timeout', 'slow connection', 'समय समाप्त'],
    ogTitle: 'समय समाप्त | Request Timeout',
    ogDescription: 'कृपया पुनः प्रयास करें | Please try again',
    noindex: true,
  },
  error500: {
    title: 'सर्वर त्रुटि - AgriServe | Server Error - AgriServe',
    description: 'कुछ गलत हो गया। हम इसे ठीक कर रहे हैं। | Something went wrong. We are fixing it.',
    keywords: ['server error', 'technical issue', 'सर्वर त्रुटि'],
    ogTitle: 'सर्वर त्रुटि | Server Error',
    ogDescription: 'हम इसे ठीक कर रहे हैं | We are fixing it',
    noindex: true,
  },

  // Network pages
  offline: {
    title: 'ऑफ़लाइन - AgriServe | Offline - AgriServe',
    description:
      'आप ऑफ़लाइन हैं। कृपया अपना इंटरनेट कनेक्शन जांचें। | You are offline. Please check your internet connection.',
    keywords: ['offline', 'no internet', 'ऑफ़लाइन'],
    ogTitle: 'ऑफ़लाइन | Offline',
    ogDescription: 'इंटरनेट कनेक्शन जांचें | Check internet connection',
    noindex: true,
  },

  // Legal pages
  about: {
    title: 'हमारे बारे में - AgriServe | About Us - AgriServe',
    description:
      "AgriServe भारत का अग्रणी कृषि उपकरण किराया मंच है। | AgriServe is India's leading agricultural equipment rental platform.",
    keywords: ['about', 'company', 'mission', 'हमारे बारे में'],
    ogTitle: 'हमारे बारे में | About Us',
    ogDescription: "भारत का अग्रणी कृषि मंच | India's leading agri platform",
    canonical: '/about',
  },
  contact: {
    title: 'संपर्क करें - AgriServe | Contact Us - AgriServe',
    description: 'हमसे संपर्क करें। फोन, ईमेल या पता। | Contact us. Phone, email or address.',
    keywords: ['contact', 'support', 'help', 'संपर्क'],
    ogTitle: 'संपर्क करें | Contact Us',
    ogDescription: 'हमसे संपर्क करें | Get in touch with us',
    canonical: '/contact',
  },
  faq: {
    title: 'सामान्य प्रश्न - AgriServe | FAQ - AgriServe',
    description: 'अक्सर पूछे जाने वाले प्रश्न और उत्तर। | Frequently asked questions and answers.',
    keywords: ['faq', 'questions', 'help', 'प्रश्न'],
    ogTitle: 'सामान्य प्रश्न | FAQ',
    ogDescription: 'आपके प्रश्नों के उत्तर | Answers to your questions',
    canonical: '/faq',
  },
  privacy: {
    title: 'गोपनीयता नीति - AgriServe | Privacy Policy - AgriServe',
    description: 'हम आपके डेटा की सुरक्षा कैसे करते हैं। | How we protect your data.',
    keywords: ['privacy', 'data protection', 'security', 'गोपनीयता'],
    ogTitle: 'गोपनीयता नीति | Privacy Policy',
    ogDescription: 'आपका डेटा सुरक्षित है | Your data is safe',
    canonical: '/privacy',
  },
  terms: {
    title: 'नियम और शर्तें - AgriServe | Terms & Conditions - AgriServe',
    description: 'AgriServe उपयोग के नियम और शर्तें। | AgriServe terms and conditions of use.',
    keywords: ['terms', 'conditions', 'rules', 'नियम'],
    ogTitle: 'नियम और शर्तें | Terms & Conditions',
    ogDescription: 'उपयोग के नियम | Terms of use',
    canonical: '/terms',
  },
  refundPolicy: {
    title: 'रिफंड नीति - AgriServe | Refund Policy - AgriServe',
    description: 'रिफंड और रद्दीकरण नीति। | Refund and cancellation policy.',
    keywords: ['refund', 'cancellation', 'policy', 'रिफंड'],
    ogTitle: 'रिफंड नीति | Refund Policy',
    ogDescription: 'रिफंड और रद्दीकरण | Refund and cancellation',
    canonical: '/refund-policy',
  },
};
