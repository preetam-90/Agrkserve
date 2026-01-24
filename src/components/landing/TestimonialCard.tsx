'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
  rating: number;
  delay: number;
}

export function TestimonialCard({ quote, author, location, rating, delay }: TestimonialCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-green-100 shadow-lg hover:shadow-xl transition-shadow"
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 text-green-200" />
      
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      
      <p className="text-gray-700 mb-6 italic leading-relaxed">"{quote}"</p>
      
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-500">{location}</p>
        </div>
      </div>
    </motion.div>
  );
}
