'use client';

import { useEffect, useState, useCallback, useRef, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';
import { LabourCardSkeleton } from '@/components/skeletons/LabourSkeleton';
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
  Award,
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
import { labourService, dmService } from '@/lib/services';
import { useAppStore, useAuthStore, useMessagesStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { LabourProfile, LabourAvailability } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { BackButton } from '@/components/ui/back-button';

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
  isAuthenticated,
}: {
  labour: LabourProfile;
  onMessage: (labour: LabourProfile) => void;
  onBook: (labour: LabourProfile) => void;
  isAuthenticated: boolean;
}) {
  const getAvailabilityColor = (availability: LabourAvailability) => {
    switch (availability) {
      case 'available':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'busy':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'unavailable':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getAvailabilityText = (availability: LabourAvailability) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'unavailable':
        return 'Unavailable';
      default:
        return availability;
    }
  };

  return (
    <Card className="group overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="relative h-32 bg-gradient-to-br from-emerald-900/50 via-slate-900 to-slate-900">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900/90 to-transparent" />
        </div>

        <div className="relative -mt-16 px-6">
          <div className="flex items-end justify-between">
            {/* Avatar - Clickable */}
            <Link
              href={`/user/${labour.user_id}`}
              className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-slate-900 shadow-xl transition-transform duration-300 hover:scale-105"
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
                <div className="flex h-full w-full items-center justify-center bg-slate-800">
                  <User className="h-10 w-10 text-slate-500" />
                </div>
              )}
              {/* Availability indicator */}
              <div
                className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-slate-900 ${
                  labour.availability === 'available'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : labour.availability === 'busy'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
              />
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
              className="inline-block transition-colors transition-opacity hover:opacity-80 group-hover:text-emerald-400"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white">
                {labour.user?.name || 'Agricultural Worker'}
              </h3>
            </Link>
            <div className="mt-1.5 flex items-center gap-3">
              {labour.rating && (
                <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-500">
                    {labour.rating.toFixed(1)}
                  </span>
                  {labour.review_count && (
                    <span className="text-xs text-slate-500">({labour.review_count})</span>
                  )}
                </div>
              )}
              {labour.total_jobs && labour.total_jobs > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{labour.total_jobs} jobs</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            {labour.location_name && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="rounded-lg bg-slate-800 p-1.5">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="truncate text-sm" title={labour.location_name}>
                  {labour.location_name}
                </span>
              </div>
            )}

            {/* Experience */}
            <div className="flex items-center gap-2 text-slate-400">
              <div className="rounded-lg bg-slate-800 p-1.5">
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-sm">{labour.experience_years}y exp</span>
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {labour.skills.slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-default border-slate-700 bg-slate-800/50 text-xs text-slate-300 hover:bg-slate-800"
                >
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))}
              {labour.skills.length > 4 && (
                <Badge
                  variant="outline"
                  className="border-slate-700 bg-slate-800/50 text-xs text-slate-400"
                >
                  +{labour.skills.length - 4}
                </Badge>
              )}
            </div>
          </div>

          {/* Bio */}
          {labour.bio && (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">{labour.bio}</p>
          )}

          {/* Pricing */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <div>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(labour.daily_rate)}
              </p>
              <p className="text-xs font-medium text-slate-500">per day</p>
            </div>
            {labour.hourly_rate && (
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-300">
                  {formatCurrency(labour.hourly_rate)}
                </p>
                <p className="text-xs font-medium text-slate-500">per hour</p>
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
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500"
              onClick={() => onBook(labour)}
              disabled={!isAuthenticated || labour.availability === 'unavailable'}
            >
              <Calendar className="mr-2 h-4 w-4" />
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

  // Fuzzy search for labour profiles
  const filteredLabourProfiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return labourProfiles;
    }

    const fuse = new Fuse(labourProfiles, {
      keys: [
        { name: 'user.name', weight: 2.0 },
        { name: 'skills', weight: 1.5 },
        { name: 'city', weight: 1.0 },
        { name: 'location_name', weight: 1.0 },
        { name: 'experience_years', weight: 0.8 },
        { name: 'bio', weight: 0.5 },
      ],
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 2,
      ignoreLocation: true,
      includeScore: false,
    });

    return fuse.search(searchQuery).map((result) => result.item);
  }, [labourProfiles, searchQuery]);

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
      lat: userLocation?.lat,
      lng: userLocation?.lng,
    });
  }, [searchQuery, selectedSkill, selectedAvailability, sortBy, priceRange, userLocation]);

  // Load labour profiles
  const loadLabour = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
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
            availability:
              selectedAvailability !== 'all'
                ? (selectedAvailability as LabourAvailability)
                : undefined,
            minRate: priceRange.min ? Number(priceRange.min) : undefined,
            maxRate: priceRange.max ? Number(priceRange.max) : undefined,
            latitude: userLocation?.lat,
            longitude: userLocation?.lng,
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
          setError(
            'Labour profiles feature is not yet available. Please run the database migration.'
          );
        } else {
          setError('Failed to load workers. Please try again.');
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      getCacheKey,
      searchQuery,
      selectedSkill,
      selectedAvailability,
      priceRange,
      userLocation,
      labourProfiles,
    ]
  );

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
    if (!selectedLabour || !messageText.trim() || !user) {
      console.error('Missing required data:', {
        selectedLabour: !!selectedLabour,
        messageText: !!messageText.trim(),
        user: !!user,
      });
      toast.error('Unable to send message. Please try again.');
      return;
    }

    setIsSending(true);
    try {
      console.log('Creating conversation with labourer:', selectedLabour.user_id);

      // Get or create conversation with the labourer
      const conversationId = await dmService.getOrCreateConversation(selectedLabour.user_id);

      if (!conversationId) {
        throw new Error('Failed to create conversation - no conversation ID returned');
      }

      console.log('Conversation created:', conversationId);

      // Send the message
      await dmService.sendMessage(conversationId, messageText.trim());
      console.log('Message sent successfully');

      // Refresh conversations list in the store
      await useMessagesStore.getState().fetchConversations();

      // Close dialog and reset
      setMessageDialogOpen(false);
      setMessageText('');

      // Show success toast
      toast.success('Message sent! The labourer will be notified.');

      // Redirect to messages page
      router.push(`/messages?conversation=${conversationId}`);
    } catch (err) {
      console.error('Failed to send message:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));

      // Extract meaningful error message
      const errorMessage =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
            ? String(err.message)
            : 'Failed to send message. Please try again.';

      toast.error(errorMessage);
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

  const hasActiveFilters =
    searchQuery ||
    selectedSkill !== 'all' ||
    selectedAvailability !== 'all' ||
    priceRange.min ||
    priceRange.max;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-28">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton variant="minimal" />
        </div>

        {/* Page Header */}
        <div className="relative mb-8">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Skilled <span className="text-emerald-400">Agricultural Workers</span>
              </h1>
              <p className="mt-2 text-lg text-slate-400">
                Find and hire experienced farm workers in your area
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-900/50 hover:text-emerald-400"
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
          <div className="pointer-events-none absolute left-0 top-1/2 -z-0 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skill, or location..."
                  className="h-12 border-slate-800 bg-slate-950 pl-11 text-slate-200 placeholder:text-slate-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="w-full border-slate-800 bg-slate-950 text-slate-200 focus:ring-emerald-500/50 sm:w-48">
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-white">
                  {LABOUR_SKILLS.map((skill) => (
                    <SelectItem
                      key={skill.value}
                      value={skill.value}
                      className="focus:bg-slate-800 focus:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <span>{skill.icon}</span>
                        <span>{skill.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="w-full border-slate-800 bg-slate-950 text-slate-200 focus:ring-emerald-500/50 sm:w-48">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-white">
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="focus:bg-slate-800 focus:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full border-slate-800 bg-slate-950 text-slate-200 focus:ring-emerald-500/50 sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-white">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="focus:bg-slate-800 focus:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">More Filters</span>
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
              <span className="text-sm text-slate-500">Active filters:</span>
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 border border-slate-700 bg-slate-800 text-slate-200"
                >
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-emerald-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedSkill !== 'all' && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 border border-slate-700 bg-slate-800 text-slate-200"
                >
                  {LABOUR_SKILLS.find((s) => s.value === selectedSkill)?.label}
                  <button
                    onClick={() => setSelectedSkill('all')}
                    className="hover:text-emerald-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedAvailability !== 'all' && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 border border-slate-700 bg-slate-800 text-slate-200"
                >
                  {AVAILABILITY_OPTIONS.find((a) => a.value === selectedAvailability)?.label}
                  <button
                    onClick={() => setSelectedAvailability('all')}
                    className="hover:text-emerald-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(priceRange.min || priceRange.max) && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 border border-slate-700 bg-slate-800 text-slate-200"
                >
                  ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                  <button
                    onClick={() => setPriceRange({ min: '', max: '' })}
                    className="hover:text-emerald-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-slate-400">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                Searching...
              </span>
            ) : (
              <span className="font-medium text-slate-300">
                {searchQuery.trim()
                  ? `Showing ${filteredLabourProfiles.length} of ${totalCount} workers`
                  : `${totalCount} workers found`}
              </span>
            )}
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-slate-500">
              <Link href="/login" className="text-emerald-400 hover:underline">
                Login
              </Link>{' '}
              to message and hire workers
            </p>
          )}
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <LabourCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 py-16 text-center">
            <p className="mb-4 text-red-400">{error}</p>
            <Button
              onClick={() => loadLabour(1)}
              variant="outline"
              className="border-slate-700 text-slate-300"
            >
              Try Again
            </Button>
          </div>
        ) : filteredLabourProfiles.length === 0 ? (
          <EmptyState
            icon={<User className="h-16 w-16 text-slate-600" />}
            title="No workers found"
            description={
              hasActiveFilters
                ? 'Try adjusting your filters to find more workers.'
                : 'No workers are currently available in your area.'
            }
            action={
              hasActiveFilters ? (
                <Button
                  onClick={clearFilters}
                  className="bg-slate-800 text-white hover:bg-slate-700"
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
            className="border border-slate-800 bg-slate-900/50 text-slate-400"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLabourProfiles.map((labour) => (
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
            <div ref={loadMoreRef} className="flex justify-center py-12">
              {isLoadingMore && <Spinner className="text-emerald-500" />}
              {!hasMore && filteredLabourProfiles.length > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm text-slate-600">
                  <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                  All workers loaded
                </div>
              )}
            </div>
          </>
        )}

        {/* More Filters Dialog */}
        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent className="border-slate-800 bg-slate-900 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Filter Workers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Daily Rate Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                    className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
                  />
                  <span className="flex items-center text-slate-500">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                    className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
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
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
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
          <DialogContent className="border-slate-800 bg-slate-900 sm:max-w-md">
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
                className="resize-none border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
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
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                >
                  {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Booking Dialog */}
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent className="border-slate-800 bg-slate-900 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                Hire {selectedLabour?.user?.name || 'Worker'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedLabour && (
                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
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
                      <p className="text-sm font-medium text-emerald-400">
                        {formatCurrency(selectedLabour.daily_rate)}/day
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={bookingDates.start}
                    onChange={(e) => setBookingDates((d) => ({ ...d, start: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="border-slate-800 bg-slate-950 text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">End Date</label>
                  <Input
                    type="date"
                    value={bookingDates.end}
                    onChange={(e) => setBookingDates((d) => ({ ...d, end: e.target.value }))}
                    min={bookingDates.start || new Date().toISOString().split('T')[0]}
                    className="border-slate-800 bg-slate-950 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Notes (optional)
                </label>
                <Textarea
                  placeholder="Any specific requirements or instructions..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                  className="resize-none border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
                />
              </div>

              {/* Price Estimate */}
              {selectedLabour && bookingDates.start && bookingDates.end && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Estimated Total:</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {formatCurrency(
                        selectedLabour.daily_rate *
                          Math.max(
                            1,
                            Math.ceil(
                              (new Date(bookingDates.end).getTime() -
                                new Date(bookingDates.start).getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) + 1
                          )
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-600/70">
                    Based on{' '}
                    {Math.max(
                      1,
                      Math.ceil(
                        (new Date(bookingDates.end).getTime() -
                          new Date(bookingDates.start).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1
                    )}{' '}
                    day(s)
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
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
                  onClick={handleSubmitBooking}
                  disabled={!bookingDates.start || !bookingDates.end || isSending}
                >
                  {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500" />
        </div>
      }
    >
      <LabourPageContent />
    </Suspense>
  );
}
