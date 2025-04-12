/*
  # Clean up phone verification system

  1. Changes
    - Drop any remaining verification functions
    - Drop phone verification table if it exists
    - Update organizations table constraints
    - Clean up any remaining indexes
    
  2. Security
    - No security changes needed
*/

-- Drop verification functions if they exist
DROP FUNCTION IF EXISTS generate_verification_token(text);
DROP FUNCTION IF EXISTS check_verification(text, text);

-- Drop phone verification table if it exists
DROP TABLE IF EXISTS phone_verification CASCADE;

-- Update organizations table
ALTER TABLE organizations
DROP CONSTRAINT IF EXISTS phone_verified_check;