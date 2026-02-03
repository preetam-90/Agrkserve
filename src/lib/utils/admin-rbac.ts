/**
 * Admin RBAC (Role-Based Access Control) Utilities
 * Server-side role checking for admin operations
 */

import { createClient } from '@/lib/supabase/server';
import type { AdminRole, AdminPermissions } from '@/lib/types/cloudinary-admin';
import { ROLE_PERMISSIONS } from '@/lib/types/cloudinary-admin';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  profile?: {
    name?: string;
    profile_image?: string;
  };
}

/**
 * Get the current admin user with their role
 */
export async function getAdminUserWithRole(): Promise<AdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Get user role from user_roles table
  // First try specific admin roles, then fall back to generic 'admin' role
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role, is_active')
    .eq('user_id', user.id)
    .in('role', ['super_admin', 'moderator', 'support_admin', 'admin'])
    .eq('is_active', true)
    .order('role', { ascending: true }) // Prioritize super_admin > moderator > support_admin > admin
    .limit(1)
    .single();

  if (roleError || !roleData) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name, profile_image')
    .eq('id', user.id)
    .single();

  // Map generic 'admin' role to 'super_admin' for backward compatibility
  const mappedRole = roleData.role === 'admin' ? 'super_admin' : roleData.role;

  return {
    id: user.id,
    email: user.email || '',
    role: mappedRole as AdminRole,
    isActive: roleData.is_active,
    profile: profile || undefined,
  };
}

/**
 * Check if user has specific permission
 */
export async function checkPermission(
  permission: keyof AdminPermissions
): Promise<{ allowed: boolean; user: AdminUser | null }> {
  const user = await getAdminUserWithRole();

  if (!user || !user.isActive) {
    return { allowed: false, user: null };
  }

  const permissions = ROLE_PERMISSIONS[user.role];
  return { allowed: permissions[permission], user };
}

/**
 * Require specific permission - throws if not allowed
 */
export async function requirePermission(permission: keyof AdminPermissions): Promise<AdminUser> {
  const { allowed, user } = await checkPermission(permission);

  if (!allowed || !user) {
    throw new Error(`Unauthorized: ${permission} permission required`);
  }

  return user;
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getAdminUserWithRole();
  return user?.role === 'super_admin' && user.isActive;
}

/**
 * Check if user can perform destructive operations
 */
export async function canPerformDestructiveOperations(): Promise<boolean> {
  const { allowed } = await checkPermission('canDeleteMedia');
  return allowed;
}

/**
 * Get all admin users
 */
export async function getAllAdmins(): Promise<AdminUser[]> {
  const supabase = await createClient();

  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('user_id, role, is_active')
    .in('role', ['super_admin', 'moderator', 'support_admin', 'admin'])
    .eq('is_active', true);

  if (error || !roles) {
    return [];
  }

  const admins: AdminUser[] = [];

  for (const role of roles) {
    const { data: user } = await supabase.auth.admin.getUserById(role.user_id);
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name, profile_image')
      .eq('id', role.user_id)
      .single();

    if (user?.user) {
      // Map generic 'admin' role to 'super_admin' for backward compatibility
      const mappedRole = role.role === 'admin' ? 'super_admin' : role.role;

      admins.push({
        id: user.user.id,
        email: user.user.email || '',
        role: mappedRole as AdminRole,
        isActive: role.is_active,
        profile: profile || undefined,
      });
    }
  }

  return admins;
}

/**
 * Middleware helper for API routes
 * Returns 403 if permission check fails
 */
export async function withPermission<T>(
  permission: keyof AdminPermissions,
  handler: (user: AdminUser) => Promise<T>
): Promise<T> {
  const { allowed, user } = await checkPermission(permission);

  if (!allowed || !user) {
    throw new Error(`Forbidden: ${permission} permission required`);
  }

  return handler(user);
}
