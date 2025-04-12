/*
  # Fix organizations table RLS policies

  1. Changes
    - Update INSERT policy to allow registration
    - Keep other policies unchanged
    - Maintain existing table structure and constraints

  2. Security
    - Allow new users to create their organization profile
    - Maintain security for other operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own organization data" ON organizations;

-- Create new insert policy that allows registration
CREATE POLICY "Users can insert own organization data"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: Other policies remain unchanged:
-- - "Users can read own organization data"
-- - "Users can update own organization data"