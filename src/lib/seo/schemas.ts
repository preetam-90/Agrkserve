// Enhanced JSON-LD schemas for better SEO and GEO optimization
// This file provides comprehensive structured data for search engines and AI models

import { getSiteUrl } from '@/lib/seo/site-url';

const siteUrl = getSiteUrl();

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'AgriServe',
  alternateName: 'AgriServe India',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    "AgriServe is India's leading farm equipment rental platform, connecting farmers with verified equipment providers for tractors, harvesters, and agricultural machinery.",
  foundingDate: '2024',
  foundingLocation: {
    '@type': 'Place',
    name: 'India',
  },
  sameAs: [
    'https://www.facebook.com/agriserve.in',
    'https://www.twitter.com/agriserve_in',
    'https://www.instagram.com/agriserve.in',
    'https://www.linkedin.com/company/agriserve',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-1800-AGRISERVE',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
      areaServed: 'IN',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '06:00',
        closes: '22:00',
      },
    },
    {
      '@type': 'ContactPoint',
      telephone: '+91-1800-AGRISERVE',
      contactType: 'technical support',
      availableLanguage: ['English', 'Hindi'],
      areaServed: 'IN',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
    addressRegion: 'India',
  },
};

// LocalBusiness Schema with enhanced details
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteUrl}/#localbusiness`,
  name: 'AgriServe',
  description:
    'Farm equipment rental platform connecting farmers with verified equipment providers across India. Rent tractors, harvesters, cultivators, and more.',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: `${siteUrl}/og-image.jpg`,
  telephone: '+91-1800-AGRISERVE',
  priceRange: '₹₹',
  paymentAccepted: 'Cash, UPI, Bank Transfer, Credit Card, Debit Card',
  currenciesAccepted: 'INR',
  areaServed: [
    {
      '@type': 'Country',
      name: 'India',
      sameAs: 'https://en.wikipedia.org/wiki/India',
    },
    // Northern India — Primary Focus
    { '@type': 'State', name: 'Punjab', sameAs: 'https://en.wikipedia.org/wiki/Punjab,_India' },
    { '@type': 'State', name: 'Haryana', sameAs: 'https://en.wikipedia.org/wiki/Haryana' },
    {
      '@type': 'State',
      name: 'Uttar Pradesh',
      sameAs: 'https://en.wikipedia.org/wiki/Uttar_Pradesh',
    },
    { '@type': 'State', name: 'Rajasthan', sameAs: 'https://en.wikipedia.org/wiki/Rajasthan' },
    {
      '@type': 'State',
      name: 'Madhya Pradesh',
      sameAs: 'https://en.wikipedia.org/wiki/Madhya_Pradesh',
    },
    { '@type': 'State', name: 'Bihar', sameAs: 'https://en.wikipedia.org/wiki/Bihar' },
    { '@type': 'State', name: 'Uttarakhand', sameAs: 'https://en.wikipedia.org/wiki/Uttarakhand' },
    {
      '@type': 'State',
      name: 'Himachal Pradesh',
      sameAs: 'https://en.wikipedia.org/wiki/Himachal_Pradesh',
    },
    { '@type': 'State', name: 'Jharkhand', sameAs: 'https://en.wikipedia.org/wiki/Jharkhand' },
    {
      '@type': 'State',
      name: 'Chhattisgarh',
      sameAs: 'https://en.wikipedia.org/wiki/Chhattisgarh',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Delhi NCR',
      sameAs: 'https://en.wikipedia.org/wiki/Delhi',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Chandigarh',
      sameAs: 'https://en.wikipedia.org/wiki/Chandigarh',
    },
    {
      '@type': 'State',
      name: 'Jammu and Kashmir',
      sameAs: 'https://en.wikipedia.org/wiki/Jammu_and_Kashmir_(union_territory)',
    },
    // Western & Southern India
    { '@type': 'State', name: 'Maharashtra', sameAs: 'https://en.wikipedia.org/wiki/Maharashtra' },
    { '@type': 'State', name: 'Gujarat', sameAs: 'https://en.wikipedia.org/wiki/Gujarat' },
    { '@type': 'State', name: 'Karnataka', sameAs: 'https://en.wikipedia.org/wiki/Karnataka' },
    { '@type': 'State', name: 'Tamil Nadu', sameAs: 'https://en.wikipedia.org/wiki/Tamil_Nadu' },
    {
      '@type': 'State',
      name: 'Andhra Pradesh',
      sameAs: 'https://en.wikipedia.org/wiki/Andhra_Pradesh',
    },
    { '@type': 'State', name: 'Telangana', sameAs: 'https://en.wikipedia.org/wiki/Telangana' },
    { '@type': 'State', name: 'Kerala', sameAs: 'https://en.wikipedia.org/wiki/Kerala' },
    // Eastern India
    { '@type': 'State', name: 'West Bengal', sameAs: 'https://en.wikipedia.org/wiki/West_Bengal' },
    { '@type': 'State', name: 'Odisha', sameAs: 'https://en.wikipedia.org/wiki/Odisha' },
    { '@type': 'State', name: 'Assam', sameAs: 'https://en.wikipedia.org/wiki/Assam' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
    addressRegion: 'India',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '20.5937',
    longitude: '78.9629',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '06:00',
    closes: '22:00',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '8500',
  },
  slogan: 'Empowering Indian Farmers with Affordable Equipment Access',
};

// Service Schema
export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${siteUrl}/#service`,
  name: 'Farm Equipment Rental',
  description:
    'Rent tractors, harvesters, cultivators, rotavators, and agricultural machinery from verified providers. Flexible rental periods, affordable rates, and reliable service.',
  provider: {
    '@id': `${siteUrl}/#organization`,
  },
  areaServed: 'India',
  serviceType: 'Equipment Rental',
  category: 'Agricultural Services',
  termsOfService: `${siteUrl}/terms`,
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: siteUrl,
    servicePhone: '+91-1800-AGRISERVE',
    serviceSmsNumber: '+91-1800-AGRISERVE',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Farm Equipment',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Tractor Rental',
          description: 'Rent tractors from 20HP to 60HP+. Available across all major states.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Harvester Rental',
          description: 'Combine harvesters and crop-specific harvesters for efficient harvesting.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Cultivator Rental',
          description: 'Cultivators for soil preparation and weed management.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Rotavator Rental',
          description: 'Rotavators for efficient tillage and seedbed preparation.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Seed Drill Rental',
          description: 'Precision seed drills for efficient sowing and planting.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Sprayer Rental',
          description: 'Agricultural sprayers for pesticide and fertilizer application.',
        },
      },
    ],
  },
  // Labour Services
  hasOfferCatalog2: undefined, // Separate catalogue not needed, adding via additionalType
  additionalType: 'https://schema.org/EmploymentAgency',
  serviceOutput: [
    {
      '@type': 'Thing',
      name: 'Harvesting Labour',
      description: 'Skilled agricultural workers for crop harvesting across India.',
    },
    {
      '@type': 'Thing',
      name: 'Planting & Sowing Labour',
      description: 'Experienced workers for seed planting and sowing operations.',
    },
    {
      '@type': 'Thing',
      name: 'Land Preparation Labour',
      description: 'Workers for land preparation, clearing, and leveling.',
    },
    {
      '@type': 'Thing',
      name: 'Irrigation Labour',
      description: 'Skilled workers for irrigation system setup and management.',
    },
    {
      '@type': 'Thing',
      name: 'Crop Spraying Labour',
      description: 'Trained workers for pesticide and fertilizer spraying.',
    },
    {
      '@type': 'Thing',
      name: 'Weeding Labour',
      description: 'Agricultural workers for manual and mechanical weeding.',
    },
  ],
};

// WebSite Schema with SearchAction
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  url: siteUrl,
  name: 'AgriServe',
  alternateName: 'AgriServe India',
  description:
    'Rent farm equipment from verified providers across India. Tractors, harvesters, and agricultural machinery at affordable rates.',
  publisher: {
    '@id': `${siteUrl}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/equipment?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: ['en-IN', 'hi-IN'],
};

// BreadcrumbList Schema
export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': `${siteUrl}/#breadcrumb`,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
  ],
};

// FAQ Schema for GEO optimization
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does AgriServe farm equipment rental work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AgriServe connects farmers with verified equipment providers. Browse available equipment, select rental dates, book online, and receive equipment at your farm. Payment is flexible with UPI, cash, or bank transfer.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of farm equipment can I rent on AgriServe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can rent tractors (20HP-60HP+), harvesters, cultivators, rotavators, ploughs, seed drills, sprayers, and specialized agricultural machinery across India.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which states does AgriServe operate in?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AgriServe operates across all of India with primary focus on Northern Indian states including Punjab, Haryana, Uttar Pradesh, Rajasthan, Madhya Pradesh, Bihar, Uttarakhand, Himachal Pradesh, Jharkhand, Chhattisgarh, Delhi NCR, and Jammu & Kashmir. We also serve Maharashtra, Gujarat, Karnataka, Tamil Nadu, Andhra Pradesh, Telangana, Kerala, West Bengal, Odisha, and Assam.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are equipment providers verified on AgriServe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, all equipment providers undergo verification including document checks, equipment quality inspection, and background verification to ensure reliability and safety.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the cost of renting farm equipment on AgriServe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rental costs vary by equipment type, location, and duration. Tractors typically range from ₹500-2000/day, harvesters ₹2000-5000/day. Browse equipment listings for specific pricing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I rent equipment for multiple days or weeks?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, AgriServe supports flexible rental periods - daily, weekly, and monthly rentals. Longer rentals often receive discounted rates.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if rented equipment breaks down?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Equipment providers are responsible for maintenance and repairs. Contact the provider immediately through AgriServe messaging for quick resolution.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to provide a security deposit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Security deposit requirements vary by provider and equipment type. Deposit details are clearly mentioned in each equipment listing before booking.',
      },
    },
  ],
};

// Product Schema Template (for individual equipment pages)
export const createProductSchema = (product: {
  name: string;
  description: string;
  price: string;
  category: string;
  location: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  category: product.category,
  image: product.image || `${siteUrl}/logo.png`,
  brand: {
    '@type': 'Brand',
    name: 'AgriServe',
  },
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: siteUrl,
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    seller: {
      '@type': 'Organization',
      name: 'AgriServe',
    },
  },
  ...(product.rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      bestRating: '5',
      worstRating: '1',
      ratingCount: product.reviewCount?.toString() || '100',
    },
  }),
  areaServed: product.location,
});

// Combine all schemas for the root layout
export const rootJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationSchema,
    localBusinessSchema,
    serviceSchema,
    websiteSchema,
    breadcrumbSchema,
  ],
};
