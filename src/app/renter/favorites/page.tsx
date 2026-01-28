'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin, Tractor, Users } from 'lucide-react';
import Link from 'next/link';

// Mock data
const initialFavorites = [
  {
    id: 1,
    title: 'John Deere 5310',
    type: 'equipment',
    category: 'Tractor',
    price: '₹800/hr',
    rating: 4.8,
    reviews: 24,
    location: 'Pune, Maharashtra',
    image: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?w=800&q=80',
    provider: 'Rahul Sharma',
  },
  {
    id: 2,
    title: 'Harvesting Team A',
    type: 'labour',
    category: 'Harvesting',
    price: '₹500/day',
    rating: 4.5,
    reviews: 12,
    location: 'Nashik, Maharashtra',
    image: 'https://images.unsplash.com/photo-1595245899436-541530756784?w=800&q=80',
    provider: 'Suresh Patil',
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(initialFavorites);

  const removeFavorite = (id: number) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
          <p className="text-gray-500 max-w-sm mb-6">
            You haven't added any equipment or labour profiles to your favorites yet. Browse our listings to find what you need.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/equipment">Browse Equipment</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/renter/labour">Browse Labour</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
        <p className="text-gray-500 mt-1">
          {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((item) => (
          <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-200">
              {/* Image Placeholder - In real app use Next.js Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <button
                onClick={() => removeFavorite(item.id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
              >
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              </button>
              <Badge
                className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white"
              >
                {item.type === 'equipment' ? (
                  <><Tractor className="h-3 w-3 mr-1" /> Equipment</>
                ) : (
                  <><Users className="h-3 w-3 mr-1" /> Labour</>
                )}
              </Badge>
            </div>

            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{item.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-medium text-gray-900 mr-1">{item.rating}</span>
                  <span>({item.reviews})</span>
                </div>
                <div className="flex items-center truncate">
                  <MapPin className="h-4 w-4 mr-1 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 border-t pt-4">
                <span className="text-xs">Provided by</span>
                <span className="font-medium text-gray-900">{item.provider}</span>
              </div>
            </CardContent>

            <CardFooter className="p-4 bg-gray-50 flex gap-2">
              <Button className="w-full bg-green-600 hover:bg-green-700">Book Now</Button>
              <Button variant="outline" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
