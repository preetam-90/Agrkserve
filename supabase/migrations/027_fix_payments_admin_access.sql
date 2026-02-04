-- Fix admin access to payments table
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view related payments" ON public.payments;

-- Create new policy that allows admins to view all payments
CREATE POLICY "Users can view related payments"
    ON public.payments FOR SELECT
    USING (
        -- Allow admins to view all payments
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
        OR
        -- Allow users to view their own payments
        auth.uid() IN (
            SELECT renter_id FROM public.bookings WHERE id = booking_id
            UNION
            SELECT owner_id FROM public.equipment 
            WHERE id IN (SELECT equipment_id FROM public.bookings WHERE id = booking_id)
        )
    );

-- Also add admin policy for updates
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
CREATE POLICY "Admins can update payments"
    ON public.payments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Add admin policy for delete
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
CREATE POLICY "Admins can delete payments"
    ON public.payments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );
