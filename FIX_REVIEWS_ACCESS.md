# Fix Reviews Admin Access

## Problem
The admin reviews page shows an error because RLS (Row Level Security) is enabled on the reviews table, but there are no admin policies for SELECT and DELETE operations.

## Solution

### 1. Apply the Migration

Run this SQL in your Supabase SQL Editor:

```sql
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
            AND user_profiles.role = 'admin'
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
            AND user_profiles.role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT SELECT, DELETE ON public.reviews TO authenticated;
```

### 2. Verify Your Admin Role

Make sure your user has the admin role:

```sql
SELECT id, email, role FROM public.user_profiles WHERE id = auth.uid();
```

If your role is not 'admin', update it:

```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE id = auth.uid();
```

### 3. Test the Reviews Page

1. Navigate to `/admin/reviews`
2. You should now see all reviews
3. Try deleting a review to verify the DELETE policy works

## Changes Made

### Database Migration
- Created `supabase/migrations/022_fix_reviews_admin_access.sql`
- Added admin SELECT policy (allows admins to view all reviews)
- Added admin DELETE policy (allows admins to delete reviews)
- Granted necessary permissions to authenticated users

### Code Improvements
- Added error state to show helpful error messages
- Improved error handling with specific error messages
- Added retry button when errors occur
- Removed duplicate rating filter 