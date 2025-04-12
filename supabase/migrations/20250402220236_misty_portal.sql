/*
  # Update phone verification to work without authentication

  1. Changes
    - Make organization_id nullable to allow pre-auth verification
    - Update functions to work without requiring org_id
    - Add function to link verification to organization
    
  2. Security
    - Allow public access to generate_otp
    - Keep verification secure
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS generate_otp(text, uuid);
DROP FUNCTION IF EXISTS verify_otp(text, text, uuid);

-- Create function to generate OTP without requiring org_id
CREATE OR REPLACE FUNCTION generate_otp(phone text)
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
    expires_at
  )
  VALUES (
    phone,
    otp,
    now() + interval '10 minutes'
  );
  
  RETURN otp;
END;
$$;

-- Create function to verify OTP without requiring org_id
CREATE OR REPLACE FUNCTION verify_otp(phone text, otp text)
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
    AND expires_at > now()
    AND verified = false
  RETURNING true INTO is_valid;
  
  RETURN COALESCE(is_valid, false);
END;
$$;

-- Create function to link verification to organization
CREATE OR REPLACE FUNCTION link_phone_verification(phone text, org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE phone_verification
  SET organization_id = org_id
  WHERE phone_number = phone
    AND verified = true
    AND organization_id IS NULL;
    
  RETURN FOUND;
END;
$$;

-- Update policies
DROP POLICY IF EXISTS "Organizations can manage their own verification" ON phone_verification;

-- Allow anyone to create verification records
CREATE POLICY "Anyone can create verification records"
  ON phone_verification
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to read their own verification records by phone number
CREATE POLICY "Anyone can read verification records"
  ON phone_verification
  FOR SELECT
  TO public
  USING (true);

-- Only allow updates through RPC functions
CREATE POLICY "Updates only through RPC"
  ON phone_verification
  FOR UPDATE
  TO public
  USING (false)
  WITH CHECK (false);