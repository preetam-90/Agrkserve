'use client';

import { useEffect, useState, useCallback, useRef, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';
import {
  Search,
  Tractor,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageCircle,
  ChevronDown,
  ArrowLeft,
  Plus,
  SlidersHorizontal,
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
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { EquipmentSkeleton, EquipmentCardSkeleton } from '@/components/skeletons/EquipmentSkeleton';

// Indian States and Cities mapping
const INDIAN_STATES = [
  'Maharashtra',
  'Gujarat',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Punjab',
  'Rajasthan',
  'Madhya Pradesh',
  'Haryana',
  'Telangana',
  'Andhra Pradesh',
  'Bihar',
  'West Bengal',
  'Kerala',
  'Odisha',
  'Jharkhand',
  'Chhattisgarh',
  'Assam',
  'Uttarakhand',
  'Himachal Pradesh',
] as const;

const STATE_CITIES: Record<string, string[]> = {
  Maharashtra: [
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Aurangabad',
    'Thane',
    'Solapur',
    'Kolhapur',
    'Sangli',
    'Satara',
  ],
  Gujarat: [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Bhavnagar',
    'Jamnagar',
    'Gandhinagar',
    'Junagadh',
    'Anand',
    'Nadiad',
  ],
  Karnataka: [
    'Bengaluru',
    'Mysuru',
    'Mangaluru',
    'Hubli',
    'Belgaum',
    'Gulbarga',
    'Davanagere',
    'Shimoga',
    'Tumkur',
    'Bellary',
  ],
  'Tamil Nadu': [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Erode',
    'Vellore',
    'Thoothukudi',
    'Dindigul',
  ],
  'Uttar Pradesh': [
    'Lucknow',
    'Kanpur',
    'Agra',
    'Varanasi',
    'Allahabad',
    'Noida',
    'Ghaziabad',
    'Meerut',
    'Bareilly',
    'Aligarh',
  ],
  Punjab: [
    'Ludhiana',
    'Amritsar',
    'Jalandhar',
    'Patiala',
    'Bathinda',
    'Mohali',
    'Hoshiarpur',
    'Batala',
    'Pathankot',
    'Moga',
  ],
  Rajasthan: [
    'Jaipur',
    'Jodhpur',
    'Udaipur',
    'Kota',
    'Bikaner',
    'Ajmer',
    'Alwar',
    'Bharatpur',
    'Sikar',
    'Pali',
  ],
  'Madhya Pradesh': [
    'Bhopal',
    'Indore',
    'Jabalpur',
    'Gwalior',
    'Ujjain',
    'Sagar',
    'Rewa',
    'Satna',
    'Ratlam',
    'Chhindwara',
  ],
  Haryana: [
    'Gurugram',
    'Faridabad',
    'Panipat',
    'Ambala',
    'Karnal',
    'Rohtak',
    'Hisar',
    'Sonipat',
    'Panchkula',
    'Kurukshetra',
  ],
  Telangana: [
    'Hyderabad',
    'Warangal',
    'Nizamabad',
    'Karimnagar',
    'Khammam',
    'Secunderabad',
    'Nalgonda',
    'Mahbubnagar',
    'Adilabad',
    'Siddipet',
  ],
  'Andhra Pradesh': [
    'Visakhapatnam',
    'Vijayawada',
    'Guntur',
    'Nellore',
    'Kurnool',
    'Tirupati',
    'Kakinada',
    'Rajahmundry',
    'Anantapur',
    'Eluru',
  ],
  Bihar: [
    'Patna',
    'Gaya',
    'Bhagalpur',
    'Muzaffarpur',
    'Purnia',
    'Darbhanga',
    'Bihar Sharif',
    'Arrah',
    'Begusarai',
    'Katihar',
  ],
  'West Bengal': [
    'Kolkata',
    'Howrah',
    'Durgapur',
    'Siliguri',
    'Asansol',
    'Burdwan',
    'Malda',
    'Baharampur',
    'Habra',
    'Kharagpur',
  ],
  Kerala: [
    'Thiruvananthapuram',
    'Kochi',
    'Kozhikode',
    'Thrissur',
    'Kollam',
    'Kannur',
    'Alappuzha',
    'Palakkad',
    'Kottayam',
    'Kasaragod',
  ],
  Odisha: [
    'Bhubaneswar',
    'Cuttack',
    'Rourkela',
    'Berhampur',
    'Sambalpur',
    'Puri',
    'Balasore',
    'Bhadrak',
    'Baripada',
    'Jharsuguda',
  ],
  Jharkhand: [
    'Ranchi',
    'Jamshedpur',
    'Dhanbad',
    'Bokaro',
    'Hazaribagh',
    'Deoghar',
    'Giridih',
    'Ramgarh',
    'Dumka',
    'Chaibasa',
  ],
  Chhattisgarh: [
    'Raipur',
    'Bhilai',
    'Bilaspur',
    'Korba',
    'Durg',
    'Rajnandgaon',
    'Jagdalpur',
    'Raigarh',
    'Ambikapur',
    'Mahasamund',
  ],
  Assam: [
    'Guwahati',
    'Silchar',
    'Dibrugarh',
    'Jorhat',
    'Nagaon',
    'Tinsukia',
    'Tezpur',
    'Barpeta',
    'Sivasagar',
    'Goalpara',
  ],
  Uttarakhand: [
    'Dehradun',
    'Haridwar',
    'Rishikesh',
    'Roorkee',
    'Haldwani',
    'Rudrapur',
    'Kashipur',
    'Roorkee',
    'Mussoorie',
    'Nainital',
  ],
  'Himachal Pradesh': [
    'Shimla',
    'Manali',
    'Dharamshala',
    'Solan',
    'Mandi',
    'Kullu',
    'Kangra',
    'Palampur',
    'Una',
    'Bilaspur',
  ],
};

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

            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="pb-2 text-[10px] font-black text-gray-600">
                {day.charAt(0)}
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

function LazyCard({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible ? children : <EquipmentCardSkeleton />}</div>;
}

// Equipment Card Component - Redesigned per reference image
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
  const [imageLoaded, setImageLoaded] = useState(false);
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
      console.warn('[Calendar] Could not fetch availability:', error);
      setBookedDates([]);
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
      <div className="group">
        <Link href={`/equipment/item/${equipment.id}`} className="block h-full">
          <div className="relative h-full overflow-hidden rounded-xl bg-[#1a1a1a] transition-all duration-300 hover:-translate-y-1">
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[currentImageIndex]}
                    alt={equipment.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                      imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      {/* Image Indicators */}
                      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
                        {images.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1 rounded-full transition-all ${
                              index === currentImageIndex ? 'w-4 bg-cyan-400' : 'w-1 bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Status Badge - Top Left */}
                  <div className="absolute left-3 top-3 z-10">
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        equipment.is_available
                          ? 'bg-emerald-500 text-white'
                          : 'bg-orange-500 text-white'
                      }`}
                    >
                      {equipment.is_available ? 'AVAILABLE' : 'ON DUTY'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#111]">
                  <Tractor className="h-12 w-12 text-gray-700" />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-4">
              {/* Brand & Model */}
              <div className="mb-3">
                {equipment.brand && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
                    {equipment.brand}
                  </p>
                )}
                <h3 className="line-clamp-1 text-lg font-bold text-white">{equipment.name}</h3>
              </div>

              {/* Spec Badges Row */}
              <div className="mb-4 flex flex-wrap gap-2">
                {equipment.horsepower && (
                  <div className="flex flex-col rounded-lg bg-[#252525] px-3 py-2">
                    <span className="text-[10px] uppercase text-gray-500">HP</span>
                    <span className="text-sm font-semibold text-white">{equipment.horsepower}</span>
                  </div>
                )}
                {equipment.year && (
                  <div className="flex flex-col rounded-lg bg-[#252525] px-3 py-2">
                    <span className="text-[10px] uppercase text-gray-500">Year</span>
                    <span className="text-sm font-semibold text-white">{equipment.year}</span>
                  </div>
                )}
                {equipment.fuel_type && (
                  <div className="flex flex-col rounded-lg bg-[#252525] px-3 py-2">
                    <span className="text-[10px] uppercase text-gray-500">Fuel</span>
                    <span className="text-sm font-semibold capitalize text-white">
                      {equipment.fuel_type}
                    </span>
                  </div>
                )}
                {equipment.category && (
                  <div className="flex flex-col rounded-lg bg-[#252525] px-3 py-2">
                    <span className="text-[10px] uppercase text-gray-500">Type</span>
                    <span className="text-sm font-semibold text-white">{equipment.category}</span>
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs text-gray-500">Rental Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-cyan-400">
                      ₹{equipment.price_per_day}
                    </span>
                    <span className="text-sm text-gray-500">/hr</span>
                  </div>
                </div>
                {equipment.price_per_hour && (
                  <p className="text-right text-xs text-gray-600">
                    Daily Rate: ₹{equipment.price_per_hour}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleBookClick}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cyan-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-400"
                >
                  <Calendar className="h-4 w-4" />
                  Book Now
                </button>
                <button
                  onClick={handleCalendarClick}
                  className="flex items-center justify-center rounded-full border border-gray-700 bg-transparent px-3 py-2.5 text-gray-400 transition-colors hover:border-cyan-500 hover:text-cyan-400"
                  aria-label="View calendar"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <button
                  onClick={handleMessageClick}
                  className="flex items-center justify-center rounded-full border border-gray-700 bg-transparent px-3 py-2.5 text-gray-400 transition-colors hover:border-cyan-500 hover:text-cyan-400"
                  aria-label="Send message"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
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
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [priceInput, setPriceInput] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Sidebar state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  // Location filter state
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

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
    let result = equipment;

    // Apply location filter first
    if (selectedState || selectedCity) {
      result = result.filter((item) => {
        const location = item.location_name || '';
        const locationParts = location.split(',').map((p) => p.trim().toLowerCase());

        if (selectedCity) {
          return locationParts.some((part) => part.includes(selectedCity.toLowerCase()));
        } else if (selectedState) {
          return locationParts.some((part) => part.includes(selectedState.toLowerCase()));
        }
        return true;
      });
    }

    // Apply search query using Fuse.js
    if (!searchQuery.trim()) {
      return result;
    }

    const fuse = new Fuse(result, {
      keys: [
        { name: 'name', weight: 2.5 },
        { name: 'brand', weight: 2.0 },
        { name: 'model', weight: 2.0 },
        { name: 'category', weight: 1.5 },
        { name: 'fuel_type', weight: 1.5 },
        { name: 'location_name', weight: 1.5 },
        { name: 'description', weight: 1.0 },
        { name: 'features', weight: 1.0 },
        { name: 'year', weight: 0.8 },
        { name: 'horsepower', weight: 0.8 },
        { name: 'owner.name', weight: 0.8 },
        { name: 'price_per_hour', weight: 0.5 },
        { name: 'price_per_day', weight: 0.5 },
        { name: 'rating', weight: 0.5 },
        { name: 'review_count', weight: 0.5 },
      ],
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 2,
      ignoreLocation: true,
      includeScore: true,
    });

    const searchResults = fuse.search(searchQuery);
    return searchResults.map((searchResult) => searchResult.item);
  }, [equipment, searchQuery, selectedState, selectedCity]);

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
    router.push(`/equipment/item/${eq.id}/book`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 50000 });
    setPriceInput({ min: '', max: '' });
    setMinRating(0);
    setSortBy('newest');
    setSelectedBrands([]);
    setPage(1);
    setBrandSearch('');
    setSelectedState('');
    setSelectedCity('');
  };

  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-6">
      {/* Header with Reset */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <button
          onClick={() => {
            clearFilters();
            if (isMobile) setShowFilters(false);
          }}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          Reset Filters
        </button>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="mb-4 text-sm font-medium text-gray-400">Price Range (₹)</h4>

        {/* Input Fields Row */}
        <div className="mb-6 flex items-center gap-3">
          {/* Min Input */}
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-cyan-400">Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ₹
              </span>
              <input
                type="number"
                placeholder="0"
                value={priceInput.min}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setPriceInput((p) => ({ ...p, min: inputValue }));
                }}
                onBlur={() => {
                  const numVal = parseInt(priceInput.min) || 0;
                  const clampedMin = Math.min(numVal, priceRange.max);
                  setPriceRange((p) => ({ ...p, min: clampedMin }));
                  setPriceInput((p) => ({ ...p, min: clampedMin.toString() }));
                }}
                className="flex h-10 w-full rounded-lg border border-gray-700 bg-[#252525] pl-7 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Separator */}
          <div className="mt-5 text-gray-500">—</div>

          {/* Max Input */}
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-cyan-400">Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ₹
              </span>
              <input
                type="number"
                placeholder="50000"
                value={priceInput.max}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setPriceInput((p) => ({ ...p, max: inputValue }));
                }}
                onBlur={() => {
                  const numVal = parseInt(priceInput.max) || 50000;
                  const clampedMax = Math.max(numVal, priceRange.min);
                  setPriceRange((p) => ({ ...p, max: clampedMax }));
                  setPriceInput((p) => ({ ...p, max: clampedMax.toString() }));
                }}
                className="flex h-10 w-full rounded-lg border border-gray-700 bg-[#252525] pl-7 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Price Range Inputs */}
        <div className="px-1">
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>₹0</span>
            <span>₹50k+</span>
          </div>
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-400">Brand</h4>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search brands"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full rounded-lg border-gray-700 bg-[#252525] pl-10 text-white placeholder:text-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
          />
        </div>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {visibleBrands.length > 0 ? (
            visibleBrands.map((brand) => (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#252525]"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-4 w-4 rounded border-gray-600 bg-[#252525] text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-300">{brand}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">No brands found</p>
          )}
        </div>
        {!brandSearch && brands.length > 5 && (
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
          >
            {showAllBrands ? 'Show Less' : `Show More (${brands.length - 5})`}
          </button>
        )}
      </div>

      {/* Location Filter */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-400">Location</h4>
        <div className="space-y-3">
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('');
              }}
              className="w-full appearance-none rounded-lg border border-gray-700 bg-[#252525] px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state} className="bg-[#1a1a1a]">
                  {state}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>

          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              className="w-full appearance-none rounded-lg border border-gray-700 bg-[#252525] px-4 py-2.5 text-white transition-opacity focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select City</option>
              {selectedState &&
                STATE_CITIES[selectedState]?.map((city) => (
                  <option key={city} value={city} className="bg-[#1a1a1a]">
                    {city}
                  </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      <Button
        onClick={() => {
          loadEquipment(1, false);
          if (isMobile) setShowFilters(false);
        }}
        className="w-full rounded-full bg-cyan-500 py-3 font-semibold text-white hover:bg-cyan-400"
      >
        Apply Filters
      </Button>
    </div>
  );

  const hasActiveFilters =
    searchQuery ||
    (selectedCategory && selectedCategory !== 'all') ||
    priceRange.min > 0 ||
    priceRange.max < 50000 ||
    minRating > 0 ||
    selectedBrands.length > 0 ||
    selectedState ||
    selectedCity;

  // Category tabs configuration
  const categoryTabs = [
    { value: 'all', label: 'All Equipment' },
    { value: 'tractor', label: 'Tractors' },
    { value: 'harvester', label: 'Harvesters' },
    { value: 'drone', label: 'Drones & Tech' },
    { value: 'cultivator', label: 'Soil Prep' },
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'seeder', label: 'Seeders' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="mx-auto max-w-[1600px] px-4 pb-8 pt-24">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left: Back + Title + Breadcrumb */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] text-gray-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-cyan-400 md:text-3xl">Premium Equipment</h1>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Marketplace › Agricultural Listings
                </p>
              </div>
            </div>

            {/* Right: Sort Dropdown */}
            <div suppressHydrationWarning>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-gray-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-gray-300 transition-colors hover:border-cyan-500 hover:text-white">
                    <span>
                      Sort:{' '}
                      {sortBy === 'newest'
                        ? 'Newest First'
                        : sortBy === 'price-asc'
                          ? 'Price: Low to High'
                          : sortBy === 'price-desc'
                            ? 'Price: High to Low'
                            : 'Top Rated'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-gray-800 bg-[#1a1a1a]">
                  <DropdownMenuItem
                    onClick={() => setSortBy('newest')}
                    className="cursor-pointer text-gray-300 focus:bg-[#252525] focus:text-white"
                  >
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortBy('price-asc')}
                    className="cursor-pointer text-gray-300 focus:bg-[#252525] focus:text-white"
                  >
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortBy('price-desc')}
                    className="cursor-pointer text-gray-300 focus:bg-[#252525] focus:text-white"
                  >
                    Price: High to Low
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortBy('rating')}
                    className="cursor-pointer text-gray-300 focus:bg-[#252525] focus:text-white"
                  >
                    Top Rated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search premium equipment (e.g. John Deere 50HP)..."
              className="h-14 w-full rounded-xl border-gray-800 bg-[#1a1a1a] pl-12 pr-4 text-base text-white placeholder:text-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Category Tabs - Pill Style */}
        <div className="mb-8">
          <div className="scrollbar-hide flex flex-wrap gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleCategoryChange(tab.value)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedCategory === tab.value
                    ? 'bg-cyan-500 text-white'
                    : 'border border-gray-700 bg-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Sidebar + Grid */}
        <div className="flex gap-6">
          {/* Left Sidebar Filters */}
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-gray-800 bg-[#1a1a1a] p-5">
              {FilterContent({})}
            </div>
          </aside>

          {/* Equipment Grid */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="mb-4 lg:hidden">
              <Button
                onClick={() => setShowFilters(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-700 bg-[#1a1a1a] py-3 text-gray-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>

            {/* Results Info */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {isLoading ? 'Loading...' : `Showing ${filteredEquipment.length} results`}
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-gray-500">
                  <Link href="/login" className="text-cyan-400 hover:underline">
                    Login
                  </Link>{' '}
                  to book
                </p>
              )}
            </div>

            {/* Equipment Grid */}
            {isLoading && page === 1 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      Clear Filters
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredEquipment.map((item) => (
                    <LazyCard key={item.id}>
                      <EquipmentCard
                        equipment={item}
                        onMessage={handleMessage}
                        onBook={handleBook}
                      />
                    </LazyCard>
                  ))}
                </div>

                {/* Load More Section */}
                <div
                  ref={loadMoreRef}
                  className="mt-12 flex flex-col items-center justify-center py-8"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-gray-500">Loading more...</span>
                    </div>
                  ) : hasMore ? (
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => {
                          const nextPage = page + 1;
                          setPage(nextPage);
                          loadEquipment(nextPage, true);
                        }}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-700 bg-[#1a1a1a] text-gray-400 transition-colors hover:border-cyan-500 hover:text-cyan-400"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                      <span className="text-sm font-medium text-gray-400">Load More Equipment</span>
                      <span className="text-xs text-gray-600">
                        Showing {filteredEquipment.length} results
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-600">No more equipment to load</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-800 bg-[#0a0a0a] p-0 text-white sm:max-w-md">
          <DialogHeader className="sticky top-0 z-10 border-b border-gray-800 bg-[#0a0a0a] px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-6">{FilterContent({ isMobile: true })}</div>
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
