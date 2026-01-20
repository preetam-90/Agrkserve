import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import type { UserProfile, UserRole } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  activeRole: UserRole | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setRoles: (roles: UserRole[]) => void;
  setActiveRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  roles: [],
  activeRole: null,
  isLoading: true,
  isInitialized: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setRoles: (roles) => set({ roles }),
      setActiveRole: (role) => set({ activeRole: role }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),

      initialize: async () => {
        const supabase = createClient();
        
        try {
          set({ isLoading: true });

          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            set({ user });
            await Promise.all([get().fetchProfile(), get().fetchRoles()]);
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          // If table doesn't exist or no profile found, create a basic profile from auth metadata
          if (error) {
            if (error.code === '42P01' || error.code === 'PGRST116') {
              // Table doesn't exist or no rows found - use auth metadata
              const basicProfile: UserProfile = {
                id: user.id,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                phone: user.phone || '',
                bio: '',
                profile_image: user.user_metadata?.avatar_url || '',
                address: '',
                pincode: '',
                latitude: null,
                longitude: null,
                roles: null,
                is_profile_complete: false,
                preferred_language: 'en',
                is_verified: false,
                last_login: null,
                created_at: user.created_at,
                updated_at: new Date().toISOString(),
              };
              set({ profile: basicProfile });
            } else {
              console.error('Failed to fetch profile:', error);
            }
            return;
          }

          set({ profile: data });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      },

      fetchRoles: async () => {
        const { user, activeRole } = get();
        if (!user) return;

        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('is_active', true);

          // If table doesn't exist, default to 'renter' role
          if (error) {
            if (error.code === '42P01') {
              // Table doesn't exist - assign default renter role
              const defaultRoles: UserRole[] = ['renter'];
              set({ roles: defaultRoles, activeRole: 'renter' });
            } else {
              console.error('Failed to fetch roles:', error);
              // Still set default role on error
              set({ roles: ['renter'], activeRole: 'renter' });
            }
            return;
          }

          const roles = data?.map((r) => r.role as UserRole) || [];
          
          // If no roles found, default to 'renter'
          if (roles.length === 0) {
            set({ roles: ['renter'], activeRole: 'renter' });
          } else {
            set({ roles });
            // Set active role if not already set
            if (!activeRole) {
              set({ activeRole: roles[0] });
            }
          }
        } catch (error) {
          console.error('Error fetching roles:', error);
          // Set default role on any error
          set({ roles: ['renter'], activeRole: 'renter' });
        }
      },

      switchRole: (role) => {
        const { roles } = get();
        if (roles.includes(role)) {
          set({ activeRole: role });
        }
      },

      refreshProfile: async () => {
        await get().fetchProfile();
        await get().fetchRoles();
      },

      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        get().reset();
      },

      reset: () => set(initialState),
    }),
    {
      name: 'agri-serve-auth',
      partialize: (state) => ({
        activeRole: state.activeRole,
      }),
    }
  )
);
