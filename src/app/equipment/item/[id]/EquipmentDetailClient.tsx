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
  Loader2,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { equipmentService, reviewService } from '@/lib/services';
import { useAuthStore, useMessagesStore } from '@/lib/store';
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
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Create media array combining images and video
  const mediaItems: Array<{ type: 'image' | 'video'; url: string }> = [];
  if (equipment?.images && equipment.images.length > 0) {
    mediaItems.push(...equipment.images.map((url) => ({ type: 'image' as const, url })));
  }
  if (equipment?.video_url) {
    mediaItems.push({ type: 'video' as const, url: equipment.video_url });
  }
  const currentMedia = mediaItems[currentMediaIndex];

  useEffect(() => {
    loadEquipmentDetails();
     
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
      setCurrentMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (mediaItems.length > 0) {
      setCurrentMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
    }
  };

  const handleBook = () => {
    if (!user) {
      router.push(`/login?redirect=/equipment/item/${equipmentId}/book`);
      return;
    }
    router.push(`/equipment/item/${equipmentId}/book`);
  };

  const handleChat = async () => {
    if (!user) {
      // Redirect to login and preserve intent to message the owner after auth
      router.push(`/login?redirect=${encodeURIComponent(`/messages?user=${equipment?.owner_id}`)}`);
      return;
    }

    if (!equipment?.owner_id) {
      toast.error('Unable to find equipment owner');
      return;
    }

    // If the current user is the equipment owner, don't attempt to create a
    // conversation (backend prohibits self-conversations). Send them to the
    // Messages inbox instead.
    if (equipment.owner_id === user?.id) {
      router.push('/messages');
      return;
    }

    // Normal flow: create (or fetch) a conversation with the owner and open it
    setIsStartingChat(true);
    try {
      const conversationId = await useMessagesStore
        .getState()
        .startConversation(equipment.owner_id);
      router.push(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat. Please try again.');
    } finally {
      setIsStartingChat(false);
    }
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
      <div className="flex min-h-screen flex-col bg-slate-950">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <Tractor className="mb-6 h-20 w-20 text-slate-700" />
          <h1 className="mb-2 text-3xl font-bold text-white">Equipment Not Found</h1>
          <p className="mb-8 max-w-md text-slate-400">
            The equipment you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-500">
            <Link href="/equipment">Browse Equipment</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const owner = (equipment as Equipment & { owner?: UserProfile }).owner;
  const category = EQUIPMENT_CATEGORIES.find((c) => c.value === equipment.category);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-8 pt-28">
        {/* Back Button */}
        <Link
          href="/equipment"
          className="mb-6 inline-flex items-center text-slate-400 transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to search
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Media Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl">
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
                    <div className="relative h-full w-full">
                      <video
                        src={currentMedia.url}
                        controls
                        className="h-full w-full object-cover"
                        playsInline
                      />
                      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                        <Play className="h-3 w-3 fill-white" />
                        Video
                      </div>
                    </div>
                  )}
                  {mediaItems.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 transform rounded-full bg-black/50 p-2.5 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transform rounded-full bg-black/50 p-2.5 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                        {mediaItems.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentMediaIndex(i)}
                            className={`h-2 w-2 rounded-full transition-all ${
                              i === currentMediaIndex
                                ? 'w-6 bg-emerald-500'
                                : 'bg-white/50 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Tractor className="h-24 w-24 text-slate-700" />
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {mediaItems.length > 1 && (
              <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                {mediaItems.map((media, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentMediaIndex(i)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      i === currentMediaIndex
                        ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'border-transparent opacity-70 hover:border-slate-600 hover:opacity-100'
                    }`}
                  >
                    {media.type === 'image' ? (
                      <Image src={media.url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="relative h-full w-full">
                        <video src={media.url} className="h-full w-full object-cover" />
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
                    <Badge
                      variant="secondary"
                      className="mb-3 border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      <span className="mr-1.5">{category.icon}</span> {category.label}
                    </Badge>
                  )}
                  <h1 className="mb-2 text-3xl font-bold text-white">{equipment.name}</h1>
                  <p className="flex items-center gap-1.5 text-lg text-slate-400">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    {equipment.location_name || 'Location not specified'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 ${isFavorite ? 'border-red-500/50 text-red-500' : 'text-slate-400'}`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="border-slate-700 bg-slate-900/50 text-emerald-400 backdrop-blur-sm hover:bg-slate-800 hover:text-emerald-300"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1">
                  <Star className="mr-1.5 h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold text-yellow-500">
                    {equipment.rating?.toFixed(1) || 'New'}
                  </span>
                </div>
                <span className="text-slate-500">({equipment.review_count || 0} reviews)</span>
              </div>
            </div>

            {/* Price Card */}
            <Card className="overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-5">
                <Tractor className="h-32 w-32" />
              </div>
              <CardContent className="relative p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-emerald-400">
                        {formatCurrency(equipment.price_per_day)}
                      </span>
                      <span className="font-medium text-slate-400">/ day</span>
                    </div>
                    {equipment.price_per_hour && (
                      <p className="mt-1 text-sm text-slate-500">
                        Or {formatCurrency(equipment.price_per_hour)} / hour
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {equipment.is_available ? (
                      <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-medium text-emerald-400">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                        </span>
                        Available Now
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-500/20 bg-red-500/10 text-red-400"
                      >
                        Currently Booked
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-800/50 pt-6">
                  <Button
                    className={`h-12 w-full text-lg font-semibold shadow-lg ${equipment.is_available ? 'bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-500' : 'cursor-not-allowed bg-slate-800 text-slate-400'}`}
                    disabled={!equipment.is_available}
                    onClick={handleBook}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    {equipment.is_available ? 'Book Now' : 'Not Available'}
                  </Button>
                  {equipment.total_bookings && equipment.total_bookings > 0 && (
                    <p className="mt-3 text-center text-xs text-slate-500">
                      Trusted by {equipment.total_bookings} farmers
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Owner Card */}
            {owner && (
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Link
                    href={`/user/${equipment.owner_id}`}
                    className="group flex items-center gap-4"
                  >
                    <Avatar
                      src={owner.profile_image}
                      name={owner.name}
                      size="lg"
                      className="border-2 border-slate-700 transition-colors group-hover:border-emerald-500"
                    />
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white transition-colors group-hover:text-emerald-400">
                        {owner.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        Verified Provider
                      </p>
                    </div>
                  </Link>
                  <div className="mt-5 flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChat}
                      disabled={isStartingChat}
                      className="flex-1 border-emerald-500/30 bg-emerald-500/5 text-emerald-400 transition-all duration-300 hover:bg-emerald-500 hover:text-white"
                    >
                      {isStartingChat ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquare className="mr-2 h-4 w-4" />
                      )}
                      {isStartingChat ? 'Starting...' : 'Chat'}
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
            <TabsList className="mb-6 h-auto w-full justify-start rounded-xl border border-slate-800 bg-slate-900/50 p-1">
              <TabsTrigger
                value="details"
                className="rounded-lg px-6 py-2.5 text-slate-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="rounded-lg px-6 py-2.5 text-slate-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-lg px-6 py-2.5 text-slate-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="mb-4 text-xl font-bold text-white">Description</h3>
                  <p className="whitespace-pre-line leading-relaxed text-slate-300">
                    {equipment.description || 'No description provided.'}
                  </p>

                  {equipment.features && equipment.features.length > 0 && (
                    <>
                      <h3 className="mb-4 mt-8 text-xl font-bold text-white">Features</h3>
                      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {equipment.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3"
                          >
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                            <span className="text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="mt-8 flex items-start gap-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                    <div className="rounded-full bg-emerald-500/10 p-2">
                      <Shield className="h-6 w-6 flex-shrink-0 text-emerald-500" />
                    </div>
                    <div>
                      <p className="mb-1 text-lg font-bold text-emerald-400">AgriServe Guarantee</p>
                      <p className="text-emerald-500/80">
                        Every booking is covered by our protection policy. Equipment is verified and
                        owners are vetted.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs">
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="mb-6 text-xl font-bold text-white">Specifications</h3>
                  <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
                    {equipment.brand && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                        <p className="mb-1 text-sm text-slate-500">Brand</p>
                        <p className="text-lg font-semibold text-white">{equipment.brand}</p>
                      </div>
                    )}
                    {equipment.model && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                        <p className="mb-1 text-sm text-slate-500">Model</p>
                        <p className="text-lg font-semibold text-white">{equipment.model}</p>
                      </div>
                    )}
                    {equipment.year && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                        <p className="mb-1 text-sm text-slate-500">Year</p>
                        <p className="text-lg font-semibold text-white">{equipment.year}</p>
                      </div>
                    )}
                    {equipment.horsepower && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                        <p className="mb-1 text-sm text-slate-500">Horsepower</p>
                        <p className="text-lg font-semibold text-white">
                          {equipment.horsepower} HP
                        </p>
                      </div>
                    )}
                    {equipment.fuel_type && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                        <p className="mb-1 text-sm text-slate-500">Fuel Type</p>
                        <p className="text-lg font-semibold capitalize text-white">
                          {equipment.fuel_type}
                        </p>
                      </div>
                    )}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                      <p className="mb-1 text-sm text-slate-500">Category</p>
                      <p className="text-lg font-semibold text-white">
                        {category?.label || equipment.category}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  {reviews.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mb-4 inline-flex rounded-full bg-slate-800/50 p-4">
                        <Star className="h-8 w-8 text-slate-600" />
                      </div>
                      <p className="mb-1 text-lg text-slate-400">No reviews yet</p>
                      <p className="text-sm text-slate-600">
                        Be the first to review this equipment
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => {
                        const reviewer = (review as Review & { reviewer?: UserProfile }).reviewer;
                        return (
                          <div
                            key={review.id}
                            className="border-b border-slate-800 pb-6 last:border-0"
                          >
                            <div className="flex items-start gap-4">
                              <Avatar
                                src={reviewer?.profile_image}
                                name={reviewer?.name || 'User'}
                                className="border border-slate-700"
                              />
                              <div className="flex-1">
                                <div className="mb-1 flex items-center justify-between">
                                  <p className="font-bold text-white">
                                    {reviewer?.name || 'Anonymous'}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="mb-2 flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3.5 w-3.5 ${
                                        star <= review.rating
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
