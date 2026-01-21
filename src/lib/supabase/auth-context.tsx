'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from './client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    console.log('[AuthProvider] Initializing auth...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthProvider] Session loaded:', session?.user?.id || 'No user');
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('[AuthProvider] Loading set to false');
    }).catch((err) => {
      console.error('[AuthProvider] Error getting session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthProvider] Auth state changed:', _event, session?.user?.id || 'No user');
      setUser(session?.user ?? null);
    });

    return () => {
      console.log('[AuthProvider] Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
}
