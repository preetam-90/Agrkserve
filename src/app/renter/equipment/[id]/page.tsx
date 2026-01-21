'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  MapPin, 
  Star, 
  Calendar, 
  Phone,
  MessageSquare,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Tractor,
  Shield,
  CheckCircle,
  Play
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { 
  Button, 
  Card, 
  CardContent, 
  Badge, 
  Spinner, 
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui';
import { equipmentService, reviewService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { Equipment, Review, UserProfile } from '@/lib/types';
import { formatCurrency, EQUIPMENT_CATEGORIES } from '@/lib/utils';

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const equipmentId = params.id as string;
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Create media array combining images and video
  const mediaItems: Array<{ type: 'image' | 'video'; url: string }> = [];
  if (equipment?.images && equipment.images.length > 0) {
    mediaItems.push(...equipment.images.map(url => ({ type: 'image' as const, url })));
  }
  if (equipment?.video_url) {
    mediaItems.push({ type: 'video' as const, url: equipment.video_url });
  }
  const currentMedia = mediaItems[currentMediaIndex];

  useEffect(() => {
    loadEquipmentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentId]);

  const loadEquipmentDetails = async () => {
    setIsLoading(true);
    try {
      const [equipmentData, reviewsData] = await Promise.all([
        equipmentService.getEquipmentById(equipmentId),
        reviewService.getEquipmentReviews(equipmentId),
      ]);
      
      setEquipment(equipmentData);
      setReviews(reviewsData.data);
    } catch (err) {
      console.error('Failed to load equipment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevImage = () => {
    if (mediaItems.length > 0) {
      setCurrentMediaIndex((prev) => 
        prev === 0 ? mediaItems.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (mediaItems.length > 0) {
      setCurrentMediaIndex((prev) => 
        prev === mediaItems.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleBook = () => {
    if (!user) {
      router.push(`/login?redirect=/renter/equipment/${equipmentId}/book`);
      return;
    }
    router.push(`/renter/equipment/${equipmentId}/book`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: equipment?.name,
        text: equipment?.description || undefined,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Tractor className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Equipment Not Found</h1>
          <p className="text-gray-600 mb-6">
            The equipment you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/renter/equipment">Browse Equipment</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const owner = (equipment as Equipment & { owner?: UserProfile }).owner;
  const category = EQUIPMENT_CATEGORIES.find(c => c.value === equipment.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link 
          href="/renter/equipment"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to search
        </Link>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Media Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
              {mediaItems.length > 0 ? (
                <>
                  {currentMedia.type === 'image' ? (
                    <Image
                      src={currentMedia.url}
                      alt={equipment.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={currentMedia.url}
                        controls
                        className="w-full h-full object-cover"
                        playsInline
                      />
                      <div className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Video
                      </div>
                    </div>
                  )}
                  {mediaItems.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all hover:scale-110"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all hover:scale-110"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {mediaItems.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentMediaIndex(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              i === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tractor className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {mediaItems.map((media, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentMediaIndex(i)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                      i === currentMediaIndex ? 'ring-2 ring-green-500 scale-105' : 'hover:scale-105'
                    }`}
                  >
                    {media.type === 'image' ? (
                      <Image src={media.url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="relative w-full h-full">
                        <video src={media.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Equipment Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  {category && (
                    <Badge variant="secondary" className="mb-2">
                      {category.icon} {category.label}
                    </Badge>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-600 flex items-center gap-1 mt-2">
                <MapPin className="h-4 w-4" />
                {equipment.location_name || 'Location not specified'}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= (equipment.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{equipment.rating?.toFixed(1) || 'New'}</span>
                <span className="text-gray-500">({equipment.review_count || 0} reviews)</span>
              </div>
            </div>

            {/* Price Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600">
                    {formatCurrency(equipment.price_per_day)}
                  </span>
                  <span className="text-gray-500">/ day</span>
                </div>
                
                {equipment.price_per_hour && (
                  <p className="text-sm text-gray-500 mt-1">
                    Or {formatCurrency(equipment.price_per_hour)} / hour
                  </p>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <Badge variant={equipment.is_available ? 'success' : 'secondary'}>
                    {equipment.is_available ? 'Available Now' : 'Currently Booked'}
                  </Badge>
                  {equipment.total_bookings && equipment.total_bookings > 0 && (
                    <span className="text-sm text-gray-500">
                      {equipment.total_bookings} bookings
                    </span>
                  )}
                </div>

                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  disabled={!equipment.is_available}
                  onClick={handleBook}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {equipment.is_available ? 'Book Now' : 'Not Available'}
                </Button>
              </CardContent>
            </Card>

            {/* Owner Card */}
            {owner && (
              <Card>
                <CardContent className="p-4">
                  <Link 
                    href={`/user/${equipment.owner_id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar src={owner.profile_image} name={owner.name} size="lg" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 hover:text-green-600">{owner.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Verified Provider
                      </p>
                    </div>
                  </Link>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Details Tabs */}
        <Tabs defaultValue="details" className="mt-8">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {equipment.description || 'No description provided.'}
                </p>

                {equipment.features && equipment.features.length > 0 && (
                  <>
                    <h3 className="font-semibold text-lg mt-6 mb-3">Features</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {equipment.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">AgriServe Guarantee</p>
                    <p className="text-sm text-green-700">
                      Every booking is covered by our protection policy. Equipment is verified and owners are vetted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {equipment.brand && (
                    <div>
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="font-medium">{equipment.brand}</p>
                    </div>
                  )}
                  {equipment.model && (
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p className="font-medium">{equipment.model}</p>
                    </div>
                  )}
                  {equipment.year && (
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-medium">{equipment.year}</p>
                    </div>
                  )}
                  {equipment.horsepower && (
                    <div>
                      <p className="text-sm text-gray-500">Horsepower</p>
                      <p className="font-medium">{equipment.horsepower} HP</p>
                    </div>
                  )}
                  {equipment.fuel_type && (
                    <div>
                      <p className="text-sm text-gray-500">Fuel Type</p>
                      <p className="font-medium capitalize">{equipment.fuel_type}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{category?.label || equipment.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <Card>
              <CardContent className="p-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-600">No reviews yet</p>
                    <p className="text-sm text-gray-500">Be the first to review this equipment</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => {
                      const reviewer = (review as Review & { reviewer?: UserProfile }).reviewer;
                      return (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-start gap-3">
                            <Avatar 
                              src={reviewer?.profile_image} 
                              name={reviewer?.name || 'User'} 
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{reviewer?.name || 'Anonymous'}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.comment && (
                                <p className="text-gray-700 mt-2">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
