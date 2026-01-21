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
  IndianRupee
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Agricultural Labour</h1>
          <p className="text-gray-600">Skilled farm workers available for hire</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by skills, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="default">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {(selectedSkills.length > 0 || priceRange.min || priceRange.max || minRating > 0) && (
                <Badge variant="default" className="ml-1">
                  {selectedSkills.length + (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0) + (minRating > 0 ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(skill => (
              <Badge key={skill} variant="default" className="flex items-center gap-1">
                {skill}
                <button onClick={() => handleSkillToggle(skill)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(selectedSkills.length > 0 || priceRange.min || priceRange.max || minRating > 0) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          {/* Sort and Results Count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {totalCount} {totalCount === 1 ? 'worker' : 'workers'} found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Labour Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : labourProfiles.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No workers found"
            description="Try adjusting your filters or search query"
            action={
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {labourProfiles.map((labour) => (
                <Card key={labour.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <Link href={`/renter/labour/${labour.id}`}>
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <Link 
                              href={`/user/${labour.user_id}`}
                              className="hover:text-green-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {labour.user?.name || 'Farm Worker'}
                              </h3>
                            </Link>
                            {labour.location_name && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                {labour.location_name}
                              </div>
                            )}
                          </div>
                          {labour.user?.is_verified && (
                            <Badge variant="default" className="bg-green-500">
                              Verified
                            </Badge>
                          )}
                        </div>

                        {/* Rating */}
                        {labour.rating && labour.rating > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-sm">
                              {labour.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({labour.review_count})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Experience */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{labour.experience_years} years experience</span>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {labour.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {labour.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{labour.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center text-2xl font-bold text-teal-600">
                              <IndianRupee className="h-5 w-5" />
                              {labour.daily_rate}
                            </div>
                            <div className="text-xs text-gray-500">per day</div>
                          </div>
                          <Button size="sm" variant="default">
                            View Details
                          </Button>
                        </div>
                        {labour.hourly_rate && (
                          <div className="text-xs text-gray-500 mt-1">
                            or ₹{labour.hourly_rate}/hour
                          </div>
                        )}
                      </div>

                      {/* Availability Badge */}
                      <div className="mt-3">
                        {labour.availability === 'available' && (
                          <Badge variant="default" className="bg-green-500 w-full justify-center">
                            Available Now
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filter Labour</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map(skill => (
                  <Button
                    key={skill}
                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Rate Range (₹)
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map(rating => (
                  <Button
                    key={rating}
                    variant={minRating === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMinRating(rating)}
                    className="flex items-center gap-1"
                  >
                    <Star className="h-4 w-4" />
                    {rating === 0 ? 'All' : `${rating}+`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Clear All
              </Button>
              <Button onClick={applyFilters} className="flex-1">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>}>
      <LabourListPageContent />
    </Suspense>
  );
}
