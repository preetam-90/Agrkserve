-- Setup Storage for Equipment Videos

-- Create equipment-videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-videos',
  'equipment-videos',
  true,
  20971520, -- 20MB limit (after compression videos should be 5-15MB)
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for equipment-videos bucket
-- Allow authenticated users to upload equipment videos
CREATE POLICY "Authenticated users can upload equipment videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'equipment-videos');

-- Allow anyone to view equipment videos (public bucket)
CREATE POLICY "Anyone can view equipment videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'equipment-videos');

-- Allow authenticated users to update equipment videos
CREATE POLICY "Authenticated users can update their equipment videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'equipment-videos')
WITH CHECK (bucket_id = 'equipment-videos');

-- Allow authenticated users to delete equipment videos
CREATE POLICY "Authenticated users can delete their equipment videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'equipment-videos');
