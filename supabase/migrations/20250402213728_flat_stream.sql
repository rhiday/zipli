/*
  # Add phone verification table and functions

  1. New Tables
    - `phone_verification`
      - `id` (uuid, primary key)
      - `phone_number` (text)
      - `otp_code` (text)
      - `expires_at` (timestamptz)
      - `verified` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for managing OTP verification
    
  3. Functions
    - Add function to generate OTP
    - Add function to verify OTP
*/

-- Create phone verification table
CREATE TABLE IF NOT EXISTS phone_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE phone_verification ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX phone_verification_phone_number_idx ON phone_verification(phone_number);
CREATE INDEX phone_verification_organization_id_idx ON phone_verification(organization_id);

-- Create function to generate OTP
CREATE OR REPLACE FUNCTION generate_otp(phone text, org_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp text;
BEGIN
  -- Generate 6-digit OTP
  otp := floor(random() * 900000 + 100000)::text;
  
  -- Insert new verification record
  INSERT INTO phone_verification (
    phone_number,
    otp_code,
    expires_at,
    organization_id
  )
  VALUES (
    phone,
    otp,
    now() + interval '10 minutes',
    org_id
  );
  
  RETURN otp;
END;
$$;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_otp(phone text, otp text, org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_valid boolean;
BEGIN
  UPDATE phone_verification
  SET verified = true
  WHERE phone_number = phone
    AND otp_code = otp
    AND organization_id = org_id
    AND expires_at > now()
    AND verified = false
  RETURNING true INTO is_valid;
  
  RETURN COALESCE(is_valid, false);
END;
$$;

-- Create policies
CREATE POLICY "Organizations can manage their own verification"
  ON phone_verification
  FOR ALL
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());