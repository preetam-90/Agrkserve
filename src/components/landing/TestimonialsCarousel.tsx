'use client';

/* eslint-disable */

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
  created_at: string;
}

function TestimonialsCarousel() {
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
          .select(
            `
            id,
            rating,
            comment,
            created_at,
            reviewer_id
          `
          )
          .gte('rating', 4)
          .not('comment', 'is', null)
          .order('rating', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (reviews && reviews.length > 0) {
          // Fetch reviewer profiles
          const reviewerIds = [...new Set(reviews.map((r) => r.reviewer_id))];
          const { data: reviewers } = await supabase
            .from('user_profiles')
            .select('id, name, profile_image')
            .in('id', reviewerIds);

          const reviewerMap = new Map(reviewers?.map((r) => [r.id, r]) || []);

          const enrichedReviews = reviews.map((review) => ({
            ...review,
            reviewer: reviewerMap.get(review.reviewer_id),
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
      comment:
        'AgriServe has transformed my farming operations. The equipment is top-quality and delivery is always on time.',
      reviewer: { name: 'Farmer', profile_image: null },
      created_at: new Date().toISOString(),
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  if (isLoading) {
    return (
      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-950/50 to-slate-900" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="mx-auto mb-4 h-12 w-64 rounded-lg bg-white/10" />
              <div className="mx-auto h-6 w-96 rounded-lg bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative overflow-hidden py-32">
      {/* Background with Parallax Farm Image Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-950/50 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h2 className="mb-6 text-5xl font-bold text-white md:text-6xl">
            {testimonials.length > 0 ? 'Farmer Stories' : 'What Farmers Say'}
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            {testimonials.length > 0
              ? `Hear from ${testimonials.length} satisfied farmers`
              : 'Join thousands of satisfied farmers'}
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
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
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-12">
                {/* Quote Icon */}
                <div className="absolute right-8 top-8 opacity-10">
                  <Quote className="h-24 w-24 text-emerald-400" />
                </div>

                {/* Stars */}
                <div className="mb-6 flex gap-1">
                  {[...Array(displayTestimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="mb-8 text-xl italic leading-relaxed text-gray-300 md:text-2xl">
                  "{displayTestimonials[currentIndex].comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 text-xl font-bold text-white shadow-lg">
                    {displayTestimonials[currentIndex].reviewer?.profile_image ? (
                      <img
                        src={displayTestimonials[currentIndex].reviewer.profile_image}
                        alt={displayTestimonials[currentIndex].reviewer.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      displayTestimonials[currentIndex].reviewer?.name?.charAt(0).toUpperCase() ||
                      'F'
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {displayTestimonials[currentIndex].reviewer?.name || 'Verified Farmer'}
                    </h4>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          {displayTestimonials.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={goToPrevious}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:scale-110 hover:border-emerald-500/50 hover:bg-white/10"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {displayTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
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
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:scale-110 hover:border-emerald-500/50 hover:bg-white/10"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
