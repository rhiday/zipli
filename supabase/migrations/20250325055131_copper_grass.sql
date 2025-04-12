/*
  # Create donations table and related schemas

  1. New Tables
    - `donations`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `title` (text)
      - `description` (text)
      - `quantity` (text)
      - `location` (text)
      - `distance` (text)
      - `pickup_time` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on donations table
    - Add policies for:
      - Organizations can read their own donations
      - Organizations can create new donations
      - Organizations can update their own donations
      - Organizations can delete their own donations
      - Any authenticated user can read available donations

  3. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  quantity text NOT NULL,
  location text NOT NULL,
  distance text NOT NULL,
  pickup_time text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organizations can read own donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (organization_id = auth.uid());

CREATE POLICY "Organizations can create donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Organizations can update own donations"
  ON donations
  FOR UPDATE
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

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

-- Create updated_at trigger
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();