
-- Drop existing overly permissive policies on leads
DROP POLICY IF EXISTS "Anyone can read leads by id" ON public.leads;
DROP POLICY IF EXISTS "Anyone can update leads by email" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Allow anonymous insert for lead capture (calculator still works)
CREATE POLICY "Allow anonymous insert for lead capture"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can read leads
CREATE POLICY "Only authenticated users can read leads"
ON public.leads FOR SELECT
TO authenticated
USING (true);

-- Allow anonymous read of own lead by ID (needed for Thank You page)
-- Uses RPC get_vibe_check_property instead, so no anon SELECT needed

-- Restrict updates to authenticated users only
CREATE POLICY "Only authenticated users can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
