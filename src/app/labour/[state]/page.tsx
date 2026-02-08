import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getStateBySlug,
  getAllStateSlugs,
  LABOUR_SERVICES,
  STATE_DESCRIPTIONS,
} from '@/data/india-locations';

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  return getAllStateSlugs().map((state) => ({ state }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) return {};

  const title = `Hire Agricultural Labour in ${state.name} | AgriServe`;
  const description = `Find and hire skilled farm workers in ${state.name} (${state.nameHi}). Agricultural labour services including harvesting, planting, crop spraying & more across ${state.majorCities
    .map((c) => c.name)
    .slice(0, 5)
    .join(', ')} and all districts.`;

  return {
    title,
    description,
    keywords: [
      `agricultural labour ${state.name}`,
      `farm workers ${state.name}`,
      `hire labour ${state.name}`,
      `खेत मजदूर ${state.nameHi}`,
      `कृषि श्रमिक ${state.nameHi}`,
      `harvesting labour ${state.name}`,
      `planting workers ${state.name}`,
      ...state.majorCities.slice(0, 8).map((c) => `farm labour ${c.name}`),
      ...LABOUR_SERVICES.map((s) => `${s.name} workers ${state.name}`),
      'agri labour hire India',
      'agricultural manpower',
      'farm labour booking online',
    ],
    alternates: {
      canonical: `https://agriserve.in/labour/${stateSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://agriserve.in/labour/${stateSlug}`,
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

export default async function LabourStatePage({ params }: Props) {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) notFound();

  const stateDesc = STATE_DESCRIPTIONS[stateSlug];
  const allStates = getAllStateSlugs()
    .map((s) => getStateBySlug(s)!)
    .filter((s) => s.slug !== stateSlug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: `Agricultural Labour Services in ${state.name}`,
        description: `Hire skilled farm workers and agricultural labourers across ${state.name}`,
        provider: {
          '@type': 'Organization',
          name: 'AgriServe',
          url: 'https://agriserve.in',
        },
        serviceType: 'Agricultural Labour Hiring',
        areaServed: {
          '@type': 'State',
          name: state.name,
          containedInPlace: {
            '@type': 'Country',
            name: 'India',
          },
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Agricultural Labour Services',
          itemListElement: LABOUR_SERVICES.map((service, i) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: `${service.name} in ${state.name}`,
              description: service.description,
            },
            position: i + 1,
          })),
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How to hire agricultural labour in ${state.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `You can hire agricultural labour in ${state.name} through AgriServe's platform. Browse available workers by location and skill, check their ratings and reviews, and book directly. Workers are available across all cities and rural areas in ${state.name}.`,
            },
          },
          {
            '@type': 'Question',
            name: `What types of farm workers are available in ${state.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `AgriServe provides ${LABOUR_SERVICES.map((s) => s.name.toLowerCase()).join(', ')} workers across ${state.name}. All workers are verified and rated by previous employers.`,
            },
          },
          {
            '@type': 'Question',
            name: `What is the cost of hiring farm labour in ${state.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Labour costs vary based on the type of work, season, and location within ${state.name}. Browse AgriServe to compare rates from multiple labour providers and find competitive pricing for your agricultural needs.`,
            },
          },
        ],
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
            <li className="text-teal-400">{state.name}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Hire Agricultural Labour in{' '}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              {state.name}
            </span>
          </h1>
          <p className="mt-2 text-lg text-teal-400/80">
            {state.nameHi} में कृषि मजदूर किराए पर लें
          </p>
          {stateDesc && <p className="mt-4 max-w-3xl text-lg text-gray-300">{stateDesc.en}</p>}
          {stateDesc?.crops && (
            <div className="mt-4 flex flex-wrap gap-2">
              {stateDesc.crops.map((crop) => (
                <span
                  key={crop}
                  className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-sm text-teal-400"
                >
                  {crop}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Labour Services */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Agricultural Labour Services in {state.name}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LABOUR_SERVICES.map((service) => (
              <div
                key={service.slug}
                className="group rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-teal-500/40 hover:bg-gray-900/80"
              >
                <div className="mb-3 text-3xl">{service.icon}</div>
                <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                <p className="mt-2 text-sm text-gray-400">{service.description}</p>
                <p className="mt-3 text-xs text-teal-400/70">Available across {state.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cities Grid */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Hire Farm Labour by City in {state.name}
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {state.majorCities.map((city) => (
              <Link
                key={city.slug}
                href={`/labour/${stateSlug}/${city.slug}`}
                className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/40 p-4 transition-all hover:border-teal-500/40 hover:bg-gray-900/70"
              >
                <div>
                  <span className="font-medium text-white">{city.name}</span>
                  <span className="ml-2 text-sm text-gray-500">{city.nameHi}</span>
                </div>
                <svg
                  className="h-4 w-4 text-gray-600 group-hover:text-teal-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Why AgriServe for Labour */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Why Hire Farm Workers Through AgriServe?
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Verified Workers',
                desc: `All agricultural labourers in ${state.name} are verified and background-checked for your safety.`,
              },
              {
                title: 'Transparent Pricing',
                desc: 'Compare labour rates from multiple providers. No hidden charges or middlemen.',
              },
              {
                title: 'Instant Booking',
                desc: `Book farm workers in ${state.name} instantly through our app. Available for same-day and advance bookings.`,
              },
              {
                title: 'Skilled Workforce',
                desc: 'Workers experienced in harvesting, planting, spraying, and all agricultural operations.',
              },
              {
                title: 'Rural Coverage',
                desc: `We cover not just cities but all rural areas and villages across ${state.name}.`,
              },
              {
                title: 'Fair Wages',
                desc: 'We ensure fair wages for workers while keeping costs competitive for farmers.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-800 bg-gray-900/30 p-5"
              >
                <h3 className="font-semibold text-teal-400">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-link other states */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Agricultural Labour in Other States</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {allStates.map((s) => (
              <Link
                key={s.slug}
                href={`/labour/${s.slug}`}
                className="rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300 transition-all hover:border-teal-500/40 hover:text-teal-400"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Also browse equipment */}
        <section className="mx-auto max-w-7xl px-4 py-12 pb-24 sm:px-6">
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 p-8 text-center">
            <h2 className="text-2xl font-bold">Also Need Farm Equipment in {state.name}?</h2>
            <p className="mt-3 text-gray-400">
              Browse tractors, harvesters, cultivators, and more available for rent across{' '}
              {state.name}.
            </p>
            <Link
              href={`/equipment/${stateSlug}`}
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3 font-semibold text-black transition-all hover:shadow-lg hover:shadow-teal-500/25"
            >
              Browse Equipment in {state.name}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
