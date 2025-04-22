/*
  # Add image column to donations table

  1. Changes
    - Add `image` column to `donations` table to store image data
    - This is in addition to the existing `image_url` column
    - The `image` column will store temporary image data before processing

  2. Notes
    - Both `image` and `image_url` columns are nullable
    - `image_url` remains the primary image storage field
    - `image` column is used during the upload process
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donations' 
    AND column_name = 'image'
  ) THEN
    ALTER TABLE donations ADD COLUMN image text;
  END IF;
END $$;