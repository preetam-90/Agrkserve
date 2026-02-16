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
  User,
  Loader2,
  ChevronDown,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Input,
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
  DualRangeSlider,
} from '@/components/ui';
import { labourService, dmService } from '@/lib/services';
import { useAppStore, useAuthStore, useMessagesStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { LabourProfile, LabourAvailability } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

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
  { value: 'sowing', label: 'Sowing', icon: '🌾' },
  { value: 'harvesting', label: 'Harvesting', icon: '🌻' },
  { value: 'mechanic', label: 'Mechanic', icon: '🔧' },
  { value: 'organic_pest_control', label: 'Organic Pest Control', icon: '🐛' },
];

const SKILL_MATCH_PATTERNS: Record<string, string[]> = {
  tractor_operator: ['tractor', 'tractor operation', 'tractor operator'],
  harvester_operator: ['harvester', 'harvest', 'combine'],
  planting: ['planting', 'plant'],
  irrigation: ['irrigation', 'irrigate', 'water'],
  pesticide_spraying: ['spraying', 'spray', 'pest', 'pesticide', 'insecticide'],
  pruning: ['pruning', 'prune', 'trim'],
  weeding: ['weeding', 'weed'],
  general_labour: ['general', 'labour', 'labor', 'farm work', 'field work'],
  livestock: ['livestock', 'cattle', 'cow', 'animal', 'dairy', 'poultry'],
  loading: ['loading', 'unloading', 'load'],
  sowing: ['sowing', 'sow', 'seed'],
  harvesting: ['harvesting', 'harvest', 'reaping'],
  mechanic: ['mechanic', 'repair', 'maintenance', 'machine'],
  organic_pest_control: ['organic', 'pest control', 'biopesticide'],
};

const normalizeSkill = (skill: string): string => {
  return skill.toLowerCase().replace(/_/g, ' ').trim();
};

const skillMatchesFilter = (profileSkill: string, filterValue: string): boolean => {
  const normalizedProfileSkill = normalizeSkill(profileSkill);
  const patterns = SKILL_MATCH_PATTERNS[filterValue];

  if (patterns) {
    return patterns.some((pattern) => normalizedProfileSkill.includes(pattern));
  }

  const normalizedFilter = normalizeSkill(filterValue);
  return normalizedProfileSkill.includes(normalizedFilter);
};

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'Any Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Busy' },
  { value: 'unavailable', label: 'Unavailable' },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'jobs', label: 'Most Jobs Completed' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'All Experience levels' },
  { value: '1', label: '1+ Years' },
  { value: '3', label: '3+ Years' },
  { value: '5', label: '5+ Years' },
  { value: '10', label: '10+ Years' },
];

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: LabourProfile[]; count: number; timestamp: number }>();

// Labour Card Component - Redesigned to match reference
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
  const getAvailabilityStyle = (availability: LabourAvailability) => {
    switch (availability) {
      case 'available':
        return {
          bg: 'bg-emerald-500',
          dot: 'bg-emerald-300',
          text: 'AVAILABLE',
        };
      case 'busy':
        return {
          bg: 'bg-amber-500',
          dot: 'bg-amber-300',
          text: 'BUSY',
        };
      case 'unavailable':
        return {
          bg: 'bg-red-500',
          dot: 'bg-red-300',
          text: 'UNAVAILABLE',
        };
      default:
        return {
          bg: 'bg-slate-600',
          dot: 'bg-slate-400',
          text: String(availability || 'UNKNOWN').toUpperCase(),
        };
    }
  };

  const router = useRouter();
  const availStyle = getAvailabilityStyle(labour.availability);

  const handleCardClick = () => {
    router.push(`/renter/labour/${labour.id}`);
  };

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:border-slate-700"
      onClick={handleCardClick}
    >
      {/* Profile Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
        {labour.user?.profile_image ? (
          <Image
            src={labour.user.profile_image}
            alt={labour.user?.name || 'Worker'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <User className="h-20 w-20 text-slate-600" />
          </div>
        )}

        {/* Availability Badge - Top Left */}
        <div className="absolute left-3 top-3">
          <div
            className={`flex items-center gap-1.5 rounded-full ${availStyle.bg} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg`}
          >
            <span
              className={`h-2 w-2 rounded-full ${availStyle.dot} ${labour.availability === 'available' ? 'animate-pulse' : ''}`}
            />
            {availStyle.text}
          </div>
        </div>

        {/* Rating Badge - Top Right */}
        {labour.rating && (
          <div className="absolute right-3 top-3">
            <div className="flex items-center gap-1 rounded-full bg-slate-900/90 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {labour.rating.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Name + Verified + Location */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/renter/labour/${labour.id}`}
              className="text-lg font-bold text-white transition-colors group-hover:text-emerald-400"
              onClick={(e) => e.stopPropagation()}
            >
              {labour.user?.name || 'Agricultural Worker'}
            </Link>
            {labour.total_jobs && labour.total_jobs > 50 && (
              <BadgeCheck className="h-5 w-5 flex-shrink-0 fill-emerald-500/20 text-emerald-500" />
            )}
          </div>
          {labour.location_name && (
            <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              <span className="truncate">{labour.location_name}</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Experience
            </p>
            <p className="text-sm font-bold text-white">{labour.experience_years} Years</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Jobs Done
            </p>
            <p className="text-sm font-bold text-white">{labour.total_jobs || 0}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Rate
            </p>
            <p className="text-sm font-bold text-emerald-400">
              {formatCurrency(labour.daily_rate)}/d
            </p>
          </div>
        </div>

        {/* Skill Tags */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {labour.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400"
            >
              {skill.replace(/_/g, ' ')}
            </span>
          ))}
          {labour.skills.length > 3 && (
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              +{labour.skills.length - 3}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <Button
            size="sm"
            className={`flex-1 rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-400 ${
              labour.availability === 'unavailable' ? 'opacity-50' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onBook(labour);
            }}
            disabled={!isAuthenticated || labour.availability === 'unavailable'}
          >
            Hire Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-full border-slate-700 bg-transparent py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onMessage(labour);
            }}
            disabled={!isAuthenticated}
          >
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sidebar Filter Component
function FilterSidebar({
  selectedSkills,
  onSkillToggle,
  selectedAvailability,
  onAvailabilityChange,
  priceRange,
  onPriceRangeChange,
  selectedExperience,
  onExperienceChange,
  availableCount,
}: {
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  selectedAvailability: string;
  onAvailabilityChange: (val: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (val: [number, number]) => void;
  selectedExperience: string;
  onExperienceChange: (val: string) => void;
  availableCount: number;
}) {
  return (
    <aside className="sticky top-24 h-fit space-y-7">
      {/* Availability Section */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-500">
          Availability
        </h3>
        <div className="space-y-2.5">
          {AVAILABILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-0.5 transition-colors hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                    selectedAvailability === option.value
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                  onClick={() => onAvailabilityChange(option.value)}
                >
                  {selectedAvailability === option.value && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </div>
                <span className="text-sm text-slate-300">{option.label}</span>
              </div>
              {option.value === 'available' && availableCount > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                  {availableCount}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Skills & Expertise Section */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-500">
          Skills & Expertise
        </h3>
        <div className="flex flex-wrap gap-2">
          {LABOUR_SKILLS.filter((s) => s.value !== 'all').map((skill) => (
            <button
              key={skill.value}
              onClick={() => onSkillToggle(skill.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                selectedSkills.includes(skill.value)
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              {skill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500">
            Price Range
          </h3>
          <span className="text-xs text-slate-400">
            {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])} / day
          </span>
        </div>
        <DualRangeSlider
          min={200}
          max={2000}
          step={50}
          value={priceRange}
          onValueChange={onPriceRangeChange}
          colorScheme="emerald"
          className="py-2"
        />
      </div>

      {/* Experience Section */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-500">
          Experience
        </h3>
        <Select value={selectedExperience} onValueChange={onExperienceChange}>
          <SelectTrigger className="w-full border-slate-700 bg-slate-800/50 text-slate-200 focus:ring-emerald-500/50">
            <SelectValue placeholder="All Experience levels" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-white">
            {EXPERIENCE_OPTIONS.map((option) => (
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
      </div>
    </aside>
  );
}

// Mobile Filter Drawer
function MobileFilterDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-700 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Filters</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-slate-800">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        {children}
        <div className="mt-6">
          <Button
            className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
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

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [priceRange, setPriceRange] = useState<[number, number]>([200, 2000]);
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  // Skill toggle handler
  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }, []);

  // Available count
  const availableCount = useMemo(
    () => labourProfiles.filter((l) => l.availability === 'available').length,
    [labourProfiles]
  );

  // Fuzzy search for labour profiles
  const filteredLabourProfiles = useMemo(() => {
    let profiles = labourProfiles;

    // Apply client-side skill filter
    if (selectedSkills.length > 0) {
      profiles = profiles.filter((p) =>
        selectedSkills.some((filterSkill) =>
          p.skills.some((profileSkill) => skillMatchesFilter(profileSkill, filterSkill))
        )
      );
    }

    // Apply client-side price filter (if not default range)
    if (priceRange[0] > 200 || priceRange[1] < 2000) {
      profiles = profiles.filter(
        (p) => p.daily_rate >= priceRange[0] && p.daily_rate <= priceRange[1]
      );
    }

    // Apply experience filter
    if (selectedExperience !== 'all') {
      const minExp = parseInt(selectedExperience);
      profiles = profiles.filter((p) => p.experience_years >= minExp);
    }

    if (!searchQuery.trim()) {
      return profiles;
    }

    const fuse = new Fuse(profiles, {
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
  }, [labourProfiles, searchQuery, selectedSkills, priceRange, selectedExperience]);

  // Generate cache key
  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      search: searchQuery,
      availability: selectedAvailability,
      sort: sortBy,
      lat: userLocation?.lat,
      lng: userLocation?.lng,
    });
  }, [searchQuery, selectedAvailability, sortBy, userLocation]);

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
            availability:
              selectedAvailability !== 'all'
                ? (selectedAvailability as LabourAvailability)
                : undefined,
            minRate: priceRange[0] > 200 ? priceRange[0] : undefined,
            maxRate: priceRange[1] < 2000 ? priceRange[1] : undefined,
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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        const errorCode = (err as { code?: string })?.code;
        console.error('Failed to load labour profiles:', errorMessage, errorCode);

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
    [getCacheKey, searchQuery, selectedAvailability, priceRange, userLocation, labourProfiles]
  );

  // Initial load
  useEffect(() => {
    loadLabour(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAvailability, sortBy, userLocation]);

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

  // Handle load more button click
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadLabour(page + 1, true);
    }
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

      const conversationId = await dmService.getOrCreateConversation(selectedLabour.user_id);

      if (!conversationId) {
        throw new Error('Failed to create conversation - no conversation ID returned');
      }

      console.log('Conversation created:', conversationId);

      await dmService.sendMessage(conversationId, messageText.trim());
      console.log('Message sent successfully');

      await useMessagesStore.getState().fetchConversations();

      setMessageDialogOpen(false);
      setMessageText('');

      toast.success('Message sent! The labourer will be notified.');

      router.push(`/messages?conversation=${conversationId}`);
    } catch (err) {
      console.error('Failed to send message:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));

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
      const booking = await labourService.createBooking({
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
      router.push(`/renter/labour/bookings/${booking.id}`);
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setSelectedAvailability('all');
    setSortBy('rating');
    setPriceRange([200, 2000]);
    setSelectedExperience('all');
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedSkills.length > 0 ||
    selectedAvailability !== 'all' ||
    priceRange[0] > 200 ||
    priceRange[1] < 2000 ||
    selectedExperience !== 'all';

  // Filter sidebar content (shared between desktop and mobile)
  const filterContent = (
    <FilterSidebar
      selectedSkills={selectedSkills}
      onSkillToggle={handleSkillToggle}
      selectedAvailability={selectedAvailability}
      onAvailabilityChange={setSelectedAvailability}
      priceRange={priceRange}
      onPriceRangeChange={setPriceRange}
      selectedExperience={selectedExperience}
      onExperienceChange={setSelectedExperience}
      availableCount={availableCount}
    />
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <Header />

      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-24">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden w-64 flex-shrink-0 lg:block">{filterContent}</div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Top Bar: Title + Sort */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  Discover Skilled Labour{' '}
                  {!isLoading && (
                    <span className="text-lg font-normal text-slate-500">
                      ({totalCount} results)
                    </span>
                  )}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 lg:hidden"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </Button>

                {/* Sort Dropdown - Redesigned */}
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="group flex w-[180px] items-center justify-between gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all hover:border-emerald-500/40 hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                          <svg
                            className="h-3.5 w-3.5 text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                            />
                          </svg>
                        </div>
                        <span className="truncate">
                          {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Sort'}
                        </span>
                      </div>
                      <svg
                        className="h-4 w-4 text-slate-500 transition-transform group-data-[state=open]:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </SelectTrigger>
                    <SelectContent className="border-slate-700/60 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-all hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800">
                            {option.value === 'rating' && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                            {option.value === 'price_asc' && (
                              <svg
                                className="h-4 w-4 text-emerald-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                                />
                              </svg>
                            )}
                            {option.value === 'price_desc' && (
                              <svg
                                className="h-4 w-4 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                                />
                              </svg>
                            )}
                            {option.value === 'experience' && (
                              <svg
                                className="h-4 w-4 text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                            {option.value === 'jobs' && (
                              <svg
                                className="h-4 w-4 text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium">{option.label}</span>
                          {sortBy === option.value && (
                            <svg
                              className="ml-auto h-4 w-4 text-emerald-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Skills (e.g. Tractor), or Location..."
                className="h-12 rounded-xl border-slate-800 bg-slate-900/80 pl-12 text-slate-200 placeholder:text-slate-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Active Filters Row */}
            {hasActiveFilters && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Active:</span>
                {selectedSkills.map((skill) => {
                  const skillInfo = LABOUR_SKILLS.find((s) => s.value === skill);
                  return (
                    <Badge
                      key={skill}
                      className="flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    >
                      {skillInfo?.label || skill}
                      <button onClick={() => handleSkillToggle(skill)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                {selectedAvailability !== 'all' && (
                  <Badge className="flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    {AVAILABILITY_OPTIONS.find((a) => a.value === selectedAvailability)?.label}
                    <button onClick={() => setSelectedAvailability('all')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(priceRange[0] > 200 || priceRange[1] < 2000) && (
                  <Badge className="flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                    <button onClick={() => setPriceRange([200, 2000])}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedExperience !== 'all' && (
                  <Badge className="flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    {selectedExperience}+ Years Exp
                    <button onClick={() => setSelectedExperience('all')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <button
                  onClick={clearFilters}
                  className="ml-1 text-xs text-red-400 transition-colors hover:text-red-300"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Not authenticated notice */}
            {!isAuthenticated && (
              <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                <Link href="/login" className="font-medium text-emerald-400 hover:underline">
                  Login
                </Link>{' '}
                to message and hire workers
              </div>
            )}

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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

                {/* Load More Button */}
                <div ref={loadMoreRef} className="mt-10 flex justify-center">
                  {isLoadingMore ? (
                    <Spinner className="text-emerald-500" />
                  ) : hasMore ? (
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      className="rounded-xl border-slate-700 bg-slate-800/50 px-8 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-emerald-500/30 hover:bg-slate-800 hover:text-white"
                    >
                      Load More Workers
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : filteredLabourProfiles.length > 0 ? (
                    <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm text-slate-600">
                      <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                      All workers loaded
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer open={showMobileFilters} onClose={() => setShowMobileFilters(false)}>
          {filterContent}
        </MobileFilterDrawer>

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
