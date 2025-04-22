/*
  # Add storage bucket for donation images

  1. Changes
    - Create storage bucket for donation images
    - Add public access policy
    - Enable image uploads
    
  2. Security
    - Only allow image files
    - Restrict file size
    - Enable public read access
*/

-- Enable storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create donations bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('donations', 'donations', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'donations');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'donations' AND
  (LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'gif', 'webp')) AND
  (octet_length(content) < 5242880) -- 5MB max
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);