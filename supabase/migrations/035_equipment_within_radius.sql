CREATE OR REPLACE FUNCTION equipment_within_radius(
  lat        double precision,
  lng        double precision,
  radius_km  double precision DEFAULT 50,
  max_results integer DEFAULT 20
)
RETURNS TABLE (
  id            uuid,
  name          text,
  category      text,
  brand         text,
  price_per_day numeric,
  location_name text,
  rating        numeric,
  is_available  boolean,
  distance_km   double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    e.id,
    e.name,
    e.category,
    e.brand,
    e.price_per_day,
    e.location_name,
    e.rating,
    e.is_available,
    ST_Distance(
      e.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000.0 AS distance_km
  FROM equipment e
  WHERE
    e.location IS NOT NULL
    AND ST_DWithin(
      e.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT max_results;
$$;

GRANT EXECUTE ON FUNCTION equipment_within_radius(double precision, double precision, double precision, integer) TO service_role;
