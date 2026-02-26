
-- Create shared_reports table for shareable dossier links
CREATE TABLE public.shared_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin manage shared reports"
  ON public.shared_reports FOR ALL
  USING (auth.jwt() ->> 'email' IN ('hello@be.ie', 'info@be.ie'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('hello@be.ie', 'info@be.ie'));

-- Public can read by token (for shareable links)
CREATE POLICY "Public read shared report by token"
  ON public.shared_reports FOR SELECT
  USING (true);

-- Index on token for fast lookups
CREATE INDEX idx_shared_reports_token ON public.shared_reports(token);
CREATE INDEX idx_shared_reports_lead ON public.shared_reports(lead_id);
