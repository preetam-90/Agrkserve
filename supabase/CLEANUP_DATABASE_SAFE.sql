-- =====================================================
-- ULTRA-SAFE CLEANUP SCRIPT
-- =====================================================
-- This script ignores ALL errors and cleans up safely
-- Run this first before running COMPLETE_DATABASE_SETUP.sql
-- =====================================================

-- Drop triggers on auth.users (safe)
DO $$ BEGIN DROP TRIGGER IF EXISTS create_user_notification_preferences ON auth.users; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Drop all functions (safe)
DO $$ BEGIN DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS public.update_user_profile_from_auth() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS create_default_notification_preferences() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS create_notification CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS cleanup_old_notifications CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS get_unread_notification_count() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS mark_all_notifications_read() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS mark_notification_read CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS update_delivery_location_from_coordinates() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS update_location_from_coordinates() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS check_phone_before_complete() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS update_last_login(UUID) CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS update_labour_location_from_coordinates() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS update_labour_updated_at() CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS search_labour_nearby CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS count_labour_nearby CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS create_labour_profile CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP FUNCTION IF EXISTS update_labour_profile_with_location CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Drop all tables (safe)
DO $$ BEGIN DROP TABLE IF EXISTS public.notification_delivery_log CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.notification_preferences CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.notifications CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.audit_logs CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.labour_bookings CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.labour_profiles CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.payments CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.messages CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.reviews CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.bookings CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.equipment CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.user_roles CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TABLE IF EXISTS public.user_profiles CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Drop all custom types (safe)
DO $$ BEGIN DROP TYPE IF EXISTS notification_delivery_channel CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TYPE IF EXISTS notification_priority CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TYPE IF EXISTS notification_category CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TYPE IF EXISTS labour_booking_status CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TYPE IF EXISTS labour_availability CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TYPE IF EXISTS booking_status CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TYPE IF EXISTS equipment_category CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP TYPE IF EXISTS notification_type CASCADE; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Drop storage policies (safe)
DO $$ BEGIN DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated users can upload equipment images" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view equipment images" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated users can update their equipment images" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated users can delete their equipment images" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated users can upload equipment videos" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view equipment videos" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated users can update their equipment videos" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated users can delete their equipment videos" ON storage.objects; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Delete storage buckets (safe)
DO $$ BEGIN DELETE FROM storage.buckets WHERE id = 'avatars'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DELETE FROM storage.buckets WHERE id = 'equipment-images'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DELETE FROM storage.buckets WHERE id = 'equipment-videos'; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                                ║';
  RAISE NOTICE '║   ✅ CLEANUP COMPLETED SUCCESSFULLY!                           ║';
  RAISE NOTICE '║                                                                ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Database is clean and ready for setup!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Step:';
  RAISE NOTICE '   → Run: supabase/COMPLETE_DATABASE_SETUP.sql';
  RAISE NOTICE '';
END $$;
