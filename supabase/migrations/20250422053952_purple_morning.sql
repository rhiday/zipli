/*
  # Add rescuer functionality to donations table

  1. Changes
    - Add rescuer_id column if it doesn't exist
    - Add image_url column for donation images
    - Add comments for clarity
    - Add policy for rescue operations
    
  2. Security
    - Maintain RLS
    - Add proper security checks for rescue operations
*/

-- Add rescuer_id column if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.donations
    ADD COLUMN IF NOT EXISTS rescuer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS image_url text;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Add column comments
COMMENT ON COLUMN public.donations.rescuer_id IS 'ID of the user (receiver) who rescued this donation.';
COMMENT ON COLUMN public.donations.image_url IS 'Public URL of the primary image associated with the donation, stored in Supabase Storage.';

-- Create policy for rescue operations
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow authenticated users to rescue donations" ON public.donations;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Allow authenticated users to rescue donations" 
ON public.donations
FOR UPDATE
USING (
  role() = 'authenticated' AND -- User must be logged in
  auth.uid() != organization_id AND -- User cannot rescue their own donation
  status = 'active' -- Only active donations can be rescued
);