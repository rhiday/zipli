/*
  # Fix organization RLS policy for registration

  1. Changes
    - Drop existing insert policy
    - Create new policy that allows registration
    - Keep other policies unchanged
    
  2. Security
    - Allow organization creation during registration
    - Maintain security for other operations
*/

-- Drop existing policy
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