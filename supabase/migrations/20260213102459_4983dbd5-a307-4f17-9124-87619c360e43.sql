
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name TEXT NOT NULL,
  org_code TEXT NOT NULL UNIQUE,
  manager_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Public can read org by code (needed for survey page)
CREATE POLICY "Anyone can read organizations by code"
ON public.organizations FOR SELECT
USING (true);

-- Only authenticated managers can update their org
CREATE POLICY "Managers can update their org"
ON public.organizations FOR UPDATE
TO authenticated
USING (manager_email = auth.jwt()->>'email');

-- Create pulse_responses table
CREATE TABLE public.pulse_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department TEXT,
  question_1_energy INTEGER NOT NULL CHECK (question_1_energy BETWEEN 1 AND 5),
  question_2_support INTEGER NOT NULL CHECK (question_2_support BETWEEN 1 AND 5),
  question_3_growth INTEGER NOT NULL CHECK (question_3_growth BETWEEN 1 AND 5),
  question_4_spirit INTEGER CHECK (question_4_spirit BETWEEN 1 AND 5),
  open_feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_demo_data BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.pulse_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can insert responses (public survey)
CREATE POLICY "Anyone can submit pulse responses"
ON public.pulse_responses FOR INSERT
WITH CHECK (true);

-- Only authenticated users can read responses for their org
CREATE POLICY "Managers can read their org responses"
ON public.pulse_responses FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT id FROM public.organizations WHERE manager_email = auth.jwt()->>'email'
  )
);

-- Managers can delete demo data
CREATE POLICY "Managers can delete demo data from their org"
ON public.pulse_responses FOR DELETE
TO authenticated
USING (
  is_demo_data = true AND
  organization_id IN (
    SELECT id FROM public.organizations WHERE manager_email = auth.jwt()->>'email'
  )
);

-- Insert demo organizations
INSERT INTO public.organizations (org_name, org_code, manager_email) VALUES
('Kilkea Castle', 'kilkea-castle', NULL),
('Rose Hotel', 'rose-hotel', NULL);
