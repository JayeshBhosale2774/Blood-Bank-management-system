-- Drop the existing public SELECT policy on donors table
DROP POLICY IF EXISTS "Anyone can view available donors" ON public.donors;

-- Create new policy: Only authenticated person users can view available donors
CREATE POLICY "Authenticated persons can view available donors"
ON public.donors
FOR SELECT
TO authenticated
USING (
  available = true 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'person'
  )
);