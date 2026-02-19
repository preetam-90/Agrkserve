import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserRole } from '@/lib/types';

interface PostgresError {
  code?: string;
  message?: string;
}

// Helper to get a fresh Supabase client for each operation
// This ensures auth state is always current
const getClient = () => createClient();

export const authService = {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    const supabase = getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string, name?: string) {
    const supabase = getClient();
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
    const supabase = getClient();
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
    const supabase = getClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const supabase = getClient();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  // Get current session
  async getSession() {
    const supabase = getClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getUser() {
    const supabase = getClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Sign out
  async signOut() {
    const supabase = getClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = getClient();
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') throw error;
      return data;
    } catch (error: unknown) {
      const pgError = error as PostgresError;
      // Return null if table doesn't exist or other non-critical errors
      if (pgError.code === '42P01') {
        console.warn('user_profiles table does not exist yet');
        return null;
      }
      throw error;
    }
  },

  // Get public user profile (alias for public access)
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.getProfile(userId);
  },

  // Create or update user profile
  async upsertProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // Verify user is authenticated first via the browser client
      const supabase = getClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('Auth error in upsertProfile:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!user) {
        console.error('No authenticated user found in upsertProfile');
        throw new Error('Not authenticated. Please log in again.');
      }

      if (user.id !== userId) {
        console.error('User ID mismatch in upsertProfile:', {
          authUserId: user.id,
          requestedUserId: userId,
        });
        throw new Error('User ID mismatch. Please refresh and try again.');
      }

      // Call server-side API route for the upsert (avoids RLS permission issues)
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const { data } = await response.json();
      console.log('Profile upserted successfully for user:', userId);

      // If roles are provided, add them to user_roles table
      if (profile.roles && Array.isArray(profile.roles)) {
        for (const role of profile.roles) {
          await this.addUserRole(userId, role as UserRole);
        }
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      console.error('Unexpected error in upsertProfile:', error);
      throw new Error('An unexpected error occurred. Please try again.');
    }
  },

  // Update profile with location
  async updateProfileWithLocation(
    userId: string,
    profile: Partial<UserProfile>,
    latitude: number,
    longitude: number
  ): Promise<UserProfile> {
    const supabase = getClient();
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
    const supabase = getClient();
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
    } catch (error: unknown) {
      const pgError = error as PostgresError;
      if (pgError.code === '42P01') {
        console.warn('user_roles table does not exist yet, returning default role');
        return ['renter'];
      }
      throw error;
    }
  },

  // Add user role to user_roles table (with duplicate handling)
  async addUserRole(userId: string, role: UserRole): Promise<void> {
    const supabase = getClient();
    try {
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: role,
        is_active: true,
      });

      if (error) {
        // Ignore duplicate key errors (role already exists)
        if (error.code === '23505') {
          console.log(`Role ${role} already exists for user ${userId}`);
          return;
        }
        if (error.code === '42P01') {
          console.warn('user_roles table does not exist yet');
          return;
        }
        throw error;
      }
    } catch (error: unknown) {
      const pgError = error as PostgresError;
      // Ignore duplicate key errors
      if (pgError.code === '23505') {
        console.log(`Role ${role} already exists for user ${userId}`);
        return;
      }
      if (pgError.code === '42P01') {
        console.warn('user_roles table does not exist yet');
        return;
      }
      throw error;
    }
  },

  // Remove user role
  async removeUserRole(userId: string, role: UserRole): Promise<void> {
    const supabase = getClient();
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
    } catch (error: unknown) {
      const pgError = error as PostgresError;
      if (pgError.code === '42P01') {
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
    const supabase = getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate phone number if provided
    if (profile.phone && !/^[6-9]\d{9}$/.test(profile.phone)) {
      throw new Error('Invalid phone number. Please enter a valid 10-digit number');
    }

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
    } catch (error: unknown) {
      const pgError = error as PostgresError;
      if (pgError.code === '42P01') {
        console.warn('user_profiles table does not exist yet');
        return null;
      }
      throw error;
    }
  },

  // Update last login time
  async updateLastLogin(userId: string): Promise<void> {
    const supabase = getClient();
    try {
      await supabase.rpc('update_last_login', { user_id: userId });
    } catch (error) {
      console.error('Failed to update last login:', error);
      // Don't throw - this is not critical
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    const supabase = getClient();
    return supabase.auth.onAuthStateChange(callback);
  },
};
