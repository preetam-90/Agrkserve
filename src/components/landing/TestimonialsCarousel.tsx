'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer?: {
    name: string;
    profile_image?: string;
  };
  equipment?: {
    location_name?: string;
  };
  created_at: string;
}

export function TestimonialsCarousel() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const supabase = createClient();
        
        // Fetch top-rated reviews with user and equipment data
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer_id,
            equipment_id
          `)
          .gte('rating', 4)
          .not('comment', 'is', null)
          .order('rating', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (reviews && reviews.length > 0) {
          // Fetch reviewer profiles
          const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id))];
          const { data: reviewers } = await supabase
            .from('user_profiles')
            .select('id, name, profile_image')
            .in('id', reviewerIds);

          // Fetch equipment locations
          const equipmentIds = [...new Set(reviews.map(r => r.equipment_id).filter(Boolean))];
          const { data: equipment } = await supabase
            .from('equipment')
            .select('id, location_name')
            .in('id', equipmentIds);

          const reviewerMap = new Map(reviewers?.map(r => [r.id, r]) || []);
          const equipmentMap = new Map(equipment?.map(e => [e.id, e]) || []);

          const enrichedReviews = reviews.map(review => ({
            ...review,
            reviewer: reviewerMap.get(review.reviewer_id),
            equipment: equipmentMap.get(review.equipment_id),
          }));

          setTestimonials(enrichedReviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Fallback testimonials if no real reviews
  const fallbackTestimonials = [
    {
      id: '1',
      rating: 5,
      comment: 'AgriServe has transformed my farming operations. The equipment is top-quality and delivery is always on time.',
      reviewer: { name: 'Farmer', profile_image: null },
      equipment: { location_name: 'India' },
      created_at: new Date().toISOString(),
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  if (isLoading) {
    return (
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-950/50 to-slate-900" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-white/10 rounded-lg w-64 mx-auto mb-4" />
              <div className="h-6 bg-white/10 rounded-lg w-96 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background with Parallax Farm Image Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-950/50 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {testimonials.length > 0 ? 'Farmer Stories' : 'What Farmers Say'}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {testimonials.length > 0 
              ? `Hear from ${testimonials.length} satisfied farmers across India`
              : 'Join thousands of satisfied farmers across India'
            }
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
                {/* Quote Icon */}
                <div className="absolute top-8 right-8 opacity-10">
                  <Quote className="w-24 h-24 text-emerald-400" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(displayTestimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xl md:text-2xl text-gray-300 italic mb-8 leading-relaxed">
                  "{displayTestimonials[currentIndex].comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {displayTestimonials[currentIndex].reviewer?.profile_image ? (
                      <img
                        src={displayTestimonials[currentIndex].reviewer.profile_image}
                        alt={displayTestimonials[currentIndex].reviewer.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      displayTestimonials[currentIndex].reviewer?.name?.charAt(0).toUpperCase() || 'F'
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {displayTestimonials[currentIndex].reviewer?.name || 'Verified Farmer'}
                    </h4>
                    <p className="text-gray-400">
                      {displayTestimonials[currentIndex].equipment?.location_name || 'India'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          {displayTestimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={goToPrevious}
                className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {displayTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-gradient-to-r from-emerald-400 to-teal-400'
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
