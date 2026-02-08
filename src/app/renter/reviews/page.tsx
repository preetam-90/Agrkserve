'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';

// Mock data
const givenReviews = [
  {
    id: 1,
    targetName: 'John Deere 5310',
    targetType: 'Equipment',
    providerName: 'Rahul Sharma',
    rating: 5,
    date: '15 May 2024',
    comment: 'Excellent condition tractor. Very powerful and fuel efficient. Rahul was very helpful with the setup.',
    helpfulCount: 2,
  },
  {
    id: 2,
    targetName: 'Harvesting Team (5)',
    targetType: 'Labour',
    providerName: 'Suresh Patil',
    rating: 4,
    date: '10 May 2024',
    comment: 'The team was hardworking and finished the job on time. Communication could be slightly better regarding break times.',
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
    comment: 'Great renter! Took good care of the equipment and returned it on time. Payment was prompt.',
  },
];

export default function RenterReviewsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_activeTab, setActiveTab] = useState('given');

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
        <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-gray-500 mt-1">
          Manage your reviews and view feedback from providers.
        </p>
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
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {review.targetName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                            {review.targetType}
                          </span>
                          <span>•</span>
                          <span>Provided by {review.providerName}</span>
                        </CardDescription>
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
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        Helpful ({review.helpfulCount})
                      </button>
                      <Button variant="link" className="h-auto p-0 text-gray-500 hover:text-green-600">
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
                <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No reviews written yet</h3>
                <p className="text-gray-500 text-center max-w-sm mt-2 mb-6">
                  Share your experience with providers to help others in the community make better choices.
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
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.reviewerName}</h4>
                            <p className="text-xs text-gray-500">{review.role}</p>
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
                <h3 className="text-lg font-medium text-gray-900">No reviews received yet</h3>
                <p className="text-gray-500 text-center max-w-sm mt-2">
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
