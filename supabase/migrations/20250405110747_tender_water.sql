/*
  # Make phone verification optional

  1. Changes
    - Add phone_verified column to organizations table
    - Set default to false
    - Add check constraint to ensure valid values
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add phone_verified column to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- Add check constraint
ALTER TABLE organizations
ADD CONSTRAINT phone_verified_check CHECK (phone_verified IN (true, false));