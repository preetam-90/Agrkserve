-- Add admin role types to user_roles table
-- This migration extends the existing user_roles to support granular admin permissions

-- Update the CHECK constraint to include new admin roles
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('renter', 'provider', 'labour', 'admin', 'super_admin', 'moderator', 'support_admin'));

-- Create an index for faster admin role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_admin 
ON public.user_roles(user_id, role) 
WHERE role IN ('admin', 'super_admin', 'moderator', 'support_admin');

-- Comment explaining the admin roles
COMMENT ON TABLE public.user_roles IS 'User roles including base roles (renter, provider, labour, admin) and granular admin roles (super_admin, moderator, support_admin)';
