-- Drop the previous policy
DROP POLICY IF EXISTS "Allow authenticated users to rescue donations" ON public.donations;

-- Recreate the policy without the WITH CHECK clause
CREATE POLICY "Allow authenticated users to rescue donations" 
ON public.donations
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND -- User must be logged in
  auth.uid() != organization_id AND -- User cannot rescue their own donation
  status = 'active' -- Only active donations can be rescued
);
-- We trust the application logic (in DonationDetails.tsx) to set the correct 
-- status ('completed') and rescuer_id (auth.uid()) during the update. 