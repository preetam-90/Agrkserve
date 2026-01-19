import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserRole } from '@/lib/types';

const supabase = createClient();

export const authService = {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  // Send password reset email
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') throw error;
      return data;
    } catch (error: any) {
      // Return null if table doesn't exist or other non-critical errors
      if (error.code === '42P01') {
        console.warn('user_profiles table does not exist yet');
        return null;
      }
      throw error;
    }
  },

  // Create or update user profile
  async upsertProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          console.warn('user_profiles table does not exist yet');
          return null;
        }
        throw error;
      }
      return data;
    } catch (error: any) {
      if (error.code === '42P01') {
        console.warn('user_profiles table does not exist yet');
        return null;
      }
      throw error;
    }
  },

  // Update profile with location
  async updateProfileWithLocation(
    userId: string,
    profile: Partial<UserProfile>,
    latitude: number,
    longitude: number
  ): Promise<UserProfile> {
    // Use raw SQL to properly handle PostGIS geography type
    const { data, error } = await supabase.rpc('update_user_profile_with_location', {
      p_user_id: userId,
      p_full_name: profile.name || null,
      p_email: profile.email || null,
      p_bio: profile.bio || null,
      p_city: profile.address || null,
      p_address: profile.address || null,
      p_avatar_url: profile.profile_image || null,
      p_latitude: latitude,
      p_longitude: longitude,
    });

    if (error) throw error;
    return data;
  },

  // Get user roles
  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        if (error.code === '42P01') {
          console.warn('user_roles table does not exist yet, returning default role');
          return ['renter'];
        }
        throw error;
      }
      
      const roles = data?.map((r) => r.role as UserRole) || [];
      return roles.length > 0 ? roles : ['renter'];
    } catch (error: any) {
      if (error.code === '42P01') {
        console.warn('user_roles table does not exist yet, returning default role');
        return ['renter'];
      }
      throw error;
    }
  },

  // Add user role
  async addUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          is_active: true,
        });

      if (error && error.code !== '42P01') throw error;
      if (error?.code === '42P01') {
        console.warn('user_roles table does not exist yet');
      }
    } catch (error: any) {
      if (error.code === '42P01') {
        console.warn('user_roles table does not exist yet');
        return;
      }
      throw error;
    }
  },

  // Remove user role
  async removeUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('role', role);

      if (error && error.code !== '42P01') throw error;
      if (error?.code === '42P01') {
        console.warn('user_roles table does not exist yet');
      }
    } catch (error: any) {
      if (error.code === '42P01') {
        console.warn('user_roles table does not exist yet');
        return;
      }
      throw error;
    }
  },

  // Check if profile is complete
  isProfileComplete(profile: UserProfile | null): boolean {
    if (!profile) return false;
    return !!(profile.name && profile.address);
  },

  // Update user profile
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          console.warn('user_profiles table does not exist yet');
          return null;
        }
        throw error;
      }
      return data;
    } catch (error: any) {
      if (error.code === '42P01') {
        console.warn('user_profiles table does not exist yet');
        return null;
      }
      throw error;
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
