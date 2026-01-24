'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Tractor } from 'lucide-react';

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-br from-green-900 via-green-800 to-green-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
            <Tractor className="w-16 h-16 text-lime-400" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Farming is hard.
            <br />
            <span className="text-lime-400">Renting equipment shouldn't be.</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-green-100 max-w-2xl mx-auto">
            Join thousands of farmers who are saving money and growing smarter with AgriServe
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/equipment">
              <Button
                size="lg"
                className="group bg-lime-500 hover:bg-lime-600 text-green-900 px-10 py-7 text-xl rounded-xl shadow-2xl hover:shadow-lime-500/50 transition-all font-bold min-h-[44px] min-w-[44px]"
              >
                Start Renting Now
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/provider/equipment">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-10 py-7 text-xl rounded-xl backdrop-blur-sm min-h-[44px] min-w-[44px]"
              >
                List Your Equipment
              </Button>
            </Link>
          </div>
          
          <p className="text-green-200 text-sm">
            No credit card required • Free to browse • Instant booking
          </p>
        </motion.div>
      </div>
    </section>
  );
}
