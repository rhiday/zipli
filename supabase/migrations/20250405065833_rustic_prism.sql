/*
  # Remove phone verification system

  1. Changes
    - Drop phone verification table
    - Drop related functions
    - Clean up indexes
    
  2. Security
    - No security changes needed
*/

-- Drop functions first
DROP FUNCTION IF EXISTS generate_otp(text);
DROP FUNCTION IF EXISTS verify_otp(text, text);
DROP FUNCTION IF EXISTS link_phone_verification(text, uuid);

-- Drop table and related objects
DROP TABLE IF EXISTS phone_verification CASCADE;