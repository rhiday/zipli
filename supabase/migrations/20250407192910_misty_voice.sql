/*
  # Remove phone verification

  1. Changes
    - Remove phone_verified column from organizations table
    - Remove phone verification constraint
    - Clean up any related indexes
    
  2. Security
    - No security changes needed
*/

-- Remove phone_verified column and related objects
ALTER TABLE organizations DROP COLUMN IF EXISTS phone_verified;

-- Remove related indexes
DROP INDEX IF EXISTS idx_organizations_phone_verified;
DROP INDEX IF EXISTS idx_organizations_role_status;