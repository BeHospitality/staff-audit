
-- Create dossier_actions table for CTA tracking
CREATE TABLE public.dossier_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id UUID NOT NULL REFERENCES public.pulse_dossiers(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dossier_actions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public dossier page)
CREATE POLICY "Anyone can log dossier actions"
ON public.dossier_actions
FOR INSERT
WITH CHECK (true);

-- Authenticated staff can read all actions
CREATE POLICY "Authenticated users can read dossier actions"
ON public.dossier_actions
FOR SELECT
TO authenticated
USING (true);
