-- Test the handle_new_user trigger
-- Run this in Supabase SQL Editor to debug

-- 1. Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 2. Check if function exists
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';

-- 3. Check RLS policies on user_profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'user_profiles';

-- 4. Check current user_profiles structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. Test manual insert (simulate what trigger does)
-- Replace 'test-uuid' with a real UUID from auth.users if needed
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    -- Try to insert a test profile
    INSERT INTO public.user_profiles (
        id,
        email,
        name,
        phone,
        is_profile_complete,
        preferred_language,
        is_verified,
        created_at,
        updated_at
    )
    VALUES (
        test_id,
        'test@example.com',
        'Test User',
        NULL,
        FALSE,
        'en',
        FALSE,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Test insert successful for ID: %', test_id;
    
    -- Clean up test data
    DELETE FROM public.user_profiles WHERE id = test_id;
    RAISE NOTICE 'Test data cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;
