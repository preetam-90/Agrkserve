-- Add phone number validation and make it mandatory
-- Update user_profiles table to enforce phone number

-- Add constraint to make phone not null (but we'll handle this in app logic for existing users)
-- We won't add NOT NULL constraint directly to avoid breaking existing data
-- Instead, we'll use a check at the application level

-- Add a trigger to ensure phone is set before profile is marked complete
CREATE OR REPLACE FUNCTION check_phone_before_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_profile_complete = TRUE AND (NEW.phone IS NULL OR NEW.phone = '') THEN
    RAISE EXCEPTION 'Phone number is required before profile can be marked complete';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_phone_on_complete ON public.user_profiles;
CREATE TRIGGER enforce_phone_on_complete
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_phone_before_complete();

-- Add last_login field to track user activity
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add function to update last login
CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles 
  SET last_login = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_last_login(UUID) TO authenticated;
