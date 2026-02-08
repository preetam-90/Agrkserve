import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getCityBySlug,
  getAllCitySlugs,
  EQUIPMENT_CATEGORIES,
  STATE_DESCRIPTIONS,
} from '@/data/india-locations';

interface Props {
  params: Promise<{ state: string; city: string }>;
}

export async function generateStaticParams() {
  return getAllCitySlugs().map(({ stateSlug, citySlug }) => ({
    state: stateSlug,
    city: citySlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;
  const data = getCityBySlug(stateSlug, citySlug);
  if (!data) return {};

  const { state, city } = data;
  const title = `Rent Farm Equipment in ${city.name}, ${state.name} | AgriServe`;
  const description = `Book tractors, harvesters, cultivators & farm equipment in ${city.name}, ${state.name}. Best rental rates from verified providers. AgriServe - India's trusted agricultural equipment booking platform.`;

  return {
    title,
    description,
    keywords: [
      `farm equipment rental ${city.name}`,
      `tractor rental ${city.name}`,
      `harvester rental ${city.name}`,
      `agricultural equipment ${city.name} ${state.name}`,
      `कृषि उपकरण ${city.nameHi}`,
      `ट्रैक्टर किराया ${city.nameHi}`,
      `${city.name} tractor on rent`,
      `${city.name} harvester on rent`,
      `farm machinery ${city.name}`,
      `krishi yantra ${city.name}`,
    ],
    alternates: {
      canonical: `https://agriserve.in/equipment/${state.slug}/${city.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://agriserve.in/equipment/${state.slug}/${city.slug}`,
      siteName: 'AgriServe',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CityEquipmentPage({ params }: Props) {
  const { state: stateSlug, city: citySlug } = await params;
  const data = getCityBySlug(stateSlug, citySlug);
  if (!data) notFound();

  const { state, city } = data;
  const stateDesc = STATE_DESCRIPTIONS[state.slug];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Agricultural Equipment Rental in ${city.name}, ${state.name}`,
    description: `Rent farm equipment including tractors, harvesters, and cultivators in ${city.name}, ${state.name}. AgriServe provides verified equipment at affordable rates.`,
    provider: {
      '@type': 'Organization',
      name: 'AgriServe',
      url: 'https://agriserve.in',
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'State',
        name: state.name,
        containedInPlace: {
          '@type': 'Country',
          name: 'India',
        },
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: city.lat,
        longitude: city.lng,
      },
    },
    serviceType: 'Agricultural Equipment Rental',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://agriserve.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Equipment',
        item: 'https://agriserve.in/equipment',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: state.name,
        item: `https://agriserve.in/equipment/${state.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: city.name,
        item: `https://agriserve.in/equipment/${state.slug}/${city.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen bg-[#0A0F0C] text-white">
        {/* Hero */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="transition-colors hover:text-teal-400">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/equipment" className="transition-colors hover:text-teal-400">
                    Equipment
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link
                    href={`/equipment/${state.slug}`}
                    className="transition-colors hover:text-teal-400"
                  >
                    {state.name}
                  </Link>
                </li>
                <li>/</li>
                <li className="text-teal-400">{city.name}</li>
              </ol>
            </nav>

            <h1 className="mb-6 text-4xl font-bold sm:text-5xl">
              Farm Equipment Rental in{' '}
              <span className="bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
                {city.name}
              </span>
              <span className="mt-2 block text-2xl text-gray-400 sm:text-3xl">{state.name}</span>
            </h1>
            <p className="mb-4 max-w-3xl text-lg text-gray-300">
              Rent tractors, harvesters, cultivators, and other agricultural equipment in{' '}
              {city.name} and surrounding areas. Compare prices from verified equipment providers on
              AgriServe.
            </p>
            {stateDesc?.crops && (
              <p className="mb-8 text-sm text-gray-400">
                <strong className="text-gray-300">Popular crops in {state.name}:</strong>{' '}
                {stateDesc.crops.join(' • ')}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              <Link
                href="/equipment"
                className="rounded-xl bg-gradient-to-r from-teal-500 to-green-500 px-8 py-3 font-semibold text-white transition-all hover:from-teal-600 hover:to-green-600"
              >
                Browse Equipment in {city.name}
              </Link>
              <Link
                href={`/labour/${state.slug}/${city.slug}`}
                className="rounded-xl border border-teal-500/30 px-8 py-3 font-semibold text-teal-400 transition-all hover:bg-teal-500/10"
              >
                Hire Farm Labour
              </Link>
            </div>
          </div>
        </section>

        {/* Equipment Categories */}
        <section className="bg-[#0D1410] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-3xl font-bold">
              Equipment Available in {city.name}, {state.name}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {EQUIPMENT_CATEGORIES.map((category) => (
                <div
                  key={category.slug}
                  className="rounded-2xl border border-teal-500/10 bg-[#111916] p-6 transition-all hover:border-teal-500/30"
                >
                  <span className="mb-4 block text-4xl">{category.icon}</span>
                  <h3 className="mb-2 text-xl font-semibold">
                    {category.name} in {city.name}
                  </h3>
                  <p className="mb-1 text-sm text-gray-400">{category.nameHi}</p>
                  <p className="text-sm text-gray-300">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other cities in this state */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 text-2xl font-bold">
              Equipment Rentals in Other Cities of {state.name}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {state.majorCities
                .filter((c) => c.slug !== city.slug)
                .map((otherCity) => (
                  <Link
                    key={otherCity.slug}
                    href={`/equipment/${state.slug}/${otherCity.slug}`}
                    className="group rounded-xl border border-teal-500/10 bg-[#111916] p-4 transition-all hover:border-teal-500/40"
                  >
                    <h3 className="font-semibold transition-colors group-hover:text-teal-400">
                      {otherCity.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">{otherCity.nameHi}</p>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* SEO content */}
        <section className="bg-[#0D1410] px-4 py-16 sm:px-6 lg:px-8">
          <div className="prose prose-invert mx-auto max-w-4xl">
            <h2 className="mb-4 text-2xl font-bold">
              Agricultural Equipment Rental Services in {city.name}
            </h2>
            <p className="text-gray-300">
              AgriServe is India&apos;s trusted platform for renting agricultural equipment in{' '}
              {city.name}, {state.name}. Whether you need a tractor for ploughing, a combine
              harvester for wheat or rice harvesting, or a rotavator for soil preparation, our
              verified equipment providers have you covered.
            </p>
            <p className="text-gray-300">
              Our platform connects farmers in {city.name} and nearby villages with equipment
              owners, eliminating middlemen and ensuring transparent pricing. Book online, pay
              securely through Razorpay, and get equipment delivered to your farm.
            </p>
            <h3 className="mb-3 mt-6 text-xl font-semibold">
              Serving {city.name} &amp; Surrounding Areas
            </h3>
            <p className="text-gray-300">
              AgriServe&apos;s equipment network covers {city.name} city, surrounding tehsils,
              blocks, and rural areas. Farmers from nearby villages can also book equipment with
              doorstep delivery options.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
