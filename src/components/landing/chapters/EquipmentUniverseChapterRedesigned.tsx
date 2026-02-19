'use client';

import { useLayoutEffect, useRef, useState, useCallback, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { safeGsapRevert } from '../shared/safeGsapRevert';
import { equipmentService } from '@/lib/services';
import type { Equipment } from '@/lib/types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface EquipmentUniverseChapterProps {
  reducedMotion?: boolean;
}

interface EquipmentCard {
  id: string;
  name: string;
  category: string;
  priceRange: string;
  accent: string;
  description: string;
  image?: string;
  rating: number;
  location: string;
  available: boolean;
  bookingCount: number;
  reviewCount: number;
  createdAt: string;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const categoryLabelMap: Record<string, string> = {
  tractor: 'Field Mobility',
  harvester: 'Harvest Operations',
  plough: 'Soil Preparation',
  seeder: 'Planting Systems',
  sprayer: 'Crop Protection',
  cultivator: 'Land Preparation',
  rotavator: 'Soil Preparation',
  thresher: 'Harvest Operations',
  irrigation: 'Water Systems',
  drone: 'Precision Agriculture',
  other: 'Farm Equipment',
};

const categoryAccentMap: Record<string, string> = {
  tractor: 'from-emerald-500/20 to-cyan-500/10',
  harvester: 'from-cyan-500/20 to-blue-500/10',
  plough: 'from-amber-500/20 to-orange-500/10',
  seeder: 'from-lime-500/20 to-green-500/10',
  sprayer: 'from-violet-500/20 to-purple-500/10',
  cultivator: 'from-teal-500/20 to-emerald-500/10',
  rotavator: 'from-amber-500/20 to-lime-500/10',
  thresher: 'from-sky-500/20 to-cyan-500/10',
  irrigation: 'from-blue-500/20 to-cyan-500/10',
  drone: 'from-indigo-500/20 to-cyan-500/10',
  other: 'from-emerald-500/20 to-cyan-500/10',
};

const fallbackEquipmentCards: EquipmentCard[] = [
  {
    id: '1',
    name: 'Mahindra 575 DI Tractor',
    category: 'Field Mobility',
    priceRange: '₹1,500 - ₹2,500/day',
    accent: 'from-emerald-500/20 to-cyan-500/10',
    description:
      '45 HP diesel tractor with hydraulic lift. Ideal for tilling, ploughing, and haulage.',
    rating: 4.8,
    location: 'Punjab',
    available: true,
    bookingCount: 240,
    reviewCount: 86,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    name: 'Swaraj 744 FE Combine Harvester',
    category: 'Harvest Operations',
    priceRange: '₹4,000 - ₹6,000/day',
    accent: 'from-cyan-500/20 to-blue-500/10',
    description: 'Self-propelled combine for wheat and paddy harvesting. Includes operator.',
    rating: 4.9,
    location: 'Haryana',
    available: true,
    bookingCount: 210,
    reviewCount: 74,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    name: 'Rotavator 6ft',
    category: 'Soil Preparation',
    priceRange: '₹800 - ₹1,200/day',
    accent: 'from-amber-500/20 to-orange-500/10',
    description: 'PTO-driven rotary tiller for seedbed preparation. Tractor attachment required.',
    rating: 4.7,
    location: 'Maharashtra',
    available: true,
    bookingCount: 190,
    reviewCount: 68,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
  },
  {
    id: '4',
    name: 'Seed Drill 9-row',
    category: 'Planting Systems',
    priceRange: '₹600 - ₹900/day',
    accent: 'from-lime-500/20 to-green-500/10',
    description: 'Multi-row seed drill for wheat, paddy, and pulses. Precision spacing.',
    rating: 4.6,
    location: 'Uttar Pradesh',
    available: false,
    bookingCount: 150,
    reviewCount: 52,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: '5',
    name: 'Power Sprayer 500L',
    category: 'Crop Protection',
    priceRange: '₹400 - ₹700/day',
    accent: 'from-violet-500/20 to-purple-500/10',
    description: 'PTO-operated sprayer with 500L tank. Adjustable pressure and nozzle.',
    rating: 4.5,
    location: 'Gujarat',
    available: true,
    bookingCount: 160,
    reviewCount: 49,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
  },
  {
    id: '6',
    name: 'Laser Land Leveler',
    category: 'Land Preparation',
    priceRange: '₹1,200 - ₹1,800/day',
    accent: 'from-rose-500/20 to-pink-500/10',
    description: 'GPS-guided laser leveler for precision field leveling. Includes operator.',
    rating: 4.8,
    location: 'Rajasthan',
    available: true,
    bookingCount: 220,
    reviewCount: 71,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

function getCategoryLabel(category: string | null | undefined): string {
  if (!category) return 'Farm Equipment';
  return categoryLabelMap[category] || category.replace(/_/g, ' ');
}

function getCategoryAccent(category: string | null | undefined): string {
  if (!category) return categoryAccentMap.other;
  return categoryAccentMap[category] || categoryAccentMap.other;
}

function mapEquipmentToCard(item: Equipment): EquipmentCard {
  const rating = Number(item.rating || 0);
  const reviewCount = Number(item.review_count || 0);
  const bookingCount = Number(item.total_bookings || 0);
  const normalizedRating = rating > 0 ? rating : Math.min(4.9, 4.2 + reviewCount * 0.01);
  const priceLabel =
    item.price_per_day > 0
      ? `${currencyFormatter.format(item.price_per_day)}/day`
      : 'Price on request';
  const location = item.location_name?.trim() || 'Pan-India Coverage';
  const categoryLabel = getCategoryLabel(item.category);

  return {
    id: item.id,
    name: item.name,
    category: categoryLabel,
    priceRange: priceLabel,
    accent: getCategoryAccent(item.category),
    description:
      item.description?.trim() ||
      `${categoryLabel} ready for high-demand farm operations with verified provider support.`,
    image: item.images?.[0] || undefined,
    rating: Number(normalizedRating.toFixed(1)),
    location,
    available: Boolean(item.is_available),
    bookingCount,
    reviewCount,
    createdAt: item.created_at,
  };
}

/**
 * Equipment Universe Chapter - Redesigned
 *
 * Changes:
 * 1. Native snap-scroll instead of GSAP horizontal scrolljacking
 * 2. Clear pricing, availability, and distance indicators
 * 3. Touch-friendly card design
 * 4. Navigation dots and arrow buttons
 */
function EquipmentUniverseChapterRedesigned({
  reducedMotion = false,
}: EquipmentUniverseChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [equipmentCards, setEquipmentCards] = useState<EquipmentCard[]>(fallbackEquipmentCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let isMounted = true;

    const loadRecentEquipment = async () => {
      try {
        const response = await equipmentService.getEquipment({ limit: 24, page: 1 });
        const mappedCards = response.data.map(mapEquipmentToCard);

        // Sort by createdAt (most recent first) - data already comes sorted from API
        const recentCards = mappedCards.slice(0, 9);

        const fallbackTopups = fallbackEquipmentCards.filter(
          (fallback) => !recentCards.some((live) => live.name === fallback.name)
        );
        const showcaseCards =
          recentCards.length >= 6
            ? recentCards
            : [...recentCards, ...fallbackTopups].slice(0, Math.max(6, recentCards.length));

        if (!isMounted) return;

        if (showcaseCards.length > 0) {
          setEquipmentCards(showcaseCards);
          setCurrentIndex(0);
        } else {
          setEquipmentCards(fallbackEquipmentCards);
          setCurrentIndex(0);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load recent equipment:', error);
        setEquipmentCards(fallbackEquipmentCards);
        setCurrentIndex(0);
      }
    };

    void loadRecentEquipment();

    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP animations for section entrance
  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const context = gsap.context(() => {
      // Heading — clip-path reveal with blur dissolve
      gsap.fromTo(
        '.equipment-header',
        { opacity: 0, y: 40, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Cards — staggered 3D cascade with rotateX tilt
      gsap.fromTo(
        '.equipment-card',
        { opacity: 0, y: 60, rotateX: -12, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'rotateX',
          scrollTrigger: {
            trigger: '.equipment-grid',
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      );

      // CTA button — spring entrance
      gsap.from('.equipment-cta', {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.7,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: '.equipment-cta',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });

      // Background parallax depth
      gsap.to('.equipment-bg', {
        yPercent: -7,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.3,
        },
      });
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [equipmentCards.length, reducedMotion]);

  // Scroll tracking for navigation dots
  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;

    const scrollLeft = trackRef.current.scrollLeft;
    const cardWidth = trackRef.current.querySelector('.equipment-card')?.clientWidth || 0;
    const index = Math.round(scrollLeft / (cardWidth + 24)); // 24px gap
    setCurrentIndex(Math.min(Math.max(index, 0), Math.max(0, equipmentCards.length - 1)));
  }, [equipmentCards.length]);

  // Navigation functions
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!trackRef.current) return;

      const cardWidth = trackRef.current.querySelector('.equipment-card')?.clientWidth || 0;
      trackRef.current.scrollTo({
        left: index * (cardWidth + 24),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [prefersReducedMotion]
  );

  const goToPrevious = useCallback(() => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  }, [currentIndex, scrollToIndex]);

  const goToNext = useCallback(() => {
    const newIndex = Math.min(equipmentCards.length - 1, currentIndex + 1);
    scrollToIndex(newIndex);
  }, [currentIndex, equipmentCards.length, scrollToIndex]);

  return (
    <section
      id="equipment-universe"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#030705] py-[var(--landing-section-y)]"
      aria-label="Equipment showcase"
    >
      {/* Background decorations */}
      <div className="equipment-bg pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.08),transparent_35%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[var(--landing-max-width)] px-[var(--landing-padding-x)]">
        {/* Section Header */}
        <div className="equipment-header mb-10 md:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Chapter 02 // Equipment Universe
            </span>
          </div>

          <h2 className="mb-4 text-[clamp(1.75rem,5vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-white">
            Premium Equipment
            <span className="text-emerald-400"> At Your Fingertips</span>
          </h2>

          <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Browse verified tractors, harvesters, and agricultural machinery from trusted providers
            across India. Real-time availability, transparent pricing, and instant booking.
          </p>
        </div>

        {/* Equipment Grid/Carousel */}
        <div className="relative">
          {/* Navigation Arrows - Desktop */}
          <div className="hidden lg:block">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-white backdrop-blur-xl transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous equipment"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex >= equipmentCards.length - 1 || equipmentCards.length <= 1}
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-white backdrop-blur-xl transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next equipment"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Equipment Cards - Native Snap Scroll */}
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="equipment-grid scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:gap-6 lg:grid lg:snap-none lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:pb-0"
            style={{ scrollSnapType: prefersReducedMotion ? 'none' : 'x mandatory' }}
          >
            {equipmentCards.map((card) => (
              <EquipmentCard key={card.id} card={card} reducedMotion={reducedMotion} />
            ))}
          </div>

          {/* Navigation Dots - Mobile/Tablet */}
          <div className="mt-6 flex justify-center gap-2 lg:hidden">
            {equipmentCards.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-emerald-400'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to equipment ${index + 1}`}
                aria-current={index === currentIndex ? 'page' : undefined}
              />
            ))}
          </div>
        </div>

        {/* View All CTA */}
        <div className="equipment-cta mt-10 flex justify-center md:mt-14">
          <Link
            href="/equipment"
            className="landing-touch group flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20"
          >
            View All Equipment
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Equipment Card Component
 */
interface EquipmentCardProps {
  card: EquipmentCard;
  reducedMotion?: boolean;
}

function EquipmentCard({ card, reducedMotion }: EquipmentCardProps) {
  return (
    <Link href={`/equipment/item/${card.id}`} className="block snap-center lg:snap-align-none">
      <motion.article
        whileHover={reducedMotion ? {} : { y: -4 }}
        className="equipment-card group relative flex w-[84vw] min-w-[280px] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl transition-all hover:border-white/20 min-[414px]:w-[78vw] sm:w-[52vw] md:w-[44vw] lg:w-full lg:min-w-0 lg:max-w-none"
        style={{ scrollSnapAlign: 'center' }}
      >
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden md:h-56">
          {card.image ? (
            <Image
              src={card.image}
              alt={card.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 33vw"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0c] via-transparent to-transparent" />

          {/* Availability Badge */}
          <div className="absolute right-3 top-3 md:right-4 md:top-4">
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-xl ${
                card.available
                  ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                  : 'border border-amber-500/50 bg-amber-500/20 text-amber-300'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  card.available ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              {card.available ? 'Available' : 'Booked'}
            </div>
          </div>

          {/* Category */}
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
            <span className="text-xs font-medium uppercase tracking-wider text-white/60">
              {card.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
          {/* Name */}
          <h3 className="text-lg font-bold leading-tight text-white md:text-xl">{card.name}</h3>

          {/* Description */}
          <p className="flex-1 text-sm leading-relaxed text-white/60 md:text-base">
            {card.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {card.location}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              {card.rating}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/65">
              {card.bookingCount > 0
                ? `${card.bookingCount} bookings`
                : `${card.reviewCount} reviews`}
            </span>
          </div>

          {/* Price & CTA */}
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <span className="text-xs text-white/50">Per day</span>
              <p className="text-lg font-bold text-emerald-400">{card.priceRange}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 transition-all group-hover:bg-emerald-500 group-hover:text-white">
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default EquipmentUniverseChapterRedesigned;
