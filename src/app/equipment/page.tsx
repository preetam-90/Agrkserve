'use client';

import { useEffect, useState, useCallback, useRef, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
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
  User,
  IndianRupee,
  RefreshCw,
  Loader2,
  Phone,
  ChevronDown,
  ChevronUp,
  Settings2,
  Zap
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  Spinner,
  EmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@/components/ui';
import { equipmentService, bookingService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { Equipment, EquipmentCategory } from '@/lib/types';
import { EQUIPMENT_CATEGORIES, formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { addDays, isSameDay, parseISO } from 'date-fns';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: Equipment[]; count: number; timestamp: number }>();

// Simple availability calendar dialog - moved outside to prevent re-mounting issues
function AvailabilityCalendar({
  isOpen,
  onClose,
  bookedDates,
  isLoading,
  equipmentName
}: {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  bookedDates: Date[];
  isLoading: boolean;
  equipmentName: string;
}) {
  console.log(`[AvailabilityCalendar] Rendering ${equipmentName} with ${bookedDates.length} booked dates. Loading: ${isLoading}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

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
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/10 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Availability
          </DialogTitle>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{equipmentName}</p>
        </DialogHeader>

        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-6 bg-white/5 p-2 rounded-2xl border border-white/5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="font-black text-white tracking-tight">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center min-h-[250px] relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/50 backdrop-blur-[2px] z-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            )}

            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="text-[10px] font-black text-gray-600 pb-2">
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
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all relative ${past
                    ? 'text-gray-800'
                    : booked
                      ? 'bg-red-500/20 text-red-500 border border-red-500/40 line-through scale-95'
                      : 'bg-white/5 text-emerald-400/90 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer'
                    }`}
                >
                  {day}
                  {booked && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/30" />
              <span className="text-[10px] font-bold uppercase text-gray-500">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-red-500/20 border border-red-500/30" />
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
  isAuthenticated
}: {
  equipment: Equipment;
  onMessage: (equipment: Equipment) => void;
  onBook: (equipment: Equipment) => void;
  isAuthenticated: boolean;
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
  }, [showCalendar, equipment.id]);

  const fetchBookedDates = async () => {
    setIsLoadingBooked(true);
    try {
      const bookedData = await bookingService.getEquipmentAvailability(equipment.id);
      console.log(`[Calendar] ${equipment.name}: Found ${bookedData.length} occupied dates`);
      setBookedDates(bookedData);
    } catch (error: any) {
      // Better error logging for Supabase objects
      const detail = error?.message || error?.details || error?.code ||
        (typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error));
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
      <div className="group perspective-1000">
        <Link
          href={`/equipment/${equipment.id}`}
          className="block h-full"
        >
          <div className="relative h-full rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:translate-y-0">
            {/* Animated gradient border glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm motion-reduce:transition-none" />

            {/* Glassmorphism card */}
            <div className="relative bg-gradient-to-br from-[#1a1a1a]/90 to-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-shadow duration-500 h-full motion-reduce:transition-none">

              {/* Image Gallery with parallax effect */}
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
                {images.length > 0 ? (
                  <>
                    <div className="relative w-full h-full overflow-hidden">
                      <Image
                        src={images[currentImageIndex]}
                        alt={equipment.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                      {/* Holographic overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay motion-reduce:transition-none" />
                    </div>

                    {/* Enhanced image navigation */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-cyan-500/80 hover:scale-110 z-10 motion-reduce:transition-none"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-cyan-500/80 hover:scale-110 z-10 motion-reduce:transition-none"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        {/* Enhanced image indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                          {images.map((_, index) => (
                            <div
                              key={index}
                              className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${index === currentImageIndex
                                ? 'w-8 bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                                : 'w-1.5 bg-white/40 hover:bg-white/60'
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Availability badge with glow */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-3 py-1.5 rounded-full backdrop-blur-xl border ${equipment.is_available
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : 'bg-red-500/20 border-red-400/50 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${equipment.is_available ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {equipment.is_available ? 'Available' : 'Booked'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="px-3 py-1.5 rounded-full backdrop-blur-xl bg-black/40 border border-white/20 text-white/90">
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {equipment.category || 'Equipment'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
                    <Tractor className="h-16 w-16 text-gray-700/50" />
                  </div>
                )}
              </div>

              {/* Enhanced content section */}
              <div className="p-5 flex flex-col flex-grow space-y-4">

                {/* Equipment Name & Brand info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {equipment.brand && (
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">{equipment.brand}</span>
                    )}
                    {equipment.model && (
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{equipment.model}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2 motion-reduce:transition-none">
                    {equipment.name}
                  </h3>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {(equipment.year || equipment.horsepower) && (
                    <>
                      {equipment.year && (
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300 group-hover:border-white/10 transition-colors">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-medium">{equipment.year}</span>
                        </div>
                      )}
                      {equipment.horsepower && (
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300 group-hover:border-white/10 transition-colors">
                          <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-medium">{equipment.horsepower} HP</span>
                        </div>
                      )}
                    </>
                  )}
                  {equipment.fuel_type && (
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-300 group-hover:border-white/10 transition-colors ${(!equipment.year || !equipment.horsepower) ? 'col-span-1' : 'col-span-2'}`}>
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs font-medium capitalize">{equipment.fuel_type}</span>
                    </div>
                  )}
                </div>

                {/* Price with gradient background - showing both hourly and daily */}
                <div className="space-y-2 mt-auto pt-2">
                  {equipment.price_per_hour && (
                    <div className="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20">
                      <IndianRupee className="h-4 w-4 text-purple-400" />
                      <span className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {equipment.price_per_hour}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">/hour</span>
                    </div>
                  )}
                  <div className="inline-flex w-full items-baseline gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 border border-cyan-500/20">
                    <IndianRupee className="h-5 w-5 text-cyan-400" />
                    <span className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      {equipment.price_per_day}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">/day</span>
                  </div>
                </div>

                {/* Location & Rating */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium truncate max-w-[120px]">{equipment.location_name || 'Location'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">
                      {equipment.rating?.toFixed(1) || '5.0'}
                    </span>
                    {equipment.review_count && equipment.review_count > 0 && (
                      <span className="text-xs text-gray-500">
                        ({equipment.review_count})
                      </span>
                    )}
                  </div>
                </div>

                {/* Floating action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleBookClick}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 text-white font-bold text-sm uppercase tracking-wide hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transform hover:scale-[1.02] active:scale-95 transition-all duration-300 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={handleCalendarClick}
                    className="px-3 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 hover:border-cyan-400/50 transform hover:scale-105 active:scale-95 transition-all duration-300 motion-reduce:transition-none"
                    aria-label="View calendar"
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleMessageClick}
                    className="px-3 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 hover:border-emerald-400/50 transform hover:scale-105 active:scale-95 transition-all duration-300 motion-reduce:transition-none"
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
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Sidebar state
  const [showPriceFilter, setShowPriceFilter] = useState(true);
  const [showBrandFilter, setShowBrandFilter] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  // Message dialog state
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const limit = 12;

  // Extract unique brands from equipment
  const brands = useMemo(() => {
    const uniqueBrands = new Set<string>();
    equipment.forEach(item => {
      if (item.brand) {
        uniqueBrands.add(item.brand);
      }
    });
    return Array.from(uniqueBrands).sort();
  }, [equipment]);

  const visibleBrands = useMemo(() => {
    let filtered = brands;
    if (brandSearch) {
      filtered = brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
    }
    return showAllBrands ? filtered : filtered.slice(0, 5);
  }, [brands, showAllBrands, brandSearch]);

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

  const loadEquipment = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    const cacheKey = getCacheKey();
    const now = Date.now();

    if (pageNum === 1 && !append) {
      const cached = cache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        setEquipment(cached.data);
        setTotalCount(cached.count);
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
      setTotalCount(result.count);
      setHasMore(newEquipment.length < result.count);

      if (pageNum === 1 && !append) {
        cache.set(cacheKey, {
          data: result.data,
          count: result.count,
          timestamp: now,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message || 'Unknown error occurred';
      console.error('Failed to load equipment:', errorMessage, err);
      if (!append) {
        setEquipment([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [getCacheKey, searchQuery, selectedCategory, priceRange, minRating, equipment]);

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
          setIsAutoRefreshing(true);
          cache.clear();
          loadEquipment(1, false).then(() => {
            setIsAutoRefreshing(false);
            setLastRefresh(new Date());
          });
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadEquipment(1, false);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as EquipmentCategory | 'all');
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    setSortBy('newest');
    setSelectedBrands([]);
    setPage(1);
  };

  const handleManualRefresh = () => {
    cache.clear();
    setPage(1);
    loadEquipment(1, false);
    setLastRefresh(new Date());
  };

  const handleMessage = (eq: Equipment) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/equipment');
      return;
    }
    setSelectedEquipment(eq);
    setShowMessageDialog(true);
  };

  const handleBook = (eq: Equipment) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/equipment');
      return;
    }
    router.push(`/equipment/${eq.id}/book`);
  };

  const sendMessage = async () => {
    if (!selectedEquipment || !messageContent.trim() || !user) return;

    setIsSendingMessage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowMessageDialog(false);
      setMessageContent('');
      setSelectedEquipment(null);
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const hasActiveFilters = searchQuery || (selectedCategory && selectedCategory !== 'all') || priceRange.min || priceRange.max || minRating > 0 || selectedBrands.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Enhanced Page Header with gradient text */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3">
                Premium Equipment
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                <span>›</span>
                <span className="text-white font-medium">Equipment</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20">
                <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Top Rated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 border-b border-gray-800">
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`text-sm whitespace-nowrap pb-3 border-b-2 transition-colors ${selectedCategory === 'all'
                ? 'border-[#DFFF00] text-[#DFFF00]'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
            >
              All Items
            </button>
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`text-sm whitespace-nowrap pb-3 border-b-2 transition-colors ${selectedCategory === cat.value
                  ? 'border-[#DFFF00] text-[#DFFF00]'
                  : 'border-transparent text-gray-400 hover:text-white'
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
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Reset Filters with gradient */}
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 text-red-400 rounded-xl hover:from-red-500/20 hover:to-pink-500/20 hover:border-red-500/40 transition-all duration-300 font-bold text-sm uppercase tracking-wide motion-reduce:transition-none"
              >
                <X className="h-4 w-4" />
                <span>Reset filters</span>
              </button>

              {/* Price Filter with glassmorphism */}
              <div className="bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
                <button
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  className="w-full flex items-center justify-between text-white font-bold mb-4 hover:text-cyan-400 transition-colors motion-reduce:transition-none"
                >
                  <span className="text-lg">Price Range</span>
                  {showPriceFilter ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>

                {showPriceFilter && (
                  <div className="space-y-3">
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
                      className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/50 rounded-xl"
                    />
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
                      className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/50 rounded-xl"
                    />
                    <Button
                      onClick={() => loadEquipment(1, false)}
                      className="w-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] font-bold uppercase tracking-wide transition-all duration-300 rounded-xl motion-reduce:transition-none"
                    >
                      Apply Filter
                    </Button>
                  </div>
                )}
              </div>

              {/* Brand Filter with glassmorphism */}
              <div className="bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
                <button
                  onClick={() => setShowBrandFilter(!showBrandFilter)}
                  className="w-full flex items-center justify-between text-white font-bold mb-4 hover:text-cyan-400 transition-colors motion-reduce:transition-none"
                >
                  <span className="text-lg">Brand</span>
                  {showBrandFilter ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>

                {showBrandFilter && (
                  <div className="space-y-2">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                      <Input
                        placeholder="Search brands"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/50 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      {visibleBrands.length > 0 ? (
                        visibleBrands.map((brand) => (
                          <label
                            key={brand}
                            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2.5 rounded-lg transition-colors motion-reduce:transition-none"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => toggleBrand(brand)}
                              className="w-4 h-4 rounded border-cyan-500/30 bg-black/40 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0"
                            />
                            <span className="text-sm text-gray-300 font-medium">{brand}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 px-2">No brands found</p>
                      )}
                    </div>
                    {!brandSearch && brands.length > 5 && (
                      <button
                        onClick={() => setShowAllBrands(!showAllBrands)}
                        className="w-full text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest py-2 hover:bg-cyan-500/10 rounded-lg transition-colors mt-2"
                      >
                        {showAllBrands ? 'Show Less' : `Show More (${brands.length - 5})`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Equipment Grid */}
          <div className="flex-1">
            {/* Enhanced Search Bar with glassmorphism */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300 motion-reduce:transition-none" />
                <div className="relative bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search premium equipment..."
                    className="pl-14 pr-4 bg-transparent border-0 text-white placeholder:text-gray-500 h-14 text-base focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>
            </form>

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-400">
                {isLoading ? 'Loading...' : `${totalCount} equipment found`}
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 animate-pulse">
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="h-10 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl w-32" />
                      <div className="h-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg w-full" />
                      <div className="h-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg w-3/4" />
                      <div className="flex gap-2">
                        <div className="flex-1 h-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl" />
                        <div className="h-12 w-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl" />
                        <div className="h-12 w-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : equipment.length === 0 ? (
              <EmptyState
                icon={<Tractor className="h-12 w-12" />}
                title="No equipment found"
                description={
                  hasActiveFilters
                    ? 'Try adjusting your filters or search query'
                    : "There's no equipment listed yet. Check back later!"
                }
                action={
                  hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {equipment.map((item) => (
                    <EquipmentCard
                      key={item.id}
                      equipment={item}
                      onMessage={handleMessage}
                      onBook={handleBook}
                      isAuthenticated={isAuthenticated}
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
                  {!hasMore && equipment.length > 0 && (
                    <p className="text-gray-500">You&apos;ve reached the end of the list</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="bg-[#1a1a1a] border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                Message to {selectedEquipment?.owner?.name || 'Equipment Owner'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedEquipment && (
                <div className="flex items-center gap-3 rounded-lg bg-[#0a0a0a] p-3">
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-800">
                    {selectedEquipment.images?.[0] ? (
                      <Image
                        src={selectedEquipment.images[0]}
                        alt={selectedEquipment.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Tractor className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedEquipment.name}</p>
                    <p className="text-sm text-gray-400">
                      {formatCurrency(selectedEquipment.price_per_day)}/day
                    </p>
                  </div>
                </div>
              )}

              <Textarea
                placeholder="Hi, I'm interested in renting this equipment. Is it available for..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
                className="bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-500"
              />

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                <span>Or call: {selectedEquipment?.owner?.phone || 'Not available'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMessageDialog(false)}
                className="flex-1 bg-transparent border-gray-700 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={sendMessage}
                disabled={!messageContent.trim() || isSendingMessage}
                className="flex-1 bg-[#DFFF00] text-black hover:bg-[#DFFF00]/90"
              >
                {isSendingMessage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Spinner size="lg" /></div>}>
      <PublicEquipmentPageContent />
    </Suspense>
  );
}
