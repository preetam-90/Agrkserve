-- ============================================================================
-- CLEANUP EXISTING LABOUR FUNCTIONS
-- ============================================================================
-- Run this FIRST to remove any existing labour functions
-- Then run SETUP_LABOUR_NOW.sql
-- ============================================================================

-- Drop all existing labour-related functions
DROP FUNCTION IF EXISTS search_labour_nearby CASCADE;
DROP FUNCTION IF EXISTS count_labour_nearby CASCADE;
DROP FUNCTION IF EXISTS create_labour_profile CASCADE;
DROP FUNCTION IF EXISTS update_labour_profile_with_location CASCADE;

-- Drop triggers (they will be recreated)
DROP TRIGGER IF EXISTS labour_location_trigger ON public.labour_profiles;
DROP TRIGGER IF EXISTS labour_profiles_updated_at ON public.labour_profiles;
DROP TRIGGER IF EXISTS labour_bookings_updated_at ON public.labour_bookings;

-- ============================================================================
-- CLEANUP COMPLETE!
-- ============================================================================
-- Now run SETUP_LABOUR_NOW.sql to create everything fresh
-- ============================================================================
