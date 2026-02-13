
-- Create managers table to link auth users to organizations
CREATE TABLE public.managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

-- Managers can read their own record
CREATE POLICY "Managers can read own record"
ON public.managers
FOR SELECT
USING (email = (auth.jwt() ->> 'email'::text));

-- Anyone can insert (during signup)
CREATE POLICY "Anyone can insert manager record"
ON public.managers
FOR INSERT
WITH CHECK (true);
