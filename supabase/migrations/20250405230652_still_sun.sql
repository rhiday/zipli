/*
  # Add performance indexes

  1. Changes
    - Add indexes for frequently queried columns
    - Add composite indexes for common query patterns
    - Add partial indexes for specific conditions

  2. Performance
    - Improve query performance for common operations
    - Optimize sorting and filtering
*/

-- Add index for phone verification status
CREATE INDEX IF NOT EXISTS idx_organizations_phone_verified 
ON organizations(phone_verified) 
WHERE phone_verified = true;

-- Add composite index for role and status
CREATE INDEX IF NOT EXISTS idx_organizations_role_status 
ON organizations(role, phone_verified);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_organizations_email_lower 
ON organizations(LOWER(email));

-- Add partial index for active donations
CREATE INDEX IF NOT EXISTS idx_donations_active 
ON donations(created_at DESC) 
WHERE status = 'active';

-- Add index for organization donations
CREATE INDEX IF NOT EXISTS idx_donations_org_status 
ON donations(organization_id, status, created_at DESC);

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_donations_location 
ON donations(location);

-- Add index for pickup time
CREATE INDEX IF NOT EXISTS idx_donations_pickup 
ON donations(pickup_time);