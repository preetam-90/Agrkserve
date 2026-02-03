-- Helper script to grant admin access to a user
-- Replace 'your-user-email@example.com' with the actual user email

-- OPTION 1: Grant super_admin role (full permissions)
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'super_admin', true
FROM auth.users
WHERE email = 'your-user-email@example.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET is_active = true;

-- OPTION 2: Grant generic admin role (also gets super_admin permissions via fallback)
-- Uncomment if you prefer using the generic 'admin' role
-- INSERT INTO public.user_roles (user_id, role, is_active)
-- SELECT id, 'admin', true
-- FROM auth.users
-- WHERE email = 'your-user-email@example.com'
-- ON CONFLICT (user_id, role) 
-- DO UPDATE SET is_active = true;

-- Verify the role was set
SELECT 
  u.email,
  ur.role,
  ur.is_active,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'your-user-email@example.com'
  AND ur.role IN ('admin', 'super_admin', 'moderator', 'support_admin');
