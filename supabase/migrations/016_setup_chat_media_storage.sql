-- =====================================================
-- CONFIGURE STORAGE FOR CHAT MEDIA
-- =====================================================

-- Create storage bucket for chat media
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for chat media (drop existing if any)
DROP POLICY IF EXISTS "Users can upload chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat media" ON storage.objects;
DROP POLICY IF EXISTS "Limit chat media file size" ON storage.objects;

CREATE POLICY "Users can upload chat media" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'chat-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view chat media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-media');

CREATE POLICY "Users can delete own chat media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add file size limit (30MB)
CREATE POLICY "Limit chat media file size"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-media'
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'))
  AND octet_length(decode(encode(name::bytea, 'escape'), 'escape')) < 31457280
);

-- =====================================================
-- DONE: Storage configured for chat media
-- =====================================================
