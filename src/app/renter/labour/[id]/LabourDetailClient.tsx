'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Star,
  Calendar,
  Briefcase,
  Navigation,
  Award,
  CheckCircle,
  Share2,
  Loader2,
  Phone,
  MessageCircle,
  Send,
  Languages,
  Zap,
  ChevronDown,
  User,
  FileCheck,
  Quote,
} from 'lucide-react';

import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { labourService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { LabourProfile } from '@/lib/types';

export default function LabourDetailClient() {
  const params = useParams();
  const router = useRouter();
  const labourId = params.id as string;
  const { user } = useAuthStore();

  const [labour, setLabour] = useState<LabourProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('');
  const [workers, setWorkers] = useState(1);

  useEffect(() => {
    loadLabourProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labourId]);

  const loadLabourProfile = async () => {
    try {
      setIsLoading(true);
      const data = await labourService.getById(labourId);
      if (!data) {
        toast.error('Labour profile not found');
        router.push('/labour');
        return;
      }
      setLabour(data);
    } catch (err) {
      console.error('Failed to load labour profile:', err);
      toast.error('Failed to load labour details');
      router.push('/labour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      router.push(`/login?redirect=/labour/${labourId}`);
      return;
    }
    router.push(`/renter/labour/${labourId}/book`);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${labour?.user?.name || 'Labour Worker'} on AgriServe`,
      text: `Check out ${labour?.user?.name || 'this worker'} - ${labour?.skills?.[0] || 'Agricultural Worker'} in ${labour?.city}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch {
      // User cancelled share
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!labour) {
    return null;
  }

  const userData = labour.user;
  const displayName = userData?.name || 'Unknown Worker';
  const displayImage = userData?.profile_image || '/images/default-avatar.png';
  const isVerified = userData?.is_verified || false;
  const specialization = labour.skills?.slice(0, 2).join(' & ') || 'Agricultural Worker';
  const displayRating = labour.rating || 0;
  const displayReviews = labour.review_count || 0;
  const displayLocation = labour.location_name || labour.city || 'Location not specified';

  // Price calculations
  const days = dateRange ? 5 : 0;
  const subtotal = labour.daily_rate * days * workers;
  const serviceFee = Math.round(subtotal * 0.025);
  const total = subtotal + serviceFee;

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'busy':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'unavailable':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available for immediate booking';
      case 'busy':
        return 'Currently busy, check back soon';
      case 'unavailable':
        return 'Not available for booking';
      default:
        return 'Availability unknown';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/labour"
            className="mb-6 inline-flex items-center text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Labour
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            {/* LEFT COLUMN */}
            <div className="space-y-8">
              {/* Profile Header Section */}
              <section className="flex flex-col gap-6 sm:flex-row sm:items-start">
                {/* Profile Image with Verified Badge */}
                <div className="relative shrink-0">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-slate-800">
                    <Image src={displayImage} alt={displayName} fill className="object-cover" />
                  </div>
                  {isVerified && (
                    <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Name and Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{displayName}</h1>
                    {displayRating >= 4.0 && (
                      <Badge className="border-emerald-500/30 bg-emerald-500/20 text-xs uppercase tracking-wider text-emerald-400">
                        TOP RATED
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-lg text-slate-400">{specialization}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">{displayLocation}</span>
                    <span className="text-slate-600">·</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-slate-300">{displayRating.toFixed(1)}</span>
                    <span className="text-slate-500">({displayReviews} reviews)</span>
                  </div>
                </div>
              </section>

              <div className="border-b border-slate-800" />

              {/* Stats Row */}
              <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                    Experience
                  </p>
                  <p className="text-lg font-bold text-white">{labour.experience_years}+ Years</p>
                </div>
                <div className="space-y-1">
                  <Briefcase className="h-5 w-5 text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                    Jobs Done
                  </p>
                  <p className="text-lg font-bold text-white">{labour.total_jobs || 0}+ Projects</p>
                </div>
                <div className="space-y-1">
                  <Navigation className="h-5 w-5 text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                    Radius
                  </p>
                  <p className="text-lg font-bold text-white">
                    {labour.service_radius_km}km Circle
                  </p>
                </div>
                <div className="space-y-1">
                  <Send className="h-5 w-5 text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                    Status
                  </p>
                  <p className="text-lg font-bold text-white">
                    {isVerified ? 'Certified' : labour.availability}
                  </p>
                </div>
              </section>

              <div className="border-b border-slate-800" />

              {/* Tabs */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-1">
                <Tabs defaultValue="bio" className="w-full">
                  <TabsList className="w-full justify-start gap-1 rounded-xl bg-slate-800/50 p-1">
                    <TabsTrigger
                      value="bio"
                      className="rounded-lg px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-slate-400 transition-all duration-200 hover:bg-slate-700/50 hover:text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-emerald-600/10 data-[state=active]:text-emerald-400 data-[state=active]:shadow-none"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Bio
                    </TabsTrigger>
                    <TabsTrigger
                      value="skills"
                      className="rounded-lg px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-slate-400 transition-all duration-200 hover:bg-slate-700/50 hover:text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-emerald-600/10 data-[state=active]:text-emerald-400 data-[state=active]:shadow-none"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Skills
                    </TabsTrigger>
                    <TabsTrigger
                      value="certifications"
                      className="rounded-lg px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-slate-400 transition-all duration-200 hover:bg-slate-700/50 hover:text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-emerald-600/10 data-[state=active]:text-emerald-400 data-[state=active]:shadow-none"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Certifications
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bio" className="mt-6 px-4 pb-4">
                    {labour.bio ? (
                      <div className="relative rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-800/30 to-slate-900/50 p-6">
                        <Quote className="absolute right-4 top-4 h-8 w-8 text-emerald-500/20" />
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 ring-1 ring-emerald-500/30">
                            <User className="h-6 w-6 text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-3 text-lg font-semibold text-white">
                              About {displayName}
                            </h3>
                            <p className="leading-relaxed text-slate-300">{labour.bio}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
                          <User className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-lg font-medium text-slate-500">No bio available</p>
                        <p className="mt-1 text-sm text-slate-600">
                          This worker hasn&apos;t added a bio yet
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="skills" className="mt-6 px-4 pb-4">
                    {labour.skills && labour.skills.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {labour.skills.map((skill, index) => (
                          <div
                            key={index}
                            className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/80 p-4 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="relative flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 transition-colors duration-300 group-hover:bg-emerald-500/20">
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                              </div>
                              <span className="text-sm font-medium text-slate-200 transition-colors duration-300 group-hover:text-white">
                                {skill}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
                          <Zap className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-lg font-medium text-slate-500">No skills listed</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Skills will appear here when added
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-6 px-4 pb-4">
                    {labour.certifications && labour.certifications.length > 0 ? (
                      <div className="space-y-3">
                        {labour.certifications.map((cert, index) => (
                          <div
                            key={index}
                            className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/80 p-4 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
                          >
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
                            <div className="flex items-center gap-4 pl-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 transition-all duration-300 group-hover:bg-emerald-500/20">
                                <FileCheck className="h-6 w-6 text-emerald-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-white transition-colors duration-300 group-hover:text-emerald-400">
                                  {cert}
                                </h4>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                  </span>
                                  <span className="text-xs text-slate-500">•</span>
                                  <span className="text-xs text-slate-500">Certificate Holder</span>
                                </div>
                              </div>
                              <div className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 sm:flex">
                                <Award className="h-3 w-3 text-emerald-400" />
                                <span className="text-xs font-medium text-emerald-400">Active</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
                          <Award className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-lg font-medium text-slate-500">
                          No certifications listed
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Certifications will appear here when verified
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Info Cards Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Availability Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">Availability</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getAvailabilityColor(labour.availability)}>
                      {labour.availability}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {getAvailabilityText(labour.availability)}
                  </p>
                </div>

                {/* Languages Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Languages className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">Languages</h3>
                  </div>
                  <p className="text-sm text-slate-300">Hindi, English</p>
                </div>
              </div>

              {/* Service Location Section */}
              <section>
                <h2 className="mb-4 text-xl font-bold text-white">Service Location</h2>
                <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-slate-800">
                  <MapPin className="mb-2 h-10 w-10 text-slate-600" />
                  <p className="text-slate-500">
                    {labour.service_radius_km}km service radius from {labour.city}
                  </p>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => toast.success('Message feature coming soon!')}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                {userData?.phone && (
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={() => window.open(`tel:${userData.phone}`)}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* RIGHT COLUMN - Sticky Sidebar */}
            <div className="lg:sticky lg:top-28 lg:h-fit">
              {/* Booking/Pricing Card */}
              <Card className="rounded-2xl border-slate-800 bg-slate-900/50">
                <CardContent className="p-6">
                  {/* Rate Display */}
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">₹{labour.daily_rate}</span>
                    <span className="text-slate-400">/day</span>
                    <Badge className="ml-auto border-emerald-500/30 bg-emerald-500/20 text-xs uppercase text-emerald-400">
                      FLEX PRICING
                    </Badge>
                  </div>

                  {/* Date Range */}
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Select Date Range
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        placeholder="Select dates"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Workers */}
                  <div className="mb-6">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Number of Workers
                    </label>
                    <div className="relative">
                      <select
                        value={workers}
                        onChange={(e) => setWorkers(Number(e.target.value))}
                        className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 py-3 pl-4 pr-10 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value={1}>1 Worker</option>
                        <option value={2}>2 Workers</option>
                        <option value={3}>3 Workers</option>
                        <option value={4}>4 Workers</option>
                        <option value={5}>5 Workers</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        ₹{labour.daily_rate} × {dateRange ? '5' : '0'} Days
                      </span>
                      <span className="text-slate-300">₹{subtotal || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Service Fee</span>
                      <span className="text-slate-300">₹{serviceFee || 0}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-white">Total</span>
                        <span className="text-xl font-bold text-emerald-400">₹{total || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <Button
                    className="h-14 w-full rounded-xl bg-emerald-500 text-lg font-bold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleBookNow}
                    disabled={labour.availability === 'unavailable'}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Book Now
                  </Button>

                  {/* Trust Badges */}
                  <div className="mt-6 space-y-3 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Secure Payment Protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Verified Worker Background</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>24/7 Field Support</span>
                    </div>
                  </div>

                  {/* Footer Text */}
                  <p className="mt-4 text-center text-xs uppercase tracking-wide text-slate-500">
                    Booking through AgriServe ensures you are covered by our worker protection
                    policy and insurance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
