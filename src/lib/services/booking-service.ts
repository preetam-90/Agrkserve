import { createClient } from '@/lib/supabase/client';
import type { 
  Booking, 
  BookingStatus, 
  PaginatedResponse 
} from '@/lib/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/utils/constants';
import { calculateDaysBetween } from '@/lib/utils';
import { notificationService } from './notification-service';
import { auditLogService } from './audit-log-service';

const supabase = createClient();

export const bookingService = {
  // Get booking by ID
  async getById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment(*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // Fetch renter profile separately
    if (data && data.renter_id) {
      const { data: renter } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.renter_id)
        .single();
      return { ...data, renter };
    }
    
    return data;
  },

  // Get bookings for renter
  async getRenterBookings(
    renterId: string,
    status?: BookingStatus | BookingStatus[],
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Booking>> {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment(id, name, images, category, price_per_day)
      `, { count: 'exact' })
      .eq('renter_id', renterId);

    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
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

  // Get bookings for owner (provider)
  async getOwnerBookings(
    ownerId: string,
    status?: BookingStatus | BookingStatus[],
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Booking>> {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment!inner(id, name, images, category, price_per_day, owner_id)
      `, { count: 'exact' })
      .eq('equipment.owner_id', ownerId);

    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Fetch renter profiles separately
    const bookings = data || [];
    if (bookings.length > 0) {
      const renterIds = [...new Set(bookings.map(b => b.renter_id).filter(Boolean))];
      const { data: renters } = await supabase
        .from('user_profiles')
        .select('id, name, profile_image, phone')
        .in('id', renterIds);
      
      const renterMap = new Map((renters || []).map(r => [r.id, r]));
      bookings.forEach(booking => {
        booking.renter = renterMap.get(booking.renter_id);
      });
    }

    return {
      data: bookings,
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Get bookings for a specific equipment
  async getEquipmentBookings(
    equipmentId: string,
    status?: BookingStatus | BookingStatus[]
  ): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('equipment_id', equipmentId);

    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query.order('start_date', { ascending: true });

    if (error) throw error;
    
    // Fetch renter profiles separately
    const bookings = data || [];
    if (bookings.length > 0) {
      const renterIds = [...new Set(bookings.map(b => b.renter_id).filter(Boolean))];
      const { data: renters } = await supabase
        .from('user_profiles')
        .select('id, name, profile_image')
        .in('id', renterIds);
      
      const renterMap = new Map((renters || []).map(r => [r.id, r]));
      bookings.forEach(booking => {
        booking.renter = renterMap.get(booking.renter_id);
      });
    }
    
    return bookings;
  },

  // Create a new booking
  async create(booking: {
    equipment_id: string;
    renter_id: string;
    start_date: string;
    end_date: string;
    price_per_day: number;
    notes?: string;
  }): Promise<Booking> {
    const totalDays = calculateDaysBetween(booking.start_date, booking.end_date);
    const totalAmount = booking.price_per_day * totalDays;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        equipment_id: booking.equipment_id,
        renter_id: booking.renter_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_days: totalDays,
        price_per_day: booking.price_per_day,
        total_amount: totalAmount,
        status: 'pending',
        notes: booking.notes || null,
      })
      .select(`
        *,
        equipment:equipment(*)
      `)
      .single();

    if (error) throw error;
    
    // Fetch renter profile separately
    if (data && data.renter_id) {
      const { data: renter } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.renter_id)
        .single();
      return { ...data, renter };
    }
    
    return data;
  },

  // Update booking status
  async updateStatus(
    id: string,
    status: BookingStatus,
    notes?: string,
    cancelledBy?: string,
    cancellationReason?: string
  ): Promise<Booking> {
    const normalizedStatus = status === 'approved' ? 'confirmed'
      : status === 'rejected' ? 'cancelled'
      : status;

    const updates: Record<string, unknown> = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };

    if (notes) updates.notes = notes;
    if (normalizedStatus === 'cancelled' && cancellationReason) {
      updates.cancellation_reason = cancellationReason;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        equipment:equipment(*)
      `)
      .single();

    if (error) throw error;
    
    // Fetch renter profile separately
    if (data && data.renter_id) {
      const { data: renter } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.renter_id)
        .single();
      return { ...data, renter };
    }
    
    return data;
  },

  // Approve booking
  async approve(id: string, notes?: string): Promise<Booking> {
    return this.updateStatus(id, 'approved', notes);
  },

  // Reject booking
  async reject(id: string, reason?: string): Promise<Booking> {
    return this.updateStatus(id, 'rejected', reason);
  },

  // Start booking (in progress)
  async start(id: string): Promise<Booking> {
    return this.updateStatus(id, 'in_progress');
  },

  // Complete booking
  async complete(id: string): Promise<Booking> {
    return this.updateStatus(id, 'completed');
  },

  // Cancel booking
  async cancel(id: string, cancelledBy: string, reason?: string): Promise<Booking> {
    return this.updateStatus(id, 'cancelled', undefined, cancelledBy, reason);
  },

  // Get upcoming bookings for dashboard
  async getUpcoming(
    userId: string,
    role: 'renter' | 'owner',
    limit: number = 5
  ): Promise<Booking[]> {
    const today = new Date().toISOString().split('T')[0];
    const column = role === 'renter' ? 'renter_id' : 'equipment.owner_id';

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment!inner(id, name, images, category, owner_id)
      `)
      .eq(column, userId)
      .in('status', ['confirmed', 'in_progress'])
      .gte('end_date', today)
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    
    // Fetch user profiles separately
    const bookings = data || [];
    if (bookings.length > 0) {
      const userIds = [...new Set([
        ...bookings.map(b => b.renter_id),
        ...bookings.map(b => b.equipment?.owner_id)
      ].filter(Boolean))];
      
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, name, profile_image')
        .in('id', userIds);
      
      const userMap = new Map((users || []).map(u => [u.id, u]));
      bookings.forEach(booking => {
        booking.renter = userMap.get(booking.renter_id);
        if (booking.equipment) {
          booking.equipment.owner = userMap.get(booking.equipment.owner_id);
        }
      });
    }
    
    return bookings;
  },

  // Get pending booking requests for owner
  async getPendingRequests(ownerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment!inner(id, name, images, category, price_per_day, owner_id)
      `)
      .eq('equipment.owner_id', ownerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch renter profiles separately
    const bookings = data || [];
    if (bookings.length > 0) {
      const renterIds = [...new Set(bookings.map(b => b.renter_id).filter(Boolean))];
      const { data: renters } = await supabase
        .from('user_profiles')
        .select('id, name, profile_image, phone')
        .in('id', renterIds);
      
      const renterMap = new Map((renters || []).map(r => [r.id, r]));
      bookings.forEach(booking => {
        booking.renter = renterMap.get(booking.renter_id);
      });
    }
    
    return bookings;
  },

  // Get booking statistics
  async getStats(userId: string, role: 'renter' | 'owner'): Promise<{
    total: number;
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
  }> {
    const column = role === 'renter' ? 'renter_id' : 'equipment.owner_id';

    const { data, error } = await supabase
      .from('bookings')
      .select('status, equipment:equipment!inner(owner_id)')
      .eq(column, userId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };

    data?.forEach((booking) => {
      switch (booking.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'confirmed':
        case 'in_progress':
          stats.active++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  },

  // Get a single booking by ID
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        equipment:equipment(*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // Fetch renter profile separately if booking exists
    if (data && data.renter_id) {
      const { data: renter } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.renter_id)
        .single();
      return { ...data, renter };
    }
    
    return data;
  },

  // Create a booking
  async createBooking(booking: {
    equipment_id: string;
    start_date: string;
    end_date: string;
    start_time?: string;
    end_time?: string;
    delivery_address?: string;
    notes?: string;
    total_amount: number;
    platform_fee?: number;
  }): Promise<Booking> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get equipment to find owner
    const { data: equipment } = await supabase
      .from('equipment')
      .select('owner_id, price_per_day')
      .eq('id', booking.equipment_id)
      .single();

    if (!equipment) throw new Error('Equipment not found');

    const totalDays = calculateDaysBetween(booking.start_date, booking.end_date);
    const pricePerDay = equipment.price_per_day || 0;
    const totalAmount = pricePerDay > 0 ? pricePerDay * totalDays : booking.total_amount;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        equipment_id: booking.equipment_id,
        renter_id: user.id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        start_time: booking.start_time || '08:00',
        end_time: booking.end_time || '18:00',
        delivery_address: booking.delivery_address,
        notes: booking.notes,
        total_days: totalDays,
        price_per_day: pricePerDay,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update booking status
  async updateBookingStatus(id: string, status: BookingStatus, userId?: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        equipment:equipment(*)
      `)
      .single();

    if (error) throw error;
    
    // Create notification for renter (optional - won't fail if notification service fails)
    if (data.renter_id) {
      try {
        const title = status === 'confirmed' ? 'Booking Confirmed' : 'Booking Updated';
        const body = status === 'confirmed' 
          ? 'Your equipment booking has been confirmed by the provider.'
          : `Your booking status has been updated to ${status}.`;
        
        await notificationService.create({
          user_id: data.renter_id,
          title,
          body,
          type: 'booking',
          data: { booking_id: id, status },
        });
      } catch (notificationError) {
        console.warn('Failed to create notification:', notificationError);
        // Continue execution - notification failure shouldn't block booking update
      }
    }
    
    // Create audit log (optional - won't fail if audit log service fails)
    if (userId) {
      try {
        await auditLogService.create({
          user_id: userId,
          action: `booking_${status}`,
          entity_type: 'booking',
          entity_id: id,
          details: {
            previous_status: data.status,
            new_status: status,
            renter_id: data.renter_id,
            equipment_id: data.equipment_id,
          },
        });
      } catch (auditError) {
        console.warn('Failed to create audit log:', auditError);
        // Continue execution - audit log failure shouldn't block booking update
      }
    }
    
    return data;
  },

  // Cancel booking
  async cancelBooking(id: string, reason?: string, userId?: string): Promise<void> {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        equipment:equipment(*)
      `)
      .single();

    if (error) throw error;
    
    // Create notification for renter (optional)
    if (data?.renter_id) {
      try {
        await notificationService.create({
          user_id: data.renter_id,
          title: 'Booking Cancelled',
          body: `Your equipment booking has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
          type: 'booking',
          data: { booking_id: id, status: 'cancelled', reason },
        });
      } catch (notificationError) {
        console.warn('Failed to create notification:', notificationError);
      }
    }
    
    // Create audit log (optional)
    if (userId) {
      try {
        await auditLogService.create({
          user_id: userId,
          action: 'booking_cancelled',
          entity_type: 'booking',
          entity_id: id,
          details: {
            previous_status: data.status,
            new_status: 'cancelled',
            cancellation_reason: reason,
            renter_id: data.renter_id,
            equipment_id: data.equipment_id,
          },
        });
      } catch (auditError) {
        console.warn('Failed to create audit log:', auditError);
      }
    }
  },

  // Convenience method for current user's bookings as renter
  async getMyBookings(status?: BookingStatus | BookingStatus[]): Promise<Booking[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const result = await this.getRenterBookings(user.id, status);
    return result.data;
  },

  // Convenience method for current user's bookings as provider
  async getProviderBookings(status?: BookingStatus | BookingStatus[]): Promise<Booking[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const result = await this.getOwnerBookings(user.id, status);
    return result.data;
  },
};
