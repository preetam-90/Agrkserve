-- Create trigger to automatically create user profile on signup
-- This was missing and causing "Database error saving new user"

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Extract name from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1) -- Use email username as fallback
  );

  -- Insert user profile
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
    NEW.id,
    NEW.email,
    user_name,
    NEW.phone, -- Can be NULL initially
    FALSE, -- Profile not complete until phone is added
    'en',
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(public.user_profiles.name, EXCLUDED.name),
    phone = COALESCE(public.user_profiles.phone, EXCLUDED.phone),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.user_roles TO anon, authenticated;

-- Ensure the trigger function can bypass RLS
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = public;

-- Create a function for updating user profile from auth metadata
CREATE OR REPLACE FUNCTION public.update_user_profile_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    email = NEW.email,
    name = COALESCE(
      name,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    phone = COALESCE(phone, NEW.phone),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile when auth.users is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profile_from_auth();

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user profile when a new user signs up';
COMMENT ON FUNCTION public.update_user_profile_from_auth() IS 'Updates user profile when auth.users is updated';
