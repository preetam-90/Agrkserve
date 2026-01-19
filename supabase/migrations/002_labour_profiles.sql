-- Labour Profiles Schema
-- Run this in your Supabase SQL Editor after 001_initial_schema.sql

-- Labour Availability Type
DO $$ BEGIN
    CREATE TYPE labour_availability AS ENUM ('available', 'busy', 'unavailable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Labour Profiles Table
CREATE TABLE IF NOT EXISTS public.labour_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 0,
    daily_rate NUMERIC NOT NULL,
    hourly_rate NUMERIC,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    service_radius_km INTEGER DEFAULT 50,
    bio TEXT,
    certifications TEXT[] DEFAULT '{}',
    availability labour_availability DEFAULT 'available',
    average_rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Labour Booking Status (reuse booking_status if it exists)
-- Labour Bookings Table
CREATE TABLE IF NOT EXISTS public.labour_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    labour_id UUID NOT NULL REFERENCES public.labour_profiles(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_labour_profiles_user_id ON public.labour_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_labour_profiles_availability ON public.labour_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_labour_profiles_skills ON public.labour_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_labour_profiles_location ON public.labour_profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_labour_profiles_daily_rate ON public.labour_profiles(daily_rate);
CREATE INDEX IF NOT EXISTS idx_labour_profiles_rating ON public.labour_profiles(average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_labour_bookings_labour_id ON public.labour_bookings(labour_id);
CREATE INDEX IF NOT EXISTS idx_labour_bookings_employer_id ON public.labour_bookings(employer_id);
CREATE INDEX IF NOT EXISTS idx_labour_bookings_status ON public.labour_bookings(status);
CREATE INDEX IF NOT EXISTS idx_labour_bookings_dates ON public.labour_bookings(start_date, end_date);

-- Function to update location from coordinates
CREATE OR REPLACE FUNCTION update_labour_location_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update location
DROP TRIGGER IF EXISTS labour_location_trigger ON public.labour_profiles;
CREATE TRIGGER labour_location_trigger
    BEFORE INSERT OR UPDATE OF latitude, longitude ON public.labour_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_labour_location_from_coordinates();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_labour_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS labour_profiles_updated_at ON public.labour_profiles;
CREATE TRIGGER labour_profiles_updated_at
    BEFORE UPDATE ON public.labour_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_labour_updated_at();

DROP TRIGGER IF EXISTS labour_bookings_updated_at ON public.labour_bookings;
CREATE TRIGGER labour_bookings_updated_at
    BEFORE UPDATE ON public.labour_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_labour_updated_at();

-- Enable Row Level Security
ALTER TABLE public.labour_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for labour_profiles
DROP POLICY IF EXISTS "Anyone can view active labour profiles" ON public.labour_profiles;
CREATE POLICY "Anyone can view active labour profiles"
    ON public.labour_profiles FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Users can manage own labour profile" ON public.labour_profiles;
CREATE POLICY "Users can manage own labour profile"
    ON public.labour_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for labour_bookings
DROP POLICY IF EXISTS "Labour can view their bookings" ON public.labour_bookings;
CREATE POLICY "Labour can view their bookings"
    ON public.labour_bookings FOR SELECT
    USING (
        auth.uid() = employer_id OR 
        auth.uid() IN (SELECT user_id FROM public.labour_profiles WHERE id = labour_id)
    );

DROP POLICY IF EXISTS "Employers can create bookings" ON public.labour_bookings;
CREATE POLICY "Employers can create bookings"
    ON public.labour_bookings FOR INSERT
    WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Participants can update bookings" ON public.labour_bookings;
CREATE POLICY "Participants can update bookings"
    ON public.labour_bookings FOR UPDATE
    USING (
        auth.uid() = employer_id OR 
        auth.uid() IN (SELECT user_id FROM public.labour_profiles WHERE id = labour_id)
    );

-- Grant permissions
GRANT ALL ON public.labour_profiles TO anon, authenticated;
GRANT ALL ON public.labour_bookings TO anon, authenticated;

-- Insert some sample labour profiles for testing (optional)
-- Uncomment to add test data
/*
INSERT INTO public.labour_profiles (user_id, skills, experience_years, daily_rate, hourly_rate, location_name, latitude, longitude, bio, availability, is_verified)
SELECT 
    id as user_id,
    ARRAY['harvesting', 'plowing', 'irrigation']::text[] as skills,
    5 as experience_years,
    500 as daily_rate,
    75 as hourly_rate,
    'Sample Location' as location_name,
    28.6139 as latitude,
    77.2090 as longitude,
    'Experienced farm worker with 5 years of experience.' as bio,
    'available'::labour_availability as availability,
    true as is_verified
FROM auth.users
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;
*/
