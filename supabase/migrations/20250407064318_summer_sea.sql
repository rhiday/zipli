/*
  # Fix RLS policies for organizations table

  1. Changes
    - Drop and recreate RLS policies with proper security checks
    - Allow organization creation during signup
    - Maintain proper access control for existing records
    
  2. Security
    - Ensure users can only access their own data
    - Allow initial creation during signup
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON organizations;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON organizations;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON organizations;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON organizations;

-- Create new policies with proper security checks
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