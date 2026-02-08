'use client';

import { useEffect, useState, useCallback, useRef, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';
import {
  Search,
  Tractor,
  MapPin,
  Star,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageCircle,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Settings2,
  Zap,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Input,
  Spinner,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';

import { equipmentService, bookingService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { Equipment, EquipmentCategory } from '@/lib/types';
import { EQUIPMENT_CATEGORIES } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { BackButton } from '@/components/ui/back-button';
import { EquipmentSkeleton, EquipmentCardSkeleton } from '@/components/skeletons/EquipmentSkeleton';

// SEO Structured Data for Agri Rental Equipment Listing
const equipmentJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: "Agricultural Equipment Rental | AgriServe - India's Leading Farm Equipment Platform",
  description:
    'Rent agricultural equipment including tractors, harvesters, planters, and more. AgriServe provides affordable farm equipment rental services across India. Search for "agri rent", "agri rental", and farm equipment near you.',
  keywords:
    'agri rent, agri rental, agricultural equipment rental, farm equipment rental, tractor rental, harvester rental, farm machinery rental, agri equipment hire, cheap farm equipment rental India',
  url: 'https://agrirental.vercel.app/equipment',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Farm Equipment for Rent',
    description:
      'Browse and rent quality agricultural equipment from verified providers across India',
  },
  about: {
    '@type': 'Thing',
    name: 'Agricultural Equipment Rental',
    description: 'Rental services for tractors, harvesters, cultivators, and other farm machinery',
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Farmers and Agricultural Businesses',
    geographicArea: {
      '@type': 'Place',
      name: 'India',
    },
  },
  provider: {
    '@type': 'Organization',
    name: 'AgriServe',
    url: 'https://agrirental.vercel.app',
    logo: 'https://agrirental.vercel.app/logo.png',
    description:
      "India's premier agricultural equipment rental platform connecting farmers with equipment providers",
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: 'India',
    },
  },
  spatialCoverage: {
    '@type': 'Place',
    name: 'India',
    description: 'Agricultural equipment rental services available across all Indian states',
    containsPlace: [
      { '@type': 'Place', name: 'Maharashtra' },
      { '@type': 'Place', name: 'Gujarat' },
      { '@type': 'Place', name: 'Karnataka' },
      { '@type': 'Place', name: 'Tamil Nadu' },
      { '@type': 'Place', name: 'Uttar Pradesh' },
      { '@type': 'Place', name: 'Punjab' },
      { '@type': 'Place', name: 'Rajasthan' },
      { '@type': 'Place', name: 'Madhya Pradesh' },
      { '@Type': 'Place', name: 'Haryana' },
      { '@type': 'Place', name: 'Telangana' },
    ],
  },
};

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: Equipment[]; count: number; timestamp: number }>();

// Render JSON-LD Structured Data
function EquipmentPageJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(equipmentJsonLd) }}
    />
  );
}

// Simple availability calendar dialog - moved outside to prevent re-mounting issues
function AvailabilityCalendar({
  isOpen,
  onClose,
  bookedDates,
  isLoading,
  equipmentName,
}: {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  bookedDates: Date[];
  isLoading: boolean;
  equipmentName: string;
}) {
  console.log(
    `[AvailabilityCalendar] Rendering ${equipmentName} with ${bookedDates.length} booked dates. Loading: ${isLoading}`
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const isBooked = (day: number) => {
    if (!bookedDates.length) return false;
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    checkDate.setHours(0, 0, 0, 0);

    return bookedDates.some((booked) => {
      const b = new Date(booked);
      b.setHours(0, 0, 0, 0);
      return b.getTime() === checkDate.getTime();
    });
  };

  const isPast = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden border border-white/10 bg-[#0a0a0a] p-0 shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-2xl font-black text-transparent">
            Availability
          </DialogTitle>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {equipmentName}
          </p>
        </DialogHeader>

        <div className="px-6 pb-8">
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                )
              }
              className="rounded-xl text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="font-black tracking-tight text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                )
              }
              className="rounded-xl text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative grid min-h-[250px] grid-cols-7 gap-1 text-center">
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]/50 backdrop-blur-[2px]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            )}

            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="pb-2 text-[10px] font-black text-gray-600">
                {day}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const past = isPast(day);
              const booked = isBooked(day);

              return (
                <div
                  key={day}
                  className={`relative flex aspect-square items-center justify-center rounded-xl text-sm font-bold transition-all ${
                    past
                      ? 'text-gray-800'
                      : booked
                        ? 'scale-95 border border-red-500/40 bg-red-500/20 text-red-500 line-through'
                        : 'cursor-pointer border border-white/5 bg-white/5 text-emerald-400/90 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                  }`}
                >
                  {day}
                  {booked && (
                    <div className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-md border border-emerald-500/30 bg-emerald-500/20" />
              <span className="text-[10px] font-bold uppercase text-gray-500">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-md border border-red-500/30 bg-red-500/20" />
              <span className="text-[10px] font-bold uppercase text-gray-500">Booked</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Equipment Card Component with dark theme and neon yellow accents
function EquipmentCard({
  equipment,
  onMessage,
  onBook,
}: {
  equipment: Equipment;
  onMessage: (equipment: Equipment) => void;
  onBook: (equipment: Equipment) => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoadingBooked, setIsLoadingBooked] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const images = equipment.images || [];

  // Fetch booked dates for calendar
  useEffect(() => {
    if (showCalendar) {
      fetchBookedDates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCalendar, equipment.id]);

  const fetchBookedDates = async () => {
    setIsLoadingBooked(true);
    try {
      const bookedData = await bookingService.getEquipmentAvailability(equipment.id);
      console.log(`[Calendar] ${equipment.name}: Found ${bookedData.length} occupied dates`);
      setBookedDates(bookedData);
    } catch (error: unknown) {
      // Better error logging for Supabase objects
      const detail =
        error instanceof Error
          ? error.message
          : error && typeof error === 'object' && 'details' in error
            ? (error as { details?: string }).details
            : error && typeof error === 'object' && 'code' in error
              ? (error as { code?: string }).code
              : typeof error === 'object'
                ? JSON.stringify(error, Object.getOwnPropertyNames(error))
                : String(error);
      console.error('[Calendar API Error]:', detail);
    } finally {
      setIsLoadingBooked(false);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMessage(equipment);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBook(equipment);
  };

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCalendar(true);
  };

  return (
    <>
      <div className="perspective-1000 group">
        <Link href={`/equipment/${equipment.id}`} className="block h-full">
          <div className="relative h-full overflow-hidden rounded-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100">
            {/* Animated gradient border glow */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none" />

            {/* Glassmorphism card */}
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/90 to-[#0a0a0a]/90 shadow-xl backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] motion-reduce:transition-none">
              {/* Image Gallery with parallax effect */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
                {images.length > 0 ? (
                  <>
                    <div className="relative h-full w-full overflow-hidden">
                      <Image
                        src={images[currentImageIndex]}
                        alt={equipment.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                      {/* Holographic overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-emerald-400/20 opacity-0 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none" />
                    </div>

                    {/* Enhanced image navigation */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-cyan-500/80 group-hover:opacity-100 motion-reduce:transition-none"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-cyan-500/80 group-hover:opacity-100 motion-reduce:transition-none"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        {/* Enhanced image indicators */}
                        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                          {images.map((_, index) => (
                            <div
                              key={index}
                              className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                                index === currentImageIndex
                                  ? 'w-8 bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                                  : 'w-1.5 bg-white/40 hover:bg-white/60'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Availability badge with glow */}
                    <div className="absolute right-4 top-4 z-10">
                      <div
                        className={`rounded-full border px-3 py-1.5 backdrop-blur-xl ${
                          equipment.is_available
                            ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                            : 'border-red-400/50 bg-red-500/20 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${equipment.is_available ? 'animate-pulse bg-emerald-400' : 'bg-red-400'}`}
                          />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {equipment.is_available ? 'Available' : 'Booked'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute left-4 top-4 z-10">
                      <div className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-white/90 backdrop-blur-xl">
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {equipment.category || 'Equipment'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
                    <Tractor className="h-16 w-16 text-gray-700/50" />
                  </div>
                )}
              </div>

              {/* Enhanced content section */}
              <div className="flex flex-grow flex-col space-y-4 p-5">
                {/* Equipment Name & Brand info - moved to top with larger font */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    {equipment.brand && (
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-lg font-bold uppercase tracking-widest text-cyan-400">
                        {equipment.brand}
                      </span>
                    )}
                    {equipment.model && (
                      <span className="text-lg font-bold uppercase tracking-widest text-gray-300">
                        {equipment.model}
                      </span>
                    )}
                  </div>
                  <h3 className="line-clamp-2 text-2xl font-bold text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 group-hover:bg-clip-text group-hover:text-transparent motion-reduce:transition-none">
                    {equipment.name}
                  </h3>
                </div>

                {/* Specs Grid - 2x2 grid with Year, HP, Fuel */}
                <div className="grid grid-cols-2 gap-3">
                  {equipment.year && (
                    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-gray-300 transition-colors group-hover:border-white/10">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-medium">{equipment.year}</span>
                    </div>
                  )}
                  {equipment.horsepower && (
                    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-gray-300 transition-colors group-hover:border-white/10">
                      <Settings2 className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-medium">{equipment.horsepower} HP</span>
                    </div>
                  )}
                  {equipment.fuel_type && (
                    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-gray-300 transition-colors group-hover:border-white/10">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium capitalize">{equipment.fuel_type}</span>
                    </div>
                  )}
                </div>

                {/* Price with gradient background - showing both hourly and daily */}
                <div className="mt-auto space-y-2 pt-2">
                  {equipment.price_per_hour && (
                    <div className="inline-flex items-baseline gap-1 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 px-3 py-1.5">
                      <IndianRupee className="h-4 w-4 text-purple-400" />
                      <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-xl font-black text-transparent">
                        {equipment.price_per_hour}
                      </span>
                      <span className="text-xs font-medium text-gray-400">/hour</span>
                    </div>
                  )}
                  <div className="inline-flex w-full items-baseline gap-1 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 px-4 py-2">
                    <IndianRupee className="h-5 w-5 text-cyan-400" />
                    <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-3xl font-black text-transparent">
                      {equipment.price_per_day}
                    </span>
                    <span className="text-sm font-medium text-gray-400">/day</span>
                  </div>
                </div>

                {/* Location & Rating */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span className="max-w-[120px] truncate text-sm font-medium">
                      {equipment.location_name || 'Location'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">
                      {equipment.rating?.toFixed(1) || '5.0'}
                    </span>
                    {equipment.review_count && equipment.review_count > 0 && (
                      <span className="text-xs text-gray-400">({equipment.review_count})</span>
                    )}
                  </div>
                </div>

                {/* Floating action buttons - Book Now moved to bottom, full-width with 8px border-radius */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={handleBookClick}
                    className="flex-1 transform rounded-lg bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={handleCalendarClick}
                    className="transform rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:bg-white/10 active:scale-95 motion-reduce:transition-none"
                    aria-label="View calendar"
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleMessageClick}
                    className="transform rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-emerald-400/50 hover:bg-white/10 active:scale-95 motion-reduce:transition-none"
                    aria-label="Send message"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Calendar Dialog */}
      <AvailabilityCalendar
        isOpen={showCalendar}
        onClose={setShowCalendar}
        bookedDates={bookedDates}
        isLoading={isLoadingBooked}
        equipmentName={equipment.name}
      />
    </>
  );
}

function PublicEquipmentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const supabase = createClient();

  const isAuthenticated = !!user;

  // State
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'all'>(
    (searchParams.get('category') as EquipmentCategory) || 'all'
  );
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Sidebar state
  const [showPriceFilter, setShowPriceFilter] = useState(true);
  const [showBrandFilter, setShowBrandFilter] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const limit = 12;

  // Extract unique brands from equipment
  const brands = useMemo(() => {
    const uniqueBrands = new Set<string>();
    equipment.forEach((item) => {
      if (item.brand) {
        uniqueBrands.add(item.brand);
      }
    });
    return Array.from(uniqueBrands).sort();
  }, [equipment]);

  const visibleBrands = useMemo(() => {
    let filtered = brands;
    if (brandSearch) {
      filtered = brands.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()));
    }
    return showAllBrands ? filtered : filtered.slice(0, 5);
  }, [brands, showAllBrands, brandSearch]);

  // Fuzzy search using Fuse.js
  const filteredEquipment = useMemo(() => {
    if (!searchQuery.trim()) {
      return equipment;
    }

    const fuse = new Fuse(equipment, {
      keys: [
        { name: 'name', weight: 2.5 }, // Equipment name (highest priority)
        { name: 'brand', weight: 2.0 }, // Brand name
        { name: 'model', weight: 2.0 }, // Model name
        { name: 'category', weight: 1.5 }, // Equipment category
        { name: 'fuel_type', weight: 1.5 }, // Fuel type (diesel, gas, electric)
        { name: 'location_name', weight: 1.5 }, // Location
        { name: 'description', weight: 1.0 }, // Description
        { name: 'features', weight: 1.0 }, // Features array
        { name: 'year', weight: 0.8 }, // Manufacturing year
        { name: 'horsepower', weight: 0.8 }, // Horsepower
        { name: 'owner.name', weight: 0.8 }, // Owner name (nested)
        { name: 'price_per_hour', weight: 0.5 }, // Hourly price
        { name: 'price_per_day', weight: 0.5 }, // Daily price
        { name: 'rating', weight: 0.5 }, // Rating
        { name: 'review_count', weight: 0.5 }, // Review count
      ],
      threshold: 0.4, // More lenient matching for typos
      distance: 100,
      minMatchCharLength: 2,
      ignoreLocation: true,
      includeScore: true,
    });

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [equipment, searchQuery]);

  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      search: searchQuery,
      category: selectedCategory,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minRating,
      sortBy,
      brands: selectedBrands,
    });
  }, [searchQuery, selectedCategory, priceRange, minRating, sortBy, selectedBrands]);

  const loadEquipment = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      const cacheKey = getCacheKey();
      const now = Date.now();

      if (pageNum === 1 && !append) {
        const cached = cache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_TTL) {
          setEquipment(cached.data);
          setHasMore(cached.data.length < cached.count);
          setIsLoading(false);
          return;
        }
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await equipmentService.getEquipment({
          search: searchQuery || undefined,
          category: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
          minPrice: priceRange.min ? Number(priceRange.min) : undefined,
          maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
          minRating: minRating > 0 ? minRating : undefined,
          page: pageNum,
          limit,
        });

        const newEquipment = append ? [...equipment, ...result.data] : result.data;
        setEquipment(newEquipment);
        setHasMore(newEquipment.length < result.count);

        if (pageNum === 1 && !append) {
          cache.set(cacheKey, {
            data: result.data,
            count: result.count,
            timestamp: now,
          });
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { message?: string })?.message || 'Unknown error occurred';
        console.error('Failed to load equipment:', errorMessage, err);
        if (!append) {
          setEquipment([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [getCacheKey, searchQuery, selectedCategory, priceRange, minRating, equipment]
  );

  useEffect(() => {
    setPage(1);
    loadEquipment(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, minRating, selectedBrands]);

  useEffect(() => {
    const channel = supabase
      .channel('equipment-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'equipment',
        },
        () => {
          cache.clear();
          loadEquipment(1, false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadEquipment]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadEquipment(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, isLoading, page, loadEquipment]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as EquipmentCategory | 'all');
    setPage(1);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleMessage = (eq: Equipment) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/messages?user=${eq.owner_id}`);
      return;
    }

    if (!eq.owner_id) {
      toast.error('Unable to find equipment owner');
      return;
    }

    // Prevent starting a conversation with yourself
    if (eq.owner_id === user?.id) {
      toast.error('You cannot start a chat with yourself.');
      return;
    }

    router.push(`/messages?user=${eq.owner_id}`);
  };

  const handleBook = (eq: Equipment) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/equipment');
      return;
    }
    router.push(`/equipment/${eq.id}/book`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    setSortBy('newest');
    setSelectedBrands([]);
    setPage(1);
    setBrandSearch('');
  };

  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-4">
      {/* Reset Filters with gradient */}
      <button
        onClick={() => {
          clearFilters();
          if (isMobile) setShowFilters(false);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-gray-400 transition-all duration-300 hover:border-white/20 hover:bg-white/5 hover:text-gray-300"
      >
        <X className="h-4 w-4" />
        <span>Reset filters</span>
      </button>

      {/* Price Filter with glassmorphism */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-5 shadow-xl backdrop-blur-xl">
        <button
          onClick={() => setShowPriceFilter(!showPriceFilter)}
          className="mb-4 flex w-full items-center justify-between font-bold text-white transition-colors hover:text-cyan-400"
        >
          <span className="text-lg">Price Range</span>
          {showPriceFilter ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {showPriceFilter && (
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Min price"
              value={priceRange.min}
              onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
              className="rounded-xl border-white/10 bg-black/40 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/50"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={priceRange.max}
              onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
              className="rounded-xl border-white/10 bg-black/40 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/50"
            />
            <Button
              onClick={() => {
                loadEquipment(1, false);
                if (isMobile) setShowFilters(false);
              }}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 font-bold uppercase tracking-wide text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
            >
              Apply Filter
            </Button>
          </div>
        )}
      </div>

      {/* Brand Filter with glassmorphism */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-5 shadow-xl backdrop-blur-xl">
        <button
          onClick={() => setShowBrandFilter(!showBrandFilter)}
          className="mb-4 flex w-full items-center justify-between font-bold text-white transition-colors hover:text-cyan-400"
        >
          <span className="text-lg">Brand</span>
          {showBrandFilter ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {showBrandFilter && (
          <div className="space-y-2">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
              <Input
                placeholder="Search brands"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="rounded-xl border-white/20 bg-black/40 pl-10 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/50"
              />
            </div>
            <div className="space-y-1">
              {visibleBrands.length > 0 ? (
                visibleBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 rounded border-cyan-500/30 bg-black/40 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-gray-300">{brand}</span>
                  </label>
                ))
              ) : (
                <p className="px-2 text-sm text-gray-500">No brands found</p>
              )}
            </div>
            {!brandSearch && brands.length > 5 && (
              <button
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="mt-2 w-full rounded-lg py-2 text-xs font-bold uppercase tracking-widest text-cyan-400 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300"
              >
                {showAllBrands ? 'Show Less' : `Show More (${brands.length - 5})`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const hasActiveFilters =
    searchQuery ||
    (selectedCategory && selectedCategory !== 'all') ||
    priceRange.min ||
    priceRange.max ||
    minRating > 0 ||
    selectedBrands.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      <Header />

      <main className="mx-auto max-w-[1600px] px-0 pb-8 pt-28 md:px-4">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton variant="minimal" />
        </div>

        {/* Enhanced Page Header with gradient text */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-3 bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
                Premium Equipment
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link href="/" className="transition-colors hover:text-cyan-400">
                  Home
                </Link>
                <span>›</span>
                <span className="font-medium text-white">Equipment</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-4 py-2 transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Filters</span>
              </Button>
              <div suppressHydrationWarning>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      suppressHydrationWarning
                      className="hidden items-center gap-2 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-4 py-2 transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] lg:flex"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-medium text-white">
                        {sortBy === 'newest' && 'Newest'}
                        {sortBy === 'price-asc' && 'Price: Low to High'}
                        {sortBy === 'price-desc' && 'Price: High to Low'}
                        {sortBy === 'rating' && 'Top Rated'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-cyan-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-slate-800 bg-slate-950 text-slate-100">
                    <DropdownMenuItem
                      onClick={() => setSortBy('newest')}
                      className="cursor-pointer focus:bg-slate-800"
                    >
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('price-asc')}
                      className="cursor-pointer focus:bg-slate-800"
                    >
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('price-desc')}
                      className="cursor-pointer focus:bg-slate-800"
                    >
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('rating')}
                      className="cursor-pointer focus:bg-slate-800"
                    >
                      Top Rated
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 border-b border-gray-800">
          <div className="scrollbar-hide flex gap-8 overflow-x-auto pb-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`border-b-3 whitespace-nowrap pb-3 text-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              All Items
            </button>
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`border-b-3 whitespace-nowrap pb-3 text-sm transition-colors ${
                  selectedCategory === cat.value
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Sidebar + Grid */}
        <div className="flex gap-6">
          {/* Enhanced Glassmorphism Sidebar Filters */}
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-6 space-y-4">
              <FilterContent />
            </div>
          </aside>

          {/* Equipment Grid */}
          <div className="flex-1">
            {/* Enhanced Search Bar with glassmorphism */}
            <div className="mb-8">
              <div className="group relative">
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100 motion-reduce:transition-none" />
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 backdrop-blur-xl">
                  <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search premium equipment..."
                    className="h-14 border-0 bg-transparent pl-14 pr-4 text-base text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-400">
                {isLoading
                  ? 'Loading...'
                  : `${filteredEquipment.length} equipment found${searchQuery ? ' (filtered)' : ''}`}
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-gray-500">
                  <Link href="/login" className="text-[#DFFF00] hover:underline">
                    Login
                  </Link>{' '}
                  to book equipment
                </p>
              )}
            </div>

            {/* Equipment Grid with enhanced loading */}
            {isLoading && page === 1 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <EquipmentCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredEquipment.length === 0 ? (
              <EmptyState
                icon={<Tractor className="h-12 w-12" />}
                title="No equipment found"
                description={
                  hasActiveFilters || searchQuery
                    ? 'Try adjusting your filters or search query'
                    : "There's no equipment listed yet. Check back later!"
                }
                action={
                  (hasActiveFilters || searchQuery) && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEquipment.map((item) => (
                    <EquipmentCard
                      key={item.id}
                      equipment={item}
                      onMessage={handleMessage}
                      onBook={handleBook}
                    />
                  ))}
                </div>

                {/* Lazy load trigger */}
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {isLoadingMore && (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-gray-500">Loading more...</span>
                    </div>
                  )}
                  {!hasMore && filteredEquipment.length > 0 && (
                    <p className="text-gray-500">You&apos;ve reached the end of the list</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-800 bg-slate-950 p-0 text-slate-100 sm:max-w-md">
          <DialogHeader className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold tracking-tight text-white">
                Filters
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="px-6 py-4">
            <FilterContent isMobile />
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <EquipmentPageJsonLd />
      <Suspense fallback={<EquipmentSkeleton />}>
        <PublicEquipmentPageContent />
      </Suspense>
    </>
  );
}
