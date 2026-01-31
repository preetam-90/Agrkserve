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
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { FuturisticHeader } from '@/components/landing/FuturisticHeader';
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
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: '#0A0F0C' }}
    >
      {/* Ambient Background Effects - Fresh Green Tones */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse"
          style={{
            backgroundColor: 'rgba(20, 184, 166, 0.08)',
            animationDelay: '1s'
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
        />
      </div>

      <FuturisticHeader />

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
        <FinalCTASection />
      </motion.main>

      <PremiumFooter />
    </div>
  );
}
