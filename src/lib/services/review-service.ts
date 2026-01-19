import { createClient } from '@/lib/supabase/client';
import type { Review, PaginatedResponse, UserProfile } from '@/lib/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/utils/constants';

const supabase = createClient();

// Helper to fetch reviewer profiles for reviews
async function attachReviewerProfiles(reviews: Review[]): Promise<Review[]> {
  if (reviews.length === 0) return reviews;
  
  const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id))];
  const { data: reviewers } = await supabase
    .from('user_profiles')
    .select('*')
    .in('id', reviewerIds);
  
  if (!reviewers) return reviews;
  
  const reviewerMap = new Map(reviewers.map(r => [r.id, r as UserProfile]));
  return reviews.map(review => ({
    ...review,
    reviewer: reviewerMap.get(review.reviewer_id) || undefined
  }));
}

export const reviewService = {
  // Get review by ID
  async getById(id: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    // Fetch reviewer profile
    const { data: reviewer } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.reviewer_id)
      .single();
    
    return { ...data, reviewer: reviewer || undefined };
  },

  // Get review for a booking (check if review exists)
  async getByBookingId(bookingId: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    // Fetch reviewer profile
    const { data: reviewer } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.reviewer_id)
      .single();
    
    return { ...data, reviewer: reviewer || undefined };
  },

  // Get reviews for equipment
  async getEquipmentReviews(
    equipmentId: string,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Review>> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('equipment_id', equipmentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const reviewsWithReviewers = await attachReviewerProfiles(data || []);

    return {
      data: reviewsWithReviewers,
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Get reviews for a user (provider)
  async getUserReviews(
    userId: string,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Review>> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const reviewsWithReviewers = await attachReviewerProfiles(data || []);

    return {
      data: reviewsWithReviewers,
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Get reviews written by a user
  async getReviewsByUser(
    userId: string,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Review>> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const reviewsWithReviewers = await attachReviewerProfiles(data || []);

    return {
      data: reviewsWithReviewers,
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  },

  // Create a review
  async create(review: {
    booking_id: string;
    reviewer_id: string;
    equipment_id?: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        booking_id: review.booking_id,
        reviewer_id: review.reviewer_id,
        equipment_id: review.equipment_id || null,
        rating: review.rating,
        comment: review.comment || null,
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Fetch reviewer profile
    const { data: reviewer } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.reviewer_id)
      .single();
    
    return { ...data, reviewer: reviewer || undefined };
  },

  // Update a review
  async update(
    id: string,
    updates: {
      rating?: number;
      comment?: string;
      is_public?: boolean;
    }
  ): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    // Fetch reviewer profile
    const { data: reviewer } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.reviewer_id)
      .single();
    
    return { ...data, reviewer: reviewer || undefined };
  },

  // Delete a review
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get average rating for equipment
  async getEquipmentRating(equipmentId: string): Promise<{
    average: number;
    count: number;
  }> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('equipment_id', equipmentId)
      ;

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: sum / data.length,
      count: data.length,
    };
  },

  // Get rating distribution for equipment
  async getRatingDistribution(equipmentId: string): Promise<Record<number, number>> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('equipment_id', equipmentId)
      ;

    if (error) throw error;

    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    data?.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    return distribution;
  },

  // Convenience method to create a review for current user
  async createReview(review: {
    booking_id: string;
    equipment_id?: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    return this.create({
      ...review,
      reviewer_id: user.id,
    });
  },
};
