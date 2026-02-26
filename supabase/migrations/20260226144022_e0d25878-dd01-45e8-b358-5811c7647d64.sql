
-- Create vibe_check_responses table
CREATE TABLE public.vibe_check_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  anonymous_id TEXT NOT NULL,
  department TEXT NOT NULL,
  role_level TEXT NOT NULL,
  tenure TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  q1_score INTEGER NOT NULL CHECK (q1_score >= 1 AND q1_score <= 5),
  q2_score INTEGER NOT NULL CHECK (q2_score >= 1 AND q2_score <= 5),
  q3_score INTEGER NOT NULL CHECK (q3_score >= 1 AND q3_score <= 5),
  q4_score INTEGER NOT NULL CHECK (q4_score >= 1 AND q4_score <= 5),
  q5_score INTEGER NOT NULL CHECK (q5_score >= 1 AND q5_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_vibe_lead ON public.vibe_check_responses(lead_id);
CREATE INDEX idx_vibe_department ON public.vibe_check_responses(lead_id, department);
CREATE INDEX idx_vibe_created ON public.vibe_check_responses(created_at);

-- Enable RLS
ALTER TABLE public.vibe_check_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (anonymous, no auth)
CREATE POLICY "Anyone can submit vibe check"
  ON public.vibe_check_responses FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read
CREATE POLICY "Authenticated users can read vibe checks"
  ON public.vibe_check_responses FOR SELECT
  USING (auth.role() = 'authenticated');

-- RPC to look up property from vibe check code (SECURITY DEFINER so anon can call it)
CREATE OR REPLACE FUNCTION public.get_vibe_check_property(check_code TEXT)
RETURNS TABLE (lead_id UUID, property_name TEXT, staff_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.property_name, l.staff_count
  FROM public.leads l
  WHERE l.vibe_check_code = check_code
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC to increment vibe check response count
CREATE OR REPLACE FUNCTION public.increment_vibe_check_responses(lead_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.leads
  SET vibe_check_responses = COALESCE(vibe_check_responses, 0) + 1
  WHERE id = lead_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
