
-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  property_name TEXT NOT NULL,
  role TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  staff_count INTEGER,
  turnover_rate INTEGER,
  biggest_challenge TEXT,
  vibe_check_requested BOOLEAN DEFAULT true,
  vibe_check_code TEXT UNIQUE,
  vibe_check_responses INTEGER DEFAULT 0,
  vibe_check_total_staff INTEGER,
  dossier_pin TEXT,
  dossier_url TEXT,
  report_sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Public insert (lead capture from calculator)
CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- Public update (for upsert on duplicate email)
CREATE POLICY "Anyone can update leads by email"
  ON public.leads FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can read leads
CREATE POLICY "Authenticated users can read leads"
  ON public.leads FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Unique index on email for upsert
CREATE UNIQUE INDEX leads_email_unique ON public.leads (email);

-- Trigger for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
