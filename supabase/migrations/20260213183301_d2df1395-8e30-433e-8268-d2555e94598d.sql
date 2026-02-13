-- Allow anyone to insert new organizations (for signup "Other" flow)
CREATE POLICY "Anyone can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (true);
