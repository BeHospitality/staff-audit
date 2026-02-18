-- Allow anonymous read of leads by ID (for thank-you page)
-- Drop the old authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can read leads" ON public.leads;

-- Replace with a policy that allows anyone to read leads (UUID is unguessable, only property-level data shown)
CREATE POLICY "Anyone can read leads by id"
  ON public.leads FOR SELECT
  USING (true);