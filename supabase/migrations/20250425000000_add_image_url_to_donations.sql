-- Add image_url column to store the public URL of the donation image
ALTER TABLE public.donations
ADD COLUMN image_url text;

COMMENT ON COLUMN public.donations.image_url IS 'Public URL of the primary image associated with the donation, stored in Supabase Storage.'; 