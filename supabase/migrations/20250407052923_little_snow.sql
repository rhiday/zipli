/*
  # Update organizations INSERT policy

  1. Changes
    - Drop existing INSERT policy
    - Create new INSERT policy with proper auth check
    
  2. Security
    - Ensure users can only create organizations with their own ID
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can insert own organization data" ON organizations;

-- Create new insert policy that checks auth.uid() matches id
CREATE POLICY "Users can insert own organization data"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Note: Other policies remain unchanged:
-- - "Users can read own organization data"
-- - "Users can update own organization data"