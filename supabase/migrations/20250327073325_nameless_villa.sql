/*
  # Add role column to organizations table

  1. Changes
    - Add role column to organizations table
    - Set default role to 'donor'
    - Add check constraint to ensure valid roles

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'donor'
CHECK (role IN ('donor', 'receiver'));