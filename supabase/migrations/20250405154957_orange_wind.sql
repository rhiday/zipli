/*
  # Add contact person column to organizations table

  1. Changes
    - Add contact_person column to organizations table
    - Make it required (NOT NULL)
    - Add it to existing organization creation
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add contact_person column
ALTER TABLE organizations 
ADD COLUMN contact_person text NOT NULL DEFAULT '';

-- Remove the default after adding the column
ALTER TABLE organizations 
ALTER COLUMN contact_person DROP DEFAULT;