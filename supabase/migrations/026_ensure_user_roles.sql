-- Migration: Ensure all users have at least one role
-- This migration ensures backward compatibility by assigning default 'renter' role
-- to any users who don't have any active roles

-- Insert default 'renter' role for users without any active roles
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT 
    u.id,
    'renter'::text,
    true
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = u.id 
    AND ur.is_active = true
)
ON CONFLICT (user_id, role) DO UPDATE
SET is_active = true;

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_active 
ON public.user_roles(user_id, is_active) 
WHERE is_active = true;

-- Add comment
COMMENT ON TABLE public.user_roles IS 'Stores user roles with support for multiple active roles per user';
