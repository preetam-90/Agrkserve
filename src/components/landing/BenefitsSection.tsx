'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Shield, Clock, CreditCard, Smartphone, Headphones } from 'lucide-react';

const benefits = [
  {
    icon: MapPin,
    title: 'Location-Based Search',
    description: 'Find equipment near you with our smart location-based search',
  },
  {
    icon: Shield,
    title: 'Verified Providers',
    description: 'All equipment owners are verified for your safety and trust',
  },
  {
    icon: Clock,
    title: 'Flexible Rentals',
    description: 'Rent by the hour, day, or week - whatever suits your needs',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Safe and secure payment processing with multiple options',
  },
  {
    icon: Smartphone,
    title: 'Easy Booking',
    description: 'Book equipment in minutes with our simple mobile-friendly platform',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support to help you anytime',
  },
];

export function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <section ref={ref} className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose AgriServe
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for hassle-free equipment rental
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group p-8 rounded-2xl bg-gradient-to-br from-white to-green-50 border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
