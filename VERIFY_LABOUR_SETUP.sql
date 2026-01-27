-- ============================================================================
-- VERIFY LABOUR PROFILE SETUP
-- ============================================================================
-- Run this in Supabase SQL Editor to verify everything is set up correctly
-- ============================================================================

-- Check 1: Verify labour_profiles table exists
SELECT 
    'labour_profiles table' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'labour_profiles'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check 2: Verify labour_bookings table exists
SELECT 
    'labour_bookings table' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'labour_bookings'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check 3: Verify create_labour_profile function exists
SELECT 
    'create_labour_profile function' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = 'create_labour_profile'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check 4: Verify search_labour_nearby function exists
SELECT 
    'search_labour_nearby function' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = 'search_labour_nearby'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check 5: Verify update_labour_profile_with_location function exists
SELECT 
    'update_labour_profile_with_location function' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = 'update_labour_profile_with_location'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check 6: Verify count_labour_nearby function exists
SELECT 
    'count_labour_nearby function' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = 'count_labour_nearby'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check 7: Count existing labour profiles
SELECT 
    'Existing labour profiles' as check_name,
    COUNT(*)::text || ' profiles' as status
FROM public.labour_profiles;

-- Check 8: Verify RLS is enabled
SELECT 
    'RLS on labour_profiles' as check_name,
    CASE 
        WHEN relrowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as status
FROM pg_class
WHERE relname = 'labour_profiles';

SELECT 
    'RLS on labour_bookings' as check_name,
    CASE 
        WHEN relrowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as status
FROM pg_class
WHERE relname = 'labour_bookings';

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- If all checks show ✅, your labour profile system is ready!
-- If any show ❌, run SETUP_LABOUR_NOW.sql
-- ============================================================================
