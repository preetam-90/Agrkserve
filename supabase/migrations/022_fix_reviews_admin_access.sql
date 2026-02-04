-- Fix Reviews Admin Access
-- Add admin policies for reviews table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;

-- Create admin SELECT policy
CREATE POLICY "Admins can view all reviews"
    ON public.reviews FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND 'admin' = ANY(user_profiles.roles)
        )
        OR true  -- Keep existing "Anyone can view reviews" behavior
    );

-- Create admin DELETE policy
CREATE POLICY "Admins can delete reviews"
    ON public.reviews FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND 'admin' = ANY(user_profiles.roles)
        )
    );

-- Grant necessary permissions
GRANT SELECT, DELETE ON public.reviews TO authenticated;
