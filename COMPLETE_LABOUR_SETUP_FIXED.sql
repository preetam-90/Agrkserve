-- ============================================================================
-- COMPLETE LABOUR PROFILE SETUP (WITH CLEANUP)
-- ============================================================================
-- This script will:
-- 1. Clean up any existing labour functions
-- 2. Create/update tables
-- 3. Create all necessary functions
-- 4. Set up security policies
-- ============================================================================

-- STEP 1: CLEANUP
-- ============================================================================
DO $$ 
BEGIN
    -- Drop functions with CASCADE to remove dependencies
    DROP FUNCTION IF EXISTS search_labour_nearby CASCADE;
    DROP FUNCTION IF EXISTS count_labour_nearby CASCADE;
    DROP FUNCTION IF EXISTS create_labour_profile CASCADE;
    DROP FUNCTION IF EXISTS update_labour_profile_with_location CASCADE;
    
    RAISE NOTICE 'Cleanup completed';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup had some errors (this is usually okay): %', SQLERRM;
END $$;

-- STEP 2: CREATE TYPES
-- ============================================================================
DO $$ 
BEGIN
    CREATE TYPE labour_availability AS ENUM ('available', 'busy', 'unavailable');
    RAISE NOTICE 'Created labour_availability type';
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'labour_availability type already exists';
END $$;

-- STEP 3: CREATE TABLES
-- ============================================================================

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
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: CREATE INDEXES
-- ============================================================================

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

-- STEP 5: CREATE HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_labour_location_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_labour_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: CREATE TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS labour_location_trigger ON public.labour_profiles;
CREATE TRIGGER labour_location_trigger
    BEFORE INSERT OR UPDATE OF latitude, longitude ON public.labour_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_labour_location_from_coordinates();

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

-- STEP 7: CREATE RPC FUNCTIONS
-- ============================================================================

-- Function to create labour profile
CREATE FUNCTION create_labour_profile(
    p_user_id UUID,
    p_skills TEXT[],
    p_experience_years INTEGER,
    p_daily_rate NUMERIC,
    p_hourly_rate NUMERIC DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_service_radius_km INTEGER DEFAULT 50,
    p_bio TEXT DEFAULT NULL,
    p_certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_latitude DOUBLE PRECISION DEFAULT NULL,
    p_longitude DOUBLE PRECISION DEFAULT NULL
)
RETURNS public.labour_profiles AS $$
DECLARE
    new_profile public.labour_profiles;
BEGIN
    INSERT INTO public.labour_profiles (
        user_id,
        skills,
        experience_years,
        daily_rate,
        hourly_rate,
        location_name,
        service_radius_km,
        bio,
        certifications,
        latitude,
        longitude,
        availability,
        is_active
    ) VALUES (
        p_user_id,
        p_skills,
        p_experience_years,
        p_daily_rate,
        p_hourly_rate,
        COALESCE(p_city, p_address),
        p_service_radius_km,
        p_bio,
        p_certifications,
        p_latitude,
        p_longitude,
        'available'::labour_availability,
        true
    )
    RETURNING * INTO new_profile;
    
    RETURN new_profile;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Function to update labour profile
CREATE FUNCTION update_labour_profile_with_location(
    p_labour_id UUID,
    p_skills TEXT[] DEFAULT NULL,
    p_experience_years INTEGER DEFAULT NULL,
    p_daily_rate NUMERIC DEFAULT NULL,
    p_hourly_rate NUMERIC DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_service_radius_km INTEGER DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_certifications TEXT[] DEFAULT NULL,
    p_availability labour_availability DEFAULT NULL,
    p_latitude DOUBLE PRECISION DEFAULT NULL,
    p_longitude DOUBLE PRECISION DEFAULT NULL
)
RETURNS public.labour_profiles AS $$
DECLARE
    updated_profile public.labour_profiles;
BEGIN
    UPDATE public.labour_profiles
    SET
        skills = COALESCE(p_skills, skills),
        experience_years = COALESCE(p_experience_years, experience_years),
        daily_rate = COALESCE(p_daily_rate, daily_rate),
        hourly_rate = COALESCE(p_hourly_rate, hourly_rate),
        location_name = COALESCE(COALESCE(p_city, p_address), location_name),
        service_radius_km = COALESCE(p_service_radius_km, service_radius_km),
        bio = COALESCE(p_bio, bio),
        certifications = COALESCE(p_certifications, certifications),
        availability = COALESCE(p_availability, availability),
        latitude = COALESCE(p_latitude, latitude),
        longitude = COALESCE(p_longitude, longitude),
        updated_at = NOW()
    WHERE id = p_labour_id
    RETURNING * INTO updated_profile;
    
    RETURN updated_profile;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Function to search labour nearby
CREATE FUNCTION search_labour_nearby(
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_km INTEGER DEFAULT 50,
    p_skills TEXT[] DEFAULT NULL,
    p_min_rate NUMERIC DEFAULT NULL,
    p_max_rate NUMERIC DEFAULT NULL,
    p_availability labour_availability DEFAULT NULL,
    p_min_experience INTEGER DEFAULT NULL,
    p_min_rating NUMERIC DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    skills TEXT[],
    experience_years INTEGER,
    daily_rate NUMERIC,
    hourly_rate NUMERIC,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    service_radius_km INTEGER,
    bio TEXT,
    certifications TEXT[],
    availability labour_availability,
    average_rating NUMERIC,
    review_count INTEGER,
    total_jobs INTEGER,
    is_verified BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    distance_km NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lp.id,
        lp.user_id,
        lp.skills,
        lp.experience_years,
        lp.daily_rate,
        lp.hourly_rate,
        lp.location_name,
        lp.latitude,
        lp.longitude,
        lp.service_radius_km,
        lp.bio,
        lp.certifications,
        lp.availability,
        lp.average_rating,
        lp.review_count,
        lp.total_jobs,
        lp.is_verified,
        lp.is_active,
        lp.created_at,
        lp.updated_at,
        ROUND(ST_Distance(
            lp.location,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
        ) / 1000, 2) as distance_km
    FROM public.labour_profiles lp
    WHERE 
        lp.is_active = true
        AND (p_availability IS NULL OR lp.availability = p_availability)
        AND (p_skills IS NULL OR lp.skills && p_skills)
        AND (p_min_rate IS NULL OR lp.daily_rate >= p_min_rate)
        AND (p_max_rate IS NULL OR lp.daily_rate <= p_max_rate)
        AND (p_min_experience IS NULL OR lp.experience_years >= p_min_experience)
        AND (p_min_rating IS NULL OR lp.average_rating >= p_min_rating)
        AND (p_search_query IS NULL OR 
             lp.bio ILIKE '%' || p_search_query || '%' OR
             lp.location_name ILIKE '%' || p_search_query || '%')
        AND ST_DWithin(
            lp.location,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
            p_radius_km * 1000
        )
    ORDER BY distance_km ASC, lp.average_rating DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to count labour nearby
CREATE FUNCTION count_labour_nearby(
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_km INTEGER DEFAULT 50,
    p_skills TEXT[] DEFAULT NULL,
    p_min_rate NUMERIC DEFAULT NULL,
    p_max_rate NUMERIC DEFAULT NULL,
    p_availability labour_availability DEFAULT NULL,
    p_min_experience INTEGER DEFAULT NULL,
    p_min_rating NUMERIC DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO result_count
    FROM public.labour_profiles lp
    WHERE 
        lp.is_active = true
        AND (p_availability IS NULL OR lp.availability = p_availability)
        AND (p_skills IS NULL OR lp.skills && p_skills)
        AND (p_min_rate IS NULL OR lp.daily_rate >= p_min_rate)
        AND (p_max_rate IS NULL OR lp.daily_rate <= p_max_rate)
        AND (p_min_experience IS NULL OR lp.experience_years >= p_min_experience)
        AND (p_min_rating IS NULL OR lp.average_rating >= p_min_rating)
        AND (p_search_query IS NULL OR 
             lp.bio ILIKE '%' || p_search_query || '%' OR
             lp.location_name ILIKE '%' || p_search_query || '%')
        AND ST_DWithin(
            lp.location,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
            p_radius_km * 1000
        );
    
    RETURN result_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- STEP 8: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.labour_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active labour profiles" ON public.labour_profiles;
DROP POLICY IF EXISTS "Users can manage own labour profile" ON public.labour_profiles;
DROP POLICY IF EXISTS "Labour can view their bookings" ON public.labour_bookings;
DROP POLICY IF EXISTS "Employers can create bookings" ON public.labour_bookings;
DROP POLICY IF EXISTS "Participants can update bookings" ON public.labour_bookings;

-- Create policies
CREATE POLICY "Anyone can view active labour profiles"
    ON public.labour_profiles FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can manage own labour profile"
    ON public.labour_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Labour can view their bookings"
    ON public.labour_bookings FOR SELECT
    USING (
        auth.uid() = employer_id OR 
        auth.uid() IN (SELECT user_id FROM public.labour_profiles WHERE id = labour_id)
    );

CREATE POLICY "Employers can create bookings"
    ON public.labour_bookings FOR INSERT
    WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Participants can update bookings"
    ON public.labour_bookings FOR UPDATE
    USING (
        auth.uid() = employer_id OR 
        auth.uid() IN (SELECT user_id FROM public.labour_profiles WHERE id = labour_id)
    );

-- STEP 9: GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON public.labour_profiles TO anon, authenticated;
GRANT ALL ON public.labour_bookings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_labour_nearby TO anon, authenticated;
GRANT EXECUTE ON FUNCTION count_labour_nearby TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_labour_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_labour_profile_with_location TO authenticated;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE '✅ Labour profile setup completed successfully!';
    RAISE NOTICE 'Tables: labour_profiles, labour_bookings';
    RAISE NOTICE 'Functions: create_labour_profile, update_labour_profile_with_location, search_labour_nearby, count_labour_nearby';
    RAISE NOTICE 'You can now create labour profiles at /provider/labour/create';
END $$;
