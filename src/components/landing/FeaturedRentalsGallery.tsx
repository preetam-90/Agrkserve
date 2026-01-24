'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Equipment {
  id: string;
  name: string;
  images: string[] | null;
  price_per_day: number;
  location_name: string | null;
  is_available: boolean;
  rating?: number | null;
  category: string | null;
}

interface FeaturedRentalsGalleryProps {
  equipment: Equipment[];
  isLoading: boolean;
}

export function FeaturedRentalsGallery({ equipment, isLoading }: FeaturedRentalsGalleryProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-900" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Featured Rentals
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Premium equipment ready for immediate booking
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-pulse">
                <div className="aspect-video bg-white/10 rounded-2xl mb-4" />
                <div className="h-6 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {equipment.slice(0, 6).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/renter/equipment/${item.id}`}>
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-emerald-500/30">
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                      
                      {/* Availability Badge */}
                      {item.is_available && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                          Available
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{item.location_name || 'Location'}</span>
                        </div>
                        {item.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{item.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            ₹{item.price_per_day}
                          </span>
                          <span className="text-gray-400 text-sm ml-1">/day</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full group-hover:scale-110 transition-transform"
                        >
                          Rent Now
                        </Button>
                      </div>
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500 pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link href="/equipment">
            <Button
              size="lg"
              className="group bg-white/5 hover:bg-white/10 border border-white/20 hover:border-emerald-500/50 text-white px-8 py-6 rounded-2xl backdrop-blur-xl transition-all hover:scale-105"
            >
              View All Equipment
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
