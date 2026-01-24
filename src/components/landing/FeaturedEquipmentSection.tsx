'use client';

import { EquipmentCard } from './EquipmentCard';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  images: string[];
  price_per_day: number;
  location_name: string;
  is_available: boolean;
  rating?: number;
  category: string;
}

interface FeaturedEquipmentSectionProps {
  equipment: Equipment[];
  isLoading: boolean;
}

export function FeaturedEquipmentSection({ equipment, isLoading }: FeaturedEquipmentSectionProps) {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Equipment
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover top-rated agricultural equipment available for rent
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : equipment.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-8">No equipment listed yet</p>
            <Link href="/provider/equipment">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                List Your Equipment
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {equipment.map((item, index) => (
                <EquipmentCard key={item.id} equipment={item} index={index} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/equipment">
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 border-green-600 text-green-700 hover:bg-green-50 px-8 py-6 text-lg rounded-xl"
                >
                  Browse All Equipment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
