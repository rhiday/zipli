/*
  # Fix donations table foreign key constraint

  1. Changes
    - Drop and recreate donations table with proper foreign key constraint
    - Add CASCADE on delete to ensure proper cleanup
    - Ensure all constraints and indexes are preserved
    - Recreate policies with proper security checks

  2. Security
    - Maintain RLS policies
    - Keep all existing security checks
*/

-- Drop and recreate the donations table with proper constraints
DO $$ BEGIN
  DROP TABLE IF EXISTS donations CASCADE;
  
  CREATE TABLE donations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    quantity text NOT NULL,
    location text NOT NULL,
    distance text NOT NULL,
    pickup_time text NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
  );

  -- Create indexes for faster queries
  CREATE INDEX donations_organization_id_idx ON donations(organization_id);
  CREATE INDEX donations_status_idx ON donations(status);
  CREATE INDEX donations_created_at_idx ON donations(created_at DESC);

EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Recreate policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Organizations can read own donations" ON donations;
  DROP POLICY IF EXISTS "Organizations can create donations" ON donations;
  DROP POLICY IF EXISTS "Organizations can update own donations" ON donations;
  DROP POLICY IF EXISTS "Organizations can delete own donations" ON donations;
  DROP POLICY IF EXISTS "Any authenticated user can read available donations" ON donations;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policies with proper security checks
CREATE POLICY "Organizations can read own donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (organization_id = auth.uid());

CREATE POLICY "Organizations can create donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = auth.uid() AND
    status IN ('active', 'completed')
  );

CREATE POLICY "Organizations can update own donations"
  ON donations
  FOR UPDATE
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (
    organization_id = auth.uid() AND
    status IN ('active', 'completed')
  );

CREATE POLICY "Organizations can delete own donations"
  ON donations
  FOR DELETE
  TO authenticated
  USING (organization_id = auth.uid());

CREATE POLICY "Any authenticated user can read available donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Recreate the updated_at trigger
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();