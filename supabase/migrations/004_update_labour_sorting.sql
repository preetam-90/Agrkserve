-- Migration 004: Update search_labour_nearby to support sorting
-- Updated to support p_sort_by and p_sort_order

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
    p_sort_by TEXT DEFAULT 'distance',
    p_sort_order TEXT DEFAULT 'asc',
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
        AND (lp.location IS NULL OR p_latitude IS NULL OR ST_DWithin(lp.location, search_point, p_radius_km * 1000))
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
        CASE 
            WHEN p_sort_by = 'distance' AND lp.location IS NOT NULL THEN ST_Distance(lp.location, search_point)
            WHEN p_sort_by = 'distance' AND lp.location IS NULL THEN 999999999
            ELSE NULL
        END ASC,
        CASE 
            WHEN p_sort_by = 'rating' AND p_sort_order = 'desc' THEN lp.average_rating
            WHEN p_sort_by = 'experience' AND p_sort_order = 'desc' THEN lp.experience_years::numeric
            WHEN p_sort_by = 'daily_rate' AND p_sort_order = 'asc' THEN -lp.daily_rate
            WHEN p_sort_by = 'daily_rate' AND p_sort_order = 'desc' THEN lp.daily_rate
            WHEN p_sort_by = 'total_jobs' AND p_sort_order = 'desc' THEN lp.total_jobs::numeric
            WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN EXTRACT(EPOCH FROM lp.created_at)
            ELSE NULL
        END DESC NULLS LAST,
        CASE 
            WHEN p_sort_by = 'rating' AND p_sort_order = 'asc' THEN lp.average_rating
            WHEN p_sort_by = 'experience' AND p_sort_order = 'asc' THEN lp.experience_years::numeric
            WHEN p_sort_by = 'total_jobs' AND p_sort_order = 'asc' THEN lp.total_jobs::numeric
            WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN EXTRACT(EPOCH FROM lp.created_at)
            ELSE NULL
        END ASC NULLS LAST,
        lp.average_rating DESC,
        lp.review_count DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
