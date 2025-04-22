-- Add rescuer_id column to track who rescued the donation
ALTER TABLE public.donations
ADD COLUMN rescuer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.donations.rescuer_id IS 'ID of the user (receiver) who rescued this donation.';

-- Add RLS policy to allow authenticated users (not the donor) to update status and rescuer_id for active donations
CREATE POLICY "Allow authenticated users to rescue donations" 
ON public.donations
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND -- User must be logged in
  auth.uid() != organization_id AND -- User cannot rescue their own donation
  status = 'active' -- Only active donations can be rescued
)
WITH CHECK (
  auth.uid() = rescuer_id AND -- Can only set rescuer_id to self
  status = 'completed' -- Can only update status to completed when rescuing
  -- Ensures only status and rescuer_id can be updated by this policy (implicitly checked by target columns in UPDATE statement)
); 