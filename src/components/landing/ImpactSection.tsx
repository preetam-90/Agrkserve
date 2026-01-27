'use client';

import { AnimatedCounter } from './AnimatedCounter';
import { TestimonialCard } from './TestimonialCard';
import { Shield, Lock } from 'lucide-react';

interface ImpactSectionProps {
  stats: {
    totalUsers: number;
    totalEquipment: number;
    categories: number;
  };
}

const testimonials = [
  {
    quote: "AgriServe made it so easy to rent a harvester for my wheat crop. Saved me lakhs compared to buying one!",
    author: "Rajesh Kumar",
    location: "Punjab",
    rating: 5,
  },
  {
    quote: "As an equipment owner, listing on AgriServe has given me steady income from my idle tractor. Highly recommend!",
    author: "Priya Sharma",
    location: "Haryana",
    rating: 5,
  },
];

export function ImpactSection({ stats }: ImpactSectionProps) {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Farmers Across India
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of farmers who are growing smarter with AgriServe
          </p>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <AnimatedCounter end={stats.totalUsers} suffix="+" label="Farmers" />
            <p className="text-lg text-gray-600 mt-2">Active Farmers</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <AnimatedCounter end={stats.totalEquipment} suffix="+" label="Equipment" />
            <p className="text-lg text-gray-600 mt-2">Equipment Listed</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <AnimatedCounter end={stats.categories} label="Categories" />
            <p className="text-lg text-gray-600 mt-2">Categories Available</p>
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              {...testimonial}
              delay={index * 0.2}
            />
          ))}
        </div>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-md border border-green-100">
            <Shield className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-gray-700">Verified Platform</span>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow-md border border-green-100">
            <Lock className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-gray-700">Secure Payments</span>
          </div>
        </div>
      </div>
    </section>
  );
}
