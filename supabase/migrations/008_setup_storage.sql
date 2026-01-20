-- Setup Storage for Profile Pictures and Equipment Images

-- Create avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  10485760, -- 10MB limit (will auto-compress)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create equipment-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images',
  'equipment-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);

-- Storage policies for equipment-images bucket
-- Allow authenticated users to upload equipment images
CREATE POLICY "Authenticated users can upload equipment images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'equipment-images');

-- Allow anyone to view equipment images (public bucket)
CREATE POLICY "Anyone can view equipment images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'equipment-images');

-- Allow authenticated users to update equipment images
CREATE POLICY "Authenticated users can update their equipment images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'equipment-images')
WITH CHECK (bucket_id = 'equipment-images');

-- Allow authenticated users to delete equipment images
CREATE POLICY "Authenticated users can delete their equipment images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'equipment-images');
