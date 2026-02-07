'use server';

import { createClient } from '@/lib/supabase/server';

export type DashboardRole = 'admin' | 'provider' | 'labour' | 'renter';

export interface DashboardUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface DashboardProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServerDashboardData {
  user: DashboardUser | null;
  profile: DashboardProfile | null;
  roles: string[];
  activeRole: DashboardRole;
  // Shared data keys (match what dashboard components expect)
  equipment?: any[];
  bookings?: any[];
  labourBookings?: any[];
  // Labour-specific
  labourProfile?: any;
}

export async function getDashboardData(): Promise<ServerDashboardData | null> {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return null;
  }

  // 2. Fetch profile + roles in parallel
  const [profileResult, rolesResult] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).eq('is_active', true),
  ]);

  const profile = profileResult.data;
  const roles = rolesResult.data?.map((r: any) => r.role) || ['renter'];

  // Determine active role (priority: admin > provider > labour > renter)
  let activeRole: DashboardRole = 'renter';
  if (roles.includes('admin')) activeRole = 'admin';
  else if (roles.includes('provider')) activeRole = 'provider';
  else if (roles.includes('labour')) activeRole = 'labour';

  const dashboardUser: DashboardUser = {
    id: user.id,
    email: user.email || '',
    fullName: profile?.full_name || user.user_metadata?.full_name || 'User',
    avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url,
  };

  // 3. Fetch role-specific data in parallel
  const baseData: ServerDashboardData = {
    user: dashboardUser,
    profile,
    roles,
    activeRole,
  };

  if (activeRole === 'renter') {
    const [equipmentRes, bookingsRes, labourBookingsRes] = await Promise.all([
      supabase
        .from('equipment')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('bookings')
        .select('*, equipment:equipment(id, name, images, category, price_per_day)')
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('labour_bookings')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);
    baseData.equipment = equipmentRes.data || [];
    baseData.bookings = bookingsRes.data || [];
    baseData.labourBookings = labourBookingsRes.data || [];
  }

  if (activeRole === 'provider') {
    const [myEquipmentRes, bookingsRes, labourBookingsRes] = await Promise.all([
      supabase
        .from('equipment')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('bookings')
        .select('*, equipment:equipment!inner(id, name, images, category, price_per_day, owner_id)')
        .eq('equipment.owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('labour_bookings')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);
    baseData.equipment = myEquipmentRes.data || [];
    baseData.bookings = bookingsRes.data || [];
    baseData.labourBookings = labourBookingsRes.data || [];
  }

  if (activeRole === 'labour') {
    // Get labour profile first
    const labourProfileRes = await supabase
      .from('labour_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const labourProfile = labourProfileRes.data;
    baseData.labourProfile = labourProfile;

    if (labourProfile) {
      const bookingsRes = await supabase
        .from('labour_bookings')
        .select('*')
        .eq('labour_id', labourProfile.id)
        .order('created_at', { ascending: false });
      baseData.labourBookings = bookingsRes.data || [];
    } else {
      baseData.labourBookings = [];
    }
  }

  return baseData;
}
