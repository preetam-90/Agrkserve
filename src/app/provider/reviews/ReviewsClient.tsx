'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ThumbsUp, MessageSquare, Calendar, Tractor, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data
const receivedReviews = [
  {
    id: 1,
    itemName: 'John Deere 5310',
    itemType: 'Equipment',
    reviewerName: 'Vikram Singh',
    rating: 5,
    date: '18 May 2024',
    comment: 'The tractor was in excellent condition. Rahul was very helpful and delivered it on time. Highly recommended!',
    helpfulCount: 4,
  },
  {
    id: 2,
    itemName: 'Harvesting Team (5)',
    itemType: 'Labour',
    reviewerName: 'Rajesh Kumar',
    rating: 4,
    date: '12 May 2024',
    comment: 'Good work by the team. Finished the job quickly. One star less because they arrived a bit late.',
    helpfulCount: 1,
  },
  {
    id: 3,
    itemName: 'Rotavator',
    itemType: 'Equipment',
    reviewerName: 'Amit Verma',
    rating: 5,
    date: '05 May 2024',
    comment: 'Perfect for my needs. Well maintained equipment.',
    helpfulCount: 0,
  },
];

const givenReviews = [
  {
    id: 1,
    targetName: 'Vikram Singh',
    targetRole: 'Renter',
    rating: 5,
    date: '19 May 2024',
    comment: 'Vikram took great care of the tractor and returned it cleaned. Payment was immediate.',
  },
  {
    id: 2,
    targetName: 'Priya Pawar',
    targetRole: 'Renter',
    rating: 3,
    date: '01 May 2024',
    comment: 'Payment was delayed by 2 days, but communication was okay.',
  },
];

export default function ProviderReviewsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_activeTab, setActiveTab] = useState('received');

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reviews & Feedback</h1>
        <p className="text-gray-500 mt-1">
          See what renters are saying about your services and manage your feedback.
        </p>
      </div>

      <Tabs defaultValue="received" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="received">Reviews Received</TabsTrigger>
          <TabsTrigger value="given">Reviews Given</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="bg-green-50 border-green-100">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-green-700 mb-1">4.8</div>
                <div className="flex justify-center mb-2">
                   {renderStars(5)}
                </div>
                <p className="text-sm text-green-600 font-medium">Average Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-1">{receivedReviews.length}</div>
                <p className="text-sm text-gray-500 font-medium mt-2">Total Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-1">98%</div>
                <p className="text-sm text-gray-500 font-medium mt-2">Recommendation Rate</p>
              </CardContent>
            </Card>
          </div>

          {receivedReviews.length > 0 ? (
            <div className="space-y-4">
              {receivedReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <h3 className="font-semibold text-gray-900">{review.itemName}</h3>
                           <Badge variant="secondary" className="font-normal text-xs">
                             {review.itemType === 'Equipment' ? <Tractor className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                             {review.itemType}
                           </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                           <span>Review by</span>
                           <span className="font-medium text-gray-700">{review.reviewerName}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {review.date}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {review.comment}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                          <ThumbsUp className="h-4 w-4" />
                          Helpful ({review.helpfulCount})
                        </button>
                      </div>
                      <Button variant="outline" size="sm">Reply</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No reviews received yet</h3>
                <p className="text-gray-500 text-center max-w-sm mt-2">
                  Once you complete bookings, renters will be able to leave reviews here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="given">
          {givenReviews.length > 0 ? (
            <div className="space-y-4">
              {givenReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar name={review.targetName} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.targetName}</h4>
                            <p className="text-xs text-gray-500">{review.targetRole}</p>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-700">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No reviews given yet</h3>
                <p className="text-gray-500 text-center max-w-sm mt-2 mb-6">
                  Review renters after a completed booking to build trust in the community.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
