-- Fix: Explicitly grant to anon and authenticated roles
DROP POLICY "Anyone can insert manager record" ON public.managers;

CREATE POLICY "Anyone can insert manager record"
ON public.managers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);