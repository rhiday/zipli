/*
  # Remove account type distinction and simplify user profiles

  1. Changes
    - Remove role column from organizations table
    - Update existing RLS policies
    - Simplify organization structure
    
  2. Security
    - Maintain existing security model
    - Keep RLS enabled
*/

-- Remove role column and its constraint
ALTER TABLE organizations 
DROP COLUMN IF EXISTS role;

-- Drop and recreate the organizations table with simplified structure
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    name text NOT NULL,
    contact_number text NOT NULL,
    email text NOT NULL UNIQUE,
    address text NOT NULL,
    contact_person text NOT NULL,
    profile_image text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON organizations;
  DROP POLICY IF EXISTS "Enable select for users based on user_id" ON organizations;
  DROP POLICY IF EXISTS "Enable update for users based on user_id" ON organizations;
  DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON organizations;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new simplified policies
CREATE POLICY "Enable insert for authenticated users"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id"
ON organizations FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
ON organizations FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id"
ON organizations FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Recreate the updated_at trigger
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();