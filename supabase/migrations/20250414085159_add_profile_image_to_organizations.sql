-- Add profile_image column to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS profile_image TEXT;
