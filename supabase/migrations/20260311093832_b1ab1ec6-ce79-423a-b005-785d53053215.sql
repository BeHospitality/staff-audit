
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS converted_to_client boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS converted_at timestamptz;
