import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { FeaturedEquipmentSection } from '@/components/landing/FeaturedEquipmentSection';
import { TimelineSection } from '@/components/landing/TimelineSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { FuturisticHeader } from '@/components/landing/FuturisticHeader';
import { PremiumFooter } from '@/components/landing/PremiumFooter';

async function getHomeData() {
  try {
    const supabase = await createClient();

    const [
      { data: equipment },
      { count: equipmentCount },
      { count: usersCount },
      { count: labourCount },
      { count: bookingsCount },
    ] = await Promise.all([
      supabase
        .from('equipment')
        .select('id, name, images, price_per_day, location_name, is_available, rating, category')
        .eq('is_available', true)
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(12),
      supabase.from('equipment').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('labour_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
    ]);

    return {
      equipment: equipment ?? [],
      stats: {
        totalEquipment: equipmentCount ?? 0,
        totalUsers: usersCount ?? 0,
        totalLabour: labourCount ?? 0,
        totalBookings: bookingsCount ?? 0,
      },
    };
  } catch {
    return {
      equipment: [],
      stats: { totalEquipment: 0, totalUsers: 0, totalLabour: 0, totalBookings: 0 },
    };
  }
}

export default async function HomePage() {
  const { equipment, stats } = await getHomeData();

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: '#0A0F0C' }}
    >
      {/* Ambient Background Effects - Fresh Green Tones */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 top-0 h-[500px] w-[500px] animate-pulse rounded-full blur-[120px]"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-[400px] w-[400px] animate-pulse rounded-full blur-[100px]"
          style={{
            backgroundColor: 'rgba(20, 184, 166, 0.08)',
            animationDelay: '1s',
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
        />
      </div>

      <FuturisticHeader />

      <main>
        <HeroSection />
        <StatsSection stats={stats} />
        <CategoriesSection />
        <FeaturedEquipmentSection equipment={equipment} isLoading={false} />
        <TimelineSection />
        <FinalCTASection />
      </main>

      <PremiumFooter />
    </div>
  );
}
