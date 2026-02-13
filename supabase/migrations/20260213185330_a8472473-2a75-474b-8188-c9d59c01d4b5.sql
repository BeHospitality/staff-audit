-- Fix: Change managers INSERT policy from RESTRICTIVE to PERMISSIVE
DROP POLICY "Anyone can insert manager record" ON public.managers;

CREATE POLICY "Anyone can insert manager record"
ON public.managers
FOR INSERT
TO public
WITH CHECK (true);