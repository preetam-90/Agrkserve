import { createClient } from '@/lib/supabase/client';
import type { 
  Equipment, 
  PaginatedResponse,
  EquipmentCategory 
} from '@/lib/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/utils/constants';

// Local type for equipment status used in this service
type EquipmentStatus = 'available' | 'unavailable' | 'inactive' | 'maintenance';

// Interface for search filters used internally
interface EquipmentSearchFilters {
  category?: string;
  search_query?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  latitude?: number;
  longitude?: number;
  max_distance_km?: number;
  brands?: string[];
}

const supabase = createClient();

export const equipmentService = {
  // Get all equipment categories
  async getCategories(): Promise<EquipmentCategory[]> {
    const { data, error } = await supabase
      .from('equipment_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get equipment by ID
  async getById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    // Fetch owner profile separately
    const { data: owner } = await supabase
      .from('user_profiles')
      .select('id, name, profile_image, phone, email, address')
      .eq('id', data.owner_id)
      .single();

    return {
      ...data,
      owner: owner || null
    };
  },

  // Search equipment with PostGIS geospatial queries
  async search(
    filters: EquipmentSearchFilters,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Equipment>> {
    const offset = (page - 1) * limit;

    // Query equipment without join first (no direct FK to user_profiles)
    let query = supabase
      .from('equipment')
      .select('*', { count: 'exact' })
      .eq('is_available', true);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.min_price !== undefined) {
      query = query.gte('price_per_day', filters.min_price);
    }

    if (filters.max_price !== undefined) {
      query = query.lte('price_per_day', filters.max_price);
    }

    if (filters.min_rating !== undefined && filters.min_rating > 0) {
      query = query.gte('rating', filters.min_rating);
    }

    if (filters.search_query) {
      query = query.or(`name.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`);
    }

    // Apply brand filter if provided
    if (filters.brands && filters.brands.length > 0) {
      query = query.in('brand', filters.brands);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Fetch owner profiles separately since there's no direct FK relationship
    let equipmentWithOwners = data || [];
    if (equipmentWithOwners.length > 0) {
      const ownerIds = [...new Set(equipmentWithOwners.map(e => e.owner_id))];
      const { data: owners } = await supabase
        .from('user_profiles')
        .select('id, name, profile_image, phone')
        .in('id', ownerIds);
      
      if (owners) {
        const ownerMap = new Map(owners.map(o => [o.id, o]));
        equipmentWithOwners = equipmentWithOwners.map(e => ({
          ...e,
          owner: ownerMap.get(e.owner_id) || null
        }));
      }
    }

    return {
      data: equipmentWithOwners,
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Get equipment by owner
  async getByOwner(
    ownerId: string,
    status?: EquipmentStatus,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Equipment>> {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('equipment')
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId);

    if (status) {
      const statusValue = String(status);
      if (statusValue === 'available') {
        query = query.eq('is_available', true);
      } else if (statusValue === 'unavailable' || statusValue === 'inactive') {
        query = query.eq('is_available', false);
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

  // Get equipment by owner ID (returns array for public profile page)
  async getByOwnerId(ownerId: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create new equipment
  async create(
    ownerId: string,
    equipment: {
      title: string;
      description?: string;
      category: string;
      hourly_rate?: number;
      daily_rate: number;
      city: string;
      images: string[];
      video_url?: string;
      specifications?: Record<string, unknown>;
      latitude: number;
      longitude: number;
    }
  ): Promise<Equipment> {
    const features = Array.isArray((equipment.specifications as { features?: string[] } | undefined)?.features)
      ? (equipment.specifications as { features?: string[] }).features
      : undefined;

    const { data, error } = await supabase
      .from('equipment')
      .insert({
        owner_id: ownerId,
        name: equipment.title,
        description: equipment.description || null,
        category: equipment.category,
        price_per_hour: equipment.hourly_rate || null,
        price_per_day: equipment.daily_rate,
        location_name: equipment.city,
        latitude: equipment.latitude || null,
        longitude: equipment.longitude || null,
        images: equipment.images,
        video_url: equipment.video_url || null,
        features: features || null,
        is_available: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update equipment
  async update(
    id: string,
    equipment: Partial<{
      title: string;
      description: string;
      category: string;
      hourly_rate: number;
      daily_rate: number;
      city: string;
      images: string[];
      video_url?: string;
      specifications: Record<string, unknown>;
      status: EquipmentStatus;
      latitude: number;
      longitude: number;
    }>
  ): Promise<Equipment> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (equipment.title !== undefined) updateData.name = equipment.title;
    if (equipment.description !== undefined) updateData.description = equipment.description;
    if (equipment.category !== undefined) updateData.category = equipment.category;
    if ((equipment as { brand?: string }).brand !== undefined) updateData.brand = (equipment as { brand?: string }).brand;
    if ((equipment as { model?: string }).model !== undefined) updateData.model = (equipment as { model?: string }).model;
    if ((equipment as { year?: number }).year !== undefined) updateData.year = (equipment as { year?: number }).year;
    if ((equipment as { horsepower?: number }).horsepower !== undefined) updateData.horsepower = (equipment as { horsepower?: number }).horsepower;
    if ((equipment as { fuel_type?: string }).fuel_type !== undefined) updateData.fuel_type = (equipment as { fuel_type?: string }).fuel_type;
    if (equipment.hourly_rate !== undefined) updateData.price_per_hour = equipment.hourly_rate;
    if (equipment.daily_rate !== undefined) updateData.price_per_day = equipment.daily_rate;
    if (equipment.city !== undefined) updateData.location_name = equipment.city;
    if (equipment.latitude !== undefined) updateData.latitude = equipment.latitude;
    if (equipment.longitude !== undefined) updateData.longitude = equipment.longitude;
    if (equipment.images !== undefined) updateData.images = equipment.images;
    if ((equipment as { video_url?: string }).video_url !== undefined) {
      updateData.video_url = (equipment as { video_url?: string }).video_url;
    }
    if (equipment.specifications !== undefined) {
      const features = Array.isArray((equipment.specifications as { features?: string[] }).features)
        ? (equipment.specifications as { features?: string[] }).features
        : undefined;
      updateData.features = features || null;
    }
    if (equipment.status !== undefined) {
      const statusValue = String(equipment.status);
      if (statusValue === 'available') updateData.is_available = true;
      if (statusValue === 'unavailable' || statusValue === 'inactive') updateData.is_available = false;
    }

    const { data, error } = await supabase
      .from('equipment')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update equipment status
  async updateStatus(id: string, status: EquipmentStatus): Promise<void> {
    const statusValue = String(status);
    const isAvailable = statusValue === 'available'
      ? true
      : statusValue === 'unavailable' || statusValue === 'inactive'
        ? false
        : true;
    const { error } = await supabase
      .from('equipment')
      .update({ 
        is_available: isAvailable,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Delete equipment (soft delete by setting inactive)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('equipment')
      .update({ 
        is_available: false,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Get featured/popular equipment
  async getFeatured(limit: number = 6): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select(`
        *,
        owner:user_profiles!owner_id(id, full_name, avatar_url)
      `)
      .eq('status', 'available')
      .order('total_bookings', { ascending: false })
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Check equipment availability for date range
  async checkAvailability(
    equipmentId: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_equipment_availability', {
      p_equipment_id: equipmentId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data;
  },

  // Get equipment statistics for provider dashboard
  async getOwnerStats(ownerId: string): Promise<{
    total_equipment: number;
    active_equipment: number;
    total_bookings: number;
    total_earnings: number;
    average_rating: number;
  }> {
    const { data, error } = await supabase.rpc('get_equipment_owner_stats', {
      p_owner_id: ownerId,
    });

    if (error) throw error;
    return data || {
      total_equipment: 0,
      active_equipment: 0,
      total_bookings: 0,
      total_earnings: 0,
      average_rating: 0,
    };
  },

  // Convenience alias methods for page compatibility

  // Alias for getById
  async getEquipmentById(id: string): Promise<Equipment | null> {
    return this.getById(id);
  },

  // Alias for search with full filter support
  async getEquipment(options?: {
    limit?: number;
    page?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    latitude?: number;
    longitude?: number;
    maxDistanceKm?: number;
    brands?: string[];
  }): Promise<PaginatedResponse<Equipment>> {
    return this.search(
      {
        category: options?.category,
        search_query: options?.search,
        min_price: options?.minPrice,
        max_price: options?.maxPrice,
        min_rating: options?.minRating,
        latitude: options?.latitude,
        longitude: options?.longitude,
        max_distance_km: options?.maxDistanceKm,
        brands: options?.brands,
      },
      options?.page || 1,
      options?.limit || DEFAULT_PAGE_SIZE
    );
  },

  // Get current user's equipment
  async getMyEquipment(): Promise<Equipment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const result = await this.getByOwner(user.id);
    return result.data;
  },

  // Alias for update - accepts Equipment-style field names
  async updateEquipment(
    id: string,
    data: Partial<{
      // Equipment type field names
      name: string;
      description: string;
      category: string;
      brand: string;
      model: string;
      year: number;
      horsepower: number;
      fuel_type: string;
      price_per_hour: number;
      price_per_day: number;
      location_name: string;
      latitude: number;
      longitude: number;
      images: string[];
      video_url?: string;
      features: string[];
      is_available: boolean;
    }>
  ): Promise<Equipment> {
    // Map from Equipment-style to service-style field names
    const updateData: Record<string, unknown> = {};
    
    if (data.name !== undefined) updateData.title = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price_per_hour !== undefined) updateData.hourly_rate = data.price_per_hour;
    if (data.price_per_day !== undefined) updateData.daily_rate = data.price_per_day;
    if (data.location_name !== undefined) updateData.city = data.location_name;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.video_url !== undefined) updateData.video_url = data.video_url;
    if (data.features !== undefined) updateData.specifications = { features: data.features };
    if (data.is_available !== undefined) {
      updateData.status = data.is_available ? 'available' : 'unavailable';
    }
    // Pass through extra fields for direct update
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.horsepower !== undefined) updateData.horsepower = data.horsepower;
    if (data.fuel_type !== undefined) updateData.fuel_type = data.fuel_type;

    return this.update(id, updateData as Parameters<typeof this.update>[1]);
  },

  // Alias for create - gets owner_id from current user, accepts Equipment-style fields
  async createEquipment(
    equipment: {
      name: string;
      description?: string;
      category: string;
      brand?: string;
      model?: string;
      year?: number;
      horsepower?: number;
      fuel_type?: string;
      price_per_hour?: number;
      price_per_day: number;
      location_name: string;
      latitude?: number;
      longitude?: number;
      images?: string[];
      video_url?: string;
      features?: string[];
      is_available?: boolean;
    }
  ): Promise<Equipment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('equipment')
      .insert({
        owner_id: user.id,
        name: equipment.name,
        description: equipment.description || null,
        category: equipment.category,
        brand: equipment.brand || null,
        model: equipment.model || null,
        year: equipment.year || null,
        horsepower: equipment.horsepower || null,
        fuel_type: equipment.fuel_type || null,
        price_per_hour: equipment.price_per_hour || null,
        price_per_day: equipment.price_per_day,
        location_name: equipment.location_name,
        latitude: equipment.latitude || null,
        longitude: equipment.longitude || null,
        images: equipment.images || [],
        video_url: equipment.video_url || null,
        features: equipment.features || null,
        is_available: equipment.is_available ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Alias for delete
  async deleteEquipment(id: string): Promise<void> {
    return this.delete(id);
  },
};
