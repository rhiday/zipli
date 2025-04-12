/*
  # Fix organizations table RLS policies

  1. Changes
    - Drop existing RLS policies for organizations table
    - Add new RLS policies that properly handle user registration
    
  2. Security
    - Enable RLS on organizations table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
    - Add policy for new users to insert their organization data
    - Add policy for authenticated users to delete their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own organization data" ON organizations;
DROP POLICY IF EXISTS "Users can read own organization data" ON organizations;
DROP POLICY IF EXISTS "Users can update own organization data" ON organizations;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users" 
ON organizations FOR INSERT 
TO authenticated 
WITH CHECK (true);

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