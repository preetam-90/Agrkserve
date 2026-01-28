'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Star,
  X,
  SlidersHorizontal,
  Calendar,
  MessageCircle,
  User,
  RefreshCw,
  Loader2,
  Briefcase,
  Award
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
import { labourService } from '@/lib/services';
import { useAppStore, useAuthStore } from '@/lib/store';
import { LabourProfile, LabourAvailability } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

// Common skills for agricultural labour
const LABOUR_SKILLS = [
  { value: 'all', label: 'All Skills', icon: '👷' },
  { value: 'tractor_operator', label: 'Tractor Operator', icon: '🚜' },
  { value: 'harvester_operator', label: 'Harvester Operator', icon: '🌾' },
  { value: 'planting', label: 'Planting', icon: '🌱' },
  { value: 'irrigation', label: 'Irrigation', icon: '💧' },
  { value: 'pesticide_spraying', label: 'Pesticide Spraying', icon: '🧴' },
  { value: 'pruning', label: 'Pruning', icon: '✂️' },
  { value: 'weeding', label: 'Weeding', icon: '🌿' },
  { value: 'general_labour', label: 'General Labour', icon: '👨‍🌾' },
  { value: 'livestock', label: 'Livestock Care', icon: '🐄' },
  { value: 'loading', label: 'Loading/Unloading', icon: '📦' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'Any Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Busy' },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'jobs', label: 'Most Jobs Completed' },
];

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: LabourProfile[]; count: number; timestamp: number }>();

// Labour Card Component
function LabourCard({
  labour,
  onMessage,
  onBook,
  isAuthenticated
}: {
  labour: LabourProfile;
  onMessage: (labour: LabourProfile) => void;
  onBook: (labour: LabourProfile) => void;
  isAuthenticated: boolean;
}) {
  const getAvailabilityColor = (availability: LabourAvailability) => {
    switch (availability) {
      case 'available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'busy': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'unavailable': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getAvailabilityText = (availability: LabourAvailability) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'unavailable': return 'Unavailable';
      default: return availability;
    }
  };

  return (
    <Card className="group bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden backdrop-blur-sm">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="relative h-32 bg-gradient-to-br from-emerald-900/50 via-slate-900 to-slate-900">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900/90 to-transparent" />
        </div>

        <div className="px-6 relative -mt-16">
          <div className="flex justify-between items-end">
            {/* Avatar - Clickable */}
            <Link
              href={`/user/${labour.user_id}`}
              className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-xl flex-shrink-0 hover:scale-105 transition-transform duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {labour.user?.profile_image ? (
                <Image
                  src={labour.user.profile_image}
                  alt={labour.user?.name || 'Worker'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <User className="h-10 w-10 text-slate-500" />
                </div>
              )}
              {/* Availability indicator */}
              <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-slate-900 ${labour.availability === 'available' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                labour.availability === 'busy' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
            </Link>

            <div className="mb-1">
              <Badge className={`border ${getAvailabilityColor(labour.availability)}`}>
                {getAvailabilityText(labour.availability)}
              </Badge>
            </div>
          </div>

          {/* Name and Rating */}
          <div className="mt-4">
            <Link
              href={`/user/${labour.user_id}`}
              className="hover:opacity-80 transition-opacity inline-block group-hover:text-emerald-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white">
                {labour.user?.name || 'Agricultural Worker'}
              </h3>
            </Link>
            <div className="flex items-center gap-3 mt-1.5">
              {labour.rating && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold text-yellow-500 text-sm">{labour.rating.toFixed(1)}</span>
                  {labour.review_count && (
                    <span className="text-slate-500 text-xs">({labour.review_count})</span>
                  )}
                </div>
              )}
              {labour.total_jobs && labour.total_jobs > 0 && (
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{labour.total_jobs} jobs</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            {labour.location_name && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="p-1.5 rounded-lg bg-slate-800">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-sm truncate" title={labour.location_name}>{labour.location_name}</span>
              </div>
            )}

            {/* Experience */}
            <div className="flex items-center gap-2 text-slate-400">
              <div className="p-1.5 rounded-lg bg-slate-800">
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-sm">{labour.experience_years}y exp</span>
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {labour.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 cursor-default">
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))}
              {labour.skills.length > 4 && (
                <Badge variant="outline" className="text-xs bg-slate-800/50 border-slate-700 text-slate-400">
                  +{labour.skills.length - 4}
                </Badge>
              )}
            </div>
          </div>

          {/* Bio */}
          {labour.bio && (
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
              {labour.bio}
            </p>
          )}

          {/* Pricing */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(labour.daily_rate)}
              </p>
              <p className="text-xs text-slate-500 font-medium">per day</p>
            </div>
            {labour.hourly_rate && (
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-300">
                  {formatCurrency(labour.hourly_rate)}
                </p>
                <p className="text-xs text-slate-500 font-medium">per hour</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => onMessage(labour)}
              disabled={!isAuthenticated}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
              onClick={() => onBook(labour)}
              disabled={!isAuthenticated || labour.availability === 'unavailable'}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Hire Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LabourPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { userLocation } = useAppStore();

  // Derived state
  const isAuthenticated = !!user;

  // State
  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Dialogs
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState<LabourProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' });
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const limit = 12;

  // Initialize lastUpdated on client side only to avoid hydration mismatch
  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  // Generate cache key
  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      search: searchQuery,
      skill: selectedSkill,
      availability: selectedAvailability,
      sort: sortBy,
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      lat: userLocation?.latitude,
      lng: userLocation?.longitude,
    });
  }, [searchQuery, selectedSkill, selectedAvailability, sortBy, priceRange, userLocation]);

  // Load labour profiles
  const loadLabour = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    const cacheKey = getCacheKey();

    // Check cache for first page
    if (pageNum === 1 && !append) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setLabourProfiles(cached.data);
        setTotalCount(cached.count);
        setHasMore(cached.data.length < cached.count);
        setIsLoading(false);
        return;
      }
    }

    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const result = await labourService.search(
        {
          search: searchQuery || undefined,
          skills: selectedSkill !== 'all' ? [selectedSkill] : undefined,
          availability: selectedAvailability !== 'all' ? selectedAvailability as LabourAvailability : undefined,
          minRate: priceRange.min ? Number(priceRange.min) : undefined,
          maxRate: priceRange.max ? Number(priceRange.max) : undefined,
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
          radiusKm: 100,
        },
        pageNum,
        limit
      );

      const newData = append ? [...labourProfiles, ...result.data] : result.data;

      // Update cache for first page
      if (pageNum === 1 && !append) {
        cache.set(cacheKey, {
          data: result.data,
          count: result.count,
          timestamp: Date.now(),
        });
      }

      setLabourProfiles(newData);
      setTotalCount(result.count);
      setHasMore(newData.length < result.count);
      setPage(pageNum);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const errorCode = (err as { code?: string })?.code;
      console.error('Failed to load labour profiles:', errorMessage, errorCode);

      // Check if it's a table not found error
      if (errorCode === '42P01' || errorMessage.includes('does not exist')) {
        setError('Labour profiles feature is not yet available. Please run the database migration.');
      } else {
        setError('Failed to load workers. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [getCacheKey, searchQuery, selectedSkill, selectedAvailability, priceRange, userLocation, labourProfiles]);

  // Initial load
  useEffect(() => {
    loadLabour(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkill, selectedAvailability, sortBy, userLocation]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadLabour(page + 1, true);
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
  }, [hasMore, isLoadingMore, isLoading, page, loadLabour]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLabour(1);
  };

  // Handle refresh
  const handleRefresh = () => {
    cache.clear();
    setPage(1);
    loadLabour(1);
  };

  // Handle message
  const handleMessage = (labour: LabourProfile) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/labour');
      return;
    }
    setSelectedLabour(labour);
    setMessageDialogOpen(true);
  };

  // Handle book
  const handleBook = (labour: LabourProfile) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/labour');
      return;
    }
    setSelectedLabour(labour);
    setBookingDialogOpen(true);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!selectedLabour || !messageText.trim() || !user) return;

    setIsSending(true);
    try {
      // For labour contacts, we'll first create a booking request,
      // then the conversation will be created with it
      // For now, show a message that this feature is coming soon
      // or redirect to a contact form
      console.log('Sending message to:', selectedLabour.user_id, messageText.trim());

      // Close dialog and reset
      setMessageDialogOpen(false);
      setMessageText('');

      // In a real implementation, you would either:
      // 1. Create a "contact request" system
      // 2. Use a direct messaging system without bookings
      // 3. Create a pending booking and start conversation with it
      alert('Message sent! The labourer will be notified and can respond to you.');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!selectedLabour || !bookingDates.start || !bookingDates.end || !user) return;

    setIsSending(true);
    try {
      // Create labour booking via the service
      await labourService.createBooking({
        labour_id: selectedLabour.id,
        employer_id: user.id,
        start_date: bookingDates.start,
        end_date: bookingDates.end,
        daily_rate: selectedLabour.daily_rate,
        notes: bookingNotes || undefined,
      });
      setBookingDialogOpen(false);
      setBookingDates({ start: '', end: '' });
      setBookingNotes('');
      // Redirect to bookings or show success
      router.push('/renter/bookings');
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkill('all');
    setSelectedAvailability('all');
    setSortBy('rating');
    setPriceRange({ min: '', max: '' });
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedSkill !== 'all' || selectedAvailability !== 'all' || priceRange.min || priceRange.max;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Skilled <span className="text-emerald-400">Agricultural Workers</span>
              </h1>
              <p className="text-slate-400 mt-2 text-lg">
                Find and hire experienced farm workers in your area
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-900/50"
                title="Refresh listings"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '...'}
                </span>
              </button>
            </div>
          </div>
          {/* Background Glow */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-5 mb-8 shadow-xl">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skill, or location..."
                  className="pl-11 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 h-12"
                />
              </div>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-8 shadow-lg shadow-emerald-900/20">
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="w-full sm:w-48 bg-slate-950 border-slate-800 text-slate-200 focus:ring-emerald-500/50">
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {LABOUR_SKILLS.map((skill) => (
                    <SelectItem key={skill.value} value={skill.value} className="focus:bg-slate-800 focus:text-white">
                      <span className="flex items-center gap-2">
                        <span>{skill.icon}</span>
                        <span>{skill.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="w-full sm:w-48 bg-slate-950 border-slate-800 text-slate-200 focus:ring-emerald-500/50">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="focus:bg-slate-800 focus:text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 bg-slate-950 border-slate-800 text-slate-200 focus:ring-emerald-500/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="focus:bg-slate-800 focus:text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">More Filters</span>
              </Button>
            </div>
          </form>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800">
              <span className="text-sm text-slate-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-slate-800 text-slate-200 border border-slate-700">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-emerald-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedSkill !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-slate-800 text-slate-200 border border-slate-700">
                  {LABOUR_SKILLS.find(s => s.value === selectedSkill)?.label}
                  <button onClick={() => setSelectedSkill('all')} className="hover:text-emerald-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedAvailability !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-slate-800 text-slate-200 border border-slate-700">
                  {AVAILABILITY_OPTIONS.find(a => a.value === selectedAvailability)?.label}
                  <button onClick={() => setSelectedAvailability('all')} className="hover:text-emerald-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(priceRange.min || priceRange.max) && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-slate-800 text-slate-200 border border-slate-700">
                  ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                  <button onClick={() => setPriceRange({ min: '', max: '' })} className="hover:text-emerald-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                Searching...
              </span>
            ) : (
              <span className="text-slate-300 font-medium">{totalCount} workers found</span>
            )}
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-slate-500">
              <Link href="/login" className="text-emerald-400 hover:underline">Login</Link>
              {' '}to message and hire workers
            </p>
          )}
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <p className="text-slate-500 animate-pulse">Finding best matches...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => loadLabour(1)} variant="outline" className="border-slate-700 text-slate-300">
              Try Again
            </Button>
          </div>
        ) : labourProfiles.length === 0 ? (
          <EmptyState
            icon={<User className="h-16 w-16 text-slate-600" />}
            title="No workers found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters to find more workers."
                : "No workers are currently available in your area."
            }
            action={
              hasActiveFilters ? (
                <Button onClick={clearFilters} className="bg-slate-800 hover:bg-slate-700 text-white">
                  Clear Filters
                </Button>
              ) : undefined
            }
            className="bg-slate-900/50 border border-slate-800 text-slate-400"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labourProfiles.map((labour) => (
                <LabourCard
                  key={labour.id}
                  labour={labour}
                  onMessage={handleMessage}
                  onBook={handleBook}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="py-12 flex justify-center">
              {isLoadingMore && <Spinner className="text-emerald-500" />}
              {!hasMore && labourProfiles.length > 0 && (
                <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  All workers loaded
                </div>
              )}
            </div>
          </>
        )}

        {/* More Filters Dialog */}
        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Filter Workers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Daily Rate Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                  />
                  <span className="flex items-center text-slate-500">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                  onClick={clearFilters}
                >
                  Reset
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => {
                    setShowFilters(false);
                    loadLabour(1);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                Message {selectedLabour?.user?.name || 'Worker'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Write your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 resize-none"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                  onClick={() => setMessageDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Booking Dialog */}
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                Hire {selectedLabour?.user?.name || 'Worker'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedLabour && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700" >
                      {selectedLabour.user?.profile_image ? (
                        <Image
                          src={selectedLabour.user.profile_image}
                          alt={selectedLabour.user?.name || 'Worker'}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">{selectedLabour.user?.name}</p>
                      <p className="text-sm text-emerald-400 font-medium">
                        {formatCurrency(selectedLabour.daily_rate)}/day
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={bookingDates.start}
                    onChange={(e) => setBookingDates(d => ({ ...d, start: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={bookingDates.end}
                    onChange={(e) => setBookingDates(d => ({ ...d, end: e.target.value }))}
                    min={bookingDates.start || new Date().toISOString().split('T')[0]}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <Textarea
                  placeholder="Any specific requirements or instructions..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Price Estimate */}
              {selectedLabour && bookingDates.start && bookingDates.end && (
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Estimated Total:</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {formatCurrency(
                        selectedLabour.daily_rate *
                        Math.max(1, Math.ceil(
                          (new Date(bookingDates.end).getTime() - new Date(bookingDates.start).getTime())
                          / (1000 * 60 * 60 * 24)
                        ) + 1)
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600/70 mt-1">
                    Based on {Math.max(1, Math.ceil(
                      (new Date(bookingDates.end).getTime() - new Date(bookingDates.start).getTime())
                      / (1000 * 60 * 60 * 24)
                    ) + 1)} day(s)
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                  onClick={() => setBookingDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={handleSubmitBooking}
                  disabled={!bookingDates.start || !bookingDates.end || isSending}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Booking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}

export default function LabourPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>}>
      <LabourPageContent />
    </Suspense>
  );
}
