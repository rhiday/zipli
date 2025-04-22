/*
  # Switch from Twilio to MessageBird

  1. Changes
    - Update environment variable references
    - Modify verification flow for MessageBird
    - Clean up old Twilio-specific code
*/

-- Drop old Twilio-specific functions if they exist
DROP FUNCTION IF EXISTS verify_otp(text, text);
DROP FUNCTION IF EXISTS generate_otp(text);

-- Create new MessageBird verification functions
CREATE OR REPLACE FUNCTION generate_verification_token(phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token text;
BEGIN
  -- Generate 6-digit token
  token := floor(random() * 900000 + 100000)::text;
  
  -- Store verification attempt
  INSERT INTO phone_verification (
    phone_number,
    otp_code,
    expires_at
  )
  VALUES (
    phone,
    token,
    now() + interval '10 minutes'
  );
  
  RETURN token;
END;
$$;

-- Create verification check function
CREATE OR REPLACE FUNCTION check_verification(phone text, token text)
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
    AND otp_code = token
    AND expires_at > now()
    AND verified = false
  RETURNING true INTO is_valid;
  
  RETURN COALESCE(is_valid, false);
END;
$$;