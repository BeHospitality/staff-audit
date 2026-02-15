
-- Add industry column to organizations
ALTER TABLE public.organizations ADD COLUMN industry text;

-- Add name column to managers
ALTER TABLE public.managers ADD COLUMN name text;
