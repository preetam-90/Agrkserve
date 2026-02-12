'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ThumbsUp, MessageSquare, Calendar, Tractor, Users, TrendingUp, Filter, Search, Reply, Eye, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store';
import { reviewService } from '@/lib/services';
import { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ProviderReviewsPage() {
  const { user, activeRole } = useAuthStore();
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [givenReviews, setGivenReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    recommendationRate: 0,
    fiveStarPercentage: 0,
    fourStarPercentage: 0,
    threeStarPercentage: 0,
    twoStarPercentage: 0,
    oneStarPercentage: 0
  });

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get provider's reviews (reviews for their equipment)
      const providerReviewsResult = await reviewService.getProviderReviews(user.id);
      setReceivedReviews(providerReviewsResult.data);
      
      // Calculate stats
      if (providerReviewsResult.data.length > 0) {
        const totalRating = providerReviewsResult.data.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / providerReviewsResult.data.length;
        
        // Calculate recommendation rate (4+ stars)
        const recommendCount = providerReviewsResult.data.filter(r => r.rating >= 4).length;
        const recommendationRate = (recommendCount / providerReviewsResult.data.length) * 100;
        
        // Calculate star distribution
        const total = providerReviewsResult.data.length;
        const fiveStar = providerReviewsResult.data.filter(r => r.rating === 5).length;
        const fourStar = providerReviewsResult.data.filter(r => r.rating === 4).length;
        const threeStar = providerReviewsResult.data.filter(r => r.rating === 3).length;
        const twoStar = providerReviewsResult.data.filter(r => r.rating === 2).length;
        const oneStar = providerReviewsResult.data.filter(r => r.rating === 1).length;
        
        setStats({
          averageRating: parseFloat(avgRating.toFixed(1)),
          totalReviews: providerReviewsResult.data.length,
          recommendationRate: parseFloat(recommendationRate.toFixed(0)),
          fiveStarPercentage: parseFloat(((fiveStar / total) * 100).toFixed(0)),
          fourStarPercentage: parseFloat(((fourStar / total) * 100).toFixed(0)),
          threeStarPercentage: parseFloat(((threeStar / total) * 100).toFixed(0)),
          twoStarPercentage: parseFloat(((twoStar / total) * 100).toFixed(0)),
          oneStarPercentage: parseFloat(((oneStar / total) * 100).toFixed(0))
        });
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          recommendationRate: 0,
          fiveStarPercentage: 0,
          fourStarPercentage: 0,
          threeStarPercentage: 0,
          twoStarPercentage: 0,
          oneStarPercentage: 0
        });
      }
      
      // Get reviews given by this user
      const givenReviewsResult = await reviewService.getReviewsByUser(user.id);
      setGivenReviews(givenReviewsResult.data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderEmptyState = (title: string, description: string, icon: React.ReactNode) => (
    <Card className="bg-[#0F172A] border border-[#1E293B]">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 text-slate-500">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-center max-w-sm">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reviews & Feedback</h1>
            <p className="text-slate-400">
              See what renters are saying about your services and manage your feedback.
            </p>
          </div>
          
          <div className="animate-pulse space-y-6">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl h-24"></div>
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl h-24"></div>
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl h-24"></div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl h-40"></div>
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl h-40"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reviews & Feedback</h1>
          <p className="text-slate-400">
            See what renters are saying about your services and manage your feedback.
          </p>
        </div>

        <Tabs defaultValue="received" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-[#0F172A] border border-[#1E293B] h-12">
            <TabsTrigger 
              value="received" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              Reviews Received
            </TabsTrigger>
            <TabsTrigger 
              value="given" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              Reviews Given
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-500/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-emerald-400 mb-1">{stats.averageRating}</div>
                  <div className="flex justify-center mb-2">
                     {renderStars(Math.round(stats.averageRating))}
                  </div>
                  <p className="text-sm text-emerald-300 font-medium">Average Rating</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0F172A] border border-[#1E293B]">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-1">{stats.totalReviews}</div>
                  <p className="text-sm text-slate-400 font-medium mt-2">Total Reviews</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0F172A] border border-[#1E293B]">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-1">{stats.recommendationRate}%</div>
                  <p className="text-sm text-slate-400 font-medium mt-2">Recommendation Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Rating Distribution */}
            <Card className="bg-[#0F172A] border border-[#1E293B] mb-6">
              <CardHeader className="pb-4">
                <h3 className="text-lg font-semibold text-white">Rating Distribution</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="w-10 text-sm font-medium text-slate-300">{star}★</div>
                      <div className="flex-1 bg-[#1E293B] rounded-full h-2.5">
                        <div 
                          className="bg-emerald-500 h-2.5 rounded-full" 
                          style={{ width: `${stats[`${star}StarPercentage` as keyof typeof stats]}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-right text-sm text-slate-400">
                        {stats[`${star}StarPercentage` as keyof typeof stats]}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {receivedReviews.length > 0 ? (
              <div className="space-y-5">
                {receivedReviews.map((review) => (
                  <Card 
                    key={review.id} 
                    className="bg-[#0F172A] border border-[#1E293B] hover:border-emerald-500/30 transition-all duration-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <h3 className="font-semibold text-lg text-white">
                               {review.equipment_id ? 'Equipment Rental' : 'Service Provided'}
                             </h3>
                             <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                               {review.equipment_id ? <Tractor className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                               {review.equipment_id ? 'Equipment' : 'Service'}
                             </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                             <span>Review by</span>
                             <span className="font-medium text-slate-300">
                               {review.reviewer?.name || 'Anonymous'}
                             </span>
                          </div>
                        </div>
                        <div className="text-sm text-slate-400 flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-emerald-400" />
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-white ml-2">{review.rating}.0</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed mb-4">
                        {review.comment || 'No comment provided.'}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <button className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful (0)</span>
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-slate-600 text-slate-400 hover:bg-slate-700/50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              renderEmptyState(
                'No reviews received yet',
                'Once you complete bookings, renters will be able to leave reviews here.',
                <MessageSquare className="h-12 w-12" />
              )
            )}
          </TabsContent>

          <TabsContent value="given">
            {givenReviews.length > 0 ? (
              <div className="space-y-5">
                {givenReviews.map((review) => (
                  <Card key={review.id} className="bg-[#0F172A] border border-[#1E293B]">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <Avatar 
                          name={review.reviewer?.name || 'Unknown'} 
                          className="border border-[#1E293B]"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="font-semibold text-white">
                                {review.reviewer?.name || 'Unknown User'}
                              </h4>
                              <p className="text-xs text-slate-500">Renter</p>
                            </div>
                            <span className="text-sm text-slate-400">{formatDate(review.created_at)}</span>
                          </div>
                          <div className="mb-2 flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="text-sm font-medium text-white ml-2">{review.rating}.0</span>
                          </div>
                          <p className="text-slate-300">
                            {review.comment || 'No comment provided.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              renderEmptyState(
                'No reviews given yet',
                'Review renters after a completed booking to build trust in the community.',
                <Star className="h-12 w-12" />
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
