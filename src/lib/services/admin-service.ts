import { createClient } from '@/lib/supabase/client';
import type {
  UserProfile,
  Booking,
  Equipment,
  Dispute,
  DisputeStatus,
  PlatformAnalytics,
  PaginatedResponse,
} from '@/lib/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/utils/constants';

const supabase = createClient();

function safeParseRpcJson<T>(data: unknown, fallback: T): T {
  if (typeof data !== 'string') {
    return (data as T) ?? fallback;
  }

  try {
    return (JSON.parse(data) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export const adminService = {
  // Get platform analytics
  async getAnalytics(): Promise<PlatformAnalytics> {
    const { data, error } = await supabase.rpc('get_platform_analytics');

    if (error) {
      console.error('RPC Error (get_platform_analytics):', error);
      throw error;
    }

    return safeParseRpcJson(data, {
      total_users: 0,
      total_farmers: 0,
      total_providers: 0,
      total_equipment: 0,
      total_bookings: 0,
      completed_bookings: 0,
      total_revenue: 0,
      total_labour: 0,
      active_disputes: 0,
      date: new Date().toISOString(),
    });
  },

  // Get all users with pagination
  async getUsers(
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE,
    search?: string
  ): Promise<PaginatedResponse<UserProfile>> {
    const offset = (page - 1) * limit;

    let query = supabase.from('user_profiles').select('*', { count: 'exact' });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Get user details with roles
  async getUserDetails(userId: string): Promise<{
    profile: UserProfile;
    roles: string[];
    bookings_count: number;
    equipment_count: number;
  } | null> {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!profile) return null;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('is_active', true);

    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .or(`renter_id.eq.${userId},owner_id.eq.${userId}`);

    const { count: equipmentCount } = await supabase
      .from('equipment')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    return {
      profile,
      roles: roles?.map((r) => r.role) || [],
      bookings_count: bookingsCount || 0,
      equipment_count: equipmentCount || 0,
    };
  },

  // Suspend user
  async suspendUser(userId: string, reason: string): Promise<void> {
    // Deactivate all roles
    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) throw error;

    // Create admin notification
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Account Suspended',
      body: `Your account has been suspended. Reason: ${reason}`,
      type: 'admin',
      data: { action: 'suspend', reason },
    });
  },

  // Activate user
  async activateUser(userId: string, roles: string[]): Promise<void> {
    for (const role of roles) {
      await supabase.from('user_roles').upsert({
        user_id: userId,
        role,
        is_active: true,
      });
    }

    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Account Activated',
      body: 'Your account has been activated.',
      type: 'admin',
      data: { action: 'activate' },
    });
  },

  // Get all bookings for admin
  async getBookings(
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE,
    status?: string
  ): Promise<PaginatedResponse<Booking>> {
    const offset = (page - 1) * limit;

    let query = supabase.from('bookings').select(
      `
        *,
        equipment:equipment(id, title, images),
        renter:user_profiles!renter_id(id, full_name, phone),
        owner:user_profiles!owner_id(id, full_name, phone)
      `,
      { count: 'exact' }
    );

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Get all equipment for admin
  async getEquipment(
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE,
    status?: string
  ): Promise<PaginatedResponse<Equipment>> {
    const offset = (page - 1) * limit;

    let query = supabase.from('equipment').select(
      `
        *,
        owner:user_profiles!owner_id(id, full_name, phone)
      `,
      { count: 'exact' }
    );

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Get disputes
  async getDisputes(
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE,
    status?: DisputeStatus
  ): Promise<PaginatedResponse<Dispute>> {
    const offset = (page - 1) * limit;

    let query = supabase.from('disputes').select(
      `
        *,
        booking:bookings(id, equipment_id, status),
        raised_by_user:user_profiles!raised_by(id, full_name, phone),
        against_user_profile:user_profiles!against_user(id, full_name, phone)
      `,
      { count: 'exact' }
    );

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Resolve dispute
  async resolveDispute(
    disputeId: string,
    resolution: string,
    resolvedBy: string
  ): Promise<Dispute> {
    const { data, error } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', disputeId)
      .select()
      .single();

    if (error) throw error;

    // Notify both parties
    const dispute = data as Dispute;
    await supabase.from('notifications').insert([
      {
        user_id: dispute.raised_by,
        title: 'Dispute Resolved',
        body: `Your dispute has been resolved. Resolution: ${resolution}`,
        type: 'admin',
        data: { dispute_id: disputeId },
      },
      {
        user_id: dispute.against_user,
        title: 'Dispute Resolved',
        body: `A dispute against you has been resolved. Resolution: ${resolution}`,
        type: 'admin',
        data: { dispute_id: disputeId },
      },
    ]);

    return dispute;
  },

  // Get revenue statistics
  async getRevenueStats(period: 'week' | 'month' | 'year'): Promise<{
    labels: string[];
    values: number[];
    total: number;
  }> {
    const { data, error } = await supabase.rpc('get_revenue_stats', {
      p_period: period,
    });

    if (error) {
      console.error('RPC Error (get_revenue_stats):', error);
      throw error;
    }

    return safeParseRpcJson(data, { labels: [], values: [], total: 0 });
  },

  // Send announcement to all users
  async sendAnnouncement(title: string, body: string): Promise<void> {
    const { data: users } = await supabase.from('user_profiles').select('id');

    if (!users) return;

    const notifications = users.map((user) => ({
      user_id: user.id,
      title,
      body,
      type: 'system' as const,
      data: { is_announcement: true },
    }));

    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) throw error;
  },

  // Get system health metrics
  async getSystemHealth(): Promise<{
    status: 'operational' | 'degraded' | 'error';
    timestamp: string;
    metrics: {
      apiResponseTime: number;
      dbResponseTime: number;
      serverLoad: number;
      dbLoad: number;
      uptime: number;
    };
    checks: {
      database: boolean;
      api: boolean;
    };
  }> {
    try {
      const response = await fetch('/api/admin/health', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      // Return degraded status on error
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        metrics: {
          apiResponseTime: 0,
          dbResponseTime: 0,
          serverLoad: 0,
          dbLoad: 0,
          uptime: 0,
        },
        checks: {
          database: false,
          api: false,
        },
      };
    }
  },
};
