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
  Share2
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
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
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-center">
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/renter/labour"
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Labour List
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-emerald-900/50 to-slate-900 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              </div>
              <CardContent className="p-6 pt-0 relative">
                {/* Profile Image Offset */}
                <div className="-mt-12 mb-4 flex justify-between items-end">
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border-4 border-slate-900 shadow-xl overflow-hidden relative">
                    {labour.user?.profile_image ? (
                      <Image
                        src={labour.user.profile_image}
                        alt={labour.user?.name || 'Worker'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Users className="h-10 w-10 text-slate-500" />
                        {/* Using fallback icon if Image fails or no image - but need icon import fixed above if Users not available, using Briefcase/User as generic */}
                      </div>
                    )}
                  </div>
                  <div className="mb-2 flex gap-3 items-center">
                    <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full border-slate-700 bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 shadow-lg">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {labour.availability === 'available' ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 border-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        Available Now
                      </Badge>
                    ) : labour.availability === 'busy' ? (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 border-0">
                        Busy
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 hover:bg-red-600 border-0">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white tracking-tight">
                        {labour.user?.name || 'Farm Worker'}
                      </h1>
                      {labour.user?.is_verified && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {labour.location_name && (
                      <div className="flex items-center text-slate-400 mb-3">
                        <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                        {labour.location_name}
                      </div>
                    )}

                    {/* Rating */}
                    {labour.rating && labour.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-bold text-lg text-yellow-500">
                            {labour.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-slate-500 text-sm">
                          ({labour.review_count} {labour.review_count === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
                  <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="flex items-center text-slate-400 mb-1">
                      <Briefcase className="h-4 w-4 mr-2 text-emerald-500" />
                      <span className="text-sm font-medium">Experience</span>
                    </div>
                    <p className="font-bold text-white text-lg">{labour.experience_years} <span className="text-sm font-normal text-slate-500">years</span></p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="flex items-center text-slate-400 mb-1">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                      <span className="text-sm font-medium">Jobs Done</span>
                    </div>
                    <p className="font-bold text-white text-lg">{labour.total_jobs || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="flex items-center text-slate-400 mb-1">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                      <span className="text-sm font-medium">Radius</span>
                    </div>
                    <p className="font-bold text-white text-lg">{labour.service_radius_km} <span className="text-sm font-normal text-slate-500">km</span></p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="flex items-center text-slate-400 mb-1">
                      <Award className="h-4 w-4 mr-2 text-emerald-500" />
                      <span className="text-sm font-medium">Certs</span>
                    </div>
                    <p className="font-bold text-white text-lg">{labour.certifications?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="bg-slate-950 border border-slate-800 w-full justify-start p-1 h-auto">
                    <TabsTrigger value="about" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">About</TabsTrigger>
                    <TabsTrigger value="skills" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Skills</TabsTrigger>
                    <TabsTrigger value="certifications" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Certifications</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="mt-6">
                    <div>
                      <h3 className="font-bold text-lg text-white mb-3">Bio</h3>
                      {labour.bio ? (
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {labour.bio}
                        </p>
                      ) : (
                        <p className="text-slate-500 italic">No bio available</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-6">
                    <div>
                      <h3 className="font-bold text-lg text-white mb-3">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {labour.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-slate-800 text-slate-200 border border-slate-700 py-1.5 px-3 text-sm hover:bg-slate-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-6">
                    <div>
                      <h3 className="font-bold text-lg text-white mb-3">Certifications</h3>
                      {labour.certifications && labour.certifications.length > 0 ? (
                        <ul className="grid gap-3">
                          {labour.certifications.map((cert, idx) => (
                            <li key={idx} className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                              <div className="bg-emerald-500/10 p-2 rounded-full">
                                <Award className="h-5 w-5 text-emerald-500" />
                              </div>
                              <span className="text-slate-200 font-medium">{cert}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 italic">No certifications listed</p>
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
            <Card className="sticky top-24 bg-slate-900/50 border-slate-800 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Daily Rate</h3>
                  <div className="flex items-center text-4xl font-bold text-emerald-400">
                    <IndianRupee className="h-8 w-8" />
                    {labour.daily_rate}
                  </div>
                  {labour.hourly_rate && (
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                      or ₹{labour.hourly_rate}/hour
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {labour.availability === 'available' ? (
                    <Button
                      onClick={handleBookNow}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 font-bold h-12 text-lg"
                      size="lg"
                    >
                      Book Now
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-slate-800 text-slate-400 h-12"
                      size="lg"
                    >
                      Currently Unavailable
                    </Button>
                  )}

                  <Button variant="outline" className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white h-11">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>

                  {labour.user?.phone && (
                    <Button variant="outline" className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white h-11">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800 text-sm text-slate-400 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-emerald-500/80 shrink-0" />
                    <span>Secure payment through platform</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-emerald-500/80 shrink-0" />
                    <span>Cancel up to 24 hours before</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-emerald-500/80 shrink-0" />
                    <span>Verified worker profile</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {labour.user?.phone && (
                    <div className="flex items-center gap-3 text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <div className="bg-slate-800 p-2 rounded-full">
                        <Phone className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium">{labour.user.phone}</span>
                    </div>
                  )}
                  {labour.user?.email && (
                    <div className="flex items-center gap-3 text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <div className="bg-slate-800 p-2 rounded-full">
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
