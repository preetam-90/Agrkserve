'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EquipmentCardProps {
  equipment: {
    id: string;
    name: string;
    images: string[];
    price_per_day: number;
    location_name: string;
    is_available: boolean;
    rating?: number;
    category: string;
  };
  index: number;
}

export function EquipmentCard({ equipment, index }: EquipmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Link href={`/equipment/${equipment.id}`} className="block">
        <motion.div
          className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 min-h-[44px] min-w-[44px]"
          whileHover={{
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 0 20px rgb(34 197 94 / 0.3)',
          }}
        >
          {/* Image Container */}
          <div className="relative h-56 overflow-hidden bg-gray-100">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <Image
                src={equipment.images[0] || '/placeholder-equipment.jpg'}
                alt={equipment.name}
                fill
                className="object-cover"
                loading={index < 3 ? 'eager' : 'lazy'}
                priority={index < 3}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
            
            {/* Availability Badge */}
            <div className="absolute top-4 right-4">
              <Badge
                variant={equipment.is_available ? 'default' : 'secondary'}
                className={`${
                  equipment.is_available
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-500 hover:bg-gray-600'
                } text-white`}
              >
                {equipment.is_available ? 'Available' : 'Booked'}
              </Badge>
            </div>
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                {equipment.category}
              </Badge>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5 space-y-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
              {equipment.name}
            </h3>
            
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{equipment.location_name}</span>
            </div>
            
            {equipment.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">{equipment.rating.toFixed(1)}</span>
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-600">
                  ₹{equipment.price_per_day.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">/day</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
