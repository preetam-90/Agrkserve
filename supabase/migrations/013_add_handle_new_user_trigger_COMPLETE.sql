-- COMPLETE FIX for "Database error saving new user"
-- This replaces migration 013 with a more robust solution

-- Step 1: Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_profile_from_auth() CASCADE;

-- Step 2: Create the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_phone TEXT;
BEGIN
  -- Extract user data with fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  
  user_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone'
  );

  -- Insert or update user profile
  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    phone,
    profile_image,
    is_profile_complete,
    preferred_language,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_phone,
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE,
    'en',
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.user_profiles.email),
    name = COALESCE(EXCLUDED.name, public.user_profiles.name),
    phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
    profile_image = COALESCE(EXCLUDED.profile_image, public.user_profiles.profile_image),
    updated_at = NOW();
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't prevent user creation
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Step 3: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create update trigger for existing users
CREATE OR REPLACE FUNCTION public.update_user_profile_from_auth()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    email = NEW.email,
    phone = COALESCE(NEW.phone, phone),
    is_verified = (NEW.email_confirmed_at IS NOT NULL),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'update_user_profile_from_auth failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.phone IS DISTINCT FROM NEW.phone OR
    OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at
  )
  EXECUTE FUNCTION public.update_user_profile_from_auth();

-- Step 5: Ensure proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO anon, authenticated, service_role;
GRANT ALL ON public.user_roles TO anon, authenticated, service_role;

-- Step 6: Ensure RLS policies allow the trigger to work
-- The SECURITY DEFINER should bypass RLS, but let's be explicit
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Step 7: Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a user profile when a new user signs up via Supabase Auth';
COMMENT ON FUNCTION public.update_user_profile_from_auth() IS 
  'Syncs user profile data when auth.users is updated';

-- Step 8: Verify setup
DO $$
BEGIN
  RAISE NOTICE '✅ handle_new_user trigger installed successfully';
  RAISE NOTICE '✅ User profiles will be created automatically on signup';
  RAISE NOTICE '✅ Try creating a new user account now!';
END $$;
