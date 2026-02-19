import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * Check if the current user is an admin (client-side)
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role, is_active')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .single();

  return !!roles;
}

/**
 * Check if the current user is an admin (server-side)
 */
export async function isAdminServer(): Promise<boolean> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role, is_active')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .single();

  return !!roles;
}

/**
 * Get the current admin user
 */
export async function getAdminUser() {
  console.log('DEBUG: [getAdminUser] Starting check...');
  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) console.error('DEBUG: [getAdminUser] auth.getUser error:', userError);
  if (!user) {
    console.log('DEBUG: [getAdminUser] No user found in session');
    return null;
  }
  console.log('DEBUG: [getAdminUser] Found user:', user.id);

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role, is_active')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .single();

  if (rolesError) {
    console.warn('DEBUG: [getAdminUser] roles query result/error:', rolesError);
  }
  console.log('DEBUG: [getAdminUser] roles query data:', roles);

  if (!roles) {
    console.log('DEBUG: [getAdminUser] Access denied: User does not have "admin" role');
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  console.log('DEBUG: [getAdminUser] Admin check successful for:', user.email);
  return {
    ...user,
    profile,
    isAdmin: true,
  };
}

/**
 * Require admin access - throws if not admin
 */
export async function requireAdmin() {
  const admin = await isAdminServer();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}
