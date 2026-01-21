'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Star,
  Tractor,
  Users,
  Briefcase,
  CheckCircle,
  Mail,
  Phone,
  User as UserIcon,
  Calendar,
  IndianRupee,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Spinner,
  EmptyState,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui';
import { equipmentService, labourService, authService } from '@/lib/services';
import { useAuthStore, useMessagesStore } from '@/lib/store';
import { Equipment, LabourProfile, UserProfile } from '@/lib/types';
import { formatCurrency, EQUIPMENT_CATEGORIES } from '@/lib/utils';

export default function PublicUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { user: currentUser } = useAuthStore();
  const { startConversation } = useMessagesStore();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [labourProfile, setLabourProfile] = useState<LabourProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'equipment' | 'labour'>('equipment');

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load user profile
      const profile = await authService.getUserProfile(userId);
      setUserProfile(profile);

      // Load equipment listings
      const equipmentData = await equipmentService.getByOwnerId(userId);
      setEquipment(equipmentData);

      // Try to load labour profile
      try {
        const labourData = await labourService.getByUserId(userId);
        setLabourProfile(labourData);
        
        // If user has labour profile but no equipment, switch to labour tab
        if (labourData && equipmentData.length === 0) {
          setActiveTab('labour');
        }
      } catch (err) {
        // Labour profile doesn't exist, which is fine
        console.log('No labour profile found');
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!currentUser) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/user/${userId}`);
      return;
    }

    setIsStartingChat(true);
    try {
      const conversationId = await startConversation(userId);
      router.push(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setIsStartingChat(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <EmptyState
            icon={<UserIcon className="h-12 w-12" />}
            title="User not found"
            description="The user profile you're looking for doesn't exist."
            action={
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            }
          />
        </div>
        <Footer />
      </div>
    );
  }

  const hasEquipment = equipment.length > 0;
  const hasLabourProfile = labourProfile !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* User Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar
                  src={userProfile.profile_image || undefined}
                  name={userProfile.name || 'User'}
                  size="xl"
                  className="w-32 h-32"
                />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userProfile.name || 'Anonymous User'}
                  </h1>
                  {userProfile.is_verified && (
                    <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {userProfile.bio && (
                  <p className="text-gray-700 mb-4">{userProfile.bio}</p>
                )}

                {/* Location */}
                {userProfile.address && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{userProfile.address}</span>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex items-center text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Member since {new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Roles/Services */}
                <div className="flex gap-2">
                  {hasEquipment && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Tractor className="h-3 w-3" />
                      Equipment Provider
                    </Badge>
                  )}
                  {hasLabourProfile && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Labour Service
                    </Badge>
                  )}
                </div>

                {/* Message Button */}
                {!isOwnProfile && (
                  <div className="mt-4">
                    <Button
                      onClick={handleStartChat}
                      disabled={isStartingChat}
                      className="flex items-center gap-2"
                    >
                      {isStartingChat ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                      {isStartingChat ? 'Starting chat...' : 'Message'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Tabs */}
        {(hasEquipment || hasLabourProfile) && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'equipment' | 'labour')}>
            <TabsList className="mb-6">
              {hasEquipment && (
                <TabsTrigger value="equipment" className="flex items-center gap-2">
                  <Tractor className="h-4 w-4" />
                  Equipment ({equipment.length})
                </TabsTrigger>
              )}
              {hasLabourProfile && (
                <TabsTrigger value="labour" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Labour Service
                </TabsTrigger>
              )}
            </TabsList>

            {/* Equipment Tab */}
            {hasEquipment && (
              <TabsContent value="equipment">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {equipment.map((item) => {
                    const category = EQUIPMENT_CATEGORIES.find(c => c.value === item.category);
                    
                    return (
                      <Link key={item.id} href={`/renter/equipment/${item.id}`}>
                        <Card className="hover:shadow-lg transition-shadow h-full">
                          {/* Equipment Image */}
                          <div className="aspect-[4/3] bg-gray-100 relative">
                            {item.images?.[0] ? (
                              <Image
                                src={item.images[0]}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Tractor className="h-12 w-12 text-gray-300" />
                              </div>
                            )}
                            {!item.is_available && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Badge variant="secondary">Unavailable</Badge>
                              </div>
                            )}
                          </div>

                          <CardContent className="p-4">
                            {/* Equipment Name */}
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {item.name}
                            </h3>

                            {/* Category */}
                            {category && (
                              <p className="text-sm text-gray-500 mb-2">
                                {category.icon} {category.label}
                              </p>
                            )}

                            {/* Location */}
                            {item.location_name && (
                              <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                                <MapPin className="h-3 w-3" />
                                {item.location_name}
                              </p>
                            )}

                            {/* Price and Rating */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-green-600">
                                <IndianRupee className="h-4 w-4" />
                                <span className="text-lg font-bold">
                                  {item.price_per_day}
                                </span>
                                <span className="text-sm text-gray-500 ml-1">/day</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">
                                  {item.rating?.toFixed(1) || 'New'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </TabsContent>
            )}

            {/* Labour Tab */}
            {hasLabourProfile && labourProfile && (
              <TabsContent value="labour">
                <Link href={`/renter/labour/${labourProfile.id}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Profile Header */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                              {userProfile.name || 'Labour Profile'}
                            </h2>
                            <Badge
                              variant={
                                labourProfile.availability === 'available'
                                  ? 'success'
                                  : labourProfile.availability === 'busy'
                                  ? 'warning'
                                  : 'secondary'
                              }
                            >
                              {labourProfile.availability}
                            </Badge>
                          </div>

                          {/* Bio */}
                          {labourProfile.bio && (
                            <p className="text-gray-700 mb-4">{labourProfile.bio}</p>
                          )}

                          {/* Experience and Stats */}
                          <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Briefcase className="h-4 w-4" />
                              <span>{labourProfile.experience_years} years experience</span>
                            </div>
                            {labourProfile.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{labourProfile.rating.toFixed(1)}</span>
                                {labourProfile.review_count && (
                                  <span className="text-gray-500">({labourProfile.review_count} reviews)</span>
                                )}
                              </div>
                            )}
                            {labourProfile.total_jobs && labourProfile.total_jobs > 0 && (
                              <span className="text-gray-600">
                                {labourProfile.total_jobs} jobs completed
                              </span>
                            )}
                          </div>

                          {/* Skills */}
                          {labourProfile.skills && labourProfile.skills.length > 0 && (
                            <div className="mb-4">
                              <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                              <div className="flex flex-wrap gap-2">
                                {labourProfile.skills.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Certifications */}
                          {labourProfile.certifications && labourProfile.certifications.length > 0 && (
                            <div className="mb-4">
                              <h3 className="font-semibold text-gray-900 mb-2">Certifications</h3>
                              <div className="flex flex-wrap gap-2">
                                {labourProfile.certifications.map((cert, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Location */}
                          {labourProfile.location_name && (
                            <div className="flex items-center text-gray-600 mb-4">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{labourProfile.location_name}</span>
                              {labourProfile.service_radius_km && (
                                <span className="ml-2 text-sm text-gray-500">
                                  (Service radius: {labourProfile.service_radius_km} km)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Pricing */}
                          <div className="pt-4 border-t">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Daily Rate</p>
                                <div className="flex items-center text-2xl font-bold text-green-600">
                                  <IndianRupee className="h-5 w-5" />
                                  {labourProfile.daily_rate}
                                </div>
                              </div>
                              {labourProfile.hourly_rate && (
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                                  <div className="flex items-center text-xl font-semibold text-gray-700">
                                    <IndianRupee className="h-4 w-4" />
                                    {labourProfile.hourly_rate}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </TabsContent>
            )}
          </Tabs>
        )}

        {/* No Listings */}
        {!hasEquipment && !hasLabourProfile && (
          <EmptyState
            icon={<Tractor className="h-12 w-12" />}
            title="No listings available"
            description="This user hasn't listed any equipment or services yet."
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
