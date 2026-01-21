-- Add video_url column to equipment table

ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS video_url TEXT;
