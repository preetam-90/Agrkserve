import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getStateBySlug,
  getCityBySlug,
  getAllCitySlugs,
  LABOUR_SERVICES,
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
  const result = getCityBySlug(stateSlug, citySlug);
  if (!result) return {};

  const { state, city } = result;
  const title = `Hire Farm Labour in ${city.name}, ${state.name} | AgriServe`;
  const description = `Find and hire agricultural workers in ${city.name} (${city.nameHi}), ${state.name}. Skilled farm labour for harvesting, planting, crop spraying & more. Verified workers, transparent pricing, instant booking on AgriServe.`;

  return {
    title,
    description,
    keywords: [
      `farm labour ${city.name}`,
      `agricultural workers ${city.name}`,
      `hire labour ${city.name} ${state.name}`,
      `खेत मजदूर ${city.nameHi}`,
      `कृषि श्रमिक ${city.nameHi}`,
      ...LABOUR_SERVICES.map((s) => `${s.name.toLowerCase()} workers ${city.name}`),
      `farm workers near ${city.name}`,
      `${city.name} labour hire`,
      `agricultural manpower ${state.name}`,
    ],
    alternates: {
      canonical: `https://agriserve.in/labour/${stateSlug}/${citySlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://agriserve.in/labour/${stateSlug}/${citySlug}`,
      siteName: 'AgriServe',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@agriserve_in',
    },
  };
}

export default async function LabourCityPage({ params }: Props) {
  const { state: stateSlug, city: citySlug } = await params;
  const stateData = getStateBySlug(stateSlug);
  const result = getCityBySlug(stateSlug, citySlug);
  if (!stateData || !result) notFound();

  const { state, city } = result;
  const otherCities = state.majorCities.filter((c) => c.slug !== citySlug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: `Agricultural Labour in ${city.name}, ${state.name}`,
        description: `Hire skilled farm workers in ${city.name}, ${state.name} through AgriServe`,
        provider: {
          '@type': 'Organization',
          name: 'AgriServe',
          url: 'https://agriserve.in',
        },
        serviceType: 'Agricultural Labour Hiring',
        areaServed: {
          '@type': 'City',
          name: city.name,
          geo: {
            '@type': 'GeoCoordinates',
            latitude: city.lat,
            longitude: city.lng,
          },
          containedInPlace: {
            '@type': 'State',
            name: state.name,
          },
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Labour Services',
          itemListElement: LABOUR_SERVICES.map((service, i) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: `${service.name} in ${city.name}`,
              description: service.description,
            },
            position: i + 1,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://agriserve.in' },
          { '@type': 'ListItem', position: 2, name: 'Labour', item: 'https://agriserve.in/labour' },
          {
            '@type': 'ListItem',
            position: 3,
            name: state.name,
            item: `https://agriserve.in/labour/${stateSlug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: city.name,
            item: `https://agriserve.in/labour/${stateSlug}/${citySlug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#0A0F0C] text-white">
        {/* Breadcrumb */}
        <nav className="mx-auto max-w-7xl px-4 pt-24 sm:px-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="transition-colors hover:text-teal-400">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/labour" className="transition-colors hover:text-teal-400">
                Labour
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/labour/${stateSlug}`} className="transition-colors hover:text-teal-400">
                {state.name}
              </Link>
            </li>
            <li>/</li>
            <li className="text-teal-400">{city.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Hire Farm Labour in{' '}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              {city.name}
            </span>
            <span className="text-gray-400">, {state.name}</span>
          </h1>
          <p className="mt-2 text-lg text-teal-400/80">
            {city.nameHi}, {state.nameHi} में कृषि मजदूर
          </p>
          <p className="mt-4 max-w-3xl text-lg text-gray-300">
            Find verified and skilled agricultural workers in {city.name} and surrounding areas.
            Book farm labour for harvesting, planting, spraying, and all farming operations through
            AgriServe.
          </p>
        </section>

        {/* Labour Services */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Farm Labour Services in {city.name}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LABOUR_SERVICES.map((service) => (
              <div
                key={service.slug}
                className="group rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-teal-500/40 hover:bg-gray-900/80"
              >
                <div className="mb-3 text-3xl">{service.icon}</div>
                <h3 className="text-lg font-semibold text-white">
                  {service.name} in {city.name}
                </h3>
                <p className="mt-2 text-sm text-gray-400">{service.description}</p>
                <Link
                  href="/labour"
                  className="mt-4 inline-block text-sm text-teal-400 transition-colors hover:text-teal-300"
                >
                  Find Workers &rarr;
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* SEO Content */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="prose prose-invert max-w-none rounded-2xl border border-gray-800 bg-gray-900/30 p-8">
            <h2>
              Agricultural Labour Services in {city.name}, {state.name}
            </h2>
            <p>
              AgriServe connects farmers in {city.name} with skilled agricultural workers for all
              types of farm operations. Whether you need workers for harvesting season, help with
              planting and sowing, or labour for land preparation, our platform makes it easy to
              find, compare, and hire verified farm workers.
            </p>
            <h3>Types of Farm Workers Available in {city.name}</h3>
            <ul>
              {LABOUR_SERVICES.map((s) => (
                <li key={s.slug}>
                  <strong>{s.name}:</strong> {s.description}
                </li>
              ))}
            </ul>
            <h3>How to Hire Farm Labour in {city.name}</h3>
            <ol>
              <li>Browse available workers in {city.name} on AgriServe</li>
              <li>Compare ratings, experience, and daily rates</li>
              <li>Book workers for your required dates and tasks</li>
              <li>Get workers at your farm — we cover {city.name} and surrounding villages</li>
            </ol>
            <p>
              AgriServe is trusted by thousands of farmers across {state.name} for reliable, skilled
              agricultural labour. Our workers are experienced in local farming practices and crop
              requirements specific to the {city.name} region.
            </p>
          </div>
        </section>

        {/* Other cities */}
        {otherCities.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Farm Labour in Other Cities of {state.name}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/labour/${stateSlug}/${c.slug}`}
                  className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 transition-all hover:border-teal-500/40 hover:bg-gray-900/70"
                >
                  <span className="font-medium text-white">{c.name}</span>
                  <span className="ml-2 text-sm text-gray-500">{c.nameHi}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-link to equipment */}
        <section className="mx-auto max-w-7xl px-4 py-12 pb-24 sm:px-6">
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 p-8 text-center">
            <h2 className="text-2xl font-bold">Need Farm Equipment in {city.name}?</h2>
            <p className="mt-3 text-gray-400">
              Rent tractors, harvesters, and more in {city.name}, {state.name}.
            </p>
            <Link
              href={`/equipment/${stateSlug}/${citySlug}`}
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3 font-semibold text-black transition-all hover:shadow-lg hover:shadow-teal-500/25"
            >
              Browse Equipment in {city.name}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
