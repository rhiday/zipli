/*
  # Create organizations table and policies

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `contact_number` (text)
      - `email` (text, unique)
      - `address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on organizations table
    - Add policies for authenticated users to:
      - Read their own organization data
      - Update their own organization data
      - Insert their own organization data

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- First check if the table exists and create it if it doesn't
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    name text NOT NULL,
    contact_number text NOT NULL,
    email text NOT NULL UNIQUE,
    address text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own organization data" ON organizations;
  DROP POLICY IF EXISTS "Users can update own organization data" ON organizations;
  DROP POLICY IF EXISTS "Users can insert own organization data" ON organizations;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Users can read own organization data"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own organization data"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own organization data"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();