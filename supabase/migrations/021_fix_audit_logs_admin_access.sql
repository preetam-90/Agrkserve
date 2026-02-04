-- Fix audit_logs RLS policies to allow admin access
-- This migration adds a policy for admins to view all audit logs

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;

-- Create new policies
-- 1. Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- 2. Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Update the insert policy to allow service role and authenticated users
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert audit logs"
    ON public.audit_logs
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Add comment
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all system actions. Admins can view all logs, users can view their own logs.';
