import { createClient } from '@/lib/supabase/client';
import type { 
  LabourProfile, 
  LabourBooking,
  LabourFilters, 
  LabourAvailability,
  PaginatedResponse,
  UserProfile 
} from '@/lib/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/utils/constants';

const supabase = createClient();

// Helper function to fetch user profiles by IDs
async function fetchUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  if (userIds.length === 0) return new Map();
  
  const uniqueIds = [...new Set(userIds)];
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .in('id', uniqueIds);
  
  if (error) throw error;
  
  const profileMap = new Map<string, UserProfile>();
  (data || []).forEach(profile => {
    profileMap.set(profile.id, profile);
  });
  
  return profileMap;
}

// Helper to attach user profiles to labour profiles
async function attachUserToLabourProfiles(profiles: any[]): Promise<LabourProfile[]> {
  if (profiles.length === 0) return [];
  
  const userIds = profiles.map(p => p.user_id).filter(Boolean);
  const profileMap = await fetchUserProfiles(userIds);
  
  return profiles.map(profile => ({
    ...profile,
    user: profileMap.get(profile.user_id) || undefined,
  }));
}

export const labourService = {
  // Get labour profile by ID
  async getById(id: string): Promise<LabourProfile | null> {
    const { data, error } = await supabase
      .from('labour_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    // Fetch user profile separately
    const [result] = await attachUserToLabourProfiles([data]);
    return result;
  },

  // Get labour profile by user ID
  async getByUserId(userId: string): Promise<LabourProfile | null> {
    const { data, error } = await supabase
      .from('labour_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    // Fetch user profile separately
    const [result] = await attachUserToLabourProfiles([data]);
    return result;
  },

  // Search labour with PostGIS geospatial queries
  async search(
    filters: LabourFilters,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<LabourProfile>> {
    const offset = (page - 1) * limit;

    // Use RPC function for geospatial search
    if (filters.latitude && filters.longitude && filters.radiusKm) {
      const { data, error } = await supabase.rpc('search_labour_nearby', {
        p_latitude: filters.latitude,
        p_longitude: filters.longitude,
        p_radius_km: filters.radiusKm,
        p_skills: filters.skills || null,
        p_min_rate: filters.minRate || null,
        p_max_rate: filters.maxRate || null,
        p_availability: filters.availability || null,
        p_min_experience: null,
        p_min_rating: filters.minRating || null,
        p_search_query: filters.search || null,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;

      // Get total count
      const { count } = await supabase.rpc('count_labour_nearby', {
        p_latitude: filters.latitude,
        p_longitude: filters.longitude,
        p_radius_km: filters.radiusKm,
        p_skills: filters.skills || null,
        p_min_rate: filters.minRate || null,
        p_max_rate: filters.maxRate || null,
        p_availability: filters.availability || null,
        p_min_experience: null,
        p_min_rating: filters.minRating || null,
        p_search_query: filters.search || null,
      });

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      };
    }

    // Fallback to regular search
    let query = supabase
      .from('labour_profiles')
      .select('*', { count: 'exact' })
      .eq('availability', filters.availability || 'available');

    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills);
    }

    if (filters.minRate !== undefined) {
      query = query.gte('daily_rate', filters.minRate);
    }

    if (filters.maxRate !== undefined) {
      query = query.lte('daily_rate', filters.maxRate);
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
      query = query.gte('average_rating', filters.minRating);
    }

    const { data, error, count } = await query
      .order('average_rating', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Attach user profiles
    const profilesWithUsers = await attachUserToLabourProfiles(data || []);

    return {
      data: profilesWithUsers,
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Create labour profile
  async create(profile: {
    user_id: string;
    skills: string[];
    experience_years: number;
    daily_rate: number;
    hourly_rate?: number;
    city: string;
    address?: string;
    service_radius_km: number;
    bio?: string;
    certifications?: string[];
    latitude: number;
    longitude: number;
  }): Promise<LabourProfile> {
    const { data, error } = await supabase.rpc('create_labour_profile', {
      p_user_id: profile.user_id,
      p_skills: profile.skills,
      p_experience_years: profile.experience_years,
      p_daily_rate: profile.daily_rate,
      p_hourly_rate: profile.hourly_rate || null,
      p_city: profile.city,
      p_address: profile.address || null,
      p_service_radius_km: profile.service_radius_km,
      p_bio: profile.bio || null,
      p_certifications: profile.certifications || [],
      p_latitude: profile.latitude,
      p_longitude: profile.longitude,
    });

    if (error) throw error;
    return data;
  },

  // Update labour profile
  async update(
    id: string,
    profile: Partial<{
      skills: string[];
      experience_years: number;
      daily_rate: number;
      hourly_rate: number;
      city: string;
      address: string;
      service_radius_km: number;
      bio: string;
      certifications: string[];
      availability: LabourAvailability;
      latitude: number;
      longitude: number;
    }>
  ): Promise<LabourProfile> {
    // If location is being updated, use RPC
    if (profile.latitude !== undefined && profile.longitude !== undefined) {
      const { data, error } = await supabase.rpc('update_labour_profile_with_location', {
        p_labour_id: id,
        p_skills: profile.skills || null,
        p_experience_years: profile.experience_years || null,
        p_daily_rate: profile.daily_rate || null,
        p_hourly_rate: profile.hourly_rate || null,
        p_city: profile.city || null,
        p_address: profile.address || null,
        p_service_radius_km: profile.service_radius_km || null,
        p_bio: profile.bio || null,
        p_certifications: profile.certifications || null,
        p_availability: profile.availability || null,
        p_latitude: profile.latitude,
        p_longitude: profile.longitude,
      });

      if (error) throw error;
      return data;
    }

    // Regular update
    const { latitude, longitude, ...updateData } = profile;
    const { data, error } = await supabase
      .from('labour_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    // Attach user profile
    const [result] = await attachUserToLabourProfiles([data]);
    return result;
  },

  // Update availability
  async updateAvailability(id: string, availability: LabourAvailability): Promise<void> {
    const { error } = await supabase
      .from('labour_profiles')
      .update({
        availability,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Create labour booking
  async createBooking(booking: {
    labour_id: string;
    employer_id: string;
    start_date: string;
    end_date: string;
    daily_rate: number;
    notes?: string;
  }): Promise<LabourBooking> {
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = booking.daily_rate * totalDays;

    const { data, error } = await supabase
      .from('labour_bookings')
      .insert({
        labour_id: booking.labour_id,
        employer_id: booking.employer_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_days: totalDays,
        total_amount: totalAmount,
        status: 'pending',
        notes: booking.notes || null,
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Fetch related data separately
    const [labourProfile] = await attachUserToLabourProfiles([
      await supabase.from('labour_profiles').select('*').eq('id', data.labour_id).single().then(r => r.data)
    ].filter(Boolean));
    
    const employerProfiles = await fetchUserProfiles([data.employer_id]);
    
    return {
      ...data,
      labour: labourProfile,
      employer: employerProfiles.get(data.employer_id),
    };
  },

  // Get labour bookings
  async getBookings(
    userId: string,
    role: 'labour' | 'employer',
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<LabourBooking>> {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('labour_bookings')
      .select('*', { count: 'exact' });

    if (role === 'labour') {
      // Get the labour profile ID first
      const { data: labourProfile } = await supabase
        .from('labour_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (labourProfile) {
        query = query.eq('labour_id', labourProfile.id);
      }
    } else {
      query = query.eq('employer_id', userId);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Fetch labour profiles and user profiles separately
    const bookings = data || [];
    const labourIds = bookings.map(b => b.labour_id).filter(Boolean);
    const employerIds = bookings.map(b => b.employer_id).filter(Boolean);
    
    // Fetch labour profiles
    const labourProfiles = labourIds.length > 0 
      ? await supabase.from('labour_profiles').select('*').in('id', [...new Set(labourIds)]).then(r => r.data || [])
      : [];
    const labourProfilesWithUsers = await attachUserToLabourProfiles(labourProfiles);
    const labourMap = new Map(labourProfilesWithUsers.map(p => [p.id, p]));
    
    // Fetch employer profiles
    const employerMap = await fetchUserProfiles(employerIds);
    
    const enrichedBookings: LabourBooking[] = bookings.map(booking => ({
      ...booking,
      labour: labourMap.get(booking.labour_id),
      employer: employerMap.get(booking.employer_id),
    }));

    return {
      data: enrichedBookings,
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Get featured labour profiles
  async getFeatured(limit: number = 6): Promise<LabourProfile[]> {
    const { data, error } = await supabase
      .from('labour_profiles')
      .select('*')
      .eq('availability', 'available')
      .eq('is_verified', true)
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Attach user profiles
    return attachUserToLabourProfiles(data || []);
  },
};
