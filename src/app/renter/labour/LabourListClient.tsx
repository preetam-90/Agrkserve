'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Star,
  X,
  SlidersHorizontal,
  Users,
  User,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
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
} from '@/components/ui';
import { labourService } from '@/lib/services';
import { useAppStore } from '@/lib/store';
import { LabourProfile, LabourAvailability } from '@/lib/types';

const COMMON_SKILLS = [
  'Plowing',
  'Harvesting',
  'Irrigation',
  'Planting',
  'Spraying',
  'Weeding',
  'Fertilizing',
  'Tractor Operation',
  'General Farm Work',
  'Animal Husbandry',
];

const getAvailabilityStyle = (availability: LabourAvailability) => {
  switch (availability) {
    case 'available':
      return {
        label: 'AVAILABLE',
        badge: 'bg-emerald-500/95 text-white',
        dot: 'bg-emerald-200',
      };
    case 'busy':
      return {
        label: 'BUSY',
        badge: 'bg-amber-500/95 text-white',
        dot: 'bg-amber-200',
      };
    case 'unavailable':
      return {
        label: 'UNAVAILABLE',
        badge: 'bg-rose-500/95 text-white',
        dot: 'bg-rose-200',
      };
    default:
      return {
        label: 'UNKNOWN',
        badge: 'bg-slate-600/95 text-white',
        dot: 'bg-slate-300',
      };
  }
};

function LabourListPageContent() {
  const searchParams = useSearchParams();

  const { userLocation } = useAppStore();

  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  useEffect(() => {
    loadLabourProfiles();
     
  }, [selectedSkills, sortBy, page, userLocation, minRating]);

  const loadLabourProfiles = async () => {
    setIsLoading(true);
    try {
      const result = await labourService.search(
        {
          search: searchQuery || undefined,
          skills: selectedSkills.length > 0 ? selectedSkills : undefined,
          minRate: priceRange.min ? Number(priceRange.min) : undefined,
          maxRate: priceRange.max ? Number(priceRange.max) : undefined,
          minRating: minRating > 0 ? minRating : undefined,
          availability: 'available' as LabourAvailability,
          latitude: userLocation?.lat,
          longitude: userLocation?.lng,
          radiusKm: 50,
        },
        page,
        limit
      );

      setLabourProfiles(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Failed to load labour profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLabourProfiles();
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      }
      return [...prev, skill];
    });
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    setSearchQuery('');
    setPage(1);
  };

  const applyFilters = () => {
    setPage(1);
    loadLabourProfiles();
    setShowFilters(false);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200">
      <Header />

      <main className="container mx-auto flex-1 px-4 pb-8 pt-28">
        {/* Header */}
        <div className="relative mb-8">
          <div className="relative z-10">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Find <span className="text-emerald-400">Agricultural Labour</span>
            </h1>
            <p className="text-lg text-slate-400">
              Skilled farm workers available for hire in your area
            </p>
          </div>
          {/* Background Glow */}
          <div className="pointer-events-none absolute left-0 top-1/2 -z-0 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl backdrop-blur-md">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-500" />
              <Input
                type="text"
                placeholder="Search by skills, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 border-slate-800 bg-slate-950 pl-11 text-slate-200 placeholder:text-slate-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="h-11 bg-emerald-600 px-6 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500"
              >
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="flex h-11 items-center gap-2 border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {(selectedSkills.length > 0 ||
                  priceRange.min ||
                  priceRange.max ||
                  minRating > 0) && (
                  <Badge
                    variant="default"
                    className="ml-1 border-0 bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    {selectedSkills.length +
                      (priceRange.min ? 1 : 0) +
                      (priceRange.max ? 1 : 0) +
                      (minRating > 0 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </form>

          {/* Quick Filters */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1 border border-slate-700 bg-slate-800 px-3 py-1 text-slate-200"
                >
                  {skill}
                  <button
                    onClick={() => handleSkillToggle(skill)}
                    className="ml-1 hover:text-emerald-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(selectedSkills.length > 0 || priceRange.min || priceRange.max || minRating > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}

          {/* Sort and Results Count */}
          <div className="flex flex-col gap-4 border-t border-slate-800/50 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-400">
              {totalCount} {totalCount === 1 ? 'worker' : 'workers'} found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-9 w-[180px] border-slate-800 bg-slate-950 text-slate-200 focus:ring-emerald-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-slate-200">
                  <SelectItem value="rating" className="focus:bg-slate-800 focus:text-white">
                    Highest Rated
                  </SelectItem>
                  <SelectItem value="price_low" className="focus:bg-slate-800 focus:text-white">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price_high" className="focus:bg-slate-800 focus:text-white">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="experience" className="focus:bg-slate-800 focus:text-white">
                    Most Experienced
                  </SelectItem>
                  <SelectItem value="distance" className="focus:bg-slate-800 focus:text-white">
                    Nearest
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Labour Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="text-slate-500">Loading profiles...</p>
            </div>
          </div>
        ) : labourProfiles.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12 text-slate-600" />}
            title="No workers found"
            description="Try adjusting your filters or search query"
            action={
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Clear Filters
              </Button>
            }
            className="border border-slate-800 bg-slate-900/50 text-slate-300"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {labourProfiles.map((labour) => {
                const availabilityStyle = getAvailabilityStyle(labour.availability);
                const displayRating =
                  labour.average_rating && labour.average_rating > 0
                    ? labour.average_rating.toFixed(1)
                    : 'New';

                return (
                  <Card
                    key={labour.id}
                    className="group overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/35 hover:shadow-[0_30px_70px_rgba(16,185,129,0.2)]"
                  >
                    <CardContent className="p-0">
                      <Link href={`/renter/labour/${labour.id}`} className="block">
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                          {labour.user?.profile_image ? (
                            <Image
                              src={labour.user.profile_image}
                              alt={labour.user?.name || 'Farm Worker'}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                              <User className="h-20 w-20 text-slate-600" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />
                          <div
                            className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider ${availabilityStyle.badge}`}
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${availabilityStyle.dot}`} />
                            {availabilityStyle.label}
                          </div>
                          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {displayRating}
                          </div>
                        </div>
                      </Link>

                      <div className="p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/renter/labour/${labour.id}`}
                              className="block truncate text-2xl font-bold text-white transition-colors group-hover:text-emerald-300"
                            >
                              {labour.user?.name || 'Agricultural Worker'}
                            </Link>
                            <div className="mt-1 flex items-center text-sm text-slate-400">
                              <MapPin className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                              <span className="truncate pr-1">
                                {labour.location_name || labour.city || 'Location unavailable'}
                              </span>
                            </div>
                          </div>
                          {labour.user?.is_verified && (
                            <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-400" />
                          )}
                        </div>

                        <div className="mb-4 h-px bg-slate-800/90" />

                        <div className="mb-4 grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Experience
                            </p>
                            <p className="text-sm font-bold text-white">
                              {labour.experience_years} Years
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Jobs Done
                            </p>
                            <p className="text-sm font-bold text-white">{labour.total_jobs || 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Rate
                            </p>
                            <p className="text-sm font-bold text-emerald-400">
                              ₹{labour.daily_rate.toLocaleString('en-IN')}/d
                            </p>
                          </div>
                        </div>

                        <div className="mb-5 flex min-h-7 flex-wrap gap-1.5">
                          {labour.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="rounded-full border border-slate-700/80 bg-slate-800/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300"
                            >
                              {skill.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {labour.skills.length > 3 && (
                            <span className="rounded-full border border-slate-700/80 bg-slate-800/70 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                              +{labour.skills.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2.5">
                          <Button
                            asChild
                            size="sm"
                            className="h-11 flex-1 rounded-full bg-emerald-500 text-base font-semibold text-white shadow-lg shadow-emerald-900/25 hover:bg-emerald-400"
                          >
                            <Link href={`/renter/labour/${labour.id}/book`}>Hire Now</Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-11 flex-1 rounded-full border-slate-700 bg-transparent text-base font-semibold text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                          >
                            <Link href={`/renter/labour/${labour.id}`}>Message</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  Previous
                </Button>
                <span className="px-2 text-sm font-medium text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Filters Modal */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto border-slate-800 bg-slate-900 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Filter Labour</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Skills Filter */}
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-400">Skills</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map((skill) => (
                  <Button
                    key={skill}
                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSkillToggle(skill)}
                    className={
                      selectedSkills.includes(skill)
                        ? 'border-transparent bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                    }
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-400">
                Daily Rate Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                  className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
                />
                <span className="text-slate-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                  className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-400">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map((rating) => (
                  <Button
                    key={rating}
                    variant={minRating === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMinRating(rating)}
                    className={`flex items-center gap-1 ${
                      minRating === rating
                        ? 'border-transparent bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" />
                    {rating === 0 ? 'All' : `${rating}+`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-slate-800 pt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
              >
                Clear All
              </Button>
              <Button
                onClick={applyFilters}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default function LabourListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <LabourListPageContent />
    </Suspense>
  );
}
