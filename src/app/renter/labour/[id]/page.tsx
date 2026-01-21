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
  MessageSquare
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-center">
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!labour) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/renter/labour"
          className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Labour List
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        href={`/user/${labour.user_id}`}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <h1 className="text-3xl font-bold text-gray-900 hover:text-green-600">
                          {labour.user?.name || 'Farm Worker'}
                        </h1>
                      </Link>
                      {labour.user?.is_verified && (
                        <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {labour.location_name && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        {labour.location_name}
                      </div>
                    )}

                    {/* Rating */}
                    {labour.rating && labour.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-lg">
                            {labour.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          ({labour.review_count} {labour.review_count === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Availability Badge */}
                  <div>
                    {labour.availability === 'available' ? (
                      <Badge variant="default" className="bg-green-500">
                        Available Now
                      </Badge>
                    ) : labour.availability === 'busy' ? (
                      <Badge variant="default" className="bg-yellow-500">
                        Busy
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-gray-500">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="text-sm">Experience</span>
                    </div>
                    <p className="font-semibold">{labour.experience_years} years</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Jobs Done</span>
                    </div>
                    <p className="font-semibold">{labour.total_jobs || 0}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">Service Radius</span>
                    </div>
                    <p className="font-semibold">{labour.service_radius_km} km</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Award className="h-4 w-4 mr-2" />
                      <span className="text-sm">Certifications</span>
                    </div>
                    <p className="font-semibold">{labour.certifications?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="about">
                  <TabsList>
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="certifications">Certifications</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="mt-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Bio</h3>
                      {labour.bio ? (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {labour.bio}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">No bio available</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {labour.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm py-2 px-3">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Certifications</h3>
                      {labour.certifications && labour.certifications.length > 0 ? (
                        <ul className="space-y-2">
                          {labour.certifications.map((cert, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Award className="h-5 w-5 text-teal-600 mt-0.5" />
                              <span className="text-gray-700">{cert}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No certifications listed</p>
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
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm text-gray-600 mb-2">Daily Rate</h3>
                  <div className="flex items-center text-3xl font-bold text-teal-600">
                    <IndianRupee className="h-7 w-7" />
                    {labour.daily_rate}
                  </div>
                  {labour.hourly_rate && (
                    <p className="text-sm text-gray-600 mt-2">
                      or ₹{labour.hourly_rate}/hour
                    </p>
                  )}
                </div>

                {labour.availability === 'available' ? (
                  <Button 
                    onClick={handleBookNow}
                    className="w-full"
                    size="lg"
                  >
                    Book Now
                  </Button>
                ) : (
                  <Button 
                    disabled
                    className="w-full"
                    size="lg"
                  >
                    Currently Unavailable
                  </Button>
                )}

                <div className="mt-4 pt-4 border-t space-y-3">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </Button>
                  {labour.user?.phone && (
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact
                    </Button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Secure payment through platform</span>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Cancel up to 24 hours before</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Verified worker profile</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {labour.user?.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{labour.user.phone}</span>
                    </div>
                  )}
                  {labour.user?.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{labour.user.email}</span>
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
