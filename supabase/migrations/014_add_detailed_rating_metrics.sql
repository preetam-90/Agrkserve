-- Add detailed rating metrics to reviews table
-- Migration: 014_add_detailed_rating_metrics.sql
-- Description: Adds granular ratings for equipment reviews (vehicle condition, fuel efficiency, owner communication)

-- Add new rating columns to reviews table
ALTER TABLE public.reviews
ADD COLUMN vehicle_condition_rating INTEGER CHECK (vehicle_condition_rating >= 1 AND vehicle_condition_rating <= 5),
ADD COLUMN fuel_efficiency_rating INTEGER CHECK (fuel_efficiency_rating >= 1 AND fuel_efficiency_rating <= 5),
ADD COLUMN owner_communication_rating INTEGER CHECK (owner_communication_rating >= 1 AND owner_communication_rating <= 5);

-- Create index on equipment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_equipment_id ON public.reviews(equipment_id);

-- Create index on reviewer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);

-- Add comment to table
COMMENT ON TABLE public.reviews IS 'Reviews for equipment and labour bookings with detailed rating metrics';
