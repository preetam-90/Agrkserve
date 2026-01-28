'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Star,
  X,
  SlidersHorizontal,
  Users,
  Briefcase,
  IndianRupee,
  Loader2
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkills, sortBy, page, userLocation, minRating]);

  const loadLabourProfiles = async () => {
    setIsLoading(true);
    try {
      const result = await labourService.search({
        search: searchQuery || undefined,
        skills: selectedSkills.length > 0 ? selectedSkills : undefined,
        minRate: priceRange.min ? Number(priceRange.min) : undefined,
        maxRate: priceRange.max ? Number(priceRange.max) : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        availability: 'available' as LabourAvailability,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        radiusKm: 50,
      }, page, limit);

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
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              Find <span className="text-emerald-400">Agricultural Labour</span>
            </h1>
            <p className="text-slate-400 text-lg">Skilled farm workers available for hire in your area</p>
          </div>
          {/* Background Glow */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by skills, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-6 shadow-lg shadow-emerald-900/20">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 h-11 border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {(selectedSkills.length > 0 || priceRange.min || priceRange.max || minRating > 0) && (
                  <Badge variant="default" className="ml-1 bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                    {selectedSkills.length + (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0) + (minRating > 0 ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </form>

          {/* Quick Filters */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1 bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1">
                  {skill}
                  <button onClick={() => handleSkillToggle(skill)} className="ml-1 hover:text-emerald-400">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(selectedSkills.length > 0 || priceRange.min || priceRange.max || minRating > 0) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7">
                  Clear all
                </Button>
              )}
            </div>
          )}

          {/* Sort and Results Count */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-2 border-t border-slate-800/50">
            <p className="text-sm text-slate-400 font-medium">
              {totalCount} {totalCount === 1 ? 'worker' : 'workers'} found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] bg-slate-950 border-slate-800 text-slate-200 focus:ring-emerald-500/50 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="rating" className="focus:bg-slate-800 focus:text-white">Highest Rated</SelectItem>
                  <SelectItem value="price_low" className="focus:bg-slate-800 focus:text-white">Price: Low to High</SelectItem>
                  <SelectItem value="price_high" className="focus:bg-slate-800 focus:text-white">Price: High to Low</SelectItem>
                  <SelectItem value="experience" className="focus:bg-slate-800 focus:text-white">Most Experienced</SelectItem>
                  <SelectItem value="distance" className="focus:bg-slate-800 focus:text-white">Nearest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Labour Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
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
              <Button onClick={clearFilters} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Clear Filters
              </Button>
            }
            className="bg-slate-900/50 border border-slate-800 text-slate-300"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {labourProfiles.map((labour) => (
                <Card key={labour.id} className="group bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden backdrop-blur-sm">
                  <CardContent className="p-0">
                    <Link href={`/renter/labour/${labour.id}`}>
                      <div className="p-5">
                        {/* Header */}
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-white mb-1 group-hover:text-emerald-400 transition-colors">
                                {labour.user?.name || 'Farm Worker'}
                              </h3>
                              {labour.location_name && (
                                <div className="flex items-center text-sm text-slate-400">
                                  <MapPin className="h-3 w-3 mr-1 text-emerald-500" />
                                  <span className="truncate pr-2">{labour.location_name}</span>
                                </div>
                              )}
                            </div>
                            {labour.user?.is_verified && (
                              <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">
                                Verified
                              </Badge>
                            )}
                          </div>

                          {/* Rating */}
                          {labour.rating && labour.rating > 0 && (
                            <div className="flex items-center gap-1 mb-2 bg-yellow-500/5 inline-flex px-2 py-0.5 rounded-full border border-yellow-500/10">
                              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                              <span className="font-semibold text-sm text-yellow-500">
                                {labour.rating.toFixed(1)}
                              </span>
                              <span className="text-xs text-slate-500">
                                ({labour.review_count})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Experience */}
                        <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
                          <div className="p-1 rounded bg-slate-800">
                            <Briefcase className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                          <span>{labour.experience_years} years experience</span>
                        </div>

                        {/* Skills */}
                        <div className="mb-4 h-16 overflow-hidden">
                          <div className="flex flex-wrap gap-1.5">
                            {labour.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-slate-800/50 border-slate-700 text-slate-300">
                                {skill}
                              </Badge>
                            ))}
                            {labour.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs bg-slate-800/50 border-slate-700 text-slate-400">
                                +{labour.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="pt-4 border-t border-slate-800/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center text-xl font-bold text-emerald-400">
                                <IndianRupee className="h-4 w-4" />
                                {labour.daily_rate}
                              </div>
                              <div className="text-xs text-slate-500">per day</div>
                            </div>
                            <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/50">
                              View Details
                            </Button>
                          </div>
                          {labour.hourly_rate && (
                            <div className="text-xs text-slate-500 mt-1 pl-0.5">
                              or ₹{labour.hourly_rate}/hour
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Availability Badge */}
                      {labour.availability === 'available' && (
                        <div className="bg-emerald-500/10 border-t border-emerald-500/10 py-1.5 text-center">
                          <span className="text-xs font-medium text-emerald-400">Available Now</span>
                        </div>
                      )}
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-500 font-medium px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Filter Labour</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map(skill => (
                  <Button
                    key={skill}
                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSkillToggle(skill)}
                    className={selectedSkills.includes(skill)
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700"}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">
                Daily Rate Range (₹)
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                />
                <span className="text-slate-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map(rating => (
                  <Button
                    key={rating}
                    variant={minRating === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMinRating(rating)}
                    className={`flex items-center gap-1 ${minRating === rating
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700"}`}
                  >
                    <Star className="h-3.5 w-3.5" />
                    {rating === 0 ? 'All' : `${rating}+`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <Button variant="outline" onClick={clearFilters} className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
                Clear All
              </Button>
              <Button onClick={applyFilters} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin h-8 w-8 text-emerald-500" /></div>}>
      <LabourListPageContent />
    </Suspense>
  );
}
