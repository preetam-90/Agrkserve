import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import EquipmentDetailClient from './EquipmentDetailClient';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('equipment')
    .select('name, description, location_name, category, images')
    .eq('id', id)
    .single();

  if (!data) {
    return {
      title: 'Equipment Not Found - AgriServe',
    };
  }

  const location = data.location_name || 'India';
  const title = `${data.name} - Rent in ${location} | AgriServe`;
  const description =
    data.description?.slice(0, 160) ||
    `Rent ${data.name} in ${location} on AgriServe. Best prices, verified providers. Book agricultural equipment online across India. किराये पर ${data.name} लें।`;
  const imageUrl = data.images?.[0] || `${BASE_URL}/og-image.jpg`;

  return {
    title,
    description,
    keywords: [
      `${data.name} rent`,
      `${data.name} hire ${location}`,
      `${data.name} booking`,
      `farm equipment ${location}`,
      `agricultural machinery ${location}`,
      data.category ? `${data.category} rental India` : 'equipment rental India',
      `${data.name} किराया`,
      `कृषि उपकरण ${location}`,
      'AgriServe equipment',
      'tractor rental near me',
    ],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/equipment/item/${id}`,
      siteName: 'AgriServe',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${data.name} - AgriServe` }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${BASE_URL}/equipment/item/${id}`,
    },
  };
}

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('equipment')
    .select('id, name, description, location_name, daily_rate, category, images, owner_id, status')
    .eq('id', id)
    .single();

  // Calculate valid until date (90 days from now)
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 90);
  const priceValidUntil = validUntil.toISOString().split('T')[0];

  // Product + Offer JSON-LD for rich search results
  const productJsonLd = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description || `Rent ${data.name} on AgriServe`,
        image: data.images?.[0] || `${BASE_URL}/og-image.jpg`,
        brand: {
          '@type': 'Brand',
          name: 'AgriServe',
        },
        category: data.category || 'Agricultural Equipment',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: data.daily_rate || 0,
          priceValidUntil,
          availability:
            data.status === 'available'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'AgriServe',
            url: BASE_URL,
          },
          areaServed: {
            '@type': 'Country',
            name: 'India',
          },
          itemCondition: 'https://schema.org/UsedCondition',
        },
        ...(data.location_name && {
          availableAtOrFrom: {
            '@type': 'Place',
            name: data.location_name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: data.location_name,
              addressCountry: 'IN',
            },
          },
        }),
      }
    : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Equipment', item: `${BASE_URL}/equipment` },
      ...(data
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: data.name,
              item: `${BASE_URL}/equipment/item/${id}`,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <EquipmentDetailClient />
    </>
  );
}
