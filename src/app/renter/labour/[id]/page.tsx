'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Star,
  Calendar,
  Briefcase,
  IndianRupee,
  Award,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  Users,
  Share2,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
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
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function LabourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const labourId = params.id as string;

  const [labour, setLabour] = useState<LabourProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLabourProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labourId]);

  const loadLabourProfile = async () => {
    try {
      const data = await labourService.getById(labourId);
      if (!data) {
        toast.error('Labour profile not found');
        router.push('/renter/labour');
        return;
      }
      setLabour(data);
    } catch (err) {
      console.error('Failed to load labour profile:', err);
      toast.error('Failed to load labour details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      router.push(`/login?redirect=/renter/labour/${labourId}`);
      return;
    }
    router.push(`/renter/labour/${labourId}/book`);
  };

  const handleShare = async () => {
    const shareData = {
      title: labour?.user?.name || 'AgriServe Worker',
      text: `Check out ${labour?.user?.name}'s profile on AgriServe!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        console.error('Copy to clipboard failed:', err);
        toast.error('Failed to copy link.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950">
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 pb-8 pt-28">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!labour) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <Header />

      <main className="container mx-auto flex-1 px-4 pb-8 pt-28">
        {/* Back Button */}
        <Link
          href="/renter/labour"
          className="mb-6 inline-flex items-center text-emerald-400 transition-colors hover:text-emerald-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Labour List
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header Card */}
            <Card className="overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <div className="relative h-32 bg-gradient-to-r from-emerald-900/50 to-slate-900">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              </div>
              <CardContent className="relative p-6 pt-0">
                {/* Profile Image Offset */}
                <div className="-mt-12 mb-4 flex items-end justify-between">
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-slate-900 bg-slate-800 shadow-xl">
                    {labour.user?.profile_image ? (
                      <Image
                        src={labour.user.profile_image}
                        alt={labour.user?.name || 'Worker'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-800">
                        <Users className="h-10 w-10 text-slate-500" />
                        {/* Using fallback icon if Image fails or no image - but need icon import fixed above if Users not available, using Briefcase/User as generic */}
                      </div>
                    )}
                  </div>
                  <div className="mb-2 flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShare}
                      className="rounded-full border-slate-700 bg-slate-900/80 text-emerald-400 shadow-lg backdrop-blur-sm hover:bg-slate-800 hover:text-emerald-300"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {labour.availability === 'available' ? (
                      <Badge className="border-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-600">
                        Available Now
                      </Badge>
                    ) : labour.availability === 'busy' ? (
                      <Badge className="border-0 bg-yellow-500 hover:bg-yellow-600">Busy</Badge>
                    ) : (
                      <Badge className="border-0 bg-red-500 hover:bg-red-600">Unavailable</Badge>
                    )}
                  </div>
                </div>

                <div className="mb-6 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h1 className="text-3xl font-bold tracking-tight text-white">
                        {labour.user?.name || 'Farm Worker'}
                      </h1>
                      {labour.user?.is_verified && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {labour.location_name && (
                      <div className="mb-3 flex items-center text-slate-400">
                        <MapPin className="mr-2 h-4 w-4 text-emerald-500" />
                        {labour.location_name}
                      </div>
                    )}

                    {/* Rating */}
                    {labour.rating && labour.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-lg font-bold text-yellow-500">
                            {labour.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500">
                          ({labour.review_count} {labour.review_count === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 md:grid-cols-4">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                    <div className="mb-1 flex items-center text-slate-400">
                      <Briefcase className="mr-2 h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">Experience</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {labour.experience_years}{' '}
                      <span className="text-sm font-normal text-slate-500">years</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                    <div className="mb-1 flex items-center text-slate-400">
                      <Calendar className="mr-2 h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">Jobs Done</span>
                    </div>
                    <p className="text-lg font-bold text-white">{labour.total_jobs || 0}</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                    <div className="mb-1 flex items-center text-slate-400">
                      <MapPin className="mr-2 h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">Radius</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {labour.service_radius_km}{' '}
                      <span className="text-sm font-normal text-slate-500">km</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                    <div className="mb-1 flex items-center text-slate-400">
                      <Award className="mr-2 h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">Certs</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {labour.certifications?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="h-auto w-full justify-start border border-slate-800 bg-slate-950 p-1">
                    <TabsTrigger
                      value="about"
                      className="text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white"
                    >
                      About
                    </TabsTrigger>
                    <TabsTrigger
                      value="skills"
                      className="text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white"
                    >
                      Skills
                    </TabsTrigger>
                    <TabsTrigger
                      value="certifications"
                      className="text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white"
                    >
                      Certifications
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="mt-6">
                    <div>
                      <h3 className="mb-3 text-lg font-bold text-white">Bio</h3>
                      {labour.bio ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
                          {labour.bio}
                        </p>
                      ) : (
                        <p className="italic text-slate-500">No bio available</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-6">
                    <div>
                      <h3 className="mb-3 text-lg font-bold text-white">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {labour.skills.map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-6">
                    <div>
                      <h3 className="mb-3 text-lg font-bold text-white">Certifications</h3>
                      {labour.certifications && labour.certifications.length > 0 ? (
                        <ul className="grid gap-3">
                          {labour.certifications.map((cert, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3"
                            >
                              <div className="rounded-full bg-emerald-500/10 p-2">
                                <Award className="h-5 w-5 text-emerald-500" />
                              </div>
                              <span className="font-medium text-slate-200">{cert}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-500">No certifications listed</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-24 border-slate-800 bg-slate-900/50 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-400">
                    Daily Rate
                  </h3>
                  <div className="flex items-center text-4xl font-bold text-emerald-400">
                    <IndianRupee className="h-8 w-8" />
                    {labour.daily_rate}
                  </div>
                  {labour.hourly_rate && (
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      or ₹{labour.hourly_rate}/hour
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {labour.availability === 'available' ? (
                    <Button
                      onClick={handleBookNow}
                      className="h-12 w-full bg-emerald-600 text-lg font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500"
                      size="lg"
                    >
                      Book Now
                    </Button>
                  ) : (
                    <Button disabled className="h-12 w-full bg-slate-800 text-slate-400" size="lg">
                      Currently Unavailable
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="h-11 w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>

                  {labour.user?.phone && (
                    <Button
                      variant="outline"
                      className="h-11 w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  )}
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-800 pt-6 text-sm text-slate-400">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500/80" />
                    <span>Secure payment through platform</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500/80" />
                    <span>Cancel up to 24 hours before</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500/80" />
                    <span>Verified worker profile</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-bold text-white">Contact Information</h3>
                <div className="space-y-4">
                  {labour.user?.phone && (
                    <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-slate-300">
                      <div className="rounded-full bg-slate-800 p-2">
                        <Phone className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium">{labour.user.phone}</span>
                    </div>
                  )}
                  {labour.user?.email && (
                    <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-slate-300">
                      <div className="rounded-full bg-slate-800 p-2">
                        <Mail className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium">{labour.user.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
