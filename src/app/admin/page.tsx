import { createClient } from '@/lib/supabase/server';
import AdminDashboardClient from './page-client';

async function getAdminStats() {
  const supabase = await createClient();

  // Get total users
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  // Get total equipment
  const { count: totalEquipment } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true });

  // Get total bookings
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  // Get completed bookings
  const { count: completedBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  // Get total labour
  const { count: totalLabour } = await supabase
    .from('labour_profiles')
    .select('*', { count: 'exact', head: true });

  // Get total revenue
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed');

  const totalRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

  // Get active equipment
  const { count: activeEquipment } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true);

  // Get pending bookings
  const { count: pendingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return {
    totalUsers: totalUsers || 0,
    totalEquipment: totalEquipment || 0,
    totalBookings: totalBookings || 0,
    completedBookings: completedBookings || 0,
    totalLabour: totalLabour || 0,
    totalRevenue,
    activeEquipment: activeEquipment || 0,
    pendingBookings: pendingBookings || 0,
  };
}

async function getRecentBookings() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `
      *,
      equipment:equipment(name, images),
      renter:user_profiles!renter_id(name, email)
    `
    )
    .order('created_at', { ascending: false })
    .limit(5);

  return bookings || [];
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const recentBookings = await getRecentBookings();

  return <AdminDashboardClient stats={stats} recentBookings={recentBookings} />;
}
