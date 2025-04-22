/*
  # Clear existing accounts and data

  1. Changes
    - Remove all existing records from organizations and donations tables
    - Reset sequences and clean up related data
    - Remove auth users except service role
    
  2. Security
    - Maintain table structure and policies
    - Only clear data, not schema
*/

-- Safely remove all records from donations first (due to foreign key constraints)
TRUNCATE TABLE donations CASCADE;

-- Remove all records from organizations
TRUNCATE TABLE organizations CASCADE;

-- Remove all auth users except service role
DELETE FROM auth.users 
WHERE raw_app_meta_data->>'provider' != 'service_role';

-- Reset identities/sequences if any
ALTER SEQUENCE IF EXISTS donations_id_seq RESTART;