-- Labour RPC Functions for Geospatial Search
-- Run this in your Supabase SQL Editor after 002_labour_profiles.sql

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function to search nearby labour profiles
CREATE OR REPLACE FUNCTION search_labour_nearby(
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_km INTEGER,
    p_skills TEXT[] DEFAULT NULL,
    p_min_rate NUMERIC DEFAULT NULL,
    p_max_rate NUMERIC DEFAULT NULL,
    p_availability TEXT DEFAULT NULL,
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
    location GEOGRAPHY,
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
    distance_km DOUBLE PRECISION
) AS $$
DECLARE
    search_point GEOGRAPHY;
BEGIN
    -- Create point from coordinates
    search_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;
    
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
        lp.location,
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
        ROUND(ST_Distance(lp.location, search_point)::numeric / 1000, 2) as distance_km
    FROM public.labour_profiles lp
    WHERE 
        lp.is_active = true
        AND (lp.location IS NULL OR ST_DWithin(lp.location, search_point, p_radius_km * 1000))
        AND (p_skills IS NULL OR lp.skills && p_skills)
        AND (p_min_rate IS NULL OR lp.daily_rate >= p_min_rate)
        AND (p_max_rate IS NULL OR lp.daily_rate <= p_max_rate)
        AND (p_availability IS NULL OR lp.availability::TEXT = p_availability)
        AND (p_min_experience IS NULL OR lp.experience_years >= p_min_experience)
        AND (p_min_rating IS NULL OR lp.average_rating >= p_min_rating)
        AND (
            p_search_query IS NULL 
            OR lp.bio ILIKE '%' || p_search_query || '%'
            OR lp.location_name ILIKE '%' || p_search_query || '%'
        )
    ORDER BY 
        CASE WHEN lp.location IS NOT NULL 
            THEN ST_Distance(lp.location, search_point) 
            ELSE 999999999 
        END ASC,
        lp.average_rating DESC,
        lp.review_count DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to count nearby labour profiles
CREATE OR REPLACE FUNCTION count_labour_nearby(
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_km INTEGER,
    p_skills TEXT[] DEFAULT NULL,
    p_min_rate NUMERIC DEFAULT NULL,
    p_max_rate NUMERIC DEFAULT NULL,
    p_availability TEXT DEFAULT NULL,
    p_min_experience INTEGER DEFAULT NULL,
    p_min_rating NUMERIC DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    search_point GEOGRAPHY;
    result_count INTEGER;
BEGIN
    -- Create point from coordinates
    search_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography;
    
    SELECT COUNT(*)::INTEGER INTO result_count
    FROM public.labour_profiles lp
    WHERE 
        lp.is_active = true
        AND (lp.location IS NULL OR ST_DWithin(lp.location, search_point, p_radius_km * 1000))
        AND (p_skills IS NULL OR lp.skills && p_skills)
        AND (p_min_rate IS NULL OR lp.daily_rate >= p_min_rate)
        AND (p_max_rate IS NULL OR lp.daily_rate <= p_max_rate)
        AND (p_availability IS NULL OR lp.availability::TEXT = p_availability)
        AND (p_min_experience IS NULL OR lp.experience_years >= p_min_experience)
        AND (p_min_rating IS NULL OR lp.average_rating >= p_min_rating)
        AND (
            p_search_query IS NULL 
            OR lp.bio ILIKE '%' || p_search_query || '%'
            OR lp.location_name ILIKE '%' || p_search_query || '%'
        );
    
    RETURN result_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to create labour profile with location
CREATE OR REPLACE FUNCTION create_labour_profile(
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
$$ LANGUAGE plpgsql VOLATILE;

-- Function to update labour profile with location
CREATE OR REPLACE FUNCTION update_labour_profile_with_location(
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
    p_availability TEXT DEFAULT NULL,
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
        availability = COALESCE(p_availability::labour_availability, availability),
        latitude = COALESCE(p_latitude, latitude),
        longitude = COALESCE(p_longitude, longitude),
        updated_at = NOW()
    WHERE id = p_labour_id
    RETURNING * INTO updated_profile;
    
    RETURN updated_profile;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_labour_nearby TO anon, authenticated;
GRANT EXECUTE ON FUNCTION count_labour_nearby TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_labour_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_labour_profile_with_location TO authenticated;

-- Add some sample data for testing (optional)
-- Uncomment to insert test labour profiles
/*
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get first user or create a test one
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        INSERT INTO public.labour_profiles (
            user_id,
            skills,
            experience_years,
            daily_rate,
            hourly_rate,
            location_name,
            latitude,
            longitude,
            bio,
            availability,
            is_verified,
            is_active
        ) VALUES 
        (
            test_user_id,
            ARRAY['Plowing', 'Tractor Operation', 'Harvesting'],
            8,
            800,
            100,
            'Mumbai, Maharashtra',
            19.0760,
            72.8777,
            'Experienced tractor operator with 8 years of farm work. Specialized in land preparation and harvesting.',
            'available',
            true,
            true
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;
*/
