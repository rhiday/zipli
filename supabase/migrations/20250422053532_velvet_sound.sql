/*
  # Create requests table and policies

  1. New Tables
    - `requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `description` (text)
      - `people_count` (integer)
      - `pickup_date` (date)
      - `pickup_time` (text)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own requests
*/

-- Safely create the requests table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS public.requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description text,
    people_count integer NOT NULL DEFAULT 1,
    pickup_date date NOT NULL,
    pickup_time text,
    status text NOT NULL DEFAULT 'active'::text CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at timestamp with time zone DEFAULT now() NOT NULL
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Add comments if they don't exist
DO $$ BEGIN
  COMMENT ON TABLE public.requests IS 'Stores food requests made by users.';
  COMMENT ON COLUMN public.requests.people_count IS 'Number of people the request is intended to feed.';
  COMMENT ON COLUMN public.requests.pickup_date IS 'The requested date for pickup.';
  COMMENT ON COLUMN public.requests.pickup_time IS 'The requested time window for pickup (e.g., ''12:00 PM - 2:00 PM'').';
  COMMENT ON COLUMN public.requests.status IS 'The current status of the request (active, completed, cancelled).';
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow users to select own requests" ON public.requests;
  DROP POLICY IF EXISTS "Allow users to insert requests for themselves" ON public.requests;
  DROP POLICY IF EXISTS "Allow users to update own requests" ON public.requests;
  DROP POLICY IF EXISTS "Allow users to delete own requests" ON public.requests;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
CREATE POLICY "Allow users to select own requests" ON public.requests
    FOR SELECT
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert requests for themselves" ON public.requests
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own requests" ON public.requests
    FOR UPDATE
    TO public
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own requests" ON public.requests
    FOR DELETE
    TO public
    USING (auth.uid() = user_id);