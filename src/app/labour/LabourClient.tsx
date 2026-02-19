'use client';

import { useEffect, useState, useCallback, useRef, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Fuse from 'fuse.js';
import { LabourCardSkeleton } from '@/components/skeletons/LabourSkeleton';
import {
  MapPin,
  Star,
  X,
  User,
  Loader2,
  CheckCircle2,
  BadgeCheck,
  Heart,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
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
} from '@/components/ui';
import { labourService, dmService } from '@/lib/services';
import { useAppStore, useAuthStore, useMessagesStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { LabourProfile, LabourAvailability } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const LABOUR_SKILLS = [
  { value: 'all', label: 'All Skills' },
  { value: 'tractor_operator', label: 'Tractor Op' },
  { value: 'harvester_operator', label: 'Harvester' },
  { value: 'planting', label: 'Planting' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'pesticide_spraying', label: 'Spraying' },
  { value: 'pruning', label: 'Pruning' },
  { value: 'weeding', label: 'Weeding' },
  { value: 'general_labour', label: 'General' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'loading', label: 'Loading' },
  { value: 'sowing', label: 'Sowing' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'mechanic', label: 'Mechanic' },
  { value: 'drone_pilot', label: 'Drone Pilot' },
  { value: 'gps_specialist', label: 'GPS Specialist' },
  { value: 'soil_science', label: 'Soil Science' },
  { value: 'packing', label: 'Packing' },
  { value: 'quality_control', label: 'Quality Ctrl' },
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
  drone_pilot: ['drone', 'pilot', 'uav'],
  gps_specialist: ['gps', 'specialist', 'mapping'],
  soil_science: ['soil', 'science', 'agronomy'],
  packing: ['packing', 'packaging'],
  quality_control: ['quality', 'control', 'qc'],
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
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'unavailable', label: 'Unavailable' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'jobs', label: 'Most Jobs' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level (0-2 yr)' },
  { value: 'mid', label: 'Mid Level (3-5 yr)' },
  { value: 'expert', label: 'Expert (5+ yr)' },
];

const RATING_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '4', label: '4★ & Up' },
  { value: '4.5', label: '4.5★ & Up' },
  { value: '5', label: '5★ Only' },
];

const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { data: LabourProfile[]; count: number; timestamp: number }>();

function LabourCard({
  labour,
  onMessage,
  onBook,
  isAuthenticated,
  isFavorite,
  onToggleFavorite,
  viewMode = 'grid',
}: {
  labour: LabourProfile;
  onMessage: (labour: LabourProfile) => void;
  onBook: (labour: LabourProfile) => void;
  isAuthenticated: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  viewMode?: 'grid' | 'list';
}) {
  const getAvailabilityStyle = (availability: LabourAvailability) => {
    switch (availability) {
      case 'available':
        return {
          dot: 'bg-emerald-500',
          text: 'text-emerald-400',
          badge: 'Available',
        };
      case 'busy':
        return {
          dot: 'bg-amber-500',
          text: 'text-amber-400',
          badge: 'Busy',
        };
      case 'unavailable':
        return {
          dot: 'bg-red-500',
          text: 'text-red-400',
          badge: 'Unavailable',
        };
      default:
        return {
          dot: 'bg-slate-500',
          text: 'text-slate-400',
          badge: 'Unknown',
        };
    }
  };

  const router = useRouter();
  const availStyle = getAvailabilityStyle(labour.availability);
  const formatSkillName = (skill: string) =>
    skill.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const name = labour.user?.name || 'Agricultural Worker';
  const canHire = isAuthenticated && labour.availability === 'available';

  if (viewMode === 'list') {
    return (
      <div className="group rounded-2xl border border-slate-800/60 bg-[#0f1419] p-5 transition-all duration-300 hover:border-slate-700 hover:bg-[#141921]">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full">
            {labour.user?.profile_image ? (
              <Image src={labour.user.profile_image} alt={name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-800">
                <User className="h-10 w-10 text-slate-600" />
              </div>
            )}
            <span
              className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#0f1419] ${availStyle.dot}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{name}</h3>
                  {labour.total_jobs && labour.total_jobs > 50 ? (
                    <BadgeCheck className="h-5 w-5 text-emerald-500" />
                  ) : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {labour.location_name || labour.city || 'Location not specified'}
                  </span>
                  <span>{labour.service_radius_km} km radius</span>
                  <span className={availStyle.text}>{availStyle.badge}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-white">
                    {labour.average_rating?.toFixed(1) || '0.0'}
                  </span>
                  <span>({labour.review_count || 0} reviews)</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(labour.id);
                }}
                className="rounded-full p-2 transition-colors hover:bg-slate-800"
              >
                <Heart
                  className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-500 hover:text-slate-300'}`}
                />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {labour.skills.map((skill) => (
                <Badge
                  key={skill}
                  className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                >
                  {formatSkillName(skill)}
                </Badge>
              ))}
            </div>

            {labour.certifications?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {labour.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="border-blue-500/30 text-blue-300">
                    {cert}
                  </Badge>
                ))}
              </div>
            ) : null}

            {labour.bio ? (
              <p className="mt-3 line-clamp-2 text-sm text-slate-400">{labour.bio}</p>
            ) : null}

            <div className="mt-4 flex flex-col gap-4 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-5 text-sm">
                <span className="text-slate-400">
                  Experience{' '}
                  <span className="font-semibold text-white">{labour.experience_years}y</span>
                </span>
                <span className="text-slate-400">
                  Jobs <span className="font-semibold text-white">{labour.total_jobs || 0}</span>
                </span>
                {labour.hourly_rate ? (
                  <span className="text-slate-400">
                    Hourly{' '}
                    <span className="font-semibold text-white">
                      {formatCurrency(labour.hourly_rate)}
                    </span>
                  </span>
                ) : null}
                <span className="text-slate-400">
                  Daily{' '}
                  <span className="font-semibold text-white">
                    {formatCurrency(labour.daily_rate)}
                  </span>
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => router.push(`/renter/labour/${labour.id}`)}
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => onMessage(labour)}
                >
                  Message
                </Button>
                <Button
                  className={
                    canHire
                      ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                      : 'cursor-not-allowed bg-slate-700 text-slate-400'
                  }
                  onClick={() => onBook(labour)}
                  disabled={!canHire}
                >
                  {labour.availability === 'busy' ? 'Booked' : 'Hire Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-2xl border border-slate-800/60 bg-[#0f1419] p-5 transition-all duration-300 hover:border-slate-700 hover:bg-[#141921]">
      <div className="flex items-start justify-between">
        <div className="relative h-16 w-16 overflow-hidden rounded-full">
          {labour.user?.profile_image ? (
            <Image src={labour.user.profile_image} alt={name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <User className="h-8 w-8 text-slate-600" />
            </div>
          )}
          <span
            className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border border-[#0f1419] ${availStyle.dot}`}
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(labour.id);
          }}
          className="rounded-full p-1.5 hover:bg-slate-800"
        >
          <Heart
            className={`h-4.5 w-4.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-500 hover:text-slate-300'}`}
          />
        </button>
      </div>

      <h3 className="mt-3 line-clamp-1 text-lg font-bold text-white">{name}</h3>
      <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-400">
        <MapPin className="h-3.5 w-3.5" />
        {labour.location_name || labour.city || 'Location not specified'}
      </p>

      <div className="mt-2 flex items-center gap-2 text-sm">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold text-white">
          {labour.average_rating?.toFixed(1) || '0.0'}
        </span>
        <span className="text-slate-500">({labour.review_count || 0})</span>
        <span className={`ml-auto text-xs font-medium ${availStyle.text}`}>{availStyle.badge}</span>
      </div>

      <div className="mt-3 flex max-h-20 flex-wrap gap-2 overflow-y-auto">
        {labour.skills.map((skill) => (
          <Badge
            key={skill}
            className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          >
            {formatSkillName(skill)}
          </Badge>
        ))}
      </div>

      {labour.certifications?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {labour.certifications.slice(0, 2).map((cert) => (
            <Badge key={cert} variant="outline" className="border-blue-500/30 text-blue-300">
              {cert}
            </Badge>
          ))}
        </div>
      ) : null}

      {labour.bio ? <p className="mt-3 line-clamp-2 text-sm text-slate-400">{labour.bio}</p> : null}

      <div className="mt-4 space-y-2 border-t border-slate-800 pt-4 text-sm text-slate-400">
        <div className="flex justify-between">
          <span>Experience</span>
          <span className="font-semibold text-white">{labour.experience_years} years</span>
        </div>
        <div className="flex justify-between">
          <span>Jobs done</span>
          <span className="font-semibold text-white">{labour.total_jobs || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Daily rate</span>
          <span className="font-semibold text-white">{formatCurrency(labour.daily_rate)}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={() => router.push(`/renter/labour/${labour.id}`)}
        >
          Profile
        </Button>
        <Button
          className={
            canHire
              ? 'flex-1 bg-emerald-400 text-slate-950 hover:bg-emerald-300'
              : 'flex-1 cursor-not-allowed bg-slate-700 text-slate-400'
          }
          onClick={() => onBook(labour)}
          disabled={!canHire}
        >
          {labour.availability === 'busy' ? 'Booked' : 'Hire'}
        </Button>
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
  selectedRating,
  onRatingChange,
  availableCount,
  experienceCounts,
  onResetAvailability,
}: {
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  selectedAvailability: string;
  onAvailabilityChange: (val: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (val: [number, number]) => void;
  selectedExperience: string;
  onExperienceChange: (val: string) => void;
  selectedRating: string;
  onRatingChange: (val: string) => void;
  availableCount: number;
  experienceCounts: Record<string, number>;
  onResetAvailability: () => void;
}) {
  return (
    <aside className="sticky top-24 h-fit w-64 space-y-8">
      {/* Availability */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Availability
          </h3>
          <button
            className="text-xs text-emerald-400 hover:text-emerald-300"
            onClick={onResetAvailability}
          >
            Reset
          </button>
        </div>
        <div className="space-y-3">
          {AVAILABILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onAvailabilityChange(option.value)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                  selectedAvailability === option.value
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-slate-600 bg-transparent'
                }`}
              >
                {selectedAvailability === option.value ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-950" />
                ) : null}
              </div>
              <span
                className={`text-sm ${selectedAvailability === option.value ? 'text-white' : 'text-slate-400'}`}
              >
                {option.label}
              </span>
              {option.value === 'available' && availableCount > 0 ? (
                <span className="ml-auto text-xs text-slate-500">{availableCount}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Rate */}
      <div>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          Daily Rate
        </h3>
        <div className="px-2">
          <input
            type="range"
            min="100"
            max="1000"
            value={priceRange[1]}
            onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-emerald-500"
          />
          <div className="mt-3 flex justify-between text-xs text-slate-500">
            <span>$100</span>
            <span className="font-medium text-emerald-400">${priceRange[1]}</span>
            <span>$1000+</span>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {LABOUR_SKILLS.filter((s) => s.value !== 'all').map((skill) => (
            <button
              key={skill.value}
              onClick={() => onSkillToggle(skill.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedSkills.includes(skill.value)
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {skill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          Experience
        </h3>
        <div className="space-y-2">
          {EXPERIENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onExperienceChange(option.value)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                selectedExperience === option.value
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <span>{option.label}</span>
              {(experienceCounts[option.value] || 0) > 0 && (
                <span className="text-xs text-slate-500">{experienceCounts[option.value]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Rating</h3>
        <div className="space-y-2">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onRatingChange(option.value)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                selectedRating === option.value
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {option.value !== 'all' && (
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(parseFloat(option.value))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-slate-700 text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              )}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function LabourPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuthStore();
  const { userLocation } = useAppStore();

  const isAuthenticated = !!user;

  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 1000]);
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState<LabourProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' });
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSending, setIsSending] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const limit = 6;

  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  }, []);

  const availableCount = useMemo(
    () => labourProfiles.filter((l) => l.availability === 'available').length,
    [labourProfiles]
  );

  const experienceCounts = useMemo(() => {
    return {
      all: labourProfiles.length,
      entry: labourProfiles.filter((p) => p.experience_years >= 0 && p.experience_years <= 2)
        .length,
      mid: labourProfiles.filter((p) => p.experience_years >= 3 && p.experience_years <= 5).length,
      expert: labourProfiles.filter((p) => p.experience_years >= 5).length,
    };
  }, [labourProfiles]);

  const filteredLabourProfiles = useMemo(() => {
    let profiles = labourProfiles;

    if (selectedAvailability !== 'all') {
      profiles = profiles.filter((p) => p.availability === selectedAvailability);
    }

    if (selectedSkills.length > 0) {
      profiles = profiles.filter((p) =>
        selectedSkills.some((filterSkill) =>
          p.skills.some((profileSkill) => skillMatchesFilter(profileSkill, filterSkill))
        )
      );
    }

    if (priceRange[0] > 100 || priceRange[1] < 1000) {
      profiles = profiles.filter(
        (p) => p.daily_rate >= priceRange[0] && p.daily_rate <= priceRange[1]
      );
    }

    if (selectedExperience !== 'all') {
      const ranges: Record<string, [number, number]> = {
        entry: [0, 2],
        mid: [3, 5],
        expert: [5, 100],
      };
      const [min, max] = ranges[selectedExperience] || [0, 100];
      profiles = profiles.filter((p) => p.experience_years >= min && p.experience_years <= max);
    }

    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating);
      profiles = profiles.filter((p) => (p.average_rating || 0) >= minRating);
    }

    if (searchQuery.trim()) {
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

      profiles = fuse.search(searchQuery).map((result) => result.item);
    }

    const sortedProfiles = [...profiles];
    switch (sortBy) {
      case 'rating':
        sortedProfiles.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'price_asc':
        sortedProfiles.sort((a, b) => a.daily_rate - b.daily_rate);
        break;
      case 'price_desc':
        sortedProfiles.sort((a, b) => b.daily_rate - a.daily_rate);
        break;
      case 'experience':
        sortedProfiles.sort((a, b) => b.experience_years - a.experience_years);
        break;
      case 'jobs':
        sortedProfiles.sort((a, b) => (b.total_jobs || 0) - (a.total_jobs || 0));
        break;
      case 'recommended':
      default:
        sortedProfiles.sort((a, b) => {
          const ratingScore = (b.average_rating || 0) - (a.average_rating || 0);
          if (ratingScore !== 0) return ratingScore;
          return (b.total_jobs || 0) - (a.total_jobs || 0);
        });
        break;
    }

    return sortedProfiles;
  }, [
    labourProfiles,
    searchQuery,
    selectedSkills,
    selectedAvailability,
    priceRange,
    selectedExperience,
    selectedRating,
    sortBy,
  ]);

  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      search: searchQuery,
      availability: selectedAvailability,
      sort: sortBy,
      lat: userLocation?.lat,
      lng: userLocation?.lng,
    });
  }, [searchQuery, selectedAvailability, sortBy, userLocation]);

  const loadLabour = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      const cacheKey = getCacheKey();

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
            minRate: priceRange[0] > 100 ? priceRange[0] : undefined,
            maxRate: priceRange[1] < 1000 ? priceRange[1] : undefined,
            latitude: userLocation?.lat,
            longitude: userLocation?.lng,
            radiusKm: 100,
          },
          pageNum,
          limit
        );

        const newData = append ? [...labourProfiles, ...result.data] : result.data;

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

  useEffect(() => {
    loadLabour(1);
  }, [selectedAvailability, sortBy, userLocation]);

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

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadLabour(page + 1, true);
    }
  };

  const handleMessage = (labour: LabourProfile) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/labour');
      return;
    }
    setSelectedLabour(labour);
    setMessageDialogOpen(true);
  };

  const handleBook = (labour: LabourProfile) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/labour');
      return;
    }
    setSelectedLabour(labour);
    setBookingDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedLabour || !messageText.trim() || !user) {
      toast.error('Unable to send message. Please try again.');
      return;
    }

    setIsSending(true);
    try {
      const conversationId = await dmService.getOrCreateConversation(selectedLabour.user_id);
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      await dmService.sendMessage(conversationId, messageText.trim());
      await useMessagesStore.getState().fetchConversations();

      setMessageDialogOpen(false);
      setMessageText('');
      toast.success('Message sent! The labourer will be notified.');
      router.push(`/messages?conversation=${conversationId}`);
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setSelectedAvailability('all');
    setSortBy('recommended');
    setPriceRange([100, 1000]);
    setSelectedExperience('all');
    setSelectedRating('all');
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedSkills.length > 0 ||
    selectedAvailability !== 'all' ||
    priceRange[0] > 100 ||
    priceRange[1] < 1000 ||
    selectedExperience !== 'all' ||
    selectedRating !== 'all';

  return (
    <div className="min-h-screen bg-[#0a0e14] text-slate-200">
      <Header />

      <main className="mx-auto max-w-[1400px] px-4 pb-8 pt-24">
        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            selectedSkills={selectedSkills}
            onSkillToggle={handleSkillToggle}
            selectedAvailability={selectedAvailability}
            onAvailabilityChange={setSelectedAvailability}
            onResetAvailability={() => setSelectedAvailability('all')}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            selectedExperience={selectedExperience}
            onExperienceChange={setSelectedExperience}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            availableCount={availableCount}
            experienceCounts={experienceCounts}
          />

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Available Skilled Labour</h1>
              <p className="mt-1 text-slate-400">
                Showing {filteredLabourProfiles.length} professionals available for hire in your
                region.
              </p>
            </div>

            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800/50'}`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800/50'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900 text-slate-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-white">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="focus:bg-slate-800"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-900" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 py-16 text-center">
                <p className="mb-4 text-red-400">{error}</p>
                <Button
                  onClick={() => loadLabour(1)}
                  variant="outline"
                  className="border-slate-700"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredLabourProfiles.length === 0 ? (
              <EmptyState
                icon={<User className="h-16 w-16 text-slate-600" />}
                title="No workers found"
                description={
                  hasActiveFilters ? 'Try adjusting your filters.' : 'No workers available.'
                }
                action={
                  hasActiveFilters ? (
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  ) : undefined
                }
                className="border border-slate-800 bg-slate-900/50"
              />
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'
                  }
                >
                  {filteredLabourProfiles.map((labour) => (
                    <LabourCard
                      key={labour.id}
                      labour={labour}
                      onMessage={handleMessage}
                      onBook={handleBook}
                      isAuthenticated={isAuthenticated}
                      isFavorite={favorites.has(labour.id)}
                      onToggleFavorite={toggleFavorite}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
                  <p className="text-sm text-slate-500">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of{' '}
                    {totalCount} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-slate-800 bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
                      disabled={page === 1}
                      onClick={() => loadLabour(page - 1)}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-800 bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
                      disabled={!hasMore}
                      onClick={handleLoadMore}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="border-slate-800 bg-[#0f1419] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Message {selectedLabour?.user?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Write your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              className="resize-none border-slate-800 bg-slate-950 text-white"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-700 bg-transparent text-slate-300"
                onClick={() => setMessageDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSending}
              >
                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="border-slate-800 bg-[#0f1419] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Hire {selectedLabour?.user?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLabour && (
              <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-4">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-800">
                  {selectedLabour.user?.profile_image ? (
                    <Image
                      src={selectedLabour.user.profile_image}
                      alt=""
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <User className="m-3 h-6 w-6 text-slate-500" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-white">{selectedLabour.user?.name}</p>
                  <p className="text-sm text-emerald-400">
                    {formatCurrency(selectedLabour.daily_rate)}/day
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm text-slate-400">Start Date</label>
                <Input
                  type="date"
                  value={bookingDates.start}
                  onChange={(e) => setBookingDates((d) => ({ ...d, start: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">End Date</label>
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
              <label className="mb-2 block text-sm text-slate-400">Notes (optional)</label>
              <Textarea
                placeholder="Any specific requirements..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                rows={3}
                className="resize-none border-slate-800 bg-slate-950 text-white"
              />
            </div>

            {selectedLabour && bookingDates.start && bookingDates.end && (
              <div className="rounded-xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Estimated Total</span>
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
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-700 bg-transparent text-slate-300"
                onClick={() => setBookingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                onClick={handleSubmitBooking}
                disabled={!bookingDates.start || !bookingDates.end || isSending}
              >
                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Additional imports

export default function LabourPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0e14]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <LabourPageContent />
    </Suspense>
  );
}
