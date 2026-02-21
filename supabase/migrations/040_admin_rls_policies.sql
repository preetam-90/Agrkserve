-- ============================================================================
-- Migration: Admin RLS Policies
-- Description: Add admin access policies for all tables to enable admin panel
-- Created: 2026-02-21
-- ============================================================================

-- ============================================================================
-- 1. USER_PROFILES - Admin Access
-- ============================================================================

-- Admins can view all user profiles (already public, but explicit)
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all user profiles"
    ON public.user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- Admins can update any user profile
DROP POLICY IF EXISTS "Admins can update any user profile" ON public.user_profiles;
CREATE POLICY "Admins can update any user profile"
    ON public.user_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- Admins can insert user profiles
DROP POLICY IF EXISTS "Admins can insert user profiles" ON public.user_profiles;
CREATE POLICY "Admins can insert user profiles"
    ON public.user_profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- ============================================================================
-- 2. USER_ROLES - Admin Access
-- ============================================================================

-- Admins can view all user roles (already public, but explicit)
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles"
    ON public.user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND ur.is_active = true
        )
    );

-- Admins can insert any user role
DROP POLICY IF EXISTS "Admins can insert any user role" ON public.user_roles;
CREATE POLICY "Admins can insert any user role"
    ON public.user_roles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND ur.is_active = true
        )
    );

-- Admins can update any user role
DROP POLICY IF EXISTS "Admins can update any user role" ON public.user_roles;
CREATE POLICY "Admins can update any user role"
    ON public.user_roles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND ur.is_active = true
        )
    );

-- Admins can delete any user role
DROP POLICY IF EXISTS "Admins can delete any user role" ON public.user_roles;
CREATE POLICY "Admins can delete any user role"
    ON public.user_roles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'super_admin')
            AND ur.is_active = true
        )
    );

-- ============================================================================
-- 3. EQUIPMENT - Admin Access
-- ============================================================================

-- Admins can view all equipment
DROP POLICY IF EXISTS "Admins can view all equipment" ON public.equipment;
CREATE POLICY "Admins can view all equipment"
    ON public.equipment FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- Admins can insert equipment
DROP POLICY IF EXISTS "Admins can insert equipment" ON public.equipment;
CREATE POLICY "Admins can insert equipment"
    ON public.equipment FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Admins can update any equipment
DROP POLICY IF EXISTS "Admins can update any equipment" ON public.equipment;
CREATE POLICY "Admins can update any equipment"
    ON public.equipment FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator')
            AND is_active = true
        )
    );

-- Admins can delete any equipment
DROP POLICY IF EXISTS "Admins can delete any equipment" ON public.equipment;
CREATE POLICY "Admins can delete any equipment"
    ON public.equipment FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- ============================================================================
-- 4. LABOUR_PROFILES - Admin Access (if table exists)
-- ============================================================================

-- Check if labour_profiles table exists and add policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'labour_profiles') THEN
        -- Admins can view all labour profiles
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view all labour profiles" ON public.labour_profiles';
        EXECUTE 'CREATE POLICY "Admins can view all labour profiles"
            ON public.labour_profiles FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid()
                    AND role IN (''admin'', ''super_admin'', ''moderator'', ''support_admin'')
                    AND is_active = true
                )
            )';

        -- Admins can insert labour profiles
        EXECUTE 'DROP POLICY IF EXISTS "Admins can insert labour profiles" ON public.labour_profiles';
        EXECUTE 'CREATE POLICY "Admins can insert labour profiles"
            ON public.labour_profiles FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid()
                    AND role IN (''admin'', ''super_admin'')
                    AND is_active = true
                )
            )';

        -- Admins can update any labour profile
        EXECUTE 'DROP POLICY IF EXISTS "Admins can update any labour profile" ON public.labour_profiles';
        EXECUTE 'CREATE POLICY "Admins can update any labour profile"
            ON public.labour_profiles FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid()
                    AND role IN (''admin'', ''super_admin'', ''moderator'')
                    AND is_active = true
                )
            )';

        -- Admins can delete any labour profile
        EXECUTE 'DROP POLICY IF EXISTS "Admins can delete any labour profile" ON public.labour_profiles';
        EXECUTE 'CREATE POLICY "Admins can delete any labour profile"
            ON public.labour_profiles FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid()
                    AND role IN (''admin'', ''super_admin'')
                    AND is_active = true
                )
            )';
    END IF;
END $$;

-- ============================================================================
-- 5. BOOKINGS - Admin Access
-- ============================================================================

-- Admins can view all bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings"
    ON public.bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- Admins can insert bookings
DROP POLICY IF EXISTS "Admins can insert bookings" ON public.bookings;
CREATE POLICY "Admins can insert bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Admins can update any booking
DROP POLICY IF EXISTS "Admins can update any booking" ON public.bookings;
CREATE POLICY "Admins can update any booking"
    ON public.bookings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- Admins can delete any booking
DROP POLICY IF EXISTS "Admins can delete any booking" ON public.bookings;
CREATE POLICY "Admins can delete any booking"
    ON public.bookings FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- ============================================================================
-- 6. PAYMENTS - Admin Access
-- ============================================================================

-- Admins can view all payments
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'support_admin')
            AND is_active = true
        )
    );

-- Admins can insert payments
DROP POLICY IF EXISTS "Admins can insert payments" ON public.payments;
CREATE POLICY "Admins can insert payments"
    ON public.payments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Admins can update any payment
DROP POLICY IF EXISTS "Admins can update any payment" ON public.payments;
CREATE POLICY "Admins can update any payment"
    ON public.payments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- ============================================================================
-- 7. REVIEWS - Admin Access
-- ============================================================================

-- Admins can view all reviews (already public, but explicit)
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
CREATE POLICY "Admins can view all reviews"
    ON public.reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- Admins can insert reviews
DROP POLICY IF EXISTS "Admins can insert reviews" ON public.reviews;
CREATE POLICY "Admins can insert reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Admins can update any review
DROP POLICY IF EXISTS "Admins can update any review" ON public.reviews;
CREATE POLICY "Admins can update any review"
    ON public.reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator')
            AND is_active = true
        )
    );

-- Admins can delete any review
DROP POLICY IF EXISTS "Admins can delete any review" ON public.reviews;
CREATE POLICY "Admins can delete any review"
    ON public.reviews FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator')
            AND is_active = true
        )
    );

-- ============================================================================
-- 8. MESSAGES - Admin Access
-- ============================================================================

-- Admins can view all messages
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- Admins can insert messages
DROP POLICY IF EXISTS "Admins can insert messages" ON public.messages;
CREATE POLICY "Admins can insert messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
            AND is_active = true
        )
    );

-- Admins can update any message
DROP POLICY IF EXISTS "Admins can update any message" ON public.messages;
CREATE POLICY "Admins can update any message"
    ON public.messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator')
            AND is_active = true
        )
    );

-- ============================================================================
-- 9. NOTIFICATIONS - Admin Access
-- ============================================================================

-- Admins can view all notifications
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications"
    ON public.notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Admins can insert notifications
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- Admins can update any notification
DROP POLICY IF EXISTS "Admins can update any notification" ON public.notifications;
CREATE POLICY "Admins can update any notification"
    ON public.notifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
            AND is_active = true
        )
    );

-- ============================================================================
-- 10. Helper Function to Check Admin Status
-- ============================================================================

-- Create a helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'moderator', 'support_admin')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a helper function to check if a user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;

-- ============================================================================
-- Completion Notice
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Admin RLS policies created successfully';
    RAISE NOTICE '   - user_profiles: SELECT, INSERT, UPDATE';
    RAISE NOTICE '   - user_roles: SELECT, INSERT, UPDATE, DELETE';
    RAISE NOTICE '   - equipment: SELECT, INSERT, UPDATE, DELETE';
    RAISE NOTICE '   - labour_profiles: SELECT, INSERT, UPDATE, DELETE (if exists)';
    RAISE NOTICE '   - bookings: SELECT, INSERT, UPDATE, DELETE';
    RAISE NOTICE '   - payments: SELECT, INSERT, UPDATE';
    RAISE NOTICE '   - reviews: SELECT, INSERT, UPDATE, DELETE';
    RAISE NOTICE '   - messages: SELECT, INSERT, UPDATE';
    RAISE NOTICE '   - notifications: SELECT, INSERT, UPDATE';
    RAISE NOTICE '';
    RAISE NOTICE '   Helper functions created:';
    RAISE NOTICE '   - is_admin(): Check if user has admin role';
    RAISE NOTICE '   - is_super_admin(): Check if user is super_admin';
END $$;