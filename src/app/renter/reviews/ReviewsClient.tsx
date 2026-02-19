'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';
import { StarRating } from '@/components/common/StarRating';

// Mock data
const givenReviews = [
  {
    id: 1,
    targetName: 'John Deere 5310',
    targetType: 'Equipment',
    providerName: 'Rahul Sharma',
    rating: 5,
    date: '15 May 2024',
    comment:
      'Excellent condition tractor. Very powerful and fuel efficient. Rahul was very helpful with the setup.',
    helpfulCount: 2,
  },
  {
    id: 2,
    targetName: 'Harvesting Team (5)',
    targetType: 'Labour',
    providerName: 'Suresh Patil',
    rating: 4,
    date: '10 May 2024',
    comment:
      'The team was hardworking and finished the job on time. Communication could be slightly better regarding break times.',
    helpfulCount: 0,
  },
];

const receivedReviews = [
  {
    id: 1,
    reviewerName: 'Rahul Sharma',
    role: 'Provider',
    rating: 5,
    date: '16 May 2024',
    comment:
      'Great renter! Took good care of the equipment and returned it on time. Payment was prompt.',
  },
];

export default function RenterReviewsPage() {
   
  const [_activeTab, setActiveTab] = useState('given');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
        <p className="mt-1 text-gray-500">Manage your reviews and view feedback from providers.</p>
      </div>

      <Tabs defaultValue="given" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="given">Reviews Given</TabsTrigger>
          <TabsTrigger value="received">Reviews Received</TabsTrigger>
        </TabsList>

        <TabsContent value="given">
          {givenReviews.length > 0 ? (
            <div className="space-y-4">
              {givenReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {review.targetName}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            {review.targetType}
                          </span>
                          <span>•</span>
                          <span>Provided by {review.providerName}</span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {review.date}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="mb-4 leading-relaxed text-gray-700">{review.comment}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className="flex items-center gap-1 transition-colors hover:text-gray-900">
                        <ThumbsUp className="h-4 w-4" />
                        Helpful ({review.helpfulCount})
                      </button>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-gray-500 hover:text-green-600"
                      >
                        Edit Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">No reviews written yet</h3>
                <p className="mb-6 mt-2 max-w-sm text-center text-gray-500">
                  Share your experience with providers to help others in the community make better
                  choices.
                </p>
                <Button>Write a Review</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="received">
          {receivedReviews.length > 0 ? (
            <div className="space-y-4">
              {receivedReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar name={review.reviewerName} />
                      <div className="flex-1">
                        <div className="mb-1 flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.reviewerName}</h4>
                            <p className="text-xs text-gray-500">{review.role}</p>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="mb-2">
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">No reviews received yet</h3>
                <p className="mt-2 max-w-sm text-center text-gray-500">
                  Complete bookings with providers to receive feedback on your profile.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
