
-- Create pulse_dossiers table
CREATE TABLE public.pulse_dossiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  unique_code TEXT NOT NULL UNIQUE,
  pin_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_viewed_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER NOT NULL DEFAULT 0,
  client_response TEXT
);

-- Enable RLS
ALTER TABLE public.pulse_dossiers ENABLE ROW LEVEL SECURITY;

-- Authenticated staff can do everything
CREATE POLICY "Authenticated users can manage dossiers"
ON public.pulse_dossiers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Anon can read dossiers by unique_code (for PIN page)
CREATE POLICY "Anon can read dossiers by code"
ON public.pulse_dossiers
FOR SELECT
TO anon
USING (true);

-- Anon can update dossiers (for view tracking and client response)
CREATE POLICY "Anon can update dossier views"
ON public.pulse_dossiers
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Grant privileges
GRANT SELECT, UPDATE ON public.pulse_dossiers TO anon;
GRANT ALL ON public.pulse_dossiers TO authenticated;

-- Also need anon to read pulse_responses for dossier page
-- (currently only managers can via RLS). Create a policy for reading via dossier context.
-- We'll read responses server-side or via authenticated user, so no anon policy needed for responses.

-- Update RLS on pulse_responses to allow authenticated to read ALL responses (staff sees all orgs)
DROP POLICY IF EXISTS "Managers can read their org responses" ON public.pulse_responses;
CREATE POLICY "Authenticated users can read all responses"
ON public.pulse_responses
FOR SELECT
TO authenticated
USING (true);

-- Update RLS on organizations to let authenticated read all
-- (already has "Anyone can read organizations by code" with true, so this is fine)

-- Update managers delete policy to let authenticated delete demo data from any org
DROP POLICY IF EXISTS "Managers can delete demo data from their org" ON public.pulse_responses;
CREATE POLICY "Authenticated users can delete demo data"
ON public.pulse_responses
FOR DELETE
TO authenticated
USING (is_demo_data = true);
