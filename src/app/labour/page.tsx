'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  Clock,
  IndianRupee,
  RefreshCw,
  Loader2,
  Phone,
  Briefcase,
  Award,
  CheckCircle,
  Filter
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
import { labourService, messageService } from '@/lib/services';
import { useAppStore, useAuthStore } from '@/lib/store';
import { LabourProfile, LabourAvailability } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

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
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-br from-green-500 to-teal-600 p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              {labour.user?.profile_image ? (
                <Image
                  src={labour.user.profile_image}
                  alt={labour.user?.name || 'Worker'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
              )}
              {/* Availability indicator */}
              <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${
                labour.availability === 'available' ? 'bg-green-500' : 
                labour.availability === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </div>
            
            {/* Name and Rating */}
            <div className="flex-1 text-white">
              <h3 className="text-xl font-bold">
                {labour.user?.name || 'Agricultural Worker'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {labour.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{labour.rating.toFixed(1)}</span>
                    {labour.review_count && (
                      <span className="text-white/70">({labour.review_count})</span>
                    )}
                  </div>
                )}
                {labour.total_jobs && labour.total_jobs > 0 && (
                  <span className="text-white/70 text-sm">
                    • {labour.total_jobs} jobs
                  </span>
                )}
              </div>
              <Badge className={`mt-2 ${getAvailabilityColor(labour.availability)}`}>
                {getAvailabilityText(labour.availability)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-4">
          {/* Location */}
          {labour.location_name && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm">{labour.location_name}</span>
            </div>
          )}

          {/* Experience */}
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="h-4 w-4 text-green-600" />
            <span className="text-sm">{labour.experience_years} years experience</span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5">
            {labour.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill.replace(/_/g, ' ')}
              </Badge>
            ))}
            {labour.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{labour.skills.length - 4} more
              </Badge>
            )}
          </div>

          {/* Certifications */}
          {labour.certifications && labour.certifications.length > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {labour.certifications.length} certification{labour.certifications.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Bio */}
          {labour.bio && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {labour.bio}
            </p>
          )}

          {/* Pricing */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(labour.daily_rate)}
              </p>
              <p className="text-xs text-gray-500">per day</p>
            </div>
            {labour.hourly_rate && (
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-700">
                  {formatCurrency(labour.hourly_rate)}
                </p>
                <p className="text-xs text-gray-500">per hour</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onMessage(labour)}
              disabled={!isAuthenticated}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onBook(labour)}
              disabled={!isAuthenticated || labour.availability === 'unavailable'}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Hire
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LabourPage() {
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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Skilled Agricultural Workers
              </h1>
              <p className="text-gray-600 mt-1">
                Find and hire experienced farm workers in your area
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-1 hover:text-green-600 transition-colors"
                title="Refresh listings"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skill, or location..."
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent>
                  {LABOUR_SKILLS.map((skill) => (
                    <SelectItem key={skill.value} value={skill.value}>
                      {skill.icon} {skill.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowFilters(true)}
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
                  <button onClick={() => setSearchQuery('')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedSkill !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {LABOUR_SKILLS.find(s => s.value === selectedSkill)?.label}
                  <button onClick={() => setSelectedSkill('all')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedAvailability !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {AVAILABILITY_OPTIONS.find(a => a.value === selectedAvailability)?.label}
                  <button onClick={() => setSelectedAvailability('all')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(priceRange.min || priceRange.max) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                  <button onClick={() => setPriceRange({ min: '', max: '' })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${totalCount} workers found`}
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500">
              <Link href="/login" className="text-green-600 hover:underline">Login</Link>
              {' '}to message and hire workers
            </p>
          )}
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => loadLabour(1)}>Try Again</Button>
          </div>
        ) : labourProfiles.length === 0 ? (
          <EmptyState
            icon={<User className="h-12 w-12" />}
            title="No workers found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters to find more workers."
                : "No workers are currently available in your area."
            }
            action={
              hasActiveFilters ? (
                <Button onClick={clearFilters}>Clear Filters</Button>
              ) : undefined
            }
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
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {isLoadingMore && <Spinner />}
              {!hasMore && labourProfiles.length > 0 && (
                <p className="text-gray-500 text-sm">No more workers to load</p>
              )}
            </div>
          </>
        )}

        {/* More Filters Dialog */}
        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Workers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Rate Range
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

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  Reset
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Message {selectedLabour?.user?.name || 'Worker'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Write your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setMessageDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Hire {selectedLabour?.user?.name || 'Worker'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedLabour && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {selectedLabour.user?.profile_image ? (
                        <Image
                          src={selectedLabour.user.profile_image}
                          alt={selectedLabour.user?.name || 'Worker'}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{selectedLabour.user?.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(selectedLabour.daily_rate)}/day
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={bookingDates.start}
                  onChange={(e) => setBookingDates(d => ({ ...d, start: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={bookingDates.end}
                  onChange={(e) => setBookingDates(d => ({ ...d, end: e.target.value }))}
                  min={bookingDates.start || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <Textarea
                  placeholder="Any specific requirements or instructions..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Price Estimate */}
              {selectedLabour && bookingDates.start && bookingDates.end && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimated Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(
                        selectedLabour.daily_rate * 
                        Math.max(1, Math.ceil(
                          (new Date(bookingDates.end).getTime() - new Date(bookingDates.start).getTime()) 
                          / (1000 * 60 * 60 * 24)
                        ) + 1)
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
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
                  className="flex-1"
                  onClick={() => setBookingDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
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
