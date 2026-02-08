import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getStateBySlug,
  getAllStateSlugs,
  EQUIPMENT_CATEGORIES,
  STATE_DESCRIPTIONS,
} from '@/data/india-locations';

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  return getAllStateSlugs().map((slug) => ({ state: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) return {};

  const title = `Rent Farm Equipment in ${state.name} | Tractors, Harvesters & More - AgriServe`;
  const description = `Rent agricultural equipment in ${state.name} - tractors, harvesters, cultivators, rotavators & more. Best rates for farmers in ${state.majorCities
    .slice(0, 5)
    .map((c) => c.name)
    .join(', ')} and all districts of ${state.name}. Book on AgriServe.`;

  return {
    title,
    description,
    keywords: [
      `farm equipment rental ${state.name}`,
      `tractor rental ${state.name}`,
      `harvester rental ${state.name}`,
      `agricultural equipment ${state.name}`,
      `कृषि उपकरण ${state.nameHi}`,
      `ट्रैक्टर किराया ${state.nameHi}`,
      ...state.majorCities.slice(0, 8).map((c) => `equipment rental ${c.name}`),
      ...EQUIPMENT_CATEGORIES.slice(0, 4).map((e) => `${e.name} rental ${state.name}`),
    ],
    alternates: {
      canonical: `https://agriserve.in/equipment/${state.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://agriserve.in/equipment/${state.slug}`,
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

export default async function StateEquipmentPage({ params }: Props) {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) notFound();

  const stateDesc = STATE_DESCRIPTIONS[state.slug];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Agricultural Equipment Rental in ${state.name}`,
    description:
      stateDesc?.en ||
      `Rent farm equipment in ${state.name} - tractors, harvesters, cultivators and more.`,
    provider: {
      '@type': 'Organization',
      name: 'AgriServe',
      url: 'https://agriserve.in',
    },
    areaServed: {
      '@type': 'State',
      name: state.name,
      containedInPlace: {
        '@type': 'Country',
        name: 'India',
      },
    },
    serviceType: 'Agricultural Equipment Rental',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `https://agriserve.in/equipment/${state.slug}`,
      servicePlatform: 'AgriServe Web Platform',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How can I rent a tractor in ${state.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can rent a tractor in ${state.name} through AgriServe. Simply browse our equipment listings, select a tractor available in your area, and book it online. We serve all major cities including ${state.majorCities
            .slice(0, 4)
            .map((c) => c.name)
            .join(', ')} and surrounding rural areas.`,
        },
      },
      {
        '@type': 'Question',
        name: `What farm equipment is available for rent in ${state.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `AgriServe offers a wide range of farm equipment in ${state.name} including tractors, combine harvesters, cultivators, rotavators, seed drills, ploughs, threshers, and sprayers. All equipment is verified and well-maintained.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the cost of renting farm equipment in ${state.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Equipment rental rates in ${state.name} vary by type and duration. Tractor rentals typically start from ₹500-1500/hour, harvesters from ₹2000-5000/hour. Visit AgriServe to see current rates from equipment providers in your area.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is AgriServe available in rural areas of ${state.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, AgriServe serves both urban and rural areas across ${state.name}. Our network of equipment providers covers all districts including smaller towns and villages.`,
        },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="min-h-screen bg-[#0A0F0C] text-white">
        {/* Hero Section */}
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
                <li className="text-teal-400">{state.name}</li>
              </ol>
            </nav>

            <h1 className="mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Rent Farm Equipment in{' '}
              <span className="bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
                {state.name}
              </span>
            </h1>
            <p className="mb-4 max-w-3xl text-lg text-gray-300 sm:text-xl">
              {stateDesc?.en ||
                `Find and rent the best agricultural equipment across ${state.name}. Tractors, harvesters, cultivators, and more available at affordable rates.`}
            </p>
            {stateDesc?.crops && (
              <p className="text-sm text-gray-400">
                <strong className="text-gray-300">Major crops:</strong>{' '}
                {stateDesc.crops.join(' • ')}
              </p>
            )}

            {/* CTA */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/equipment"
                className="rounded-xl bg-gradient-to-r from-teal-500 to-green-500 px-8 py-3 font-semibold text-white transition-all hover:from-teal-600 hover:to-green-600"
              >
                Browse All Equipment
              </Link>
              <Link
                href={`/labour/${state.slug}`}
                className="rounded-xl border border-teal-500/30 px-8 py-3 font-semibold text-teal-400 transition-all hover:bg-teal-500/10"
              >
                Hire Farm Labour in {state.name}
              </Link>
            </div>
          </div>
        </section>

        {/* Equipment Categories */}
        <section className="bg-[#0D1410] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-3xl font-bold">Equipment Available in {state.name}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {EQUIPMENT_CATEGORIES.map((category) => (
                <div
                  key={category.slug}
                  className="rounded-2xl border border-teal-500/10 bg-[#111916] p-6 transition-all hover:border-teal-500/30"
                >
                  <span className="mb-4 block text-4xl">{category.icon}</span>
                  <h3 className="mb-2 text-xl font-semibold">{category.name}</h3>
                  <p className="mb-1 text-sm text-gray-400">{category.nameHi}</p>
                  <p className="text-sm text-gray-300">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-4 text-3xl font-bold">Rent Equipment by City in {state.name}</h2>
            <p className="mb-8 text-gray-400">
              Find agricultural equipment providers near you. Select your city for location-specific
              equipment listings.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {state.majorCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/equipment/${state.slug}/${city.slug}`}
                  className="group rounded-xl border border-teal-500/10 bg-[#111916] p-4 transition-all hover:border-teal-500/40 hover:bg-[#152018]"
                >
                  <h3 className="font-semibold transition-colors group-hover:text-teal-400">
                    {city.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">{city.nameHi}</p>
                  <p className="mt-2 text-xs text-teal-400/60">View Equipment →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why AgriServe */}
        <section className="bg-[#0D1410] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-3xl font-bold">
              Why Rent Equipment with AgriServe in {state.name}?
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-2xl bg-[#111916] p-6">
                <h3 className="mb-3 text-xl font-semibold text-teal-400">Verified Equipment</h3>
                <p className="text-gray-300">
                  All equipment on AgriServe is verified for quality and maintained by trusted
                  providers across {state.name}.
                </p>
              </div>
              <div className="rounded-2xl bg-[#111916] p-6">
                <h3 className="mb-3 text-xl font-semibold text-teal-400">Affordable Rates</h3>
                <p className="text-gray-300">
                  Compare prices from multiple providers and find the best rates for tractor,
                  harvester, and equipment rentals in your area.
                </p>
              </div>
              <div className="rounded-2xl bg-[#111916] p-6">
                <h3 className="mb-3 text-xl font-semibold text-teal-400">Rural Coverage</h3>
                <p className="text-gray-300">
                  We serve not just major cities but also rural areas, tehsils, and villages across
                  all districts of {state.name}.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-linking to other states */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 text-2xl font-bold">Equipment Rentals in Other States</h2>
            <div className="flex flex-wrap gap-3">
              {getAllStateSlugs()
                .filter((s) => s !== state.slug)
                .slice(0, 15)
                .map((slug) => {
                  const otherState = getStateBySlug(slug);
                  if (!otherState) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/equipment/${slug}`}
                      className="rounded-lg border border-teal-500/10 bg-[#111916] px-4 py-2 text-sm transition-all hover:border-teal-500/30 hover:text-teal-400"
                    >
                      {otherState.name}
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
