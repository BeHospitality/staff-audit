
ALTER TABLE public.shared_reports ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE public.shared_reports ADD COLUMN IF NOT EXISTS pin_salt TEXT;
