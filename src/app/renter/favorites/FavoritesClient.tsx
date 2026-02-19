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
    setFavorites(favorites.filter((item) => item.id !== id));
  };

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">No Favorites Yet</h2>
          <p className="mb-6 max-w-sm text-gray-500">
            You haven&apos;t added any equipment or labour profiles to your favorites yet. Browse
            our listings to find what you need.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/equipment">Browse Equipment</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/labour">Browse Labour</Link>
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
        <p className="mt-1 text-gray-500">
          {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((item) => (
          <Card key={item.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative h-48 bg-gray-200">
              {/* Image Placeholder - In real app use Next.js Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <button
                onClick={() => removeFavorite(item.id)}
                className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm transition-colors hover:bg-gray-100"
              >
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              </button>
              <Badge className="absolute left-3 top-3 bg-white/90 text-gray-900 hover:bg-white">
                {item.type === 'equipment' ? (
                  <>
                    <Tractor className="mr-1 h-3 w-3" /> Equipment
                  </>
                ) : (
                  <>
                    <Users className="mr-1 h-3 w-3" /> Labour
                  </>
                )}
              </Badge>
            </div>

            <CardContent className="p-5">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{item.price}</p>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="mr-1 font-medium text-gray-900">{item.rating}</span>
                  <span>({item.reviews})</span>
                </div>
                <div className="flex items-center truncate">
                  <MapPin className="mr-1 h-4 w-4 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t pt-4 text-sm text-gray-500">
                <span className="text-xs">Provided by</span>
                <span className="font-medium text-gray-900">{item.provider}</span>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 bg-gray-50 p-4">
              <Button className="w-full bg-green-600 hover:bg-green-700">Book Now</Button>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
