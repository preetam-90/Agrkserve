'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
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
  Phone
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
import { equipmentService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { Equipment, EquipmentCategory } from '@/lib/types';
import { EQUIPMENT_CATEGORIES, formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: Equipment[]; count: number; timestamp: number }>();

// Equipment Card Component with all features
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
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const images = equipment.images || [];
  
  // Fetch booked dates for calendar
  useEffect(() => {
    if (showCalendar) {
      fetchBookedDates();
    }
  }, [showCalendar, equipment.id]);

  const fetchBookedDates = async () => {
    try {
      // In a real app, this would fetch from the booking service
      // For now, we'll simulate some booked dates
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const booked: Date[] = [];
      
      // Simulate some random booked dates
      for (let i = 0; i < 5; i++) {
        const date = new Date(startOfMonth);
        date.setDate(date.getDate() + Math.floor(Math.random() * 30));
        booked.push(date);
      }
      setBookedDates(booked);
    } catch (error) {
      console.error('Failed to fetch booked dates:', error);
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

  // Simple availability calendar component
  const AvailabilityCalendar = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today);
    
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
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return bookedDates.some(
        (booked) => booked.toDateString() === date.toDateString()
      );
    };

    const isPast = (day: number) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Availability Calendar - {equipment.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before first of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="py-2" />
              ))}
              
              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const past = isPast(day);
                const booked = isBooked(day);
                
                return (
                  <div
                    key={day}
                    className={`py-2 rounded-full text-sm ${
                      past
                        ? 'text-gray-300'
                        : booked
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-100" />
                <span>Booked</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden group">
        {/* Image Gallery */}
        <div className="aspect-[4/3] bg-gray-100 relative">
          {images.length > 0 ? (
            <>
              <Image
                src={images[currentImageIndex]}
                alt={equipment.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Image navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  {/* Image indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tractor className="h-12 w-12 text-gray-300" />
            </div>
          )}
          
          {/* Availability Badge */}
          {equipment.is_available ? (
            <Badge className="absolute top-2 right-2" variant="success">
              Available
            </Badge>
          ) : (
            <Badge className="absolute top-2 right-2" variant="secondary">
              Booked
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          {/* Owner Info */}
          <Link 
            href={`/user/${equipment.owner_id}`}
            className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {equipment.owner?.profile_image ? (
              <Image
                src={equipment.owner.profile_image}
                alt={equipment.owner.name || 'Owner'}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <span className="text-sm text-gray-600 truncate hover:text-green-600">
              {equipment.owner?.name || 'Equipment Owner'}
            </span>
          </Link>
          
          {/* Equipment Name */}
          <Link href={`/renter/equipment/${equipment.id}`}>
            <h3 className="font-semibold text-gray-900 truncate hover:text-green-600 transition-colors">
              {equipment.name}
            </h3>
          </Link>
          
          {/* Location */}
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{equipment.location_name || 'Location not specified'}</span>
          </p>
          
          {/* Price and Rating */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center">
              <IndianRupee className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                {equipment.price_per_day}
              </span>
              <span className="text-sm text-gray-500">/day</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {equipment.rating?.toFixed(1) || 'New'}
              </span>
              {equipment.review_count && equipment.review_count > 0 && (
                <span className="text-xs text-gray-500">
                  ({equipment.review_count})
                </span>
              )}
            </div>
          </div>
          
          {/* Category Badge */}
          {equipment.category && (
            <Badge variant="outline" className="mt-2">
              {EQUIPMENT_CATEGORIES.find(c => c.value === equipment.category)?.label || equipment.category}
            </Badge>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCalendarClick}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleMessageClick}
              disabled={!isAuthenticated}
              title={!isAuthenticated ? 'Login to message' : 'Message owner'}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
          
          {/* Book Now Button */}
          <Button
            className="w-full mt-2"
            onClick={handleBookClick}
            disabled={!equipment.is_available}
          >
            {equipment.is_available ? 'Book Now' : 'Not Available'}
          </Button>
        </CardContent>
      </Card>
      
      {/* Calendar Dialog */}
      <AvailabilityCalendar />
    </>
  );
}

function PublicEquipmentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const supabase = createClient();
  
  // Derive authentication state from user
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
  
  // Message dialog state
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const limit = 12;

  // Generate cache key
  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      search: searchQuery,
      category: selectedCategory,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minRating,
      sortBy,
    });
  }, [searchQuery, selectedCategory, priceRange, minRating, sortBy]);

  // Load equipment with caching
  const loadEquipment = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    const cacheKey = getCacheKey();
    const now = Date.now();
    
    // Check cache (only for first page and not appending)
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
      
      // Update cache for first page
      if (pageNum === 1 && !append) {
        cache.set(cacheKey, {
          data: result.data,
          count: result.count,
          timestamp: now,
        });
      }
    } catch (err: unknown) {
      // Handle Supabase errors which might come as empty objects
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { message?: string })?.message || 'Unknown error occurred';
      console.error('Failed to load equipment:', errorMessage, err);
      // Set empty state on error so UI doesn't stay in loading state
      if (!append) {
        setEquipment([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [getCacheKey, searchQuery, selectedCategory, priceRange, minRating, equipment]);

  // Initial load and filter changes
  useEffect(() => {
    setPage(1);
    loadEquipment(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, minRating]);

  // Real-time subscription for new equipment
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
          // Auto-refresh when new equipment is added
          setIsAutoRefreshing(true);
          // Clear cache to get fresh data
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

  // Infinite scroll observer
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

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    setSortBy('newest');
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
    router.push(`/renter/equipment/${eq.id}/book`);
  };

  const sendMessage = async () => {
    if (!selectedEquipment || !messageContent.trim() || !user) return;
    
    setIsSendingMessage(true);
    try {
      // In a real implementation, this would create/get a conversation and send the message
      // For now, we'll show a success state
      // await messageService.sendDirectMessage(selectedEquipment.owner_id, messageContent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowMessageDialog(false);
      setMessageContent('');
      setSelectedEquipment(null);
      // Show success toast/notification
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const hasActiveFilters = searchQuery || (selectedCategory && selectedCategory !== 'all') || priceRange.min || priceRange.max || minRating > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Agricultural Equipment
              </h1>
              <p className="text-gray-600 mt-1">
                Find and rent farming equipment from local providers
              </p>
            </div>
            
            {/* Auto-refresh indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isAutoRefreshing && (
                <div className="flex items-center gap-1 text-green-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Refreshing...</span>
                </div>
              )}
              <button
                onClick={handleManualRefresh}
                className="flex items-center gap-1 hover:text-green-600 transition-colors"
                title="Refresh listings"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            {/* Search row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search equipment by name or description..."
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
            
            {/* Filters row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={minRating.toString()} 
                onValueChange={(v) => setMinRating(Number(v))}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowFilters(true)}
                className="sm:w-auto"
              >
                <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">More Filters</span>
              </Button>
            </div>
          </form>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} aria-label="Remove search filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {EQUIPMENT_CATEGORIES.find(c => c.value === selectedCategory)?.icon}{' '}
                  {EQUIPMENT_CATEGORIES.find(c => c.value === selectedCategory)?.label}
                  <button onClick={() => setSelectedCategory('all')} aria-label="Remove category filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(priceRange.min || priceRange.max) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                  <button onClick={() => setPriceRange({ min: '', max: '' })} aria-label="Remove price filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating(0)} aria-label="Remove rating filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${totalCount} equipment found`}
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500">
              <Link href="/login" className="text-green-600 hover:underline">
                Login
              </Link>{' '}
              to message owners and book equipment
            </p>
          )}
        </div>

        {/* Equipment Grid */}
        {isLoading && page === 1 ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : equipment.length === 0 ? (
          <EmptyState
            icon={<Tractor className="h-12 w-12" />}
            title="No equipment found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters or search query"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
            <div ref={loadMoreRef} className="py-8 flex justify-center">
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

        {/* Filter Dialog */}
        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Equipment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {EQUIPMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (per day)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <Select 
                  value={minRating.toString()} 
                  onValueChange={(v) => setMinRating(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Clear All
              </Button>
              <Button 
                onClick={() => { 
                  loadEquipment(1, false); 
                  setShowFilters(false); 
                }} 
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Message to {selectedEquipment?.owner?.name || 'Equipment Owner'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedEquipment && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    {selectedEquipment.images?.[0] ? (
                      <Image
                        src={selectedEquipment.images[0]}
                        alt={selectedEquipment.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tractor className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedEquipment.name}</p>
                    <p className="text-sm text-gray-500">
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
              />
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4" />
                <span>
                  Or call: {selectedEquipment?.owner?.phone || 'Not available'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowMessageDialog(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={sendMessage}
                disabled={!messageContent.trim() || isSendingMessage}
                className="flex-1"
              >
                {isSendingMessage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner /></div>}>
      <PublicEquipmentPageContent />
    </Suspense>
  );
}
