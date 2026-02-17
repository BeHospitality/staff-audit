
-- Fix pulse_dossiers: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anon can read dossiers by code" ON public.pulse_dossiers;
DROP POLICY IF EXISTS "Anon can update dossier views" ON public.pulse_dossiers;
DROP POLICY IF EXISTS "Authenticated users can manage dossiers" ON public.pulse_dossiers;

-- Permissive SELECT for everyone (anon + authenticated)
CREATE POLICY "Anyone can read dossiers"
ON public.pulse_dossiers FOR SELECT
TO anon, authenticated
USING (true);

-- Permissive UPDATE for everyone (needed for view tracking + client_response)
CREATE POLICY "Anyone can update dossiers"
ON public.pulse_dossiers FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Permissive INSERT for authenticated users only
CREATE POLICY "Authenticated users can create dossiers"
ON public.pulse_dossiers FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permissive DELETE for authenticated users only
CREATE POLICY "Authenticated users can delete dossiers"
ON public.pulse_dossiers FOR DELETE
TO authenticated
USING (true);

-- Fix dossier_actions: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can log dossier actions" ON public.dossier_actions;
DROP POLICY IF EXISTS "Authenticated users can read dossier actions" ON public.dossier_actions;

-- Permissive INSERT for everyone (anon users need to log actions too)
CREATE POLICY "Anyone can log dossier actions"
ON public.dossier_actions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permissive SELECT for authenticated users
CREATE POLICY "Authenticated users can read dossier actions"
ON public.dossier_actions FOR SELECT
TO authenticated
USING (true);
