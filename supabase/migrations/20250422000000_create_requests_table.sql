-- Create the requests table
CREATE TABLE public.requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description text,
    people_count integer NOT NULL DEFAULT 1,
    pickup_date date NOT NULL,
    pickup_time text, -- Stores time ranges like '12:00 PM - 2:00 PM'
    status text NOT NULL DEFAULT 'active'::text CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add comments to the table and columns
COMMENT ON TABLE public.requests IS 'Stores food requests made by users.';
COMMENT ON COLUMN public.requests.people_count IS 'Number of people the request is intended to feed.';
COMMENT ON COLUMN public.requests.pickup_date IS 'The requested date for pickup.';
COMMENT ON COLUMN public.requests.pickup_time IS 'The requested time window for pickup (e.g., ''12:00 PM - 2:00 PM'').';
COMMENT ON COLUMN public.requests.status IS 'The current status of the request (active, completed, cancelled).';

-- Enable Row Level Security
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Allow users to select their own requests
CREATE POLICY "Allow users to select own requests" ON public.requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Allow users to insert requests for themselves
CREATE POLICY "Allow users to insert requests for themselves" ON public.requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own requests
CREATE POLICY "Allow users to update own requests" ON public.requests
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to delete their own requests
CREATE POLICY "Allow users to delete own requests" ON public.requests
    FOR DELETE
    USING (auth.uid() = user_id); 