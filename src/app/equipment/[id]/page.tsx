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
  Play,
  Loader2
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
import toast from 'react-hot-toast';

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
      router.push(`/login?redirect=/equipment/${equipmentId}/book`);
      return;
    }
    router.push(`/equipment/${equipmentId}/book`);
  };

  const handleShare = async () => {
    const shareData = {
      title: equipment?.name || 'AgriServe Equipment',
      text: equipment?.description || 'Check out this equipment on AgriServe!',
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
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <Tractor className="h-20 w-20 text-slate-700 mb-6" />
          <h1 className="text-3xl font-bold text-white mb-2">Equipment Not Found</h1>
          <p className="text-slate-400 mb-8 max-w-md">
            The equipment you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Link href="/equipment">Browse Equipment</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const owner = (equipment as Equipment & { owner?: UserProfile }).owner;
  const category = EQUIPMENT_CATEGORIES.find(c => c.value === equipment.category);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/equipment"
          className="inline-flex items-center text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to search
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Media Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
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
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <Play className="h-3 w-3 fill-white" />
                        Video
                      </div>
                    </div>
                  )}
                  {mediaItems.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white transition-all transform hover:scale-110"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white transition-all transform hover:scale-110"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {mediaItems.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentMediaIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentMediaIndex ? 'bg-emerald-500 w-6' : 'bg-white/50 hover:bg-white/80'
                              }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tractor className="h-24 w-24 text-slate-700" />
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {mediaItems.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {mediaItems.map((media, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentMediaIndex(i)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all border-2 ${i === currentMediaIndex ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-600'
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
                    <Badge variant="secondary" className="mb-3 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700">
                      <span className="mr-1.5">{category.icon}</span> {category.label}
                    </Badge>
                  )}
                  <h1 className="text-3xl font-bold text-white mb-2">{equipment.name}</h1>
                  <p className="text-slate-400 flex items-center gap-1.5 text-lg">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    {equipment.location_name || 'Location not specified'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 ${isFavorite ? 'text-red-500 border-red-500/50' : 'text-slate-400'}`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare} className="border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 text-emerald-400 hover:text-emerald-300">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1.5" />
                  <span className="font-bold text-yellow-500">{equipment.rating?.toFixed(1) || 'New'}</span>
                </div>
                <span className="text-slate-500">({equipment.review_count || 0} reviews)</span>
              </div>
            </div>

            {/* Price Card */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Tractor className="w-32 h-32" />
              </div>
              <CardContent className="p-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-emerald-400">
                        {formatCurrency(equipment.price_per_day)}
                      </span>
                      <span className="text-slate-400 font-medium">/ day</span>
                    </div>
                    {equipment.price_per_hour && (
                      <p className="text-sm text-slate-500 mt-1">
                        Or {formatCurrency(equipment.price_per_hour)} / hour
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {equipment.is_available ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-medium bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        Available Now
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Currently Booked</Badge>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800/50">
                  <Button
                    className={`w-full h-12 text-lg font-semibold shadow-lg ${equipment.is_available ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                    disabled={!equipment.is_available}
                    onClick={handleBook}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    {equipment.is_available ? 'Book Now' : 'Not Available'}
                  </Button>
                  {equipment.total_bookings && equipment.total_bookings > 0 && (
                    <p className="text-center text-xs text-slate-500 mt-3">
                      Trusted by {equipment.total_bookings} farmers
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Owner Card */}
            {owner && (
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Link
                    href={`/user/${equipment.owner_id}`}
                    className="flex items-center gap-4 group"
                  >
                    <Avatar src={owner.profile_image} name={owner.name} size="lg" className="border-2 border-slate-700 group-hover:border-emerald-500 transition-colors" />
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{owner.name}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        Verified Provider
                      </p>
                    </div>
                  </Link>
                  <div className="flex gap-3 mt-5">
                    <Button variant="outline" size="sm" className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-slate-900/50 border border-slate-800 p-1 mb-6 h-auto w-full justify-start rounded-xl">
              <TabsTrigger value="details" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 px-6 py-2.5 rounded-lg">Details</TabsTrigger>
              <TabsTrigger value="specs" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 px-6 py-2.5 rounded-lg">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 px-6 py-2.5 rounded-lg">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="font-bold text-xl text-white mb-4">Description</h3>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {equipment.description || 'No description provided.'}
                  </p>

                  {equipment.features && equipment.features.length > 0 && (
                    <>
                      <h3 className="font-bold text-xl text-white mt-8 mb-4">Features</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {equipment.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="mt-8 p-5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-start gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-full">
                      <Shield className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-400 text-lg mb-1">AgriServe Guarantee</p>
                      <p className="text-emerald-500/80">
                        Every booking is covered by our protection policy. Equipment is verified and owners are vetted.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="font-bold text-xl text-white mb-6">Specifications</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {equipment.brand && (
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-sm text-slate-500 mb-1">Brand</p>
                        <p className="font-semibold text-white text-lg">{equipment.brand}</p>
                      </div>
                    )}
                    {equipment.model && (
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-sm text-slate-500 mb-1">Model</p>
                        <p className="font-semibold text-white text-lg">{equipment.model}</p>
                      </div>
                    )}
                    {equipment.year && (
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-sm text-slate-500 mb-1">Year</p>
                        <p className="font-semibold text-white text-lg">{equipment.year}</p>
                      </div>
                    )}
                    {equipment.horsepower && (
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-sm text-slate-500 mb-1">Horsepower</p>
                        <p className="font-semibold text-white text-lg">{equipment.horsepower} HP</p>
                      </div>
                    )}
                    {equipment.fuel_type && (
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <p className="text-sm text-slate-500 mb-1">Fuel Type</p>
                        <p className="font-semibold text-white text-lg capitalize">{equipment.fuel_type}</p>
                      </div>
                    )}
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <p className="text-sm text-slate-500 mb-1">Category</p>
                      <p className="font-semibold text-white text-lg">{category?.label || equipment.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardContent className="p-8">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex p-4 rounded-full bg-slate-800/50 mb-4">
                        <Star className="h-8 w-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400 text-lg mb-1">No reviews yet</p>
                      <p className="text-sm text-slate-600">Be the first to review this equipment</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => {
                        const reviewer = (review as Review & { reviewer?: UserProfile }).reviewer;
                        return (
                          <div key={review.id} className="border-b border-slate-800 pb-6 last:border-0">
                            <div className="flex items-start gap-4">
                              <Avatar
                                src={reviewer?.profile_image}
                                name={reviewer?.name || 'User'}
                                className="border border-slate-700"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-bold text-white">{reviewer?.name || 'Anonymous'}</p>
                                  <p className="text-sm text-slate-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center mb-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3.5 w-3.5 ${star <= review.rating
                                          ? 'fill-yellow-500 text-yellow-500'
                                          : 'text-slate-700'
                                        }`}
                                    />
                                  ))}
                                </div>
                                {review.comment && (
                                  <p className="text-slate-300">{review.comment}</p>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
