'use client';

import { ProcessStep } from './ProcessStep';
import { Search, CreditCard, CheckCircle } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the equipment you need in three simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <ProcessStep
            step={1}
            icon={Search}
            title="Search & Discover"
            description="Browse available equipment near you. Filter by type, price, and location."
            delay={0}
          />
          
          <ProcessStep
            step={2}
            icon={CreditCard}
            title="Book & Pay"
            description="Select your dates, make secure payment, and confirm your booking instantly."
            delay={0.2}
          />
          
          <ProcessStep
            step={3}
            icon={CheckCircle}
            title="Use & Return"
            description="Equipment delivered to your farm. Use it and return when done."
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}
