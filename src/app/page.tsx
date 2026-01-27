'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { equipmentService, labourService } from '@/lib/services';
import { createClient } from '@/lib/supabase/client';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { FeaturedEquipmentSection } from '@/components/landing/FeaturedEquipmentSection';
import { TimelineSection } from '@/components/landing/TimelineSection';
import { TestimonialsCarousel } from '@/components/landing/TestimonialsCarousel';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { PremiumHeader } from '@/components/landing/PremiumHeader';
import { PremiumFooter } from '@/components/landing/PremiumFooter';

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

interface Stats {
  totalEquipment: number;
  totalUsers: number;
  totalLabour: number;
  totalBookings: number;
}

export default function HomePage() {
  const [featuredEquipment, setFeaturedEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalEquipment: 0,
    totalUsers: 0,
    totalLabour: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();

        // Fetch featured equipment (available, sorted by rating and bookings)
        const equipmentResult = await equipmentService.getEquipment({
          limit: 12,
          minRating: 0,
        });
        setFeaturedEquipment(equipmentResult.data);

        // Fetch real stats from database
        const [
          { count: equipmentCount },
          { count: usersCount },
          { count: labourCount },
          { count: bookingsCount },
        ] = await Promise.all([
          supabase.from('equipment').select('*', { count: 'exact', head: true }),
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('labour_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('bookings').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          totalEquipment: equipmentCount || 0,
          totalUsers: usersCount || 0,
          totalLabour: labourCount || 0,
          totalBookings: bookingsCount || 0,
        });
      } catch (error) {
        console.error('Failed to fetch landing page data:', error);
        // Set fallback stats if fetch fails
        setStats({
          totalEquipment: 0,
          totalUsers: 0,
          totalLabour: 0,
          totalBookings: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative bg-black min-h-screen">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <PremiumHeader />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        <HeroSection />
        <StatsSection stats={stats} />
        <CategoriesSection />
        <FeaturedEquipmentSection equipment={featuredEquipment} isLoading={isLoading} />
        <TimelineSection />
        <TestimonialsCarousel />
        <FinalCTASection />
      </motion.main>

      <PremiumFooter />
    </div>
  );
}
