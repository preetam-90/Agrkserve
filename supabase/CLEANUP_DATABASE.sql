-- =====================================================
-- CLEANUP SCRIPT - Remove All AgriServe Database Objects
-- =====================================================
-- Run this FIRST if you need to start fresh
-- This will delete everything created by the setup script
-- ⚠️ WARNING: This will delete all data!
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS create_user_notification_preferences ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS enforce_phone_on_complete ON public.user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_location ON public.user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_equipment_location ON public.equipment;
DROP TRIGGER IF EXISTS update_equipment_updated_at ON public.equipment;
DROP TRIGGER IF EXISTS update_bookings_delivery_location ON public.bookings;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS labour_location_trigger ON public.labour_profiles;
DROP TRIGGER IF EXISTS labour_profiles_updated_at ON public.labour_profiles;
DROP TRIGGER IF EXISTS labour_bookings_updated_at ON public.labour_bookings;
DROP TRIGGER IF EXISTS update_labour_bookings_updated_at ON public.labour_bookings;

-- =====================================================
-- STEP 2: DROP ALL FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_profile_from_auth() CASCADE;
DROP FUNCTION IF EXISTS create_default_notification_preferences() CASCADE;
DROP FUNCTION IF EXISTS create_notification CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_notifications CASCADE;
DROP FUNCTION IF EXISTS get_unread_notification_count() CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read() CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_delivery_location_from_coordinates() CASCADE;
DROP FUNCTION IF EXISTS update_location_from_coordinates() CASCADE;
DROP FUNCTION IF EXISTS check_phone_before_complete() CASCADE;
DROP FUNCTION IF EXISTS update_last_login(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_labour_location_from_coordinates() CASCADE;
DROP FUNCTION IF EXISTS update_labour_updated_at() CASCADE;
DROP FUNCTION IF EXISTS search_labour_nearby CASCADE;
DROP FUNCTION IF EXISTS count_labour_nearby CASCADE;
DROP FUNCTION IF EXISTS create_labour_profile CASCADE;
DROP FUNCTION IF EXISTS update_labour_profile_with_location CASCADE;

-- =====================================================
-- STEP 3: DROP ALL TABLES (in reverse dependency order)
-- =====================================================

DROP TABLE IF EXISTS public.notification_delivery_log CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.labour_bookings CASCADE;
DROP TABLE IF EXISTS public.labour_profiles CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- =====================================================
-- STEP 4: DROP ALL CUSTOM TYPES
-- =====================================================

DROP TYPE IF EXISTS notification_delivery_channel CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS notification_category CASCADE;
DROP TYPE IF EXISTS labour_booking_status CASCADE;
DROP TYPE IF EXISTS labour_availability CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS equipment_category CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- =====================================================
-- STEP 5: DROP STORAGE POLICIES
-- =====================================================

-- Avatar storage policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Equipment images storage policies
DROP POLICY IF EXISTS "Authenticated users can upload equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their equipment images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their equipment images" ON storage.objects;

-- Equipment videos storage policies
DROP POLICY IF EXISTS "Authenticated users can upload equipment videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view equipment videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their equipment videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their equipment videos" ON storage.objects;

-- =====================================================
-- STEP 6: DELETE STORAGE BUCKETS
-- =====================================================

DELETE FROM storage.buckets WHERE id = 'avatars';
DELETE FROM storage.buckets WHERE id = 'equipment-images';
DELETE FROM storage.buckets WHERE id = 'equipment-videos';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                                ║';
  RAISE NOTICE '║   ✅ DATABASE CLEANUP COMPLETED!                               ║';
  RAISE NOTICE '║                                                                ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '🧹 All AgriServe database objects have been removed:';
  RAISE NOTICE '   ✓ All triggers dropped';
  RAISE NOTICE '   ✓ All functions dropped';
  RAISE NOTICE '   ✓ All tables dropped';
  RAISE NOTICE '   ✓ All custom types dropped';
  RAISE NOTICE '   ✓ All storage policies dropped';
  RAISE NOTICE '   ✓ All storage buckets deleted';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Step:';
  RAISE NOTICE '   → Run COMPLETE_DATABASE_SETUP.sql to recreate everything';
  RAISE NOTICE '';
END $$;
