import { createClient } from '@/lib/supabase/server';
import AdminDashboardClient from './page-client';

async function getAdminStats(timeRange: string = 'last_7_days') {
  const supabase = await createClient();

  // Calculate date range
  const now = new Date();
  let startDate = new Date();
  let previousStartDate = new Date();
  let previousEndDate = new Date();

  switch (timeRange) {
    case 'last_7_days':
      startDate.setDate(now.getDate() - 7);
      previousStartDate.setDate(now.getDate() - 14);
      previousEndDate.setDate(now.getDate() - 7);
      break;
    case 'last_30_days':
      startDate.setDate(now.getDate() - 30);
      previousStartDate.setDate(now.getDate() - 60);
      previousEndDate.setDate(now.getDate() - 30);
      break;
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1);
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
      previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
  }

  // Get total users (current period)
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString());

  // Get total users (previous period)
  const { count: previousUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', previousEndDate.toISOString());

  // Get total equipment (current period)
  const { count: totalEquipment } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString());

  // Get total equipment (previous period)
  const { count: previousEquipment } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', previousEndDate.toISOString());

  // Get total bookings (current period)
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString());

  // Get total bookings (previous period)
  const { count: previousBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', previousEndDate.toISOString());

  // Get total revenue (current period) - from both payments and bookings
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString());

  const paymentsRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

  // Also get revenue from completed bookings (in case payments table is not populated)
  const { data: completedBookings } = await supabase
    .from('bookings')
    .select('total_amount')
    .in('status', ['completed', 'confirmed', 'in_progress'])
    .gte('created_at', startDate.toISOString());

  const bookingsRevenue = completedBookings?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0;

  // Use whichever is greater (payments table takes precedence if it has data)
  const totalRevenue = paymentsRevenue > 0 ? paymentsRevenue : bookingsRevenue;

  // Get total revenue (previous period)
  const { data: previousPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', previousEndDate.toISOString());

  const previousPaymentsRevenue = previousPayments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

  const { data: previousCompletedBookings } = await supabase
    .from('bookings')
    .select('total_amount')
    .in('status', ['completed', 'confirmed', 'in_progress'])
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', previousEndDate.toISOString());

  const previousBookingsRevenue = previousCompletedBookings?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0;

  const previousRevenue = previousPaymentsRevenue > 0 ? previousPaymentsRevenue : previousBookingsRevenue;

  // Get pending bookings
  const { count: pendingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isUp: current > 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change * 10) / 10), isUp: change >= 0 };
  };

  return {
    totalUsers: totalUsers || 0,
    totalEquipment: totalEquipment || 0,
    totalBookings: totalBookings || 0,
    totalRevenue,
    pendingBookings: pendingBookings || 0,
    trends: {
      revenue: calculateTrend(totalRevenue, previousRevenue),
      users: calculateTrend(totalUsers || 0, previousUsers || 0),
      bookings: calculateTrend(totalBookings || 0, previousBookings || 0),
      equipment: calculateTrend(totalEquipment || 0, previousEquipment || 0),
    },
  };
}

async function getRecentBookings(timeRange: string = 'last_7_days') {
  const supabase = await createClient();

  // Calculate date range
  const now = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case 'last_7_days':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'last_30_days':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `
      *,
      equipment:equipment(name, images),
      renter:user_profiles!renter_id(name, email)
    `
    )
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  return bookings || [];
}

async function getRecentUsers(timeRange: string = 'last_7_days') {
  const supabase = await createClient();

  // Calculate date range
  const now = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case 'last_7_days':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'last_30_days':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, name, email, profile_image, roles, created_at, is_verified')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent users:', error);
    return [];
  }

  // Transform the data to match the expected interface
  return (users || []).map(user => ({
    id: user.id,
    name: user.name || 'Unknown User',
    email: user.email || '',
    avatar_url: user.profile_image || '',
    role: user.roles?.[0] || 'user',
    created_at: user.created_at,
    phone_verified: user.is_verified || false,
  }));
}

async function getActivityFeed(timeRange: string = 'last_7_days') {
  const supabase = await createClient();

  // Calculate date range
  const now = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case 'last_7_days':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'last_30_days':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  // Get recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(
      `
      id,
      created_at,
      status,
      renter:user_profiles!renter_id(name),
      equipment:equipment(name)
    `
    )
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(3);

  // Get recent users
  const { data: recentUsers } = await supabase
    .from('user_profiles')
    .select('id, name, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(2);

  // Combine and sort
  const activities = [
    ...(recentBookings?.map((b: any) => ({
      type: 'booking',
      message: `${b.renter?.name || 'User'} booked ${b.equipment?.name || 'equipment'}`,
      time: b.created_at,
      status: b.status,
    })) || []),
    ...(recentUsers?.map((u: any) => ({
      type: 'user',
      message: `${u.name} joined the platform`,
      time: u.created_at,
    })) || []),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return activities;
}

async function getSystemHealth() {
  const supabase = await createClient();

  try {
    // Get database stats
    const { data: dbStats, error: dbError } = await supabase
      .rpc('get_database_stats')
      .single();

    // Get connection count
    const { data: connections, error: connError } = await supabase
      .rpc('get_connection_count')
      .single();

    // Get storage usage from storage.objects
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('equipment-images')
      .list();

    // Calculate storage size (approximate from bucket metadata)
    let totalStorageBytes = 0;
    if (storageData && !storageError) {
      // Get size from all buckets
      const buckets = ['equipment-images', 'equipment-videos', 'chat-media', 'profile-pictures'];
      
      for (const bucket of buckets) {
        const { data: files } = await supabase.storage.from(bucket).list();
        if (files) {
          totalStorageBytes += files.reduce((sum: number, file: any) => {
            return sum + (file.metadata?.size || 0);
          }, 0);
        }
      }
    }

    // Convert to GB and calculate percentage (assuming 10GB limit)
    const storageGB = totalStorageBytes / (1024 * 1024 * 1024);
    const storageLimit = 10; // GB
    const storagePercentage = Math.min((storageGB / storageLimit) * 100, 100);

    // Database load (based on connection count)
    const maxConnections = 100;
    const dbLoadPercentage = Math.min(((connections || 0) / maxConnections) * 100, 100);

    return {
      dbLoad: Math.round(dbLoadPercentage),
      dbStatus: dbLoadPercentage < 50 ? 'Healthy' : dbLoadPercentage < 80 ? 'Moderate' : 'High',
      storageUsage: Math.round(storagePercentage),
      storageGB: storageGB.toFixed(2),
    };
  } catch (error) {
    console.error('System health check failed:', error);
    // Return safe defaults if queries fail
    return {
      dbLoad: 0,
      dbStatus: 'Unknown',
      storageUsage: 0,
      storageGB: '0',
    };
  }
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { timeRange?: string };
}) {
  const timeRange = searchParams.timeRange || 'last_7_days';
  
  const [stats, recentBookings, systemHealth, recentUsers, activityFeed] = await Promise.all([
    getAdminStats(timeRange),
    getRecentBookings(timeRange),
    getSystemHealth(),
    getRecentUsers(timeRange),
    getActivityFeed(timeRange),
  ]);

  return (
    <AdminDashboardClient
      stats={stats}
      recentBookings={recentBookings}
      systemHealth={systemHealth}
      timeRange={timeRange}
      recentUsers={recentUsers}
      activityFeed={activityFeed}
    />
  );
}
